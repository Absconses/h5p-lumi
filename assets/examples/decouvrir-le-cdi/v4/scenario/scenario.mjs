// Branching Scenario « Conseiller un ami » : la mission finale du livre « Découvrir le CDI ».
// usage : node scenario.mjs <content.json de sortie>      (scènes : scene.html + bs-render.mjs)
// Trois amis à conseiller (Sam : roman d'enquête ; Lina : documentaire, Dewey ; Noé : mangas),
// un carrefour pour passer de l'un à l'autre. Les nœuds sont nommés, puis numérotés à la fin.
import fs from 'fs';
import { text, image, sub } from './fr.mjs';
const [OUT] = process.argv.slice(2);

const N = {}; // nom -> nœud (l'ordre d'insertion donne l'index)
const base = (type, extra = {}) => ({
  type, showContentTitle: false, proceedButtonText: 'Continuer', forceContentFinished: 'useBehavioural',
  feedback: { title: '', subtitle: '' }, contentBehaviour: 'useBehavioural', ...extra,
});
const T = (name, html, next) => { N[name] = base(text(`<p style="font-size:1.15em">${html}</p>`, name), { next }); };
const I = (name, file, alt, next, [w, h] = [1200, 675]) => { N[name] = base(image(`images/${file}`, w, h, alt, name), { next }); };
// alternatives : [texte, nœud suivant] ou [texte, -1, [titre, sous-titre]]
const Q = (name, question, alts) => {
  N[name] = base(sub('H5P.BranchingQuestion 1.0', { branchingQuestion: {
    question: `<p>${question}</p>`,
    alternatives: alts.map(([t, next, end]) => ({ text: t, next, feedback: end ? { title: end[0], subtitle: end[1] } : { title: '', subtitle: '' } })),
  } }, 'Branching Question', name));
};

/* ---------- Départ ---------- */
I('intro', 'intro.jpg', 'Midi, au CDI. Trois amis ont besoin de tes conseils : Sam, Lina et Noé.', 'depart');
Q('depart', 'C’est la pause de midi. Trois amis cherchent un livre au CDI. <strong>Qui veux-tu aider en premier ?</strong>', [
  ['Sam, qui ne sait pas quoi lire', 'sam1'], ['Lina, qui prépare un exposé', 'lina1'], ['Noé, qui ne lit que des mangas', 'noe1'],
]);

