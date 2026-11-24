// Branching Scenario « Conseiller un ami » : la mission finale du livre « Découvrir le CDI ».
// usage : node scenario.mjs <content.json de sortie>      (scènes : scene.html + bs-render.mjs)
// Modèle : « Skills Practice: A Home Visit » (H5P). Pour chaque ami : sa fiche, puis une suite de
// scènes. À chaque scène, l'élève choisit un COMPORTEMENT (libellé court). Mauvais choix : un écran
// dit pourquoi et pose une question, puis on revient au même choix (on n'avance pas). Bon choix :
// un écran dit pourquoi, puis scène suivante. « Revoir la scène » relance l'image (ou la vidéo).
// Vidéos : VIDEOS=1 node scenario.mjs … remplace chaque scène où un ami parle par un nœud H5P.Video
// (videos/<scène>.mp4, affiche images/<scène>.jpg, préparés par video-build.mjs), sans toucher au graphe.
import fs from 'fs';
import { text, image, sub } from './fr.mjs';
const [OUT] = process.argv.slice(2);

const N = {}; // nom -> nœud (l'ordre d'insertion donne l'index)
const base = (type, extra = {}) => ({
  type, showContentTitle: false, proceedButtonText: 'Continuer', forceContentFinished: 'useBehavioural',
  feedback: { title: '', subtitle: '' }, contentBehaviour: 'useBehavioural', ...extra,
});
const img = (file, w = 400, h = 400) => ({ path: `images/${file}`, mime: 'image/jpeg', width: w, height: h, copyright: { license: 'U' } });
const T = (name, html, next) => { N[name] = base(text(`<p style="font-size:1.15em">${html}</p>`, name), { next }); };
const I = (name, file, alt, next, [w, h] = [1200, 675]) => { N[name] = base(image(`images/${file}`, w, h, alt, name), { next }); };
const VIDEOS = !!process.env.VIDEOS;
const V = (name, file, alt, next) => {
  const k = file.replace(/\.jpg$/, '');
  N[name] = base(sub('H5P.Video 1.6', {
    sources: [{ path: `videos/${k}.mp4`, mime: 'video/mp4', copyright: { license: 'U' } }],
    visuals: { poster: img(file, 1280, 720), fit: false, controls: true },
    playback: { autoplay: true, loop: false },
    l10n: { name: 'Vidéo', loading: 'Chargement de la vidéo…', noPlayers: 'Aucun lecteur ne peut lire cette vidéo.', noSources: 'La vidéo est introuvable.', aborted: 'La lecture a été interrompue.', networkFailure: 'Erreur de réseau.', cannotDecode: 'Impossible de décoder la vidéo.', formatNotSupported: 'Format de vidéo non pris en charge.', mediaEncrypted: 'Vidéo chiffrée.', unknownError: 'Erreur inconnue.', invalidYtId: 'Identifiant YouTube invalide.', unknownYtId: 'Vidéo YouTube introuvable.', restrictedYt: 'Le propriétaire de cette vidéo n’autorise pas son intégration.' },
    a11y: [],
  }, 'Video', alt.slice(0, 80)), { next });
};
const S = (name, file, alt, next) => (VIDEOS ? V : I)(name, file, alt, next); // scène où un ami parle
const Q = (name, question, alts) => {
  N[name] = base(sub('H5P.BranchingQuestion 1.0', { branchingQuestion: { question: `<p>${question}</p>`, alternatives: alts } }, 'Branching Question', name));
};
/* Une décision : la scène `${k}`, puis le choix `${k}?`.
 * choix : [libellé, 'pourquoi + question'] = mauvaise piste ; [libellé, 'pourquoi', suite] = bonne piste. */
const D = (k, scene, alt, question, choix, replay = k) => {
  (scene === 'dewey.jpg' ? I : S)(k, scene, alt, `${k}?`);
  Q(`${k}?`, question, [
    ...choix.map(([label, why, next]) => (next
      ? { text: label, next, feedback: { title: `<p>Bonne piste (${label})</p>`, subtitle: `<p>${why}</p>`, image: img('ok.jpg') } }
      : { text: label, next: `${k}?`, feedback: { title: `<p>Mauvaise piste (${label})</p>`, subtitle: `<p>${why}</p>`, image: img('croix.jpg') } })),
    { text: 'Revoir la scène', next: replay, feedback: { title: '', subtitle: '' } },
  ]);
};

