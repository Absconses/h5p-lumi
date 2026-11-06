/* La vie d'un livre — de l'autrice à la boîte à livres de l'école
 * (H5P.ImpressPresentation 1.0, style « cinéma », EMI 6e)
 * 1) python3 dos.py && python3 bg.py plans.json   -> media/ (photos des étapes)
 * 2) node build.mjs && python3 map.py && node build.mjs  -> geom.json, media/carte-ville.jpg, content.json
 *
 * Mise en scène : la VILLE DU LIVRE, vue de dessus. Chaque étape est posée sur son lieu :
 * la maison de l'autrice, la maison d'édition, l'imprimerie (et la BnF à côté), l'entrepôt,
 * la librairie, puis le collège avec le PLAN du CDI (bureau du professeur documentaliste,
 * présentoir, rayons, banque de prêt, réserve) et la cour avec la boîte à livres.
 * La 2e étape montre toute la ville : on voit le livre traverser la chaîne d'un coup d'œil,
 * puis on « entre » dans chaque lieu. Le décor est UNE image (map.py) derrière les photos.
 * Règles : voir references/impress-presentation.md (cartes à D = -96, clics à d > 0,
 * décor au début de `views`). */
import fs from 'fs';
import { execSync } from 'child_process';
import { presentation, camera, panel, overview, validate, guid } from './lib.mjs';

const [MEDIA = 'media', CREDITS = 'credits.json'] = process.argv.slice(2);
const credits = JSON.parse(fs.readFileSync(CREDITS, 'utf8'));
const size = (f) => execSync(`python3 -c "from PIL import Image;print(*Image.open('${f}').size)"`).toString().trim().split(' ').map(Number);
const img = (file, from) => {
  const [width, height] = size(`${MEDIA}/${file}`);
  const o = { path: `images/${file}`, mime: file.endsWith('.png') ? 'image/png' : 'image/jpeg', width, height };
  const c = from && credits[from];
  if (c) o.copyright = { license: 'U', title: `${c.title} (Pixabay Content License)`, author: c.artist, source: c.page };
  return o;
};

// --- géométrie ---------------------------------------------------------------
const P = 640, K = 1.15, D = -(K - 1) * P;
const rad = (d) => (d * Math.PI) / 180;
const p = presentation();
let n = 0;
const cam = (pose, name) => { p.add(camera(pose, `${String(++n).padStart(2, '0')} ${name}`)); return pose; };
const txt = (pose, html, o) => panel(pose, { transparent: true, html, ...o, width: 2 * o.width });
const at = (x, y, rotateZ = 0) => ({ x, y, z: 0, rotateX: 0, rotateY: 0, rotateZ });
const white = (html) => html.replace(/<p>(.*?)<\/p>/gs, '<p><span style="color:#ffffff">$1</span></p>');

/* Un plan : photo plein cadre (titre incrusté) + texte blanc à gauche. */
const shot = (pose, { bg, from, html, name, top = -40, w = 275 }) => {
  p.add(panel(pose, { d: D, width: 640 * K, height: 360 * K, color: '080c1e', transparent: false, image: img(bg, from), name: `${name} — fond` }));
  if (html) {
    const dx = (-320 + 32 + w / 2) * K;
    p.add(txt(pose, white(html), { d: D + 8, dx, dy: (top + 60) * K, width: w * K, height: 230 * K, name: `${name} — texte` }));
  }
};


// --- la ville : position de chaque étape (x vers la droite, y vers le bas) -------------
const S = {
  titre: at(-1500, -1500),
  auteur: at(0, -1500),                      // maison de l'autrice
  editeur: at(1500, -1500), couv: at(3000, -1500),   // maison d'édition
  impr: at(4600, -1500), ident: at(4600, 200),       // imprimerie
  entrepot: at(3000, 200),                   // entrepôt du distributeur
  libr: at(1500, 200),                       // librairie
  equip: at(1500, 1950), nouv: at(0, 1950), rayon: at(-1500, 1950),   // CDI, 1re rangée
  docs: at(-1500, 2520),                     // CDI, entre les deux rangées, le long des rayons (plan inchangé)
  lecteurs: at(-1500, 3000), desherb: at(0, 3000),                     // CDI, 2e rangée
  boite: at(4300, 3000),                     // cour de l'école
};
const ZB = D - 160;                          // la carte, juste derrière les photos
/* Cadre de la vue d'ensemble (unités du monde, à la profondeur de la carte). */
const FRAME = { x: -2350, y: -2300, w: 10400 };
FRAME.h = FRAME.w * 9 / 16;

