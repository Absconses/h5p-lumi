// Branching Scenario « L'affaire des livres sans pastille » : reconnaître un polar, en parcours différencié.
// usage : node scenario.mjs <content.json de sortie> <hotspots.json>
//
// Principe (apprentissage échelonné) : le scénario ne lit pas les scores, il ne bifurque que sur des clics.
// On fait donc décider le chemin par les réponses elles-mêmes :
//   - Pièce 1 = DIAGNOSTIC en deux questions (le genre, puis ce qui le prouve), sans correction immédiate.
//     Deux bonnes réponses → RACCOURCI proposé (on saute la méthode, ou on la regarde quand même).
//     Sinon → DÉTOUR : « Je découvre » (la méthode, points cliquables, aucune réponse demandée),
//     « Je retiens », « Je suis accompagné » (Drag Text avec coups de pouce, pièce 2), puis pièce 2.
//   - Pièces 3 et 4 = « je fais seul ». Chaque mauvaise réponse est une ERREUR TYPE d'élève et mène à une
//     REMÉDIATION CIBLÉE sur cette erreur-là, puis à un CAS JUMEAU (3 bis, 4 bis) qui la reteste.
//     Bonne réponse du premier coup → on passe directement à la suite.
//   - Fin commune : écrire sa définition, puis la comparer à trois définitions d'élèves (patron « écris
//     d'abord, compare ensuite »), « Je retiens », puis un DÉFI BONUS facultatif pour ceux qui ont du temps.
import fs from 'fs';
import { text, image, sub } from '../journalisme-ia/fr.mjs';
import { cp, slide, txt, el, pic, dragText } from '../journalisme-ia/cp.mjs';
import { alt } from './pieces.mjs';
const [OUT, HOT] = process.argv.slice(2);
const HS = JSON.parse(fs.readFileSync(HOT, 'utf8')).p1;

const N = {};
const base = (type, extra = {}) => ({
  type, showContentTitle: false, proceedButtonText: 'Continuer', forceContentFinished: 'useBehavioural',
  feedback: { title: '', subtitle: '' }, contentBehaviour: 'useBehavioural', ...extra,
});
const img = (file, w = 1280, h = 720) => ({ path: `images/${file}`, mime: 'image/jpeg', width: w, height: h, copyright: { license: 'U' } });
const T = (name, html, next, button = 'Continuer') => { N[name] = base(text(`<div style="font-size:1.15em">${html}</div>`, name), { next, proceedButtonText: button }); };
const I = (name, k, next, button = 'J’ai lu la quatrième') => { N[name] = base(image(`images/${k}.jpg`, 1280, 720, alt(k), name), { next, proceedButtonText: button }); };
const Q = (name, question, alts) => {
  N[name] = base(sub('H5P.BranchingQuestion 1.0', { branchingQuestion: { question: `<p>${question}</p>`, alternatives: alts } }, 'Branching Question', name));
};
const go = (label, next, title = '', subtitle = '') => ({ text: label, next, feedback: { title: title && `<p>${title}</p>`, subtitle: subtitle && `<p>${subtitle}</p>` } });
const bon = (label, next, why) => go(label, next, 'Bonne piste', why);
const faux = (label, q, why) => go(label, q, 'Mauvaise piste', why);
const revoir = (k) => go('Revoir la quatrième', k);

/* ---------- Départ ---------- */
T('mission', '<p><strong>Affaire n° 6-27 : le carton sans pastilles</strong></p>'
  + '<p>Le professeur documentaliste a reçu un carton de nouveaux romans. Problème : les <strong>pastilles de genre</strong> ne sont pas encore collées. Il te confie l’enquête : <strong>repérer les polars</strong> pour leur donner leur pastille.</p>'
  + '<p><strong>Ce jeu s’adapte à toi.</strong> Si tu réussis du premier coup, tu prends des raccourcis. Si tu hésites, le professeur documentaliste te montre sa méthode, puis tu repars. Personne ne fait exactement le même chemin, et c’est normal.</p>'
  + '<p>Pour chaque livre, ta pièce à conviction, c’est la <strong>quatrième de couverture</strong>. Lis-la bien.</p>', 'p1', 'Ouvrir le carton');