/* ---------- Départ ---------- */
I('intro', 'intro.jpg', 'Midi, au CDI. Trois amis ont besoin de tes conseils : Sam, Lina et Noé.', 'regles');
T('regles', '<strong>Comment ça marche ?</strong><br><br>Tu vas aider trois amis à trouver un livre au CDI. Avant de leur parler, <strong>lis leur fiche</strong>.<br><br>À chaque scène, choisis <strong>ce que tu fais</strong>. Si ce n’est pas la bonne piste, on t’explique pourquoi et tu réessaies.', 'depart');
Q('depart', 'Qui veux-tu aider en premier ?', [
  { text: 'Sam, qui ne sait pas quoi lire', next: 'sam0', feedback: { title: '', subtitle: '' } },
  { text: 'Lina, qui prépare un exposé', next: 'lina0', feedback: { title: '', subtitle: '' } },
  { text: 'Noé, qui ne lit que des mangas', next: 'noe0', feedback: { title: '', subtitle: '' } },
]);

/* ---------- Sam : écouter, creuser, choisir un genre, la pastille, la quatrième, le prêt ---------- */
I('sam0', 'fiche-sam.jpg', 'Fiche de Sam, 6e B. Il doit emprunter un livre pour le cours de français, avant vendredi. Il lit très peu et a abandonné son dernier roman au chapitre 2. Il passe ses mercredis sur les jeux vidéo, n’est venu au CDI qu’une seule fois et n’aime pas qu’on lui fasse la leçon.', 'sam1');
D('sam1', 'sam-arrive.jpg', 'Sam, devant les romans : « Je dois emprunter un livre pour le cours de français… mais je ne sais pas du tout quoi prendre ! »',
  'Comment commences-tu ?', [
    ['Proposer ton livre préféré', 'Sam lit le résumé et repose le livre : « Bof, c’est pas mon truc. » Ce que tu aimes n’est pas forcément ce qu’il aime. Que te manque-t-il pour bien le conseiller ?'],
    ['Montrer les nouveautés', 'Sam regarde le présentoir sans rien prendre. Les nouveautés attirent l’œil, mais tu ne sais toujours rien de ses goûts. Par quoi faudrait-il commencer ?'],
    ['L’interroger sur ses goûts', 'Pour bien conseiller, il faut d’abord écouter. Tu lui demandes ce qu’il aime lire.', 'sam2'],
  ]);
D('sam2', 'sam-jeux.jpg', 'Sam : « Ce que j’aime lire ? Rien… Les livres, c’est pas trop mon truc. Moi, je préfère les jeux vidéo. »',
  'Sam dit qu’il n’aime pas lire. Que fais-tu ?', [
    ['Creuser du côté des jeux', 'Ses goûts existent déjà, en dehors des livres : c’est de là qu’il faut partir. Tu lui demandes quels jeux il préfère.', 'sam3'],
    ['Rappeler que lire est important', 'Sam lève les yeux au ciel. Relis sa fiche : il n’aime pas qu’on lui fasse la leçon. Comment partir plutôt de ce qu’il aime déjà ?'],
    ['Choisir un livre sur les jeux vidéo', 'C’est aller trop vite : tu ne sais pas encore ce qui lui plaît dans ses jeux. L’action ? L’histoire ? Les énigmes ? Quelle question lui poser ?'],
  ]);
D('sam3', 'sam-aime.jpg', 'Sam : « Mes jeux préférés ? Les jeux d’enquête ! Chercher des indices, interroger les suspects, trouver le coupable avant tout le monde. »',
  'Quel type de livre lui ressemble ?', [
    ['Un documentaire sur la police', 'L’idée se tient : c’est le bon sujet. Mais Sam veut vivre une histoire, comme dans ses jeux, pas lire des explications. Quel type de livre raconte une histoire inventée ?'],
    ['Un roman d’enquête', 'Des indices, des suspects, un coupable à démasquer : c’est exactement le genre enquête et policier. Et c’est une histoire inventée, comme dans ses jeux.', 'sam4'],
    ['Un roman de fantasy', 'La fantasy, c’est la magie et les mondes imaginaires. Relis ce que Sam vient de dire : indices, suspects, coupable. À quel genre ces mots te font-ils penser ?'],
  ]);
