/* =====================================================================
 *  EMI 6e — Espace informationnel n°1 : LE CDI
 *  Séance 2 (1 h, réinvestissement) — Livre interactif en 4 chapitres :
 *    1. Genèse  2. Mécanique  3. Économie  4. Praxis (fiche exportable)
 *
 *  Règle d'or de la série : on ne parle QUE du CDI, sans jamais le
 *  comparer aux autres espaces (tableau comparatif = fin d'année).
 *
 *  Usage :
 *    node build.mjs                      -> écrit content.json
 *    node ../../../scripts/build-h5p.mjs --template ../../../assets/templates/gabarit-interactivebook-reporter.h5p \
 *         --content content.json --media media/melvil-dewey.jpg \
 *         --out ../cdi-comment-ca-marche.h5p --title "Le CDI : comment ça marche ?"
 *  (ou Build-H5PPackage.ps1 avec les mêmes fichiers sous Windows)
 * ===================================================================== */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  configure, text, image, mc, tf, blanks, dragText, chapter,
  banner, credit, callout, textInput, docText, standardPage, exportPage, docTool,
} from '../../../assets/lib/h5p-factories.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

configure({
  IMG: { dewey: { path: 'images/melvil-dewey.jpg', w: 1200, h: 600 } },
});

/* --- Libellés FR (les fabriques sont en anglais par défaut) -------- */
const deepMerge = (a, b) => {
  for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object') deepMerge(a[k], v);
    else a[k] = v;
  }
  return a;
};
const fr = (item, labels) => { deepMerge(item.params, labels); return item; };

const CONFIRM_FR = {
  confirmCheck: { header: 'Terminer ?', body: 'Es-tu sûr(e) de vouloir terminer ?', cancelLabel: 'Annuler', confirmLabel: 'Terminer' },
  confirmRetry: { header: 'Recommencer ?', body: 'Es-tu sûr(e) de vouloir recommencer ?', cancelLabel: 'Annuler', confirmLabel: 'Recommencer' },
};
const MC_FR = {
  UI: {
    checkAnswerButton: 'Vérifier', submitAnswerButton: 'Envoyer', showSolutionButton: 'Voir la solution',
    tryAgainButton: 'Recommencer', tipsLabel: 'Indice', scoreBarLabel: 'Tu as :num point(s) sur :total',
    tipAvailable: 'Indice disponible', feedbackAvailable: 'Commentaire disponible', readFeedback: 'Lire le commentaire',
    wrongAnswer: 'Mauvaise réponse', correctAnswer: 'Bonne réponse', shouldCheck: 'Il fallait cocher cette réponse',
    shouldNotCheck: 'Il ne fallait pas cocher cette réponse', noInput: 'Réponds avant de voir la solution',
    a11yCheck: 'Vérifier les réponses.', a11yShowSolution: 'Afficher la solution.', a11yRetry: 'Recommencer la tâche.',
  },
  ...CONFIRM_FR,
};
const TF_FR = {
  l10n: {
    trueText: 'Vrai', falseText: 'Faux', checkAnswer: 'Vérifier', submitAnswer: 'Envoyer',
    showSolutionButton: 'Voir la solution', tryAgain: 'Recommencer', score: 'Tu as @score point(s) sur @total',
    wrongAnswerMessage: 'Mauvaise réponse', correctAnswerMessage: 'Bonne réponse',
    scoreBarLabel: 'Tu as :num point(s) sur :total', a11yCheck: 'Vérifier les réponses.',
    a11yShowSolution: 'Afficher la solution.', a11yRetry: 'Recommencer la tâche.',
  },
  ...CONFIRM_FR,
};
const BLANKS_FR = {
  overallFeedback: [{ from: 0, to: 100, feedback: 'Tu as @score bonne(s) réponse(s) sur @total.' }],
  showSolutions: 'Voir la solution', tryAgain: 'Recommencer', checkAnswer: 'Vérifier', submitAnswer: 'Envoyer',
  notFilledOut: "Remplis d'abord tous les trous.", answerIsCorrect: "« :ans » est correct",
  answerIsWrong: "« :ans » est incorrect", answeredCorrectly: 'Bonne réponse', answeredIncorrectly: 'Mauvaise réponse',
  solutionLabel: 'Bonne réponse :', inputLabel: 'Trou @num sur @total', inputHasTipLabel: 'Indice disponible',
  tipLabel: 'Indice', scoreBarLabel: 'Tu as :num point(s) sur :total', a11yCheck: 'Vérifier les réponses.',
  a11yShowSolution: 'Afficher la solution.', a11yRetry: 'Recommencer la tâche.', a11yCheckingModeHeader: 'Mode correction',
  behaviour: { acceptSpellingErrors: true },
  ...CONFIRM_FR,
};