/* ---------- Pièce 1 : diagnostic (pas de correction immédiate) ---------- */
I('p1', 'p1', 'p1?');
Q('p1?', 'Scellé n° 1, « Le Manuscrit disparu ». Quel est le genre de ce roman ?', [
  go('Un roman d’aventure', 'p1b-'),
  go('Un polar', 'p1b+'),
  go('Un roman fantastique', 'p1b-'),
  revoir('p1'),
]);
const PREUVE = 'Qu’est-ce qui le montre le mieux ?';
const preuves = (ok, ko) => [
  go('Un livre précieux a disparu', ko),
  go('Zoé cherche qui est le voleur', ok),
  go('L’histoire est pleine de suspense', ko),
];
Q('p1b+', PREUVE, preuves('raccourci', 'detour'));
Q('p1b-', PREUVE, preuves('detour', 'detour'));

T('raccourci', '<p><strong>Œil d’enquêteur !</strong> Tu as vu l’essentiel : <em>Le Manuscrit disparu</em> est un polar, parce que <strong>quelqu’un enquête pour découvrir qui a commis un méfait</strong>. Un vol seul, ou du suspense seul, ne suffiraient pas.</p>'
  + '<p>Tu peux sauter l’entraînement et passer directement aux livres pièges.</p>', 'raccourci?');
Q('raccourci?', 'Que fais-tu ?', [
  go('Prendre le raccourci', 'p3'),
  go('Voir quand même la méthode', 'd0'),
]);
T('detour', '<p><strong>Pas encore tout à fait.</strong> Pas de panique : avant d’ouvrir les autres livres, le professeur documentaliste va te montrer <strong>comment il enquête sur une quatrième de couverture</strong>.</p>'
  + '<p>C’est le chemin des enquêteurs en formation. Il prend quelques minutes de plus, et il te donnera une méthode pour tous les livres suivants.</p>', 'd0', 'Voir la méthode');
T('d0', '<p><strong>Je découvre : la méthode de l’enquêteur</strong></p>'
  + '<p>Le professeur documentaliste reprend la quatrième du <em>Manuscrit disparu</em>. Il y a repéré <strong>5 indices</strong> qui prouvent que c’est un polar.</p>'
  + '<p>Sur l’image suivante, <strong>clique sur les 5 boutons +</strong>, dans l’ordre, pour lire ses explications. Rien à répondre : regarde comment il s’y prend.</p>', 'd1', 'Voir la quatrième');

/* ---------- Détour : je découvre, je retiens, je suis accompagné ---------- */
const H = (k, header, body) => ({ position: { x: HS[k][0], y: HS[k][1], legacyPositioning: false }, alwaysFullscreen: false, header,
  content: [sub('H5P.Text 1.1', { text: `<p>${body}</p>` }, 'Text', header)] });
N.d1 = base(sub('H5P.ImageHotspots 1.10', {
  image: img('p1.jpg'), backgroundImageAltText: alt('p1'),
  iconType: 'icon', icon: 'plus', color: '#a3271f',
  hotspots: [
    H('mefait', '1. Le méfait', 'Tout commence par un <strong>méfait</strong> : un vol, une disparition, une tricherie, parfois un meurtre. Ici, un livre précieux a été volé.'),
    H('suspects', '2. Les suspects', 'Plusieurs personnes auraient pu le faire : ce sont les <strong>suspects</strong>. Ici, les trois personnes qui avaient la clé.'),
    H('enqueteur', '3. L’enquêteur', 'Quelqu’un <strong>mène l’enquête</strong>. Pas forcément un policier : ici, c’est une élève de douze ans.'),
    H('indices', '4. Les indices', 'L’enquêteur observe, interroge et <strong>relie les indices</strong> pour raisonner. Ici, une goutte de cire, puis les alibis.'),
    H('question', '5. La question', 'La quatrième finit par une <strong>question</strong> : qui ? comment ? pourquoi ? Le lecteur enquête avec le héros. C’est le cœur du polar : <strong>chercher la vérité</strong>.'),
  ],
  hotspotNumberLabel: 'Indice n° #num', closeButtonLabel: 'Fermer', containsAudioVideoLabel: 'Contient un son ou une vidéo',
}, 'Image Hotspots', 'Je découvre : la méthode'), { next: 'd2', proceedButtonText: 'J’ai ouvert les 5 indices', showContentTitle: false });
T('d2', '<p><strong>Je retiens</strong></p>'
  + '<p>Un <strong>polar</strong> (ou roman policier), c’est une histoire où <strong>quelqu’un enquête pour découvrir la vérité sur un méfait</strong>.</p>'
  + '<p>Pour le reconnaître sur une quatrième, cherche :</p>'
  + '<p>1. un <strong>méfait</strong> (vol, disparition, tricherie, crime…) ;<br>2. un <strong>enquêteur</strong> (policier, détective, journaliste, enfant…) ;<br>3. une <strong>enquête</strong> : des indices, des suspects, des interrogatoires ;<br>4. une <strong>question</strong> à résoudre : qui ? comment ? pourquoi ?</p>', 'd3', 'Je m’entraîne');

