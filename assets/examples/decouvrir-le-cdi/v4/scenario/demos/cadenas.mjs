import fs from 'fs';
import { cp, slide, txt, el, pic, dragText } from '/home/user/h5p-lumi/assets/examples/journalisme-ia/cp.mjs';
import { text, image } from '/home/user/h5p-lumi/assets/examples/decouvrir-le-cdi/v4/scenario/fr.mjs';
const N = {};
const base = (type, extra) => ({ type, showContentTitle: false, proceedButtonText: 'Continuer', forceContentFinished: 'useBehavioural', feedback: { title: '', subtitle: '' }, contentBehaviour: 'useBehavioural', ...extra });
const T = (k, html, next, btn) => { N[k] = base(text(`<div style="font-size:1.15em">${html}</div>`, k), { next, ...(btn ? { proceedButtonText: btn } : {}) }); };
const I = (k, f, alt, next, btn) => { N[k] = base(image(`images/${f}`, 1280, 720, alt, k), { next, ...(btn ? { proceedButtonText: btn } : {}) }); };
const nofb = { title: '', subtitle: '' };
const Q = (k, q, alts) => { N[k] = base({ library: 'H5P.BranchingQuestion 1.0', params: { branchingQuestion: { question: `<p>${q}</p>`, alternatives: alts } }, subContentId: crypto.randomUUID(), metadata: { contentType: 'Branching Question', license: 'U', title: k } }); };
const CODE = [4, 7, 2];

I('lina', 'lina-500.jpg', 'Lina, devant le rayon 500 : « Le rayon 500 est immense… Je ne vais jamais trouver les volcans ! »', 'mot');
T('mot', '<p><strong>Un mot est scotché sur la porte de la réserve.</strong></p><p style="font-family:serif;font-style:italic;background:#fff8dc;border-left:6px solid #e9c46a;padding:12px 16px">« Lina, j’ai mis de côté pour toi le meilleur livre sur les volcans. Il est dans la réserve. Le code du cadenas ? Je l’ai caché dans ta fiche de recherche : <strong>complète-la sans erreur</strong> et il apparaîtra. »<br>La documentaliste</p><p>La réserve est fermée par un cadenas à <strong>3 chiffres</strong>.</p>', 'rayon', 'Aller voir le rayon');
const fiche = `<table style="font-size:0.78em;border-collapse:collapse;width:100%">
<tr><th colspan="2" style="text-align:left;border-bottom:2px solid #333">Rayon 500 · Sciences</th></tr>
<tr><td>510</td><td>Mathématiques</td></tr><tr><td>520</td><td>Astronomie (étoiles, planètes)</td></tr>
<tr><td>530</td><td>Physique</td></tr><tr><td>540</td><td>Chimie</td></tr>
<tr><td>550</td><td>Sciences de la Terre</td></tr><tr><td style="padding-left:1em">551</td><td style="padding-left:1em">Géologie : volcans, séismes, roches</td></tr>
<tr><td style="padding-left:1em">553</td><td style="padding-left:1em">Pierres précieuses, minerais</td></tr>
<tr><td>570</td><td>Sciences de la vie</td></tr><tr><td>580</td><td>Plantes</td></tr><tr><td>590</td><td>Animaux</td></tr></table>`;
const dt = dragText(
  '<p>Complète la fiche de Lina en t’aidant de la fiche du rayon. <strong>Quand tout sera juste, le code apparaîtra.</strong></p>',
  'Lina cherche un *documentaire*, pas un roman.\nLes sciences sont dans le domaine *500*.\nLa Terre est en *550*, mais les volcans ont leur propre nombre : *551*.',
  '*roman* *900* *520* *553* *590*', 'Fiche de Lina');
