// Impressive Presentation « L'iceberg de mon identité numérique » : on descend couche par couche
// dans un seul grand décor (iceberg.py). Chaque étape cadre une carte de texte ET la couche
// de l'iceberg qu'elle explique ; la vue d'ensemble ouvre et ferme le parcours.
// usage : node iceberg.mjs <repo_h5p-lumi> <sortie content.json>
import fs from 'fs';
const [REPO, OUT] = process.argv.slice(2);
const { presentation, view, camera, validate } = await import(`${REPO}/assets/lib/impress-factories.mjs`);

const P = 640;                                  // perspectiveRatio 1
const camZ = (fw) => P * (fw / 640 - 1);        // caméra reculée pour voir fw unités de large
const FW = 1600, CW = 620, CH = 540;            // largeur cadrée, carte

const p = presentation();
// 1. le décor d'abord (les clics vont au dernier élément du DOM)
p.add(view({ name: 'Décor : iceberg', x: 0, y: 100, z: 0, width: 4800, height: 2900, transparent: false, color: '0b2545',
  image: { path: 'images/iceberg.jpg', mime: 'image/jpeg', width: 4800, height: 2900,
    copyright: { license: 'U', title: "L'iceberg de mon identité numérique (illustration)" } } }));

const ETAPES = [
  { side: -1, at: [-700, -850], color: 'e76f51', html:
    `<h2>Ce que je montre</h2><p>Mon pseudo, ma photo de profil, ma bio, mes publications, mes commentaires, mes « j'aime ».</p>
     <p>Je les choisis : ce sont mes <strong>traces volontaires</strong>. C'est la seule partie de l'iceberg que je vois.</p>` },
  { side: 1, at: [700, -850], color: 'e76f51', html:
    `<h2>Une photo en dit plus que prévu</h2><p>Un selfie dans ma chambre peut montrer le nom de mon collège sur mon sweat, ma rue par la fenêtre, l'heure à laquelle je suis à la maison.</p>
     <p>Ce que je montre <strong>exprès</strong> contient aussi des indices que je n'ai pas vus.</p>` },
  { side: -1, at: [-1000, -230], color: '6a4c93', html:
    `<h2>Ce que les autres publient sur moi</h2><p>Une photo de classe, mon nom ajouté sur la photo d'un copain (une identification), un commentaire, une capture d'écran de mon message.</p>
     <p>Je ne l'ai pas publié, mais cela fait partie de mon identité numérique : ce sont des <strong>traces laissées par les autres</strong>.</p>` },
  { side: 1, at: [1000, 330], color: '2a9d8f', html:
    `<h2>Ce que les applis enregistrent</h2><p>L'heure et la durée de mes connexions, le lieu où je suis, ce que je tape dans la recherche, le temps passé sur chaque vidéo, même sans la « liker ».</p>
     <p>Je ne le vois pas : ce sont mes <strong>traces involontaires</strong>.</p>` },
  { side: -1, at: [-1000, 330], color: '2a9d8f', html:
    `<h2>Les données cachées d'une photo</h2><p>Une photo prise avec un téléphone contient des <strong>métadonnées</strong> : la date, l'heure, le modèle du téléphone et souvent les coordonnées GPS du lieu.</p>
     <p>Les réseaux sociaux les retirent souvent de l'image publiée, mais le fichier d'origine envoyé par mail les garde.</p>` },
  { side: 1, at: [1000, 980], color: 'c99a1c', html:
    `<h2>Ce que les algorithmes devinent</h2><p>En croisant toutes ces traces, un algorithme devine mes goûts, mon âge, mes amis, parfois mon humeur.</p>
     <p>Il range mon compte dans des cases (« 13-17 ans, fan de basket ») pour choisir mes vidéos et mes publicités : ce sont des <strong>données déduites</strong>.</p>` },
  { side: -1, at: [-1000, 980], color: '0b2545', html:
    `<h2>Tout l'iceberg, c'est moi</h2><p>Mon identité numérique, c'est l'ensemble : ce que je montre et tout ce que je ne vois pas.</p>
     <p>Je ne contrôle pas tout, mais j'agis sur chaque couche : réfléchir avant de publier, demander avant d'identifier quelqu'un, couper la localisation inutile.</p>` },
];

// cartes (dans le plan du décor, juste devant), puis textes, puis caméras dans l'ordre du parcours
const ov = () => camera({ x: 0, y: 0, z: camZ(4800) }, "Vue d'ensemble");
const cams = [ov()];
ETAPES.forEach((e, i) => {
  const cx = e.at[0] + e.side * (FW / 2 - 60 - CW / 2), cy = e.at[1];
  p.add(view({ name: `Étape ${i + 2} — bandeau`, x: cx, y: cy - CH / 2 + 9, z: 12, width: CW, height: 18, transparent: false, color: e.color }));
  p.add(view({ name: `Étape ${i + 2} — carte`, x: cx, y: cy, z: 10, width: CW, height: CH, transparent: false, color: 'ffffff' }));
  p.add(view({ name: `Étape ${i + 2} — texte`, x: cx, y: cy + 10, z: 16, width: 2 * (CW - 70), height: CH - 40,
    html: `<div style="font-size:1.5em;line-height:1.28">${e.html.replace(/\n\s+/g, '')}</div>` }));
  cams.push(camera({ x: e.at[0], y: e.at[1], z: camZ(FW) }, `Étape ${i + 2} — caméra`));
});
cams.push(ov());
cams[cams.length - 1].ordering.userDefinedName = "Retour à la vue d'ensemble";
// les ids doivent croître dans l'ordre de views : on renumérote les caméras après les panneaux
let id = Math.max(...p.views.map((v) => v.ordering.uniqueId)) + 1;
for (const c of cams) { c.ordering.uniqueId = id++; p.add(c); }
const content = p.toJSON();
const errs = validate(content);
if (errs.length) { console.error(errs); process.exit(1); }
fs.writeFileSync(OUT, JSON.stringify(content));
console.log('iceberg :', content.viewsGroup.views.length, 'vues,', content.viewsGroup.route.length, 'étapes');