D('sam4', 'sam-rayon.jpg', 'Sam, devant les rayons de romans : « Ouh là… Il y a des centaines de romans ici ! On commence par où ? »',
  'Comment repérer les romans d’enquête ?', [
    ['Chercher le nombre Dewey', 'Le nombre Dewey sert à ranger les documentaires, par sujet. Ici, vous êtes devant les romans. Qu’est-ce qui indique le genre d’un roman, sur son dos ?'],
    ['Lire tous les titres', 'Dix minutes plus tard, vous n’avez fait que deux étagères, et la sonnerie approche. Quel signe, collé sur le dos des livres, permet d’aller plus vite ?'],
    ['Repérer la pastille du genre', 'Au CDI, les romans sont rangés par genre. La pastille de couleur, sur le dos, indique le genre d’un seul coup d’œil.', 'sam5'],
  ]);
D('sam5', 'sam-deux.jpg', 'Sam tient deux romans d’enquête, « Le Mystère du manoir » et « Nuit noire au collège » : « J’en ai trouvé deux avec la bonne pastille. Je prends lequel ? »',
  'Comment l’aides-tu à choisir ?', [
    ['Lire les deux résumés au dos', 'La quatrième de couverture résume l’histoire sans dévoiler la fin. C’est le meilleur moyen de savoir si un livre va lui plaire.', 'sam6'],
    ['Prendre le plus court', 'Souviens-toi de sa fiche : Sam a déjà abandonné un roman au chapitre 2. Un livre court qui l’ennuie, il l’abandonnera aussi. Où lire de quoi parle chaque histoire ?'],
    ['Prendre la plus belle couverture', 'La couverture donne une ambiance, mais elle ne raconte pas l’histoire. Quelle partie du livre résume l’histoire en quelques lignes ?'],
  ]);
D('sam6', 'sam-livre.jpg', 'Sam, avec « Le Mystère du manoir » : « Un vol, cinq suspects… Celui-là, je le veux ! » Puis : « Mince, ça va sonner. Tu peux l’emprunter pour moi ? »',
  'Sam est pressé : « Tu peux l’emprunter pour moi ? »', [
    ['L’emprunter à ton nom', 'Trois semaines plus tard, le livre est en retard… et c’est à toi qu’on le réclame, puisqu’il est à ton nom. À quel nom un prêt doit-il être enregistré ?'],
    ['L’accompagner au comptoir', 'Chacun emprunte à son propre nom. Au comptoir, le prêt est enregistré au nom de Sam en une minute, avec la date de retour.', 'samFin'],
    ['Le laisser filer avec le livre', 'Sans enregistrement, personne ne sait où est le livre : il est considéré comme perdu. Que faut-il toujours faire avant de sortir un livre du CDI ?'],
  ]);
T('samFin', 'Sam repart avec <em>Le Mystère du manoir</em>, emprunté <strong>à son nom</strong>.<br><br>Tu l’as <strong>écouté</strong>, tu es parti de <strong>ce qu’il aime</strong>, et tu as trouvé le bon rayon grâce à la <strong>pastille</strong>. Mission réussie !', 'carrefour');

