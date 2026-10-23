/* =====================================================================
 *  impress-factories.mjs — fabriques pour H5P.ImpressPresentation
 *  (« Impressive Presentation », moteur impress.js, version ALPHA 1.0)
 *
 *  Structure deduite d'un vrai export (exemple h5p.org « impressive
 *  presentation 7141 ») — voir references/impress-presentation.md.
 *
 *  Usage :
 *      import { presentation, station, panel, textView, validate }
 *        from '<chemin>/impress-factories.mjs';
 *
 *      const p = presentation();
 *      p.add(...station({ x: 0,    y: 0, z: 0 }, { html: '<h2>Titre</h2>' }));
 *      p.add(...station({ x: 1200, y: 0, z: 0, rotateZ: 15 }, { image: IMG.carte }));
 *      const content = p.toJSON();          // -> content.json
 *      const errors  = validate(content);   // [] si tout va bien
 *
 *  Une « station » = 1 camera (vue transparente, dans le parcours) +
 *  1 ou plusieurs vues de contenu (hors parcours) posees juste devant elle,
 *  avec LA MEME rotation, decalees le long de l'axe de visee de la camera.
 *  C'est le motif de l'exemple officiel ; il evite tout calcul a la main.
 *
 *  REGLES (verifiees sur l'export ET dans le code de la bibliotheque 1.0.3) :
 *   1. Couleurs SANS « # » : "000000", "fff".
 *   2. `uniqueId` entier, STRICTEMENT CROISSANT dans l'ordre de `views`
 *      (la bibliotheque renumerote sinon, et la route ne pointe plus sur
 *      rien) ; `route` = "#h5p-impress-id-<uniqueId>" des seules vues
 *      `includeInPath: true`, route[0] = etape d'ouverture.
 *   3. Pas de `backgroundImage: {}` vide : on omet la cle.
 *   4. `action` (contenu d'une vue) : H5P.AdvancedText 1.1,
 *      H5P.MarkTheWords 1.5, H5P.SingleChoiceSet 1.3 ou H5P.Blanks 1.4
 *      (semantics.json). Rien d'autre.
 *   5. CADRAGE : la camera affiche toujours 640x360 unites, quelle que soit
 *      sa taille (backgroundWidth/Height ne zooment PAS). Pour voir plus
 *      large, on RECULE : un plan a Z unites derriere la camera est reduit
 *      d'un facteur P / (P + Z), P = 640 / perspectiveRatio (mesure).
 *   6. Un contenu (`action`) est centre dans sa vue et occupe au plus la
 *      MOITIE de sa largeur : pour une colonne de texte de largeur L, la vue
 *      doit faire 2L (textView le fait). Il deborde en haut ET en bas si
 *      le texte est trop long : 330 unites de haut ~ 14 lignes.
 *      Exception : un SingleChoiceSet prend toute la largeur de sa vue.
 *   7. Ce qui se CLIQUE (quiz, liens) doit etre DEVANT la camera (d > 0) :
 *      la vue-camera transparente intercepte les clics sur ce qui est derriere.
 * ===================================================================== */

import crypto from 'crypto';

export const guid = () => crypto.randomUUID();

const rad = (d) => (d * Math.PI) / 180;

export const ACTIONS = ['H5P.AdvancedText 1.1', 'H5P.MarkTheWords 1.5', 'H5P.SingleChoiceSet 1.3', 'H5P.Blanks 1.4'];
export const VIEWPORT = { width: 640, height: 360 };

/* Profondeur a donner a un plan pour qu'il paraisse `k` fois plus petit
 * (k > 1 = « dezoom »). Ex. : cartes de 736x414 a depth(1.15) remplissent
 * exactement l'ecran -> texte 15 % plus petit. */
export const depth = (k, perspectiveRatio = 1) => -(k - 1) * (640 / perspectiveRatio);
const r1 = (n) => Math.round(n * 10) / 10;