const T = {
  titre: `<p>Ce roman que tu empruntes au CDI a déjà fait un long voyage. Avant d'arriver entre tes mains, il est passé par <strong>une dizaine de métiers</strong>.</p>`
    + `<p>Imaginons un roman : <strong>« Le Secret du phare »</strong>, d'Inès Moreau. Suivons-le, de l'idée de son autrice jusqu'à la boîte à livres de l'école.</p>`
    + `<p><em>Avance avec la flèche →</em></p>`,
  auteur: `<p>Tout commence par une <strong>idée</strong>. Inès imagine l'histoire d'une fille qui découvre un secret dans un vieux phare.</p>`
    + `<p>Elle écrit pendant des mois, rature, réécrit : c'est le <strong>manuscrit</strong>. Quand il est prêt, elle l'envoie à des maisons d'édition.</p>`,
  editeur: `<p>Une maison d'édition reçoit des centaines de manuscrits et n'en publie que quelques-uns. L'<strong>éditrice</strong> choisit celui d'Inès et l'aide à l'améliorer ; un <strong>correcteur</strong> traque les fautes.</p>`
    + `<p>Inès signe un contrat : elle touchera des <strong>droits d'auteur</strong> sur chaque livre vendu.</p>`,
  couv: `<p>Un <strong>illustrateur</strong> dessine la couverture, un <strong>graphiste</strong> choisit les lettres du titre. La couverture doit donner envie et annoncer le genre : aventure, fantastique, humour…</p>`
    + `<p>Au dos, on écrit la <strong>quatrième de couverture</strong> : un court résumé qui donne envie de lire.</p>`,
  impr: `<p>Le livre est imprimé sur de grandes feuilles, dans des machines très rapides. Les feuilles sont pliées en <strong>cahiers</strong>, assemblées puis collées ou cousues : c'est la <strong>reliure</strong>.</p>`
    + `<p>On ajoute la couverture, on coupe les bords… Le premier <strong>tirage</strong> compte souvent quelques milliers d'exemplaires.</p>`,
  ident: `<p>Chaque livre a un <strong>ISBN</strong> : un numéro unique de 13 chiffres, imprimé au dos avec un code-barres. Le prix y est écrit aussi.</p>`
    + `<p>Un exemplaire est envoyé à la Bibliothèque nationale de France : c'est le <strong>dépôt légal</strong>, pour garder une trace de tout ce qui est publié.</p>`,
  entrepot: `<p>Avant la sortie, des <strong>représentants</strong> ont présenté le livre aux libraires : c'est la <strong>diffusion</strong>.</p>`
    + `<p>Les cartons partent ensuite chez un <strong>distributeur</strong> : d'immenses entrepôts qui stockent les livres et les livrent aux librairies.</p>`,
  libr: `<p>Le <strong>libraire</strong> choisit les livres, les conseille et les vend. En France, l'éditeur fixe le prix : <strong>prix unique du livre</strong> (loi de 1981), pas plus de 5 % de réduction, en librairie comme sur Internet.</p>`
    + `<p>Sur un livre à 10 €, le libraire garde environ 3,50 € ; l'autrice, environ 1 €.</p>`,
  equip: `<p>Le professeur documentaliste a commandé le livre. À son arrivée, il l'<strong>équipe</strong> : tampon du CDI, code-barres de prêt, étiquette de <strong>cote</strong> sur le dos, film plastique pour le protéger.</p>`
    + `<p>Puis il le <strong>catalogue</strong> : il crée sa fiche dans le catalogue du CDI, pour qu'on puisse le retrouver.</p>`,
  nouv: `<p>Le voici sur le présentoir des <strong>nouveautés</strong>, couverture bien visible. C'est là que les livres attirent le plus de lecteurs !</p>`
    + `<p>Il peut aussi rejoindre une sélection, une exposition ou un prix des lecteurs.</p>`,
  rayon: `<p>Après quelques semaines en vitrine, il faut lui trouver sa place. Tout dépend de sa <strong>nature</strong>. « Le Secret du phare » raconte une histoire inventée : c'est une <strong>fiction</strong>, un roman.</p>`
    + `<p>Les romans sont rangés par <strong>genre</strong> (aventure, enquête, fantasy…), signalé par une <strong>pastille</strong> de couleur, puis par auteur. Sa cote : <strong>R MOR</strong> = Roman + MOReau.</p>`,
  docs: `<p>Dans le même carton, il y avait <strong>« Tout sur les océans »</strong>. Lui explique le monde réel : c'est un <strong>documentaire</strong>. Il est rangé par <strong>sujet</strong>, avec un numéro de la <strong>classification Dewey</strong>.</p>`
    + `<p>Sa cote : <strong>551.46 MAR</strong> (500 = sciences, 551.46 = les océans ; MAR = Léa MARtin). BD, albums et magazines ont souvent leur propre coin.</p>`,
  lecteurs: `<p>Emprunté, lu, rendu, conseillé à un copain… Un livre de CDI peut être prêté des dizaines de fois.</p>`
    + `<p>À chaque <strong>prêt</strong>, on scanne son code-barres : le logiciel sait qui l'a emprunté et quand il doit revenir.</p>`,
  desherb: `<p>Des années plus tard, le livre est abîmé, ou plus personne ne l'emprunte. Le professeur documentaliste le retire des rayons : c'est le <strong>désherbage</strong>, comme au jardin !</p>`
    + `<p>Il fait de la place pour les nouveautés. Mais notre livre n'est pas jeté…</p>`,
  boite: `<p>Il rejoint la <strong>boîte à livres</strong> de l'école : chacun peut y prendre un livre gratuitement, le garder ou le rapporter, et en déposer d'autres.</p>`
    + `<p>« Le Secret du phare » commence une <strong>nouvelle vie</strong> avec de nouveaux lecteurs. Et peut-être que l'un d'eux écrira le prochain livre…</p>`,
};