const QCM = (q, answers, title) => fr(mc(q, answers, title), MC_FR);
const VF = (q, ok, fbOk, fbNo, title) => fr(tf(q, ok, fbOk, fbNo, title), TF_FR);
const TROUS = (intro, qs, title) => fr(blanks(intro, qs, title), BLANKS_FR);

/* --- Mise en page -------------------------------------------------- */
const head = (n, step, question, recall) => text(
  banner(`Étape ${n}`, step) +
  `<h2>${question}</h2>` +
  callout(`<p><strong>Souviens-toi de la séance précédente.</strong> ${recall}</p>`),
  `Étape ${n} — ${step}`,
);

/* =====================================================================
 *  CHAPITRE 1 — GENÈSE : qui a inventé le CDI et pourquoi ?
 * ===================================================================== */
const ch1 = chapter('1. Genèse — Qui a inventé le CDI ?', [
  head(1, 'Genèse', 'Qui a inventé le CDI, et pourquoi ?',
    'Réponds de mémoire, sans chercher : si tu te trompes, lis bien le commentaire, il te réexplique.'),

  QCM('<p>Que signifient les lettres <strong>C.D.I.</strong> ?</p>', [
    { t: "Centre de Documentation et d'Information", ok: true,
      fb: "Exact ! Un <strong>centre</strong> (un lieu), de <strong>documentation</strong> (des documents à consulter) et d'<strong>information</strong> (on y apprend à s'informer)." },
    { t: "Centre de Diffusion et d'Impression",
      fb: "Non : au CDI, on n'imprime pas de livres. C.D.I. = Centre de <strong>Documentation</strong> et d'<strong>Information</strong>." },
    { t: "Comité des Documents Illustrés",
      fb: "Non : ce n'est pas un comité. C.D.I. = <strong>Centre</strong> de Documentation et d'Information." },
    { t: "Centre des Devoirs et de l'Instruction",
      fb: "Presque : on peut y travailler, mais C.D.I. = Centre de <strong>Documentation</strong> et d'<strong>Information</strong>." },
  ], 'Le sigle CDI'),

  TROUS('<p>Complète le texte avec les mots de la séance.</p>', [
    "<p>En 1958, au lycée Janson-de-Sailly à Paris, le proviseur Marcel Sire crée l'un des premiers <strong>services de *documentation*</strong> pour les élèves.</p>",
    "<p>Son idée : les élèves ne doivent pas seulement écouter la leçon, ils doivent apprendre à *chercher/rechercher* l'information par eux-mêmes.</p>",
    "<p>Dans les années 1970, ces services prennent le nom de *CDI/C.D.I.*, et on en ouvre dans les collèges et les lycées.</p>",
    "<p>Le CDI est animé par un *professeur documentaliste/professeur-documentaliste/documentaliste*, un enseignant qui a passé un concours : le CAPES de documentation (créé en 1989).</p>",
  ], 'La naissance du CDI'),

  VF("<p>Le CDI a été créé pour que <strong>tous</strong> les élèves, quelle que soit leur famille, puissent accéder librement aux livres et à l'information.</p>",
    true,
    "Oui ! C'est l'idée de départ : un lieu ouvert à tous, pour que chacun ait accès aux documents, même sans livres à la maison.",
    "Si, c'est vrai : le CDI est né pour donner à <strong>tous</strong> les élèves un accès libre aux documents et leur apprendre à s'informer.",
    'Un lieu pour tous'),

  VF("<p>Au CDI, on ne trouve que des livres.</p>",
    false,
    "Bien vu : on y trouve aussi des <strong>magazines</strong>, des <strong>journaux</strong>, des <strong>BD</strong>, des <strong>ordinateurs</strong>, des affiches… Ce sont tous des <strong>documents</strong>.",
    "Non : le CDI rassemble toutes sortes de <strong>documents</strong> : livres, mais aussi magazines, journaux, BD, ordinateurs, affiches…",
    'Pas que des livres'),
]);