const fiche = dragText(
  '<p>Remplis la fiche d’enquête du <strong>Secret du phare</strong> (diapo précédente). Fais glisser chaque étiquette à sa place. Deux étiquettes sont en trop. Bloqué ? Clique sur le petit i.</p>',
  'Le méfait : quelqu’un se sert *du phare en secret:Que se passe-t-il chaque nuit, alors que le phare est abandonné ?*.\n'
  + 'L’enquêteur : *Malo:Qui refuse de croire à l’explication des pêcheurs ?*, aidé de sa cousine.\n'
  + 'Un indice : *des traces de pas:Qu’est-ce que Malo relève en premier ?*.\n'
  + 'La personne interrogée : *le vieux gardien:Malo pose des questions à quelqu’un. À qui ?*.\n'
  + 'La question à résoudre : *qui, et pour quoi faire:Relis la toute dernière phrase.* ?',
  '*le fantôme* *les pêcheurs*', 'Fiche d’enquête : le phare');
fiche.params.overallFeedback = [
  { from: 0, to: 99, feedback: 'Relis la quatrième (diapo précédente) et clique sur les ampoules : chaque case correspond à un ingrédient du polar.' },
  { from: 100, to: 100, feedback: 'Fiche complète : méfait, enquêteur, indice, suspect, question. Tous les ingrédients y sont.' },
];
const pres = cp([
  slide([pic(0, 0, 100, 'p2.jpg', 1280, 720, alt('p2'))], 'La pièce n° 2'),
  slide([el(2, 2, 96, 96, fiche)], 'La fiche d’enquête'),
], 'Je suis accompagné : le phare');
pres.library = 'H5P.CoursePresentation 1.25';
N.d3 = base(pres, { next: 'd4', proceedButtonText: 'J’ai rempli la fiche' });
Q('d4', 'Au fait : <em>Le Secret du phare</em>, avec son fantôme, est-ce vraiment un polar ?', [
  faux('Non, c’est fantastique : il y a un fantôme', 'd4', 'Les pêcheurs parlent d’un fantôme, mais Malo n’y croit pas : il cherche une <strong>explication réelle</strong>, indice après indice. Dans un roman fantastique, le surnaturel resterait sans explication. Que fait Malo, du début à la fin ?'),
  bon('Oui, car Malo cherche qui se cache', 'p3', 'Le « fantôme » n’est qu’une fausse piste : Malo relève des indices, interroge, cherche le coupable. C’est une enquête, donc un polar. Retiens ce piège : <strong>l’ambiance ne fait pas le genre</strong>.'),
  faux('Non, c’est une aventure : il y a une barque', 'd4', 'Une barque, des rochers, la mer : le décor fait penser à l’aventure. Mais la barque est ici un <strong>indice</strong> : Malo la découvre en enquêtant. Que cherche-t-il à savoir ?'),
  go('Revoir la fiche', 'd3'),
]);

/* ---------- Pièce 3 : le piège de la peur et des disparitions ---------- */
I('p3', 'p3', 'p3?');
Q('p3?', 'Scellé n° 3, « La Maison du bout du lac ». Est-ce un polar ?', [
  go('Oui, car des gens ont disparu', 'r-mefait'),
  bon('Non, car personne n’enquête', 'p4', 'Bien vu ! Des disparitions, une maison qui fait peur… mais Léa et son frère cherchent seulement à <strong>survivre</strong>, pas à découvrir la vérité. C’est un roman <strong>fantastique</strong> (ou d’épouvante), pas un polar.'),
  go('Oui, car on a peur jusqu’au bout', 'r-peur'),
  revoir('p3'),
]);
T('r-mefait', '<p><strong>Des disparitions ne suffisent pas.</strong></p>'
  + '<p>Des disparitions, des morts, il y en a aussi dans les contes, les récits fantastiques et les romans d’aventure. Pense au <em>Petit Chaperon rouge</em> : la grand-mère est dévorée… et personne ne mène l’enquête !</p>'
  + '<p>Ce qui fait le polar, c’est ce que le héros fait du méfait : <strong>il enquête pour découvrir la vérité</strong>. Léa, elle, ne cherche pas à savoir ce qui est arrivé aux autres : elle veut <strong>sortir vivante</strong>.</p>'
  + '<p>Un autre livre du carton te tend le même piège. À toi.</p>', 'p3b', 'Ouvrir le scellé 3 bis');