/* ---------- Lina : fiction ou documentaire, Dewey, le nombre précis, la cote, croiser deux sources ---------- */
I('lina0', 'fiche-lina.jpg', 'Fiche de Lina, 6e A. Elle prépare un exposé de SVT sur les volcans, à rendre lundi. Grande lectrice de romans, elle connaît par cœur le rayon des romans. Elle n’est jamais allée au rayon des documentaires, veut des informations sûres et précises, et aime comprendre toute seule.', 'lina1');
D('lina1', 'lina-arrive.jpg', 'Lina montre un roman, « L’Enfant du volcan » : « Pour mon exposé sur les volcans, j’ai trouvé ce roman. C’est bien, non ? »',
  'Que lui réponds-tu ?', [
    ['Approuver son choix', 'Le lundi, la professeure demande à Lina d’où viennent ses informations… Un roman raconte une histoire inventée. Quel type de document explique le monde réel ?'],
    ['L’orienter vers un documentaire', 'Un roman raconte une histoire inventée. Pour un exposé, il faut une ressource documentaire : elle explique le monde réel.', 'lina2'],
    ['Proposer un dictionnaire', 'Le dictionnaire donnera la définition du mot « volcan » en trois lignes : c’est trop peu pour un exposé. Quel document explique un sujet en détail, avec des photos et des schémas ?'],
  ]);
S('lina2', 'lina-rangement.jpg', 'Lina, devant les documentaires : « D’accord, il me faut un documentaire. Mais ici, il n’y a pas de pastilles… C’est rangé comment ? »', 'lina2b');
D('lina2b', 'dewey.jpg', 'Le système décimal Dewey : 000 informatique et généralités, 100 philosophie et psychologie, 200 religion, 300 sciences sociales, 400 langues, 500 sciences, 600 sciences appliquées, 700 arts, sports et loisirs, 800 littérature, 900 histoire et géographie.',
  'Tu lui montres le tableau des 10 domaines. Où chercher un livre qui explique les volcans ?', [
    ['En 900, histoire et géographie', 'Tentant : les volcans sont sur les cartes. Mais un livre qui explique comment fonctionne un volcan étudie la nature. Quel domaine étudie la nature ?'],
    ['En 600, sciences appliquées', 'En 600, on trouve les savoir-faire pratiques : la cuisine, la santé, les animaux de compagnie. Un volcan est un phénomène de la nature. Quel domaine l’étudie ?'],
    ['En 500, sciences', 'Les documentaires sont rangés par sujet. Un livre qui explique comment fonctionne un volcan étudie la nature : domaine 500, les sciences.', 'lina3'],
  ]);
N['lina2b'].type.params.file.width = 694; N['lina2b'].type.params.file.height = 423;
D('lina3', 'lina-500.jpg', 'Lina, devant le rayon 500, sciences : « Le rayon 500 est immense : les étoiles, les animaux, les plantes… Je ne vais jamais trouver les volcans ! »',
  'Comment trouver les volcans dans tout le rayon 500 ?', [
    ['Chercher une pastille de couleur', 'Les pastilles indiquent le genre des romans. Lina vient de te le dire : ici, il n’y en a pas. Que lit-on sur le dos d’un documentaire ?'],
    ['Suivre les nombres sur les dos', 'Sur le dos, les nombres se suivent : 520 les étoiles, 550 la Terre, 551 les volcans et les séismes… Plus le nombre est long, plus le sujet est précis.', 'lina4'],
    ['Suivre l’ordre des titres', 'Les documentaires ne sont pas rangés par titre : deux livres sur les volcans seraient séparés. Par quoi sont-ils rangés, et comment est-ce noté sur le dos ?'],
  ]);
D('lina4', 'lina-cote.jpg', 'Lina : « J’ai trouvé Tout sur les volcans ! Mais sur le dos, il y a écrit ça… » L’étiquette au dos du livre indique 551.21 MON.',
  'Lina te demande ce que veut dire « MON ». Que lui expliques-tu ?', [
    ['C’est le début du nom de l’auteur', '551.21, c’est le sujet : les volcans. MON, ce sont les 3 premières lettres du nom de l’auteur : Paul Monnier.', 'lina5'],
    ['C’est le début du titre du livre', 'Le titre est « Tout sur les volcans » : il commencerait par TOU. Le titre n’apparaît jamais dans la cote. À qui renvoient ces 3 lettres ?'],
    ['C’est le début du sujet', 'Le sujet est déjà donné par le nombre : 551.21, les volcans. Les lettres donnent une autre information. Laquelle ?'],
  ]);