/* =====================================================================
 *  CHAPITRE 2 — MÉCANIQUE : comment on choisit et range ce que je vois
 * ===================================================================== */
const ch2 = chapter('2. Mécanique — Comment tout est choisi et rangé', [
  head(2, 'Mécanique', 'Qui choisit ce que je trouve au CDI, et comment je le retrouve ?',
    'Au CDI, rien n’est posé au hasard : chaque document a été <strong>choisi</strong>, puis <strong>rangé</strong> à une place précise.'),

  QCM('<p>Qui choisit les documents achetés pour le CDI ?</p>', [
    { t: 'Le professeur documentaliste', ok: true,
      fb: "Oui ! Il lit des critiques, écoute les demandes des élèves et des professeurs, vérifie que les documents sont <strong>fiables</strong> et <strong>adaptés à ton âge</strong>. C'est la <strong>politique documentaire</strong>." },
    { t: 'Les maisons d’édition',
      fb: "Non : les éditeurs fabriquent les livres, mais c'est le <strong>professeur documentaliste</strong> qui choisit ceux qui entrent au CDI, selon les besoins des élèves." },
    { t: 'Le premier élève qui demande',
      fb: "Pas tout à fait : tes demandes comptent, mais c'est le <strong>professeur documentaliste</strong> qui décide, en vérifiant que le document est fiable et adapté." },
    { t: 'Un ordinateur, au hasard',
      fb: "Non : aucun hasard ! C'est un humain, le <strong>professeur documentaliste</strong>, qui sélectionne chaque document avec soin." },
  ], 'Qui choisit ?'),

  text(
    '<h3>Monsieur Dewey et ses 10 classes</h3>' +
    "<p>En 1876, l'Américain <strong>Melvil Dewey</strong> invente une façon de ranger les documentaires : tous les savoirs sont répartis en <strong>10 grandes classes numérotées</strong> de 000 à 900. On l'utilise encore au CDI !</p>",
    'Dewey',
  ),
  image('dewey', 'Portrait photographique de Melvil Dewey vers 1890', 'Melvil Dewey'),
  text(credit('Melvil Dewey, vers 1890. Auteur inconnu. Wikimedia Commons, domaine public.'), 'Crédit'),

  dragText(
    '<p>Fais glisser la bonne <strong>classe Dewey</strong> à côté de chaque documentaire.</p>',
    'Un documentaire sur les volcans se range en *500 Sciences*.\n' +
    'Un livre sur les règles du football se range en *700 Arts et loisirs*.\n' +
    "Un livre sur l'Égypte des pharaons se range en *900 Histoire et géographie*.\n" +
    "Un dictionnaire d'anglais se range en *400 Langues*.\n" +
    'Un livre sur la fabrication des robots se range en *600 Techniques*.',
    'Les classes Dewey',
  ),

  QCM("<p>Sur le dos d'un roman, l'étiquette (la <strong>cote</strong>) indique : <strong>R BRI</strong>. Que veut dire « BRI » ?</p>", [
    { t: "Les 3 premières lettres du nom de l'auteur", ok: true,
      fb: "Exact ! « R » = roman, « BRI » = les 3 premières lettres du <strong>nom de l'auteur</strong>. Les romans sont rangés par ordre alphabétique des auteurs." },
    { t: 'Les 3 premières lettres du titre du livre',
      fb: "Non : le titre peut changer d'une édition à l'autre. La cote donne les 3 premières lettres du <strong>nom de l'auteur</strong>." },
    { t: "Les 3 premières lettres de l'éditeur du livre",
      fb: "Non : l'éditeur n'apparaît pas dans la cote. « BRI » = les 3 premières lettres du <strong>nom de l'auteur</strong>." },
    { t: 'Les 3 premières lettres du héros du livre',
      fb: "Non : la cote donne les 3 premières lettres du <strong>nom de l'auteur</strong>, pour ranger les romans par ordre alphabétique." },
  ], 'Lire une cote'),

  QCM('<p>Tu veux savoir si le CDI possède un livre sur les requins. Que fais-tu <strong>en premier</strong> ?</p>', [
    { t: 'Je cherche dans le catalogue du CDI', ok: true,
      fb: "Oui ! Le <strong>catalogue</strong> (sur l'ordinateur du CDI) te dit si le livre existe, s'il est disponible et te donne sa <strong>cote</strong> pour le trouver sur l'étagère." },
    { t: 'Je regarde toutes les étagères une à une',
      fb: "Tu finirais par trouver… mais ce serait très long ! Le <strong>catalogue</strong> te donne directement la <strong>cote</strong>, donc l'adresse du livre." },
    { t: 'Je choisis un livre au hasard sur une table',
      fb: "Non : le hasard ne t'aidera pas. Consulte d'abord le <strong>catalogue</strong> : il te donne la <strong>cote</strong> du livre." },
    { t: 'Je renonce, ce sera trop difficile',
      fb: "Ne renonce pas ! Le <strong>catalogue</strong> du CDI est fait pour ça : il te donne la <strong>cote</strong>, c'est-à-dire l'adresse du livre." },
  ], 'Le catalogue'),

  VF("<p>Quand j'ai fini de lire un documentaire, je peux le reposer n'importe où sur une étagère.</p>",
    false,
    "Bravo ! Un livre mal rangé est un livre <strong>perdu</strong> pour les autres. On le range à sa <strong>cote</strong>, ou on le dépose à l'endroit prévu (chariot, bac de retour).",
    "Non : un livre mal rangé est un livre <strong>perdu</strong> pour les autres. On le range à sa <strong>cote</strong>, ou on le dépose à l'endroit prévu (chariot, bac de retour).",
    'Ranger'),
]);