T('r-peur', '<p><strong>La peur ne suffit pas.</strong></p>'
  + '<p>Un roman fantastique ou d’épouvante fait peur pour faire peur : le héros <strong>subit</strong> ce qui arrive et cherche à s’échapper.</p>'
  + '<p>Dans un polar, le suspense vient d’une <strong>question</strong> : qui a fait ça ? Le héros réfléchit, observe, interroge. Ici, Léa ne mène aucune enquête : elle veut seulement <strong>tenir jusqu’à l’aube</strong>.</p>'
  + '<p>Un autre livre du carton te tend le même piège. À toi.</p>', 'p3b', 'Ouvrir le scellé 3 bis');
I('p3b', 'p3b', 'p3b?');
Q('p3b?', 'Scellé n° 3 bis, « Naufrage sur l’île aux Corsaires ». Est-ce un polar ?', [
  faux('Oui, car le capitaine a disparu', 'p3b?', 'Relis : quelqu’un cherche-t-il à savoir <strong>ce qui est arrivé</strong> au capitaine, ou <strong>qui</strong> en est responsable ? Une disparition sans enquête ne fait pas un polar.'),
  faux('Oui, car des pirates les menacent', 'p3b?', 'Des pirates sont des ennemis, pas un mystère à résoudre : on sait qui ils sont, il faut juste leur échapper. Que cherchent à faire Yanis et les passagers ?'),
  bon('Non, car ils cherchent à survivre', 'p4', 'Exactement : tempête, île, pirates, survie… c’est un roman d’<strong>aventure</strong>. Personne n’y mène d’enquête.'),
  revoir('p3b'),
]);

/* ---------- Pièce 4 : le piège « pas de policier, pas de meurtre » ---------- */
I('p4', 'p4', 'p4?');
Q('p4?', 'Scellé n° 4, « Piratage au club journal ». Est-ce un polar ?', [
  go('Non, car il n’y a aucun policier', 'r-police'),
  go('Non, car il n’y a ni crime ni mort', 'r-crime'),
  bon('Oui, car Nour cherche le pirate', 'final', 'Bravo, tu as évité deux pièges à la fois : <strong>pas besoin de policier</strong>, et <strong>pas besoin de meurtre</strong>. Un méfait (le piratage), une enquêtrice, des indices, des suspects : c’est un polar.'),
  revoir('p4'),
]);
T('r-police', '<p><strong>Pas besoin d’uniforme !</strong></p>'
  + '<p>L’enquêteur d’un polar peut être un policier, mais aussi un détective, une journaliste, une vieille dame, un enfant…</p>'
  + '<p>Ce qui compte, ce n’est pas son métier, c’est ce qu’il fait : <strong>il enquête</strong>. Nour compare les heures de connexion, interroge des suspects, repère un indice : elle fait exactement le travail d’un enquêteur.</p>'
  + '<p>Un dernier livre te tend le même piège. À toi.</p>', 'p4b', 'Ouvrir le scellé 4 bis');
T('r-crime', '<p><strong>Un polar n’a pas besoin d’un meurtre.</strong></p>'
  + '<p>Un vol, une disparition, une tricherie, une fausse nouvelle : tout <strong>méfait</strong> dont on cherche l’auteur peut lancer une enquête.</p>'
  + '<p>Ici, le méfait, c’est le piratage du compte. Et la question du polar est bien là : <strong>qui a fait ça ?</strong></p>'
  + '<p>Un dernier livre te tend le même piège. À toi.</p>', 'p4b', 'Ouvrir le scellé 4 bis');