D('lina5', 'lina-magazine.jpg', 'Lina montre un magazine, « Le Mag des curieux » : « Regarde : ce magazine a tout un dossier sur les volcans. Je peux m’en servir aussi ? »',
  'Lina a trouvé un magazine en plus du livre. Que lui conseilles-tu ?', [
    ['Écarter le magazine', 'Un magazine est aussi une ressource documentaire : ses articles parlent du monde réel, et souvent de l’actualité. Pourquoi se priver d’une deuxième source ?'],
    ['Garder seulement le magazine', 'Le dossier du magazine est court : il ne suffira pas pour tout un exposé. Et le livre qu’elle vient de trouver ? Que gagne-t-on à utiliser les deux ?'],
    ['Utiliser les deux ensemble', 'Le livre documentaire explique en détail, le magazine apporte un dossier récent : ce sont deux ressources documentaires qui se complètent.', 'linaFin'],
  ]);
S('linaFin', 'lina-contente.jpg', 'Lina tient « Tout sur les volcans », de Paul Monnier : « Merci ! Avec tout ça, mon exposé va être explosif ! »', 'linaFin2');
T('linaFin2', 'Lina emprunte son livre <strong>à son nom</strong> et file préparer son exposé.<br><br>Tu l’as orientée vers une <strong>ressource documentaire</strong>, tu as trouvé le bon <strong>domaine</strong>, puis le bon <strong>nombre</strong>. Mission réussie !', 'carrefour');

/* ---------- Noé : toutes les lectures comptent, écouter, un pas plus loin, le droit d'arrêter ---------- */
I('noe0', 'fiche-noe.jpg', 'Fiche de Noé, 6e C. Sa professeure demande à chaque élève d’emprunter un livre. Il ne lit que des mangas et a lu tous les One Piece du CDI. Il pense que « les mangas, ça ne compte pas », a peur des gros livres sans images et adore les histoires de pirates.', 'noe1');
D('noe1', 'noe-arrive.jpg', 'Noé : « La prof veut qu’on emprunte un livre… Mais moi, je ne lis que des mangas. Et les mangas, ça ne compte pas. »',
  'Que réponds-tu à Noé ?', [
    ['L’emmener au rayon des mangas', 'Les mangas font partie de la famille bande dessinée, et le CDI en a tout un rayon. Toutes les lectures comptent : c’est même l’un des droits du lecteur.', 'noe2'],
    ['Lui conseiller un vrai roman', 'Noé baisse la tête : tu viens de confirmer que ses lectures « ne comptent pas ». Est-ce vrai ? Dans quelle famille de documents le CDI range-t-il les mangas ?'],
    ['Chercher le livre le plus fin', 'Noé prend un livre tout fin et s’ennuie dès la première page. Un livre court n’est pas forcément un livre qui plaît. De quelles lectures pourrais-tu partir ?'],
  ]);
D('noe2', 'noe-manga.jpg', 'Noé, devant le rayon BD et mangas : « Tu es sûr que j’ai le droit ? Bon… Le problème, c’est que j’ai déjà lu tous les One Piece du CDI. »',
  'Noé a déjà tout lu. Que fais-tu ?', [
    ['Lui dire de relire One Piece', 'Relire est un droit du lecteur ! Mais ce n’est pas ce que Noé te demande : il cherche du nouveau. Comment savoir ce qui lui plairait autant ?'],
    ['Proposer un grand classique célèbre', 'Souviens-toi de sa fiche : Noé a peur des gros livres sans images. Le saut est trop grand. Que faut-il savoir avant de lui proposer autre chose ?'],
    ['Demander ce qu’il aime dans One Piece', 'Pour trouver un livre qui lui plaira autant, il faut savoir ce qu’il aime dans celui-là : les personnages ? l’humour ? l’aventure ?', 'noe3'],
  ]);