/* =====================================================================
 *  CHAPITRE 3 — ÉCONOMIE : qui paie ?
 * ===================================================================== */
const ch3 = chapter('3. Économie — Qui paie le CDI ?', [
  head(3, 'Économie', 'Comment le CDI fonctionne-t-il avec de l’argent ?',
    'Des livres, des magazines, des ordinateurs… Tout cela coûte cher. Alors qui paie ?'),

  QCM("<p>Combien te coûte l'emprunt d'un livre au CDI ?</p>", [
    { t: "Rien : c'est gratuit", ok: true,
      fb: "Oui ! Emprunter au CDI est <strong>gratuit</strong> pour tous les élèves : c'est un <strong>service public</strong> d'éducation." },
    { t: 'Un euro par livre emprunté',
      fb: "Non : tu ne paies rien. Emprunter au CDI est <strong>gratuit</strong>, c'est un <strong>service public</strong>." },
    { t: 'Un abonnement payé chaque année',
      fb: "Non : aucun abonnement. Le CDI est <strong>gratuit</strong> et ouvert à tous les élèves de l'établissement." },
    { t: 'Une caution rendue au retour du livre',
      fb: "Non : pas de caution. L'emprunt est <strong>gratuit</strong> ; on te demande simplement de rendre le livre à temps et en bon état." },
  ], 'Combien ça coûte ?'),

  QCM('<p>Alors, qui paie les livres, les magazines et les abonnements du CDI ?</p>', [
    { t: "L'établissement, avec de l'argent public", ok: true,
      fb: "Exact ! Chaque année, l'établissement donne au CDI un <strong>budget</strong>. Cet argent vient surtout de fonds <strong>publics</strong> (les impôts, par exemple ceux versés au Département pour les collèges). Il sert à <strong>tous</strong> les élèves." },
    { t: 'Des publicités affichées dans le CDI',
      fb: "Non : il n'y a <strong>pas de publicité</strong> au CDI. Il est payé par l'établissement, avec de l'<strong>argent public</strong>." },
    { t: 'Les élèves qui empruntent des livres',
      fb: "Non : emprunter est gratuit. Le CDI est payé par l'établissement, avec de l'<strong>argent public</strong>." },
    { t: 'Les auteurs qui offrent leurs livres',
      fb: "Non : les auteurs vivent de leurs livres, ils ne les offrent pas. Le CDI les <strong>achète</strong>, avec un budget d'<strong>argent public</strong>." },
  ], 'Qui paie ?'),

  TROUS('<p>Complète ce que tu as retenu.</p>', [
    "<p>Au CDI, emprunter un livre est *gratuit*.</p>",
    "<p>Le CDI est payé avec de l'argent *public*, grâce au budget de l'établissement.</p>",
    "<p>Au CDI, il n'y a pas de *publicité/publicités/pub* et on ne vend pas tes informations personnelles.</p>",
    "<p>Les documents appartiennent à *tous/tout le monde* : si j'abîme ou je perds un livre, les autres élèves en sont privés.</p>",
  ], "L'argent du CDI"),

  VF("<p>Un livre perdu, c'est de l'argent qui aurait pu servir à acheter un <strong>nouveau</strong> livre pour le CDI.</p>",
    true,
    "Oui : le budget du CDI est limité. Racheter un livre perdu, c'est un livre nouveau en moins pour tout le monde. D'où l'importance de <strong>rendre à temps</strong> et <strong>en bon état</strong>.",
    "Si, c'est vrai : le budget du CDI est limité. Racheter un livre perdu, c'est un livre nouveau en moins pour tout le monde.",
    'Prendre soin'),
]);