// 0. Titre
shot(cam(S.titre, 'Titre'), { bg: 's00-titre.jpg', from: 'titre', name: 'Titre', top: -10, html: T.titre });
// Créer
shot(cam(S.auteur, "L'autrice"), { bg: 's01-autrice.jpg', from: 'auteur', name: 'Autrice', html: T.auteur });
shot(cam(S.editeur, "La maison d'édition"), { bg: 's02-editeur.jpg', from: 'editeur', name: 'Éditeur', html: T.editeur });
shot(cam(S.couv, 'La couverture'), { bg: 's03-couverture.jpg', from: 'illustration', name: 'Couverture', html: T.couv });
// Fabriquer
shot(cam(S.impr, "L'imprimerie"), { bg: 's04-imprimerie.jpg', from: 'imprimerie', name: 'Imprimerie', html: T.impr });
shot(cam(S.ident, "Sa carte d'identité"), { bg: 's05-identite.jpg', from: 'identite', name: 'Identité', html: T.ident });
// Vendre
shot(cam(S.entrepot, "L'entrepôt"), { bg: 's06-entrepot.jpg', from: 'entrepot', name: 'Entrepôt', html: T.entrepot });
shot(cam(S.libr, 'La librairie'), { bg: 's07-librairie.jpg', from: 'librairie', name: 'Librairie', html: T.libr });
// Au CDI : on parcourt le plan du CDI
shot(cam(S.equip, 'CDI — équipement'), { bg: 's08-equipement.jpg', from: 'arrivee', name: 'CDI équipement', html: T.equip });
shot(cam(S.nouv, 'CDI — nouveautés'), { bg: 's09-nouveautes.jpg', from: 'nouveautes', name: 'CDI nouveautés', html: T.nouv });
shot(cam(S.rayon, 'CDI — romans'), { bg: 's10-romans.jpg', name: 'CDI romans', html: T.rayon });
shot(cam(S.docs, 'CDI — documentaires'), { bg: 's10b-documentaires.jpg', from: 'rayon', name: 'CDI documentaires', html: T.docs });
shot(cam(S.lecteurs, 'Les lecteurs'), { bg: 's11-lecteurs.jpg', from: 'lecteur', name: 'Lecteurs', html: T.lecteurs });
shot(cam(S.desherb, 'Le désherbage'), { bg: 's12-desherbage.jpg', from: 'desherbage', name: 'Désherbage', html: T.desherb });
// Nouvelle vie
shot(cam(S.boite, 'La boîte à livres'), { bg: 's13-boite.jpg', from: 'boite', name: 'Boîte à livres', html: T.boite });