I('p4b', 'p4b', 'p4b?');
Q('p4b?', 'Scellé n° 4 bis, « Où est passé Pistache ? ». Est-ce un polar ?', [
  faux('Non, c’est un roman animalier', 'p4b?', 'Un hamster ne fait pas un roman animalier à lui seul : Pistache n’est pas le héros, c’est le « disparu ». Qui est le héros, et que fait-il de toute l’histoire ?'),
  bon('Oui, Gabin mène l’enquête', 'final', 'Oui ! Une disparition suspecte, des indices (graines, empreinte), des alibis, un menteur à démasquer : c’est un polar, même sans policier ni meurtre.'),
  faux('Non, rien de grave n’arrive', 'p4b?', 'Pas besoin d’un drame pour faire un polar : il suffit d’un <strong>méfait</strong> dont on cherche l’auteur. Ici, quelqu’un a pris Pistache et ment. Que fait Gabin ?'),
  revoir('p4b'),
]);

/* ---------- Fin commune : écrire, comparer, retenir ---------- */
const area = sub('H5P.ExportableTextArea 1.3', { index: 1, label: '<p>Ma définition du polar</p>', exportNotSupported: 'Export impossible sur cet appareil' }, 'Exportable Text Area', 'Ma définition du polar');
const ecrire = cp([slide([
  txt(4, 4, 92, 30, '<p style="font-size:1.2em"><strong>Dernière mission.</strong> Le professeur documentaliste veut une affichette pour le rayon des polars. <strong>Écris en une phrase</strong> ce qu’est un polar, pour qu’un élève de 6e le comprenne.</p>', 'Consigne'),
  el(4, 36, 92, 56, area),
], 'Ma définition')], 'L’affichette du rayon');
ecrire.library = 'H5P.CoursePresentation 1.25';
N.final = base(ecrire, { next: 'compare?', proceedButtonText: 'J’ai écrit ma phrase' });
Q('compare?', 'Compare ta phrase avec celles de trois élèves. Laquelle ressemble le plus à la tienne ?', [
  faux('« Un polar, c’est un livre où il y a un meurtre et des policiers. »', 'final', 'C’est le portrait du polar le plus courant, mais rappelle-toi <em>Piratage au club journal</em> et <em>Où est passé Pistache ?</em> : ni meurtre, ni policier, et pourtant des polars. Retourne à ta phrase : qu’est-ce qui ne manque <strong>jamais</strong> ?'),
  bon('« Un polar, c’est une histoire où quelqu’un enquête sur un méfait. »', 'bilan', 'Tout y est : un <strong>méfait</strong> (quel qu’il soit) et quelqu’un qui <strong>enquête</strong> (qui qu’il soit). Si ta phrase dit la même chose avec tes mots, elle est parfaite pour l’affichette.'),
  faux('« Un polar, c’est une histoire qui fait peur du début jusqu’à la fin. »', 'final', 'Souviens-toi de <em>La Maison du bout du lac</em> : elle fait peur de bout en bout, mais personne n’y enquête. Retourne à ta phrase : quel ingrédient rend un livre policier ?'),
  go('La mienne ne ressemble à aucune', 'bilan', 'Vérifie ta phrase', 'Elle est bonne si elle contient : <strong>un méfait</strong> (vol, disparition, crime…) ; <strong>quelqu’un qui enquête</strong> (pas forcément un policier) ; <strong>la recherche de la vérité</strong> (trouver qui, comment, pourquoi). Les trois y sont ? Ta phrase est peut-être meilleure que celles de la liste.'),
]);
T('bilan', '<p><strong>Je retiens</strong></p>'
  + '<p>Un <strong>polar</strong>, c’est une histoire où <strong>quelqu’un enquête pour découvrir la vérité sur un méfait</strong>.</p>'
  + '<p>Trois pièges à éviter :<br>• un mort ou une disparition <strong>ne suffit pas</strong> : il faut une enquête ;<br>• la peur <strong>ne suffit pas</strong> : le héros d’un polar cherche, il ne fait pas que fuir ;<br>• pas besoin de <strong>policier</strong> ni de <strong>meurtre</strong> : un enfant peut enquêter sur un vol.</p>'
  + '<p>Les polars du carton ont reçu leur pastille. Affaire classée !</p>', 'bonus?');
Q('bonus?', 'Il reste un livre au fond du carton. Le plus difficile. Tu le tentes ?', [
  go('Ouvrir le dernier scellé (défi)', 'p5'),
  go('Classer l’affaire et terminer', -1, 'Affaire classée', 'Tu sais maintenant reconnaître un polar sur une quatrième de couverture. Au CDI, vérifie sur les vrais livres du rayon !'),
]);