/* =====================================================================
 *  CHAPITRE 4 — PRAXIS : ma mission de recherche au CDI (fiche exportable)
 * ===================================================================== */
const SUJETS = ['les requins', 'les pyramides d’Égypte', 'les volcans', 'les planètes du système solaire', 'les Jeux olympiques'];

const fiche = docTool(
  '<p>Remplis ta fiche page après page, puis télécharge-la à la fin.</p>',
  [
    standardPage('1. Mon sujet', [
      docText('<p>Choisis <strong>un</strong> sujet dans la liste :</p><ul>' + SUJETS.map(s => `<li>${s}</li>`).join('') + '</ul>'),
      textInput('<p>Mon sujet :</p>', 'Ex. : les requins', { rows: '1', required: true }),
      textInput('<p>Mes <strong>mots-clés</strong> (2 ou 3 mots importants) :</p>', 'Ex. : requin, mer, poisson', { rows: '1', required: true }),
    ], "<p>Un mot-clé est un mot <strong>court</strong> et <strong>important</strong> de ton sujet. Évite les phrases.</p>"),

    standardPage('2. Je cherche dans le catalogue', [
      docText("<p>Tape un de tes mots-clés dans le <strong>catalogue du CDI</strong>. Choisis un <strong>documentaire</strong> (pas un roman) disponible.</p>"),
      textInput('<p>Dans quelle <strong>classe Dewey</strong> mon sujet se range-t-il ?</p>', 'Ex. : 500 Sciences', { rows: '1', required: true }),
      textInput('<p>La <strong>cote</strong> du document :</p>', 'Ex. : 597.3 REQ', { rows: '1', required: true }),
      textInput('<p>Le <strong>titre</strong> du document :</p>', 'Recopie le titre exact', { rows: '1', required: true }),
    ], "<p>Rappel : les 10 classes vont de 000 à 900. Sciences = 500, Techniques = 600, Arts et loisirs = 700, Histoire et géographie = 900.</p>"),

    standardPage('3. Je vérifie mon document', [
      docText("<p>Va chercher le document sur l'étagère grâce à sa cote. Regarde la couverture et les premières pages.</p>"),
      textInput("<p>L'<strong>auteur</strong>, l'<strong>éditeur</strong> et l'<strong>année</strong> de publication :</p>", 'Auteur / éditeur / année', { rows: '1', required: true }),
      textInput("<p>Ce document est-il adapté à mon âge et assez récent ? Pourquoi ?</p>", 'Je pense que… parce que…', { rows: '3', required: true }),
    ], "<p>L'année se trouve souvent au dos de la page de titre, en tout petit (« achevé d'imprimer », « dépôt légal »).</p>"),

    standardPage('4. Je prends des notes', [
      docText("<p>Utilise le <strong>sommaire</strong> ou l'<strong>index</strong> pour trouver la bonne page. Écris avec <strong>tes propres mots</strong>, sans recopier.</p>"),
      textInput('<p>Information n°1 (et la <strong>page</strong> où je l’ai trouvée) :</p>', "J'ai appris que… (page …)", { rows: '3', required: true }),
      textInput('<p>Information n°2 (et la <strong>page</strong>) :</p>', "J'ai appris que… (page …)", { rows: '3', required: true }),
    ], "<p>Le <strong>sommaire</strong> est au début du livre (les chapitres dans l'ordre). L'<strong>index</strong> est à la fin (les mots dans l'ordre alphabétique, avec leurs pages).</p>"),

    standardPage('5. Mon bilan', [
      textInput("<p>Qu'est-ce qui m'a aidé à trouver vite mon document ?</p>", 'Ce qui m’a aidé, c’est…', { rows: '3' }),
      textInput("<p>Une difficulté que j'ai rencontrée, et comment je l'ai résolue :</p>", 'J’ai eu du mal à… alors j’ai…', { rows: '3' }),
    ]),

    exportPage("<p>Bravo, ta mission est terminée ! Clique sur <strong>Créer mon document</strong>, vérifie ta fiche, puis <strong>télécharge-la</strong> pour la déposer sur l'ENT.</p>"),
  ],
  'Ma mission au CDI',
);