// --- activités : photo + exercice DEVANT la caméra (cliquable), hors du chemin ---------
const activity = (pose, { bg, from, name, action }) => {
  shot(pose, { bg, from, name });
  const v = panel(pose, { d: 8, dy: 22, width: 590, height: 300, transparent: true, name: `${name} — exercice` });
  v.action = { ...action, subContentId: guid() };
  p.add(v);
};
activity(cam(at(10500, -700), 'Qui fait quoi ?'), { bg: 's14-quifait.jpg', from: 'activite1', name: 'Qui fait quoi',
  action: { library: 'H5P.Blanks 1.4', metadata: { contentType: 'Fill in the Blanks', license: 'U', title: 'Qui fait quoi ?' },
    params: {
      text: '<p><strong>Complète avec le bon métier.</strong></p>',
      questions: [
        '<p><span style="font-size:0.85em">L\'*autrice/auteur/auteure* écrit le manuscrit, l\'*éditrice/éditeur* le choisit et paie sa fabrication.</span></p>',
        '<p><span style="font-size:0.85em">L\'*illustrateur/illustratrice* dessine la couverture, l\'*imprimeur/imprimeuse/imprimerie* fabrique le livre.</span></p>',
        '<p><span style="font-size:0.85em">Le *libraire* le vend ; au CDI, le professeur *documentaliste* l\'équipe et le range.</span></p>',
      ],
      score: 'Tu as @score point(s) sur @total.', showSolutions: 'Voir la solution', tryAgain: 'Recommencer', checkAnswer: 'Vérifier',
      notFilledOut: 'Remplis toutes les cases.',
      behaviour: { enableRetry: true, enableSolutionsButton: true, autoCheck: false, caseSensitive: false, showSolutionsRequiresInput: true, separateLines: false },
    } } });
activity(cam(at(10500, 800), 'Au CDI ?'), { bg: 's15-aucdi.jpg', from: 'activite2', name: 'Au CDI',
  action: { library: 'H5P.MarkTheWords 1.5', metadata: { contentType: 'Mark the Words', license: 'U', title: 'Ça se passe au CDI ?' },
    params: {
      taskDescription: '<p><strong>Clique sur les mots qui décrivent ce qui se passe AU CDI.</strong></p>',
      textField: '<p>Le livre est imprimé, puis stocké dans un entrepôt et vendu en librairie. Au collège, il est *équipé*, *catalogué* et *exposé* avec les nouveautés. Il est *rangé* au rayon selon sa nature, *emprunté* par les élèves puis, des années plus tard, *désherbé*.</p>',
      checkAnswerButton: 'Vérifier', tryAgainButton: 'Recommencer', showSolutionButton: 'Voir la solution',
      score: 'Tu as @score point(s) sur @total.',
      behaviour: { enableRetry: true, enableSolutionsButton: true },
    } } });

// --- la carte de la ville (2e étape) -------------------------------------------------------
/* Caméra reculée qui cadre exactement FRAME à la profondeur ZB ; map.py dessine la ville
 * dans ce même repère (geom.json). Les photos, plus proches (D), paraissent K_PHOTO fois plus
 * loin du centre : map.py en tient compte pour poser les lieux pile sous les photos. */
const cx = FRAME.x + FRAME.w / 2, cy = FRAME.y + FRAME.h / 2;
const zc = ZB + (FRAME.w / 640) * P - P;
const map = camera({ x: cx, y: cy, z: zc, rotateX: 0, rotateY: 0, rotateZ: 0 }, 'Carte de la ville du livre');
fs.writeFileSync('geom.json', JSON.stringify({ frame: [FRAME.x, FRAME.y, FRAME.w, FRAME.h], center: [cx, cy],
  kPhoto: (P + zc - ZB) / (P + zc - D), photo: [640 * K, 360 * K], S }, null, 1));
if (fs.existsSync(`${MEDIA}/carte-ville.jpg`)) {
  p.views.unshift(panel({ x: cx, y: cy, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0 },
    { d: ZB, width: FRAME.w, height: FRAME.h, color: 'e9e4d4', transparent: false, image: img('carte-ville.jpg'), name: 'Décor — la ville du livre' }));
}
p.add(map);