/* ---------- Sam : écouter, choisir un genre, repérer la pastille, emprunter ---------- */
I('sam1', 'sam-arrive.jpg', 'Sam, devant le rayon des romans : « Je dois emprunter un livre pour le cours de français… mais je ne sais pas du tout quoi prendre ! »', 'sam2');
Q('sam2', 'Sam ne sait pas quoi prendre. <strong>Comment commences-tu ?</strong>', [
  ['Je lui tends mon roman préféré : il va forcément l’adorer.', 'sam2a'],
  ['Je lui demande ce qu’il aime, même en dehors des livres.', 'sam3'],
  ['Je lui dis de prendre le premier livre qui lui tombe sous la main.', 'sam2b'],
]);
T('sam2a', 'Sam lit le résumé… et repose le livre : « Bof, les histoires de chevaux, c’est pas mon truc. »<br><br><strong>Ce que tu aimes n’est pas forcément ce qu’il aime.</strong> Pour bien conseiller, il faut d’abord écouter.', 'sam3');
T('sam2b', 'Sam attrape un livre au hasard. Page 3, il bâille déjà.<br><br><strong>Choisir au hasard</strong>, c’est risquer de tomber sur un livre qui ne lui ressemble pas. Demande-lui plutôt ce qu’il aime.', 'sam3');
I('sam3', 'sam-aime.jpg', 'Sam : « Ce que j’aime ? Les jeux d’enquête ! Chercher des indices et trouver le coupable avant tout le monde. »', 'sam4');
Q('sam4', 'Sam aime chercher des indices et démasquer un coupable. <strong>Que lui proposes-tu ?</strong>', [
  ['Un roman de fantasy : un monde inventé, avec de la magie et des dragons.', 'sam4a'],
  ['Un dictionnaire : il y trouvera la définition exacte du mot « indice ».', 'sam4b'],
  ['Un roman d’enquête : une histoire inventée, avec un coupable à démasquer.', 'sam5'],
]);
T('sam4a', 'Sam fait la grimace : « Les dragons, bof… Moi, je veux des indices ! »<br><br>La fantasy, c’est la magie. Des indices, des suspects, un coupable : c’est le genre <strong>enquête et policier</strong>.', 'sam5');
T('sam4b', 'Sam éclate de rire : « Je cherche une histoire, pas une définition ! »<br><br>Dans un dictionnaire, on <strong>cherche</strong> un mot : on ne le lit pas comme une histoire. Sam veut un <strong>roman d’enquête</strong>.', 'sam5');
Q('sam5', 'Vous voilà devant les romans. <strong>Comment repérer vite ceux du genre enquête ?</strong>', [
  ['On cherche le nombre Dewey des enquêtes sur le tableau des 10 domaines.', 'sam5a'],
  ['On cherche la pastille de couleur du genre, collée sur le dos des livres.', 'sam6'],
  ['On lit tous les titres un par un, du premier rayon jusqu’au dernier.', 'sam5b'],
]);
T('sam5a', 'Le nombre Dewey sert à ranger les <strong>documentaires</strong>, par sujet.<br><br>Les <strong>romans</strong>, eux, sont rangés par genre : c’est la <strong>pastille de couleur</strong> sur le dos qui l’indique.', 'sam6');
T('sam5b', 'Dix minutes plus tard, vous n’avez fait que deux étagères… et la sonnerie approche.<br><br>La <strong>pastille de couleur</strong> sur le dos indique le genre d’un seul coup d’œil.', 'sam6');
I('sam6', 'sam-livre.jpg', 'Sam tient un roman, « Le Mystère du manoir », de Rose Duval : « Celui-là a l’air trop bien ! »', 'sam7');
Q('sam7', 'Sam est pressé : « Tu peux l’emprunter pour moi ? » <strong>Que réponds-tu ?</strong>', [
  ['Oui, je le prends à mon nom et je te le donne à la sortie du CDI.', 'sam7a'],
  ['Mets-le dans ton sac sans rien dire, tu le rapporteras très vite.', 'sam7b'],
  ['Non, chacun emprunte à son nom. Viens, le comptoir, c’est une minute.', 'samFin'],
]);
T('sam7a', 'Trois semaines plus tard, le livre est en retard… et c’est à <strong>toi</strong> qu’on le réclame, puisqu’il est à ton nom.<br><br><strong>On emprunte seulement à son propre nom.</strong>', 'sam7');
T('sam7b', 'Sans enregistrement, personne ne sait où est le livre : il est considéré comme <strong>perdu</strong>.<br><br><strong>Un prêt doit toujours être enregistré</strong> au comptoir.', 'sam7');
T('samFin', 'Au comptoir, le professeur documentaliste enregistre le prêt <strong>au nom de Sam</strong> et lui donne la date de retour.<br><br>Sam repart avec <em>Le Mystère du manoir</em>. <strong>Mission réussie !</strong>', 'carrefour');