/* ---------- Défi bonus : le polar « à l'envers » ---------- */
I('p5', 'p5', 'p5?');
Q('p5?', 'Scellé n° 5, « Le Coupable idéal ». On connaît le coupable dès la première page. Est-ce encore un polar ?', [
  faux('Non : il n’y a plus rien à deviner', 'p5?', 'On sait <strong>qui</strong>, mais pas <strong>comment</strong> il va être démasqué. L’inspectrice doit encore trouver des preuves : la question du polar a seulement changé de forme. Que fait l’inspectrice Morvan ?'),
  bon('Oui : il reste à le prouver', 'fin', 'Défi relevé ! C’est un <strong>polar inversé</strong> : le lecteur sait tout dès le début, et le suspense vient du duel entre le coupable et l’enquêtrice. L’enquête est toujours là, c’est elle qui fait le polar.'),
  faux('Non : le héros, c’est le voleur', 'p5?', 'Le livre suit beaucoup le voleur, c’est vrai. Mais il y a aussi une enquêtrice qui le soupçonne et cherche à le confondre. Le méfait, l’enquête, la vérité à établir : que manque-t-il ?'),
  revoir('p5'),
]);
T('fin', '<p><strong>Enquêteur confirmé !</strong></p><p>Même quand on connaît le coupable, un polar reste un polar tant que <strong>quelqu’un enquête pour établir la vérité</strong>. Au CDI, cherche les polars du rayon et lis leur quatrième : tu sauras dire pourquoi ils ont leur pastille.</p>', -1, 'Terminer');

/* ---------- Numérotation et contrôle du graphe ---------- */
const names = Object.keys(N);
const id = (n) => { if (n === -1) return -1; const i = names.indexOf(n); if (i < 0) throw new Error(`nœud inconnu : ${n}`); return i; };
const content = names.map((n) => {
  const { next, ...node } = N[n];
  const alts = node.type.params.branchingQuestion?.alternatives;
  if (alts) alts.forEach((a) => { a.nextContentId = id(a.next); delete a.next; });
  else node.nextContentId = id(next);
  return node;
});
const reached = new Set([0]); const todo = [0];
while (todo.length) {
  const n = content[todo.pop()];
  const nexts = n.nextContentId !== undefined ? [n.nextContentId] : n.type.params.branchingQuestion.alternatives.map((a) => a.nextContentId);
  for (const x of nexts) if (x !== -1 && !reached.has(x)) { reached.add(x); todo.push(x); }
}
if (reached.size !== content.length) throw new Error(`nœuds jamais atteints : ${names.filter((_, i) => !reached.has(i))}`);

fs.writeFileSync(OUT, JSON.stringify({ branchingScenario: {
  title: 'L’affaire des livres sans pastille',
  startScreen: { startScreenTitle: '<p>L’affaire des livres sans pastille</p>', startScreenSubtitle: '<p>Enquête au CDI : qu’est-ce qu’un polar ?</p>',
    startScreenImage: img('intro.jpg'), startScreenAltText: 'Un carton de romans sans pastille de genre et un dossier : Affaire n° 6-27, mission : repérer les polars.' },
  endScreens: [{ endScreenTitle: '<p>Affaire classée</p>', endScreenSubtitle: '<p>Recommence pour essayer d’autres chemins.</p>', contentId: -1, endScreenScore: 0 }],
  content,
  scoringOptionGroup: { scoringOption: 'no-score', includeInteractionsScores: false },
  behaviour: { enableBackwardsNavigation: true, forceContentFinished: false, randomizeBranchingQuestions: false },
  l10n: {
    startScreenButtonText: 'Commencer l’enquête', endScreenButtonText: 'Recommencer', backButtonText: 'Revenir en arrière',
    disableProceedButtonText: 'Termine d’abord cette étape', replayButtonText: 'Revoir la vidéo', scoreText: 'Ton score :',
    fullscreenAria: 'Plein écran',
  },
} }));
console.log('nœuds', content.length, 'questions', names.filter((n) => N[n].type.library.startsWith('H5P.BranchingQuestion')).length);
fs.writeFileSync(OUT.replace(/content\.json$/, 'noms.json'), JSON.stringify(names));