dt.params.overallFeedback = [
  { from: 0, to: 99, feedback: 'Le cadenas ne te dira rien tant qu’un mot est faux. Relis la fiche du rayon, ligne par ligne.' },
  { from: 100, to: 100, feedback: '🔓 Tout est juste ! En bas de la fiche, une ligne apparaît à l’encre de la documentaliste : « Code de la réserve : 4 – 7 – 2 ».' },
];
dt.params.behaviour.enableSolutionsButton = false; // pas de solution offerte : on la trouve
const pres = cp([slide([txt(2, 3, 34, 94, fiche, 'Fiche du rayon'), el(38, 3, 60, 94, dt)], 'Le rayon')], 'Le rayon 500');
pres.library = 'H5P.CoursePresentation 1.25';
N['rayon'] = base(pres, { next: 'c1', proceedButtonText: 'Aller au cadenas' });

// Cadenas : 3 roues, aucune indication avant la fin (on ne peut pas deviner chiffre par chiffre).
const roue = (k, rang, okNext, koNext) => Q(k, `🔒 Cadenas de la réserve : choisis le <strong>${rang}</strong> chiffre.`, [
  ...[...Array(10).keys()].map((d) => ({ text: String(d), next: okNext && d === CODE[['premier', 'deuxième', 'troisième'].indexOf(rang)] ? okNext : koNext, feedback: nofb })),
  ...(rang === 'premier' ? [{ text: 'Retourner au rayon', next: 'rayon', feedback: nofb }] : []),
]);
roue('c1', 'premier', 'c2', 'c2x');
roue('c2', 'deuxième', 'c3', 'c3x'); roue('c2x', 'deuxième', null, 'c3x');
roue('c3', 'troisième', 'ouvert', 'ferme'); roue('c3x', 'troisième', null, 'ferme');
T('ferme', '<p style="font-size:1.6em">🔒 <em>Clac.</em></p><p>Le cadenas reste fermé. Le code n’apparaît que sur une fiche <strong>entièrement juste</strong>. Retourne au rayon.</p>', 'rayon', 'Retourner au rayon');
T('ouvert', '<p style="font-size:1.6em">🔓 <em>Clic !</em></p><p>La réserve s’ouvre. Sur l’étagère t’attend <em>Tout sur les volcans</em>, cote <strong>551.21 MON</strong>.</p><p>551 : la géologie. .21 : les volcans, plus précisément. MON : les trois premières lettres du nom de l’auteur, Paul Monnier.</p>', 'fin');
I('fin', 'lina-contente.jpg', 'Lina : « Merci ! Avec tout ça, mon exposé va être explosif ! »', -1);

const names = Object.keys(N); const id = (n) => (n === -1 ? -1 : names.indexOf(n));
const content = names.map((n) => { const { next, ...node } = N[n]; const a = node.type.params.branchingQuestion?.alternatives;
  if (a) a.forEach((x) => { x.nextContentId = id(x.next); if (x.nextContentId < -1) throw n; delete x.next; }); else { node.nextContentId = id(next); if (node.nextContentId < -1) throw n; } return node; });
const img = (f) => ({ path: `images/${f}`, mime: 'image/jpeg', width: 1280, height: 720, copyright: { license: 'U' } });
fs.writeFileSync(process.argv[2], JSON.stringify({ branchingScenario: {
  title: 'Le cadenas de la réserve',
  startScreen: { startScreenTitle: '<p>Le cadenas de la réserve</p>', startScreenSubtitle: '<p>Une énigme bloquante au CDI</p>', startScreenImage: img('lina-cote.jpg'), startScreenAltText: 'Lina au CDI' },
  endScreens: [{ endScreenTitle: '<p>Énigme résolue</p>', endScreenSubtitle: '<p>Tu as trouvé le code grâce à la classification Dewey.</p>', contentId: -1, endScreenScore: 0 }],
  content, scoringOptionGroup: { scoringOption: 'no-score', includeInteractionsScores: false },
  behaviour: { enableBackwardsNavigation: false, forceContentFinished: false, randomizeBranchingQuestions: false },
  l10n: { startScreenButtonText: 'Commencer', endScreenButtonText: 'Recommencer', backButtonText: 'Revenir en arrière', disableProceedButtonText: 'Termine d’abord cette étape', replayButtonText: 'Revoir la vidéo', scoreText: 'Ton score :', fullscreenAria: 'Plein écran' },
} }));
console.log('nœuds', content.length);
