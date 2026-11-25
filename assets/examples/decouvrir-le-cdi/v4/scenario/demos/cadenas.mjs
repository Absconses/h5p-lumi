import fs from 'fs';
import { cp, slide, txt, pic } from '/home/user/h5p-lumi/assets/examples/journalisme-ia/cp.mjs';
import { text, image } from '/home/user/h5p-lumi/assets/examples/decouvrir-le-cdi/v4/scenario/fr.mjs';
const N = {};
const base = (type, extra) => ({ type, showContentTitle: false, proceedButtonText: 'Continuer', forceContentFinished: 'useBehavioural', feedback: { title: '', subtitle: '' }, contentBehaviour: 'useBehavioural', ...extra });
const T = (k, html, next, btn) => { N[k] = base(text(`<div style="font-size:1.15em">${html}</div>`, k), { next, ...(btn ? { proceedButtonText: btn } : {}) }); };
const I = (k, f, alt, next, btn) => { N[k] = base(image(`images/${f}`, 1280, 720, alt, k), { next, ...(btn ? { proceedButtonText: btn } : {}) }); };
const nofb = { title: '', subtitle: '' };
const Q = (k, q, alts) => { N[k] = base({ library: 'H5P.BranchingQuestion 1.0', params: { branchingQuestion: { question: `<p>${q}</p>`, alternatives: alts } }, subContentId: crypto.randomUUID(), metadata: { contentType: 'Branching Question', license: 'U', title: k } }); };
const CODE = [5, 9, 8];

I('lina', 'lina-500.jpg', 'Lina, devant le rayon 500 : « Le rayon 500 est immense… Je ne vais jamais trouver les volcans ! »', 'mot');
T('mot', '<p><strong>Un mot est scotché sur la porte de la réserve.</strong></p><p style="font-family:serif;font-style:italic;background:#fff8dc;border-left:6px solid #e9c46a;padding:12px 16px">« Lina, j’ai mis de côté dans la réserve trois documents pour ton exposé. Le code du cadenas ? Chaque chiffre est le <strong>domaine Dewey</strong> d’un de ces documents, dans l’ordre. »<br>Le professeur documentaliste</p><p>La réserve est fermée par un cadenas à <strong>3 chiffres</strong>.</p>', 'enigme', 'Lire la suite du mot');
const indices = `<p style="font-size:1.05em"><strong>Les trois documents de Lina</strong></p>
<p>1er chiffre : un livre qui explique <strong>comment se forme un volcan</strong>.</p>
<p>2e chiffre : un récit de la <strong>destruction de Pompéi par le Vésuve, en l’an 79</strong>.</p>
<p>3e chiffre : un recueil de <strong>poèmes</strong> sur le feu de la Terre.</p>
<p style="color:#555">Pour chaque document, garde le premier chiffre de son domaine (500 → 5).</p>`;
const pres = cp([slide([
  pic(2, 6, 48, 'dewey.jpg', 694, 423, 'Les 10 domaines de la classification Dewey : 000 généralités, 100 philosophie et psychologie, 200 religions, 300 sciences sociales, 400 langues, 500 sciences, 600 sciences appliquées, 700 arts et loisirs, 800 littérature, 900 histoire et géographie.'),
  txt(52, 4, 46, 92, indices, 'Indices'),
], 'L’énigme')], 'L’énigme du cadenas');
pres.library = 'H5P.CoursePresentation 1.25';
N['enigme'] = base(pres, { next: 'c1', proceedButtonText: 'Aller au cadenas' });

// Cadenas : 3 roues, aucune indication avant la fin (on ne peut pas deviner chiffre par chiffre).
const roue = (k, rang, okNext, koNext) => Q(k, `🔒 Cadenas de la réserve : choisis le <strong>${rang}</strong> chiffre.`, [
  ...[...Array(10).keys()].map((d) => ({ text: String(d), next: okNext && d === CODE[['premier', 'deuxième', 'troisième'].indexOf(rang)] ? okNext : koNext, feedback: nofb })),
  ...(rang === 'premier' ? [{ text: 'Relire les indices', next: 'enigme', feedback: nofb }] : []),
]);
roue('c1', 'premier', 'c2', 'c2x');
roue('c2', 'deuxième', 'c3', 'c3x'); roue('c2x', 'deuxième', null, 'c3x');
roue('c3', 'troisième', 'ouvert', 'ferme'); roue('c3x', 'troisième', null, 'ferme');
T('ferme', '<p style="font-size:1.6em">🔒 <em>Clac.</em></p><p>Le cadenas reste fermé. Au moins un document n’est pas dans le bon domaine. Lequel ? Le cadenas ne le dira pas.</p>', 'enigme', 'Relire les indices');
T('ouvert', '<p style="font-size:1.6em">🔓 <em>Clic !</em></p><p>La réserve s’ouvre. Trois documents attendent Lina :</p><p><strong>5</strong>00, sciences : <em>Tout sur les volcans</em> (551.21 : le volcan est un phénomène de la nature).<br><strong>9</strong>00, histoire : <em>Pompéi, la ville ensevelie</em> (c’est un événement du passé, même s’il parle d’un volcan).<br><strong>8</strong>00, littérature : <em>Poèmes de feu</em> (des poèmes, quel que soit leur sujet).</p><p>Un même sujet peut donc se trouver dans plusieurs domaines : c’est le <strong>point de vue</strong> qui compte.</p>', 'fin');
I('fin', 'lina-contente.jpg', 'Lina : « Merci ! Avec tout ça, mon exposé va être explosif ! »', -1);

const names = Object.keys(N); const id = (n) => { if (n === -1) return -1; const i = names.indexOf(n); if (i < 0) throw new Error('nœud inconnu ' + n); return i; };
const content = names.map((n) => { const { next, ...node } = N[n]; const a = node.type.params.branchingQuestion?.alternatives;
  if (a) a.forEach((x) => { x.nextContentId = id(x.next); if (x.nextContentId < -1) throw n; delete x.next; }); else { node.nextContentId = id(next); if (node.nextContentId < -1) throw n; } return node; });
const img = (f) => ({ path: `images/${f}`, mime: 'image/jpeg', width: 1280, height: 720, copyright: { license: 'U' } });
fs.writeFileSync(process.argv[2], JSON.stringify({ branchingScenario: {
  title: 'Le cadenas de la réserve',
  startScreen: { startScreenTitle: '<p>Le cadenas de la réserve</p>', startScreenSubtitle: '<p>Une énigme bloquante au CDI</p>', startScreenImage: img('lina-cote.jpg'), startScreenAltText: 'Lina au CDI' },
  endScreens: [{ endScreenTitle: '<p>Énigme résolue</p>', endScreenSubtitle: '<p>Un même sujet, trois domaines : tu as raisonné comme la classification Dewey.</p>', contentId: -1, endScreenScore: 0 }],
  content, scoringOptionGroup: { scoringOption: 'no-score', includeInteractionsScores: false },
  behaviour: { enableBackwardsNavigation: false, forceContentFinished: false, randomizeBranchingQuestions: false },
  l10n: { startScreenButtonText: 'Commencer', endScreenButtonText: 'Recommencer', backButtonText: 'Revenir en arrière', disableProceedButtonText: 'Termine d’abord cette étape', replayButtonText: 'Revoir la vidéo', scoreText: 'Ton score :', fullscreenAria: 'Plein écran' },
} }));
console.log('nœuds', content.length);