// --- quiz et crédits -------------------------------------------------------------------
const QUIZ = [
  ['Comment s\'appelle le texte de l\'auteur avant d\'être publié ?', 'Le manuscrit', 'Le brouillon officiel', 'Le contrat d\'édition'],
  ['À quoi sert l\'ISBN ?', 'À identifier le livre', 'À fixer le prix du livre en magasin', 'À noter la qualité du livre'],
  ['Au CDI, où range-t-on un documentaire sur les océans ?', 'Avec les sciences, grâce à son numéro Dewey', 'Avec les romans d\'aventure, grâce à sa pastille', 'Avec les grands livres, rangés selon leur taille'],
  ['Au CDI, que veut dire la cote « R MOR » ?', 'Roman d\'un auteur nommé Moreau', 'Roman rangé au rayon Mystère', 'Roman de la collection Moreau'],
  ['Que veut dire « désherber » au CDI ?', 'Retirer les livres abîmés ou oubliés', 'Réparer les livres abîmés ou déchirés', 'Ranger les livres revenus de prêt'],
  ['Que fait-on avec une boîte à livres ?', 'On prend et on dépose des livres', 'On les vend à petit prix aux élèves', 'On rend les livres du CDI le soir'],
];
const q = cam(at(12000, 0), 'Quiz');
shot(q, { bg: 's16-quiz.jpg', from: 'quiz', name: 'Quiz' });
const quiz = panel(q, { d: 8, dy: 25, width: 520, height: 280, transparent: true, name: 'Quiz' });
quiz.action = {
  library: 'H5P.SingleChoiceSet 1.3',
  params: {
    choices: QUIZ.map(([question, ...answers]) => ({ question: `<p>${question}</p>`, answers: answers.map((a) => `<p>${a}</p>`) })),
    behaviour: { timeoutCorrect: 1500, timeoutWrong: 2500, soundEffectsEnabled: false, enableRetry: true, enableSolutionsButton: true },
    l10n: { resultSlideTitle: ':numcorrect bonne(s) réponse(s) sur :maxscore', showSolutionButtonLabel: 'Voir la solution', retryButtonLabel: 'Recommencer', solutionViewTitle: 'Solution' },
  },
  subContentId: guid(),
  metadata: { contentType: 'Single Choice Set', license: 'U', title: 'Quiz : la vie d\'un livre' },
};
p.add(quiz);

const cr = cam(at(13500, 0), 'Crédits');
shot(cr, { bg: 's17-credits.jpg', from: 'credits', name: 'Crédits' });
const LEG = { titre: 'Livre ouvert', auteur: 'Carnet', editeur: 'Correction', illustration: 'Aquarelle', imprimerie: 'Presse offset', identite: 'Livres',
  entrepot: 'Entrepôt', librairie: 'Librairie', arrivee: 'Pile de livres', nouveautes: 'Bandes dessinées', rayon: 'Rayonnages', lecteur: 'Lecteur',
  desherbage: 'Vieux livres', boite: 'Boîte à livres', activite1: 'Pages en cœur', activite2: 'Bac à livres', quiz: 'Pages', credits: 'Piles de livres' };
const A = (href, t) => `<a href="${href}" target="_blank"><span style="color:#8fd3ff">${t}</span></a>`;
const credLines = Object.entries(LEG).map(([k, leg]) => `${leg} : ${credits[k].artist}`).join(' · ');
p.add(txt(cr, `<p><span style="color:#ffffff;font-size:0.75em"><strong>Photos</strong> : ${A('https://pixabay.com', 'Pixabay')} (licence Pixabay) — ${credLines}. Carte de la ville et couvertures des romans : dessins originaux pour ce module.</span></p>`
  + `<p><span style="color:#ffffff;font-size:0.75em">« Le Secret du phare », « Tout sur les océans », leurs autrices et les Éditions Imaginaires sont <strong>inventés</strong> pour ce module ; l'ISBN est fictif.</span></p>`
  + `<p><span style="color:#ffffff;font-size:0.75em"><strong>Sources</strong> : loi n° 81-766 du 10 août 1981 relative au prix du livre ; BnF (dépôt légal) ; Syndicat national de l'édition (répartition du prix d'un livre).</span></p>`,
  { d: 8, dx: 10, dy: 20, width: 580, height: 300, name: 'Crédits — texte' }));

// --- parcours ----------------------------------------------------------------------------
/* Le DÉCOR d'abord : le navigateur donne les clics au dernier élément du DOM sous la souris. */
const isDecor = (v) => /^Décor/.test(v.ordering.userDefinedName);
p.views.splice(0, p.views.length, ...p.views.filter(isDecor), ...p.views.filter((v) => !isDecor(v)));
p.views.forEach((v, i) => { v.ordering.uniqueId = i; });
const cams = p.views.filter((v) => v.ordering.includeInPath);
const byName = (s) => cams.find((v) => v.ordering.userDefinedName.startsWith(s));
const order = [byName('01'), byName('Carte')].concat(cams.filter((v) => v !== byName('01') && v !== byName('Carte')));
if (process.env.START) order.splice(0, +process.env.START);
const content = p.toJSON(order.map((v) => `#h5p-impress-id-${v.ordering.uniqueId}`));
const errs = validate(content);
if (errs.length) { console.error(errs); process.exit(1); }
fs.writeFileSync('content.json', JSON.stringify(content, null, 1));
console.log('vues', p.views.length, 'étapes', content.viewsGroup.route.length);