const ch4 = chapter('4. Praxis — Ma mission au CDI', [
  text(
    banner('Étape 4', 'Praxis') +
    '<h2>Comment je me sers du CDI sans me tromper ?</h2>' +
    '<p>À toi de jouer ! Tu vas mener une <strong>vraie recherche</strong> dans le CDI, comme un enquêteur :</p>' +
    '<ol><li>choisir un sujet et ses <strong>mots-clés</strong> ;</li>' +
    '<li>trouver un document dans le <strong>catalogue</strong> et noter sa <strong>cote</strong> ;</li>' +
    "<li>aller le chercher sur l'étagère et <strong>vérifier</strong> qu'il est fiable ;</li>" +
    '<li>prendre des notes <strong>avec tes mots</strong>, en indiquant la page.</li></ol>' +
    callout("<p><strong>Les bons réflexes :</strong> je cherche dans le catalogue avant de chercher sur les étagères · je vérifie l'auteur et la date · je note toujours d'où vient mon information · je range le document à sa place.</p>", '#2a9d8f'),
    'Consigne Praxis',
  ),
  fiche,
]);

/* =====================================================================
 *  LIVRE
 * ===================================================================== */
const tpl = JSON.parse(fs.readFileSync(path.join(here, 'tpl-book.json'), 'utf8'));
const book = {
  ...tpl,
  showCoverPage: true,
  bookCover: {
    coverDescription:
      '<h2 style="text-align:center">Le CDI : comment ça marche ?</h2>' +
      '<p style="text-align:center">EMI 6e · Espace informationnel n°1 · Séance de réinvestissement</p>' +
      '<p style="text-align:center">4 étapes : <strong>Genèse</strong> → <strong>Mécanique</strong> → <strong>Économie</strong> → <strong>Praxis</strong></p>',
  },
  chapters: [ch1, ch2, ch3, ch4],
};

fs.writeFileSync(path.join(here, 'content.json'), JSON.stringify(book), 'utf8');
console.log('content.json écrit :', book.chapters.length, 'chapitres,',
  book.chapters.reduce((n, c) => n + c.params.content.length, 0), 'modules');