D('noe3', 'noe-aime.jpg', 'Noé : « Ce que j’aime dans One Piece ? Les pirates, les trésors, et l’équipage qui reste soudé dans l’aventure ! »',
  'Que lui proposes-tu ?', [
    ['Un documentaire sur les bateaux', 'Le sujet est proche, mais Noé aime qu’on lui raconte une aventure, pas qu’on lui explique comment flotte un navire. Quel genre de roman raconte des voyages et des dangers ?'],
    ['Un roman d’aventure de pirates', 'Tu pars de ce qu’il aime (les pirates, l’aventure) pour l’emmener un pas plus loin : c’est ce que montrent les cartes des genres exposées au CDI.', 'noe4'],
    ['Un roman de science-fiction', 'La science-fiction, c’est le futur et la technologie. Relis ce que Noé vient de dire : pirates, trésors, équipage. Quel genre y ressemble le plus ?'],
  ]);
D('noe4', 'noe-doute.jpg', 'Noé tient « L’Île au trésor » : « Un roman, sans images ? Et si je n’aime pas… je serai obligé de le finir ? »',
  'Noé hésite. Que lui dis-tu ?', [
    ['Promettre qu’il va adorer', 'Tu n’en sais rien : personne ne peut promettre qu’un livre plaira. Et s’il s’ennuie, il ne te croira plus. Que peut faire un lecteur quand un livre ne lui plaît pas ?'],
    ['Dire qu’on finit toujours un livre', 'Noé repose le livre aussitôt : tu viens de lui faire encore plus peur. Est-on vraiment obligé de finir ? Souviens-toi des droits du lecteur.'],
    ['Rappeler qu’il peut arrêter', '« Le droit de ne pas finir un livre » est un droit du lecteur. S’il n’aime pas, Noé le rapporte et en choisit un autre.', 'noeFin'],
  ]);
S('noeFin', 'noe-content.jpg', 'Noé, avec « L’Île au trésor », de R. L. Stevenson : « Alors je tente ! Des pirates et un trésor, ça me va. »', 'noeFin2');
T('noeFin2', 'Noé emprunte <em>L’Île au trésor</em>, <strong>à son nom</strong>.<br><br>Tu lui as montré que <strong>ses lectures comptent</strong>, tu es parti de <strong>ce qu’il aime</strong>, et tu l’as rassuré. Mission réussie !', 'carrefour');

/* ---------- Carrefour ---------- */
Q('carrefour', 'Qui veux-tu aider maintenant ?', [
  { text: 'Sam, qui ne sait pas quoi lire', next: 'sam0', feedback: { title: '', subtitle: '' } },
  { text: 'Lina, qui prépare un exposé', next: 'lina0', feedback: { title: '', subtitle: '' } },
  { text: 'Noé, qui ne lit que des mangas', next: 'noe0', feedback: { title: '', subtitle: '' } },
  { text: 'J’ai aidé tout le monde', next: -1, feedback: { title: '<p>Conseiller du CDI !</p>', subtitle: '<p>Pour bien conseiller : écouter, partir de ce que l’autre aime, choisir le bon type de document, trouver le rayon grâce à la cote. À toi de jouer, en vrai !</p>', image: img('ok.jpg') } },
]);

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
  title: 'Conseiller un ami',
  startScreen: { startScreenTitle: '<p>Mission : conseiller un ami</p>', startScreenSubtitle: '<p>Jeu de simulation au CDI</p>',
    startScreenImage: img('intro.jpg', 1200, 675), startScreenAltText: 'Sam, Lina et Noé au CDI' },
  endScreens: [{ endScreenTitle: '<p>Mission accomplie</p>', endScreenSubtitle: '<p>Recommence pour explorer d’autres chemins.</p>', contentId: -1, endScreenScore: 0 }],
  content,
  scoringOptionGroup: { scoringOption: 'no-score', includeInteractionsScores: false },
  behaviour: { enableBackwardsNavigation: true, forceContentFinished: false, randomizeBranchingQuestions: false },
  l10n: {
    startScreenButtonText: 'Commencer le jeu', endScreenButtonText: 'Recommencer', backButtonText: 'Revenir en arrière',
    disableProceedButtonText: 'Termine d’abord cette étape', replayButtonText: 'Revoir la vidéo', scoreText: 'Ton score :',
    fullscreenAria: 'Plein écran',
  },
} }));
console.log('nœuds', content.length, 'décisions', names.filter((n) => n.endsWith('?')).length);