/* ---------- Lina : fiction ou documentaire, domaine Dewey, lire une cote ---------- */
I('lina1', 'lina-arrive.jpg', 'Lina, devant le rayon des documentaires : « Je prépare un exposé sur les volcans. Tu sais où je peux chercher ? »', 'lina2');
Q('lina2', 'Pour un exposé sur les volcans, <strong>quel type de document lui conseilles-tu ?</strong>', [
  ['Un roman d’aventure : le héros escalade un volcan en pleine éruption.', 'lina2a'],
  ['Un livre documentaire : il explique le monde réel, avec des photos.', 'lina3'],
  ['Un recueil de poésie : il y a sûrement un poème sur les volcans.', 'lina2b'],
]);
T('lina2a', 'Lina hésite : « C’est une histoire inventée… Je ne peux pas mettre ça dans mon exposé. »<br><br>Pour <strong>s’informer sur le monde réel</strong>, il faut une <strong>ressource documentaire</strong>.', 'lina3');
T('lina2b', 'Un poème joue avec les mots et les images : c’est beau, mais ça n’explique pas comment naît une éruption.<br><br>Pour un exposé, il faut une <strong>ressource documentaire</strong>.', 'lina3');
I('lina3', 'dewey.jpg', 'Le système décimal Dewey : 000 informatique et généralités, 100 philosophie et psychologie, 200 religion, 300 sciences sociales, 400 langues, 500 sciences, 600 sciences appliquées, 700 arts, sports et loisirs, 800 littérature, 900 histoire et géographie.', 'lina4', [694, 423]);
Q('lina4', 'Les documentaires sont rangés par sujet. <strong>Dans quel domaine chercher un livre qui explique les volcans ?</strong>', [
  ['900, Histoire et géographie : les volcans sont sur les cartes.', 'lina4a'],
  ['600, Sciences appliquées : un volcan, c’est de la technique.', 'lina4b'],
  ['500, Sciences : les volcans font partie de la nature.', 'lina5'],
]);
T('lina4a', 'Tentant ! Mais un livre qui explique <strong>comment fonctionne un volcan</strong> étudie la nature : il est en <strong>500, Sciences</strong>.<br><br>En 900, tu trouverais plutôt un livre sur un pays et son histoire.', 'lina5');
T('lina4b', 'En 600, on trouve les savoir-faire pratiques : la cuisine, la santé, les animaux de compagnie.<br><br>Un volcan est un phénomène de la nature : direction le <strong>500, Sciences</strong>.', 'lina5');
I('lina5', 'lina-cote.jpg', 'Lina : « J’ai trouvé Tout sur les volcans ! Mais sur le dos, il y a écrit ça… » L’étiquette au dos du livre indique 551.21 MON.', 'lina6');
Q('lina6', 'Sur le dos du livre : <strong>551.21 MON</strong>. Que veut dire <strong>MON</strong> ?', [
  ['Les 3 premières lettres du nom de l’auteur.', 'linaFin'],
  ['Les 3 premières lettres du titre du livre.', 'lina6a'],
  ['Les 3 premières lettres du sujet : MONtagne.', 'lina6b'],
]);
T('lina6a', 'Le titre n’apparaît jamais dans la cote.<br><br>Les lettres renvoient toujours à <strong>l’auteur</strong> : ici, Paul <strong>MON</strong>nier.', 'linaFin');
T('lina6b', 'Bien tenté ! Mais le sujet est déjà donné par le nombre : 551.21, les volcans.<br><br>Les lettres renvoient à <strong>l’auteur</strong> : ici, Paul <strong>MON</strong>nier.', 'linaFin');
I('linaFin', 'lina-contente.jpg', 'Lina tient « Tout sur les volcans », de Paul Monnier : « Merci ! Avec ce livre, mon exposé va être explosif ! »', 'linaFin2');
T('linaFin2', '<strong>551.21</strong> = le sujet (les volcans). <strong>MON</strong> = l’auteur (Paul Monnier).<br><br>Lina emprunte le livre à son nom et file préparer son exposé. <strong>Mission réussie !</strong>', 'carrefour');

