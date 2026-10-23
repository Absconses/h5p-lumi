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
 *  REGLES (verifiees sur l'export) :
 *   1. Couleurs SANS « # » : "000000", "fff".
 *   2. `uniqueId` entier unique ; `route` = "#h5p-impress-id-<uniqueId>"
 *      des seules vues `includeInPath: true`.
 *   3. Pas de `backgroundImage: {}` vide : on omet la cle.
 *   4. Le texte d'une vue passe par `action` = H5P.AdvancedText 1.1
 *      (seule bibliotheque vue dans l'export ; les autres sont a confirmer
 *      dans le semantics.json de la bibliotheque).
 * ===================================================================== */

import crypto from 'crypto';

export const guid = () => crypto.randomUUID();

const rad = (d) => (d * Math.PI) / 180;
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
  inPath = false,
  id = nextId++,
}) => {
  const v = {};
  if (html) {
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

/* Raccourci texte blanc sur fond sombre, comme l'exemple officiel. */
export const textView = (cam, html, { width = 600, height = 320, color = '1d3557', d = 20, ...rest } = {}) =>
  panel(cam, { d, width, height, color, transparent: false, html, ...rest });

/* Station = camera + fond + contenu. `content` :
 *   { html }                -> panneau texte
 *   { image }               -> image (fond noir autour)
 *   { html, image }         -> image a gauche, texte a droite
 */
export const station = (pos, content = {}, { title = 'Etape', bg = '1d3557' } = {}) => {
  const cam = { width: 640, height: 360, ...pos };
  const out = [camera(cam, `${title} — camera`)];
  if (content.html && content.image) {
    out.push(panel(cam, { d: 10, width: 640, height: 360, color: bg, transparent: false, name: `${title} — fond` }));
    out.push(panel(cam, { d: 30, dx: -150, width: 300, height: 300 * content.image.height / content.image.width,
      color: '000000', transparent: false, image: content.image, name: `${title} — image` }));
    out.push(panel(cam, { d: 30, dx: 160, width: 290, height: 320, color: bg, transparent: false,
      html: content.html, name: `${title} — texte` }));
  } else if (content.image) {
    out.push(panel(cam, { d: 10, width: 640, height: 360, color: '000000', transparent: false, name: `${title} — fond` }));
    const h = 330, w = Math.min(620, h * content.image.width / content.image.height);
    out.push(panel(cam, { d: 30, width: w, height: w * content.image.height / content.image.width,
      color: '000000', transparent: false, image: content.image, name: `${title} — image` }));
  } else if (content.html) {
    out.push(textView(cam, content.html, { color: bg, width: 620, height: 340, name: `${title} — texte` }));
  }
  return out;
};

/* Mises en page de stations : renvoie des positions {x,y,z,rotate*}. */
export const layouts = {
  line: (n, { step = 900 } = {}) => Array.from({ length: n }, (_, i) => ({ x: i * step, y: 0, z: 0 })),
  // cercle vu du dessus : chaque station tourne pour suivre la courbe
  circle: (n, { r = 1500 } = {}) => Array.from({ length: n }, (_, i) => {
    const a = (360 / n) * i;
    return { x: r * Math.sin(rad(a)), y: 0, z: -r * Math.cos(rad(a)) + r, rotateY: -a };
  }),
  // spirale qui s'enfonce : effet « plongee »
  spiral: (n, { r = 900, depth = 600, turn = 60 } = {}) => Array.from({ length: n }, (_, i) => ({
    x: r * Math.cos(rad(i * turn)), y: r * Math.sin(rad(i * turn)), z: -i * depth, rotateZ: i * turn,
  })),
  // grille (vue d'ensemble facile a cadrer)
  grid: (n, { cols = 3, sx = 900, sy = 600 } = {}) => Array.from({ length: n }, (_, i) => ({
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

/* Vue d'ensemble : une camera large qui englobe tout (a ajouter en
 * premiere ou derniere etape). `margin` en px. */
export const overview = (views, { margin = 400, name = "Vue d'ensemble" } = {}) => {
  const xs = views.map((v) => v.positioning.x), ys = views.map((v) => v.positioning.y);
  const zs = views.map((v) => v.positioning.z);
  const w = Math.max(...xs) - Math.min(...xs) + 2 * margin;
  const h = Math.max(...ys) - Math.min(...ys) + 2 * margin;
  return camera({
    x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2,
    z: Math.min(...zs), width: Math.max(w, h * 16 / 9), height: Math.max(h, w * 9 / 16),
  }, name);
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
  views.forEach((v, i) => {
    const o = v.ordering || {}, p = v.positioning || {}, b = v.backgroundGroup || {};
    const n = `Vue ${i + 1} (${o.userDefinedName || '?'})`;
    if (!Number.isInteger(o.uniqueId)) err.push(`${n} : 'ordering.uniqueId' entier manquant.`);
    else if (ids.has(o.uniqueId)) err.push(`${n} : uniqueId ${o.uniqueId} en double.`);
    else ids.add(o.uniqueId);
    for (const k of ['x', 'y', 'z', 'rotateX', 'rotateY', 'rotateZ'])
      if (typeof p[k] !== 'number') err.push(`${n} : positioning.${k} doit etre un nombre.`);
    if (!(b.backgroundWidth > 0 && b.backgroundHeight > 0)) err.push(`${n} : backgroundWidth/Height > 0 requis.`);
    if (/^#/.test(b.backgroundColor || '')) err.push(`${n} : backgroundColor sans '#'.`);
    if ('backgroundImage' in b && !(b.backgroundImage && b.backgroundImage.path)) err.push(`${n} : backgroundImage vide (omettre la cle).`);
    if (v.action && !(v.action.library && v.action.params)) err.push(`${n} : 'action' sans library/params.`);
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