/* Axe de visee local d'une vue (CSS : rotateX() rotateY() rotateZ()).
 * Verifie sur l'exemple : camera rotY -102.1 -> contenu decale vers
 * (sin(rotY), ., cos(rotY)) * d, d > 0 (plus proche du spectateur). */
export const forward = ({ rotateX = 0, rotateY = 0 }) => {
  const ax = rad(rotateX), ay = rad(rotateY);
  return [Math.sin(ay), -Math.sin(ax) * Math.cos(ay), Math.cos(ax) * Math.cos(ay)];
};

let nextId = 0;

/* Vue brute. Tous les champs de l'export, dans le meme ordre. */
export const view = ({
  name,
  x = 0, y = 0, z = 0, rotateX = 0, rotateY = 0, rotateZ = 0,
  width = 640, height = 360,
  color = 'fff', transparent = true,
  image,            // { path, mime, width, height, copyright? } — fichier embarque
  html,             // texte HTML -> action H5P.AdvancedText
  action,           // ou action complete { library, params, ... } (voir ACTIONS)
  inPath = false,
  id = nextId++,
}) => {
  const v = {};
  if (action) {
    v.action = { subContentId: guid(), metadata: { license: 'U', title: name || 'Contenu' }, ...action };
  } else if (html) {
    v.action = {
      library: 'H5P.AdvancedText 1.1',
      params: { text: html },
      subContentId: guid(),
      metadata: { contentType: 'Text', license: 'U', title: name || 'Texte' },
    };
  }
  v.backgroundGroup = {
    transparentBackground: transparent,
    backgroundColor: color.replace(/^#/, ''),
    backgroundWidth: Math.round(width),
    backgroundHeight: Math.round(height),
  };
  if (image) v.backgroundGroup.backgroundImage = image;
  v.positioning = {
    centerText: true,
    y: r1(y), x: r1(x), z: r1(z),
    rotateX: r1(rotateX), rotateY: r1(rotateY), rotateZ: r1(rotateZ),
  };
  v.ordering = { includeInPath: inPath, uniqueId: id, userDefinedName: name || `Vue ${id}` };
  return v;
};

/* Camera : vue transparente qui definit le cadrage d'une etape. Sa taille
 * (640x360 par defaut) fixe le « zoom » : plus elle est grande, plus on
 * voit large. */
export const camera = (pos, name) =>
  view({ ...pos, name: name || 'Camera', inPath: true, transparent: true });

/* Vue de contenu posee devant une camera, a la distance `d` sur son axe
 * de visee, avec un decalage (dx, dy) dans le plan de la camera (sans
 * rotateZ). */
export const panel = (cam, { d = 10, dx = 0, dy = 0, ...rest }) => {
  const f = forward(cam);
  const ay = rad(cam.rotateY || 0);
  // axe « droite » local (rotation Y seulement : suffisant pour dx)
  const right = [Math.cos(ay), 0, -Math.sin(ay)];
  return view({
    x: (cam.x || 0) + f[0] * d + right[0] * dx,
    y: (cam.y || 0) + f[1] * d + dy,
    z: (cam.z || 0) + f[2] * d + right[2] * dx,
    rotateX: cam.rotateX || 0, rotateY: cam.rotateY || 0, rotateZ: cam.rotateZ || 0,
    ...rest,
  });
};

/* Colonne de texte de largeur `width` (la vue fait 2 x width, regle 6),
 * sur fond transparent : pose-la devant un panneau colore (« carte »).
 * Texte noir par defaut : prefere des cartes claires (le texte blanc exige
 * des <span style="color:#FFFFFF"> partout, comme dans l'exemple). */
export const textView = (cam, html, { width = 560, height = 330, d = 20, ...rest } = {}) =>
  panel(cam, { d, width: 2 * width, height, transparent: true, html, ...rest });

/* Station = camera + cadre + carte claire + contenu, le tout recule de
 * depth(zoom) pour que le texte ne soit pas trop gros. `content` :
 *   { html }                -> texte pleine largeur
 *   { image }               -> image seule
 *   { html, image }         -> image a gauche, texte a droite
 * Options : title (noms dans l'editeur), color (cadre), card (carte),
 * zoom (1.15 par defaut). */
export const station = (pos, content = {}, { title = 'Etape', color = '1d3557', card = 'fbf7ef', zoom = 1.15 } = {}) => {
  const cam = { ...pos };
  const d0 = depth(zoom), S = (n) => n * zoom;
  const out = [camera(cam, `${title} — camera`)];
  out.push(panel(cam, { d: d0, width: S(640), height: S(360), color, transparent: false, name: `${title} — cadre` }));
  out.push(panel(cam, { d: d0 + 4, width: S(612), height: S(332), color: card, transparent: false, name: `${title} — carte` }));
  const img = content.image;
  if (img) {
    const maxW = content.html ? S(250) : S(580), maxH = S(300);
    const w = Math.min(maxW, maxH * img.width / img.height);
    out.push(panel(cam, { d: d0 + 8, dx: content.html ? S(-170) : 0, width: w, height: w * img.height / img.width,
      color: card, transparent: false, image: img, name: `${title} — image` }));
  }
  if (content.html) {
    out.push(textView(cam, content.html, { d: d0 + 8, dx: img ? S(130) : 0, width: img ? S(290) : S(540), height: S(330),
      name: `${title} — texte` }));
  }
  return out;
};

/* Mises en page de stations : renvoie des positions {x,y,z,rotate*}. */
export const layouts = {
  line: (n, { step = 1000 } = {}) => Array.from({ length: n }, (_, i) => ({ x: i * step, y: 0, z: 0 })),
  // cercle vu du dessus : chaque station tourne pour suivre la courbe
  circle: (n, { r = 1800 } = {}) => Array.from({ length: n }, (_, i) => {
    const a = (360 / n) * i;
    return { x: r * Math.sin(rad(a)), y: 0, z: -r * Math.cos(rad(a)) + r, rotateY: -a };
  }),
  // spirale qui s'enfonce : effet « plongee »
  spiral: (n, { r = 1000, dz = 600, turn = 60 } = {}) => Array.from({ length: n }, (_, i) => ({
    x: r * Math.cos(rad(i * turn)), y: r * Math.sin(rad(i * turn)), z: -i * dz, rotateZ: i * turn,
  })),
  // grille (vue d'ensemble facile a cadrer)
  grid: (n, { cols = 3, sx = 1000, sy = 650 } = {}) => Array.from({ length: n }, (_, i) => ({
    x: (i % cols) * sx, y: Math.floor(i / cols) * sy, z: 0,
  })),
};

/* Assemble la presentation. L'ordre du parcours = ordre d'ajout des
 * cameras (sauf si on passe `route` explicitement). */
export const presentation = ({ perspectiveRatio = 1 } = {}) => {
  nextId = 0;
  const views = [];
  return {
    views,
    add: (...vs) => { views.push(...vs); return vs; },
    toJSON: (route) => ({
      viewsGroup: {
        perspectiveRatio,
        views,
        route: route || views.filter((v) => v.ordering.includeInPath)
          .map((v) => `#h5p-impress-id-${v.ordering.uniqueId}`),
      },
    }),
  };
};

/* Vue d'ensemble : une camera RECULEE (z plus grand) qui englobe toutes les
 * vues. Le zoom ne vient pas de la taille de la camera (la bibliotheque
 * cadre toujours 640x360 unites) mais de la perspective : un plan situe a
 * Z unites derriere la camera est reduit d'un facteur P / (P + Z), avec
 * P = 640 / perspectiveRatio (mesure : panneau a d = -640 -> moitie de sa taille).
 * `margin` en px autour de la boite englobante. */
export const overview = (all, { margin = 200, perspective = 640, name = "Vue d'ensemble" } = {}) => {
  // seules les vues visibles (fond non transparent) comptent : un panneau texte
  // transparent est 2 fois plus large que son texte (voir textView)
  const opaque = all.filter((v) => !v.backgroundGroup.transparentBackground);
  const views = opaque.length ? opaque : all;
  const ext = (v, k, s) => v.positioning[k] + s * (k === 'x' ? v.backgroundGroup.backgroundWidth : v.backgroundGroup.backgroundHeight) / 2;
  const x0 = Math.min(...views.map((v) => ext(v, 'x', -1))), x1 = Math.max(...views.map((v) => ext(v, 'x', 1)));
  const y0 = Math.min(...views.map((v) => ext(v, 'y', -1))), y1 = Math.max(...views.map((v) => ext(v, 'y', 1)));
  const zs = views.map((v) => v.positioning.z);
  const zNear = Math.max(...zs);   // plan le plus proche : rien ne deborde
  const s = Math.min(640 / (x1 - x0 + 2 * margin), 360 / (y1 - y0 + 2 * margin));
  return camera({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: zNear + perspective * (1 / s - 1) }, name);
};

/* Controles structurels (miroir de Test-H5PJson.ps1 -Type impress). */
export const validate = (c) => {
  const err = [];
  const vg = c && c.viewsGroup;
  if (!vg) return ["Cle racine 'viewsGroup' absente."];
  if (typeof vg.perspectiveRatio !== 'number') err.push("'perspectiveRatio' doit etre un nombre.");
  const views = vg.views || [];
  if (!views.length) err.push("'views' est vide.");
  const ids = new Set();
  let prev = -1;
  views.forEach((v, i) => {
    const o = v.ordering || {}, p = v.positioning || {}, b = v.backgroundGroup || {};
    const n = `Vue ${i + 1} (${o.userDefinedName || '?'})`;
    if (!Number.isInteger(o.uniqueId)) err.push(`${n} : 'ordering.uniqueId' entier manquant.`);
    else if (ids.has(o.uniqueId)) err.push(`${n} : uniqueId ${o.uniqueId} en double.`);
    else {
      ids.add(o.uniqueId);
      if (o.uniqueId <= prev) err.push(`${n} : uniqueId ${o.uniqueId} doit etre strictement croissant (precedent ${prev}).`);
      prev = o.uniqueId;
    }
    for (const k of ['x', 'y', 'z', 'rotateX', 'rotateY', 'rotateZ'])
      if (typeof p[k] !== 'number') err.push(`${n} : positioning.${k} doit etre un nombre.`);
    if (!(b.backgroundWidth > 0 && b.backgroundHeight > 0)) err.push(`${n} : backgroundWidth/Height > 0 requis.`);
    if (/^#/.test(b.backgroundColor || '')) err.push(`${n} : backgroundColor sans '#'.`);
    if ('backgroundImage' in b && !(b.backgroundImage && b.backgroundImage.path)) err.push(`${n} : backgroundImage vide (omettre la cle).`);
    if (v.action && !(v.action.library && v.action.params)) err.push(`${n} : 'action' sans library/params.`);
    else if (v.action && !ACTIONS.includes(v.action.library)) err.push(`${n} : '${v.action.library}' non autorise (${ACTIONS.join(', ')}).`);
  });
  const inPath = views.filter((v) => v.ordering && v.ordering.includeInPath);
  if (!inPath.length) err.push('Aucune vue dans le parcours (includeInPath).');
  for (const r of vg.route || []) {
    const m = /^#h5p-impress-id-(\d+)$/.exec(r);
    if (!m) err.push(`route : '${r}' au mauvais format.`);
    else if (!ids.has(+m[1])) err.push(`route : '${r}' ne correspond a aucune vue.`);
  }
  return err;
};