/* ---------- Noé : toutes les lectures comptent, la famille BD, un pas plus loin ---------- */
I('noe1', 'noe-arrive.jpg', 'Noé : « La prof veut qu’on emprunte un livre… Mais moi, je ne lis que des mangas. »', 'noe2');
Q('noe2', 'Noé ne lit que des mangas. <strong>Que lui réponds-tu ?</strong>', [
  ['Les mangas, ça ne compte pas : il faut prendre un vrai roman.', 'noe2a'],
  ['Les mangas, c’est de la lecture ! Le CDI en a tout un rayon, viens.', 'noe3'],
  ['Prends le livre le plus fin du CDI, tu auras vite terminé.', 'noe2b'],
]);
T('noe2a', 'Noé se renfrogne. Pourtant, <strong>toutes les lectures comptent</strong> : c’est même l’un des droits du lecteur, « le droit de lire n’importe quoi ».<br><br>C’est en lisant ce qu’on aime qu’on prend goût à lire.', 'noe3');
T('noe2b', 'Noé prend un livre tout fin… et s’ennuie dès la première page.<br><br>Un livre court n’est pas forcément un livre qui plaît. Mieux vaut <strong>partir de ce qu’il aime déjà</strong> : les mangas.', 'noe3');
I('noe3', 'noe-manga.jpg', 'Noé, devant le rayon BD et mangas : « J’ai adoré One Piece ! Les pirates, les trésors, les bateaux… Mais j’ai déjà lu tous ceux du CDI. »', 'noe4');
Q('noe4', 'Au CDI, <strong>dans quelle famille de documents range-t-on les mangas ?</strong>', [
  ['La bande dessinée, avec la BD et le roman graphique.', 'noe5'],
  ['Les ressources documentaires, avec les magazines.', 'noe4a'],
  ['La littérature, avec le théâtre et la poésie.', 'noe4b'],
]);
T('noe4a', 'Les ressources documentaires servent à s’informer sur le monde réel.<br><br>Un manga raconte une histoire en images : il fait partie de la famille <strong>bande dessinée</strong>, avec la BD et le roman graphique.', 'noe5');
T('noe4b', 'La littérature raconte des histoires avec des mots seulement.<br><br>Un manga raconte en images, dans des cases : il fait partie de la famille <strong>bande dessinée</strong>.', 'noe5');
Q('noe5', 'Noé a déjà lu tous les <em>One Piece</em> du CDI. <strong>Que lui proposes-tu pour la suite ?</strong>', [
  ['Un dictionnaire : il y apprendra plein de mots nouveaux.', 'noe5a'],
  ['Un autre manga d’aventure : il reste dans ce qu’il aime lire.', 'noe5b'],
  ['Un roman d’aventure avec des pirates : un pas plus loin.', 'noe5c'],
]);
T('noe5a', 'Noé soupire. Dans un dictionnaire, on cherche un mot : ce n’est pas une histoire de pirates !<br><br><strong>Pars plutôt de ce qu’il aime.</strong>', 'noe5');
T('noe5b', 'Bonne idée : Noé lit, et il aime ça. Il note un nouveau manga pour plus tard.<br><br>Et tu lui glisses une piste, <strong>un pas plus loin</strong> : un roman d’aventure avec des pirates…', 'noe6');
T('noe5c', 'Bien vu : tu pars de <strong>ce qu’il aime</strong> (les pirates) pour l’emmener <strong>un pas plus loin</strong>.<br><br>C’est exactement ce que montrent les cartes des genres exposées au CDI.', 'noe6');
I('noe6', 'noe-content.jpg', 'Noé tient « L’Île au trésor », de R. L. Stevenson : « Des pirates et un trésor ? Je prends ! »', 'noeFin');
T('noeFin', 'Noé emprunte <em>L’Île au trésor</em>, à son nom.<br><br>Et s’il ne l’aime pas ? Il a le droit de ne pas le finir et d’en choisir un autre. <strong>Mission réussie !</strong>', 'carrefour');

/* ---------- Carrefour ---------- */
Q('carrefour', 'Bravo ! <strong>Qui veux-tu aider maintenant ?</strong>', [
  ['Sam, qui ne sait pas quoi lire', 'sam1'], ['Lina, qui prépare un exposé', 'lina1'], ['Noé, qui ne lit que des mangas', 'noe1'],
  ['J’ai aidé tout le monde : je retourne en cours.', -1, ['Conseiller du CDI !', 'Pour bien conseiller : écouter ce que l’autre aime, choisir le bon type de document, repérer le rayon grâce à la cote. À toi de jouer, en vrai !']],
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
  startScreen: { startScreenTitle: '<p>Mission : conseiller un ami</p>', startScreenSubtitle: '<p>Trois amis cherchent un livre au CDI. Écoute-les, aide-les à se décider, et trouve le bon rayon.</p>' },
  endScreens: [{ endScreenTitle: '<p>Mission accomplie</p>', endScreenSubtitle: '<p>Recommence pour explorer d’autres chemins.</p>', contentId: -1, endScreenScore: 0 }],
  content,
  scoringOptionGroup: { scoringOption: 'no-score', includeInteractionsScores: false },
  behaviour: { enableBackwardsNavigation: true, forceContentFinished: false, randomizeBranchingQuestions: false },
  l10n: {
    startScreenButtonText: 'Commencer', endScreenButtonText: 'Recommencer', backButtonText: 'Revenir en arrière',
    disableProceedButtonText: 'Termine d’abord cette étape', replayButtonText: 'Revoir la vidéo', scoreText: 'Ton score :',
    fullscreenAria: 'Plein écran',
  },
} }));
console.log('nœuds', content.length);
