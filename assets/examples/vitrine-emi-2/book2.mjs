// Livre vitrine EMI, tome 2 « Regarder, écouter, écrire » : les 28 types H5P que le tome 1 ne montrait pas.
// Natifs (notés sur Lumi Nuage quand le type a un score) + types refusés par la Column en cadre
// (H5P.IFrameEmbed, lecteur hors ligne, jamais notés). Chaque chapitre commence par une fiche technique.
// Fil rouge : « Radio JM », la radio des élèves du collège Jean-Moulin de Montval (tout est fictif).
// usage : node book2.mjs <gabarit_interactivebook_reporter_extrait> <base_url_partage> <article-radio.json> <sortie>
import fs from 'fs';
import { text, image, mc, tf, scs, sub, guid } from './fr.mjs';
import { dragText, essay } from './cp.mjs';
import { lib, img } from './defaults.mjs';
const [TPL, BASE, ART, OUT] = process.argv.slice(2);
const base = JSON.parse(fs.readFileSync(`${TPL}/content/content.json`, 'utf8'));
const art = JSON.parse(fs.readFileSync(ART, 'utf8'));
const L = (library, params, contentType, title) => lib(library, TPL, params, contentType, title);

const PLAYER = 'https://h5p-offline-player.vercel.app/embed?src=';
const RAW = 'https://raw.githubusercontent.com/Absconses/h5p-lumi/main/partage';

/* ---------- briques communes (reprises du tome 1) ---------- */
const iframe = (url, w, h, title) => sub('H5P.IFrameEmbed 1.0',
  { source: url, width: String(w), height: String(h), minWidth: '280', resizeSupported: true }, 'Iframe Embedder', title);
const module = (path, w, h, title, consigne, { scripts = false } = {}) => {
  const url = `${PLAYER}${path.startsWith('/') ? RAW + path : `${BASE}/${path}`}`;
  const tip = scripts ? ' Si un bouton « Open with its own scripts » apparaît, clique dessus : c\'est normal.' : '';
  return [
    text(`<p><strong>${consigne}</strong>${tip}</p>`, 'Consigne'),
    iframe(url, w, h, title),
    text(`<p style="font-size:0.9em">Le cadre est trop petit ? <a href="${url}" target="_blank" rel="noopener">Ouvrir l'activité en grand</a> `
      + "(cette activité sert à t'entraîner : elle n'est pas comptée dans ton score).</p>", 'Lien'),
  ];
};
const chapter = (title, items) => ({
  library: 'H5P.Column 1.18', subContentId: guid(),
  params: { content: items.map((c) => ({ content: c, useSeparator: 'auto' })) },
  metadata: { contentType: 'Column', license: 'U', title },
});
const fiche = (type, apport, ou) => text(`<p style="background-color:#eef2f7;font-size:0.88em;color:#33415c">`
  + `<strong>Fiche technique · ${type}.</strong> ${apport} <strong>Où :</strong> ${ou}</p>`, 'Fiche technique');
const OU_NOTE = 'noté sur Lumi Nuage (le score remonte dans le rapport du livre), fonctionne aussi par simple lien.';
const OU_CADRE = 'type refusé dans un chapitre de livre ; affiché en cadre depuis le lecteur hors ligne, donc jamais noté.';
const intro = (html) => text(`<p>${html}</p>`, 'Introduction');
const retiens = (html) => text(`<p><strong>À retenir.</strong> ${html}</p>`, 'À retenir');
const partie = (titre, html) => text(`<p style="background-color:#1d3557;color:#ffffff"><strong>${titre}</strong> · ${html}</p>`, 'Partie');
const PX = (user) => ({ license: 'U', author: `${user} (Pixabay)`, source: 'https://pixabay.com', title: 'Licence Pixabay' });
const pic = (file, w, h, alt, user) => image(`images/${file}`, w, h, alt, alt.slice(0, 60), user ? PX(user) : { license: 'U' });

const ch = [];

/* ===== 0. Avant-propos ===== */
const rows = [
  ['1. Avant, après', 'Image Juxtaposition', 'cadre'], ['2. Quelle photo pour ce titre ?', 'Multimedia Choice', 'oui'],
  ['3. Un lieu, quatre récits', 'Collage', 'non (QCM noté)'], ['4. Le détail et l\'image entière', 'Image Pairing', 'cadre'],
  ['5. Une info, cinq formats', 'Image Slider', 'non (quiz noté)'], ['6. Anatomie d\'un article', 'Image Hotspots + Find the Hotspot', 'oui'],
  ['7. La dictée de la brève', 'Dictation', 'cadre'], ['8. À ton micro', 'Audio Recorder + Speak the Words', 'non'],
  ['9. Ta classe et l\'info', 'Questionnaire + Guess the Answer + Chart', 'QCM noté'], ['10. Les chiffres dans les titres', 'Arithmetic Quiz', 'cadre'],
  ['11. Les questions du chapô', 'Fill in the Blanks + Advanced Fill the Blanks', 'oui'], ['12. Les supports de l\'info', 'Memory Game', 'non'],
  ['13. Les sigles de l\'info', 'Flashcards', 'cadre'], ['14. Mots cachés', 'Find the Words', 'cadre'],
  ['15. Se repérer dans Wikipédia', 'Find Multiple Hotspots', 'cadre'], ['16. Une histoire du savoir', 'Image Sequencing', 'cadre'],
  ['17. La boîte à outils du vérificateur', 'Information Wall', 'QCM noté'], ['18. Le QR code de l\'affiche', 'KewAr Code', 'QCM noté'],
  ['19. L\'archipel de la vérification', 'Game Map', 'cadre'], ['20. Prendre des notes', 'Cornell Notes', 'cadre'],
  ['21. Écrire sa brève', 'Structure Strip + Essay', 'oui (Essay)'], ['22. Le grand quiz', 'Question Set', 'oui'],
];
ch.push(chapter('Avant-propos : à l\'attention de la direction', [
  text('<p>Ce second livre complète la vitrine <a href="' + PLAYER + RAW + '/vitrine-emi/livre-vitrine-emi.h5p" target="_blank" rel="noopener"><em>« S\'informer, vérifier, publier »</em></a> (tome 1). Le premier tome montrait vingt-trois types d\'activités H5P ; '
    + 'celui-ci présente <strong>les vingt-huit autres types fiables</strong> du catalogue, toujours sur le thème de l\'éducation aux médias et à l\'information (EMI) au cycle 4. '
    + 'Avec les deux tomes, la quasi-totalité des types H5P disponibles est montrée en situation de classe.</p>'
    + '<p>Un <strong>fil rouge</strong> relie les chapitres : <em>Radio JM</em>, la radio en ligne que des élèves de 4e lancent dans leur collège (tout est inventé). '
    + 'Les élèves apprennent à <strong>regarder</strong> une image (chapitres 1 à 6), à <strong>écouter et dire</strong> (7 et 8), à <strong>compter</strong> (9 et 10), '
    + 'à maîtriser <strong>les mots</strong> de l\'info (11 à 14), à <strong>chercher et vérifier</strong> (15 à 19), puis à <strong>écrire</strong> (20 à 22).</p>'
    + '<p>Comme dans le tome 1, chaque chapitre s\'ouvre sur une <span style="background-color:#eef2f7">&nbsp;fiche technique&nbsp;</span> pour l\'adulte. '
    + 'Trois types ont été écartés volontairement, car ils risquent de mal s\'afficher le jour d\'une démonstration : Advent Calendar, AR Scavenger et Speak the Words Set.</p>', 'Présentation'),
  text('<table><thead><tr><th>Chapitre</th><th>Type mis en avant</th><th>Noté ?</th></tr></thead><tbody>'
    + rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('') + '</tbody></table>'
    + '<p style="font-size:0.88em">« Cadre » : activité affichée depuis le lecteur hors ligne, jamais notée.</p>', 'Sommaire des types'),
]));

/* ===== 1. Image Juxtaposition ===== */
ch.push(chapter('1. Avant, après : une photo retouchée', [
  partie('Regarder', 'chapitres 1 à 6'),
  fiche('Avant/après (Image Juxtaposition)', 'Deux images superposées et un curseur : l\'élève compare lui-même, au pixel près. Idéal pour une retouche, un paysage qui change, une restauration.', OU_CADRE),
  intro('Pour annoncer un événement de Radio JM, un élève propose cette photo de rue. Quelqu\'un l\'a « un peu améliorée ». Compare.'),
  ...module('avant-apres.h5p', 1000, 760, 'Avant, après : une photo retouchée', 'Fais glisser le curseur jaune de gauche à droite.'),
  mc('Qu\'est-ce que la retouche a changé ?', [
    { t: 'La lumière : la scène paraît ensoleillée.', ok: true, fb: '' },
    { t: 'Les couleurs : elles sont plus chaudes et plus vives.', ok: true },
    { t: 'L\'ambiance : on croirait qu\'il fait beau, alors qu\'il pleuvait.', ok: true },
    { t: 'Des passants ont été ajoutés dans la rue.', fb: 'Regarde bien : les personnes sont les mêmes. La retouche ici ne touche que la lumière et les couleurs.' },
    { t: 'Rien d\'important : ce n\'est qu\'un filtre.', fb: 'Un « simple » filtre change la météo apparente : il raconte autre chose que la réalité du jour.' },
  ], 'Ce que la retouche change', { type: 'multi', ok: 'Oui : sans rien ajouter, un filtre change le récit de la photo.' }),
  retiens('Une retouche peut changer l\'impression sans rien ajouter ni effacer. En France, depuis 2017, une photo publicitaire dont on a modifié la silhouette d\'un mannequin doit porter la mention « photographie retouchée ».'),
]));

/* ===== 2. Multimedia Choice ===== */
const mmImg = (file, w, h, alt, user, correct) => ({
  media: sub('H5P.Image 1.1', { contentName: 'Image', alt, title: alt, decorative: false, file: img(`images/${file}`, w, h, PX(user)) }, 'Image', alt.slice(0, 60)),
  correct,
});
ch.push(chapter('2. Quelle photo pour ce titre ?', [
  fiche('Choix d\'images (Multimedia Choice)', 'Un QCM dont les réponses sont des images (ou des sons). L\'élève doit lire les images, pas seulement des mots.', OU_NOTE),
  intro('Le <em>Courrier de Montval</em> publie un article titré : <strong>« Samedi, le marché de Noël de Montval a attiré la foule »</strong>. La rédaction hésite entre quatre photos.'),
  L('H5P.MultiMediaChoice 0.3', {
    question: 'Quelle photo illustre honnêtement ce titre ?',
    options: [
      mmImg('marche-foule.jpg', 1200, 900, 'Une place de marché de Noël noire de monde, en plein jour.', 'garten-gg', true),
      mmImg('marche-calme.jpg', 1200, 800, 'Un marché de Noël sous la neige, le soir, avec quelques passants.', 'garten-gg', false),
      mmImg('marche-nuit.jpg', 1200, 900, 'Un marché de Noël illuminé, vu de loin et de haut, la nuit.', 'Hans', false),
      mmImg('cadeaux.jpg', 1200, 800, 'Des paquets cadeaux et des boules de Noël sur une table.', 'buzukis', false),
    ],
    overallFeedback: [{ from: 0, to: 99, feedback: 'Une photo d\'information doit montrer ce que dit le titre : ici, la foule.' }, { from: 100, to: 100, feedback: 'Oui : c\'est la seule qui montre la foule. Les cadeaux sont une jolie illustration, mais ils ne prouvent rien.' }],
    behaviour: { enableRetry: true, enableSolutionsButton: true, singlePoint: false, questionType: 'single', aspectRatio: '4to3', maxAlternativesPerRow: '2', passPercentage: 100 },
    l10n: { checkAnswerButtonText: 'Vérifier', showSolutionButtonText: 'Voir la solution', retryText: 'Recommencer', result: 'Tu as :num point(s) sur :total', correctAnswer: 'Bonne réponse', wrongAnswer: 'Mauvaise réponse' },
  }, 'Image Choice', 'Quelle photo pour ce titre ?'),
  retiens('Une <strong>photo d\'information</strong> montre l\'événement. Une <strong>photo d\'illustration</strong> (les cadeaux) décore la page : elle doit être signalée comme telle.'),
]));

/* ===== 3. Collage ===== */
const clip = (file, w, h, alt, user) => ({ image: img(`images/${file}`, w, h, PX(user)), offset: { top: 0, left: 0 }, alt, scale: 1 });
ch.push(chapter('3. Un lieu, quatre récits', [
  fiche('Collage', 'Plusieurs images composées en une seule planche : on les voit ensemble, on les compare d\'un regard.', 'partout ; pas de score (le QCM qui suit est noté).'),
  intro('Quatre photographes ont photographié <strong>le même monument</strong>. Regarde la planche.'),
  L('H5P.Collage 0.3', { collage: {
    template: '2-2', options: { heightRatio: 0.75, spacing: 0.5, frame: true },
    clips: [
      clip('tour-carte.jpg', 1200, 800, 'La tour Eiffel au coucher du soleil, en carte postale.', 'TheDigitalArtist'),
      clip('tour-nb.jpg', 1200, 624, 'La tour Eiffel en noir et blanc, vue d\'en bas, ciel orageux.', 'Walkerssk'),
      clip('tour-foule.jpg', 1200, 810, 'Le pied de la tour Eiffel et la foule des touristes.', 'philriley427'),
      clip('tour-ville.jpg', 800, 1200, 'La tour Eiffel minuscule au loin, au-dessus des toits de Paris.', 'dnovac'),
    ],
  } }, 'Collage', 'Quatre photos de la tour Eiffel'),
  mc('D\'une photo à l\'autre, qu\'est-ce qui change ?', [
    { t: 'Le point de vue : de près, de loin, d\'en bas.', ok: true },
    { t: 'La lumière et les couleurs : coucher de soleil, noir et blanc…', ok: true },
    { t: 'Ce que le photographe choisit de montrer : la foule, la ville, le ciel.', ok: true },
    { t: 'Le monument lui-même.', fb: 'Non : c\'est toujours la même tour. C\'est le regard du photographe qui change.' },
  ], 'Ce qui change', { type: 'multi', ok: 'Exact : une photo n\'est jamais « la réalité », c\'est un choix de regard.' }),
  retiens('Une même réalité peut raconter quatre histoires : majestueuse, inquiétante, envahie de touristes, lointaine. Avant de croire une photo, demande-toi : <em>qu\'est-ce que le photographe a choisi de montrer, et de cacher ?</em>'),
]));

/* ===== 4. Image Pairing ===== */
ch.push(chapter('4. Le détail et l\'image entière', [
  fiche('Paires d\'images (Image Pairing)', 'Associer des images deux à deux par glisser-déposer : sans aucun texte, on peut travailler l\'observation.', OU_CADRE),
  intro('Sur les réseaux, une image circule souvent <strong>recadrée</strong>. Un détail peut faire croire à tout autre chose : une vague géante, une foule en colère…'),
  ...module('detail-image.h5p', 1000, 560, 'Paires : le détail et l\'image entière', 'Associe chaque détail à la photo entière dont il vient, puis clique sur « Vérifier ».'),
  tf('Recadrée sur la fresque, la première photo pourrait faire croire à une vague réelle qui déferle sur la ville.', true,
    'Oui : sans les passants et le trottoir, impossible de savoir que c\'est un mur peint.', 'Regarde le détail seul : on ne voit plus ni le mur, ni les passants. On peut y croire.', 'Le recadrage'),
  retiens('Devant une image surprenante, cherche <strong>l\'image entière</strong> (la recherche d\'image inversée, chapitre 17, sert à ça).'),
]));

/* ===== 5. Image Slider ===== */
const slide = (n, alt) => sub('H5P.ImageSlide 1.1', { image: pic(`format-${n}.jpg`, 1200, 750, alt) }, 'Image Slide', alt.slice(0, 60));
ch.push(chapter('5. Une info, cinq formats', [
  fiche('Diaporama (Image Slider)', 'Des images qui défilent, en plein écran si besoin : pour comparer une série de documents.', 'partout ; pas de score (le quiz qui suit est noté).'),
  intro('La même information, « Radio JM est lancée », circule sous cinq formes. Fais défiler les images.'),
  L('H5P.ImageSlider 1.1', {
    imageSlides: [
      slide(1, 'La dépêche d\'une agence de presse fictive : un texte brut, daté, destiné aux journalistes.'),
      slide(2, 'L\'article en ligne du Courrier de Montval, avec titre, chapô et photo.'),
      slide(3, 'Le post de Radio JM sur un réseau social, avec émoji, mot-dièse et compteurs.'),
      slide(4, 'Une vidéo verticale de 45 secondes avec de gros sous-titres.'),
      slide(5, 'La page d\'un épisode de podcast de 18 minutes.'),
    ],
    aspectRatioMode: 'custom', aspectRatio: { aspectWidth: 16, aspectHeight: 10 },
    a11y: { nextSlide: 'Image suivante', prevSlide: 'Image précédente', gotoSlide: 'Aller à l\'image %slide' },
  }, 'Image Slider', 'Une info, cinq formats'),
  scs([
    ['Quel format est écrit pour les journalistes, pas pour le public ?', ['La dépêche d\'agence', 'Le post sur un réseau social', 'Le podcast']],
    ['Quel format est pensé pour être compris sans le son ?', ['La vidéo verticale sous-titrée', 'Le podcast', 'La dépêche d\'agence']],
    ['Quel format permet d\'écouter en faisant autre chose ?', ['Le podcast', 'L\'article en ligne', 'La vidéo verticale']],
    ['Quel format donne le plus de détails et de contexte ?', ['L\'article en ligne', 'Le post sur un réseau social', 'La vidéo verticale']],
  ], 'Quiz des formats'),
]));

/* ===== 6. Image Hotspots + Find the Hotspot ===== */
const A = art;
// le point se place dans la marge, à gauche de l'élément (colonne de droite : à sa droite)
const hs = (id, header, html, where = 'gauche') => ({
  position: { x: typeof where === 'number' ? where : where === 'centre' ? +(A[id].x + A[id].w / 2).toFixed(1) : where === 'droite' ? +(A[id].x + A[id].w + 1.2).toFixed(1) : +(Math.max(A[id].x - 1.4, 1.2)).toFixed(1),
    y: +(A[id].y + A[id].h / 2).toFixed(1), legacyPositioning: false },
  alwaysFullscreen: false, header, content: [sub('H5P.Text 1.1', { text: `<p>${html}</p>` }, 'Text', header)],
});
const zone = (id, correct, feedbackText, pad = 0.6) => ({
  userSettings: { correct, feedbackText },
  computedSettings: { x: +(A[id].x - pad).toFixed(1), y: +(A[id].y - pad).toFixed(1), width: +(A[id].w + 2 * pad).toFixed(1), height: +(A[id].h + 2 * pad).toFixed(1), figure: 'rectangle' },
});
ch.push(chapter('6. Anatomie d\'un article', [
  fiche('Image interactive (Image Hotspots)', 'Des points à cliquer sur une image : chacun ouvre une explication. L\'élève explore à son rythme.', 'partout ; pas de score.'),
  intro('Voici l\'article du <em>Courrier de Montval</em> sur le lancement de Radio JM. Clique sur chaque <strong>+</strong> pour découvrir les éléments d\'un article.'),
  L('H5P.ImageHotspots 1.10', {
    image: img('images/article-radio.jpg', 1200, 1226), backgroundImageAltText: 'Page web d\'un article du Courrier de Montval sur Radio JM.',
    iconType: 'icon', icon: 'plus', color: '#b5172f',
    hotspots: [
      hs('journal', 'Le nom du média', 'Qui publie ? Un média identifié a une adresse, des responsables (les « mentions légales »), une ligne éditoriale.'),
      hs('rubrique', 'La rubrique', 'Elle classe l\'article : ici, l\'éducation à Montval. Elle indique aussi le point de vue (local).'),
      hs('titre', 'Le titre', 'Il attire l\'attention et annonce le sujet en quelques mots.'),
      hs('chapo', 'Le chapô', 'Le paragraphe en gras résume l\'essentiel : qui, quoi, où, quand. Si tu ne lis qu\'une chose, lis le chapô.'),
      hs('signature', 'La signature', 'Le nom de la journaliste qui a écrit l\'article : elle en est responsable.'),
      hs('date', 'La date', 'Publication et mise à jour : une info sans date peut être sortie de son contexte (voir le chapitre 19).', 49),
      hs('photo', 'La photo', 'Elle attire l\'œil… mais montre-t-elle vraiment l\'événement ? Lis la légende.', 'centre'),
      hs('legende', 'La légende', '« Photo d\'illustration » : l\'image ne montre PAS les élèves de Radio JM, mais un studio quelconque. C\'est honnête de le signaler.'),
      hs('credit', 'Le crédit photo', 'Il indique qui a pris la photo (ou d\'où elle vient) : ici une banque d\'images.', 'droite'),
      hs('intertitre', 'L\'intertitre', 'Il découpe un article long en parties pour faciliter la lecture.'),
      hs('citation', 'La citation', 'Les mots exacts d\'une personne, entre guillemets, avec son nom : c\'est une source.'),
      hs('pub', 'La publicité', 'Elle est signalée par le mot « Publicité ». Elle finance le journal, mais ne fait pas partie de l\'information.', 'droite'),
      hs('commentaires', 'Les commentaires', 'Ce sont des avis de lecteurs, pas de l\'information vérifiée.', 'droite'),
    ],
    hotspotNumberLabel: 'Point n° #num', closeButtonLabel: 'Fermer', containsAudioVideoLabel: 'Contient du son ou une vidéo',
  }, 'Image Hotspots', 'Anatomie d\'un article'),
  fiche('Trouve la zone (Find the Hotspot)', 'L\'élève clique sur une zone de l\'image ; chaque zone, juste ou fausse, a son commentaire.', OU_NOTE),
  L('H5P.ImageHotspotQuestion 1.8', {
    imageHotspotQuestion: {
      backgroundImageSettings: img('images/article-radio.jpg', 1200, 1226),
      hotspotSettings: {
        taskDescription: '<p>Clique sur l\'élément qui indique <strong>qui a pris la photo</strong>.</p>',
        hotspot: [
          zone('credit', true, 'Oui : le crédit photo nomme l\'auteur de l\'image (ici, une banque d\'images).'),
          zone('legende', false, 'La légende dit ce que montre la photo, pas qui l\'a prise.'),
          zone('signature', false, 'C\'est la journaliste qui a écrit l\'article. La photo vient d\'ailleurs : regarde sous l\'image, à droite.'),
          zone('photo', false, 'L\'image ne dit pas qui l\'a prise. Cherche une mention écrite juste en dessous.', 0),
        ],
        noneSelectedFeedback: 'Ce n\'est pas là. Cherche une petite mention près de la photo.',
        showFeedbackAsPopup: true, l10n: { retryText: 'Recommencer', closeText: 'Fermer' },
      },
    },
    scoreBarLabel: 'Tu as :num point(s) sur :total', a11yRetry: 'Recommencer l\'exercice.',
  }, 'Image Hotspot Question', 'Qui a pris la photo ?'),
]));

/* ===== 7. Dictation ===== */
ch.push(chapter('7. La dictée de la brève', [
  partie('Écouter et dire', 'chapitres 7 et 8'),
  fiche('Dictée (Dictation)', 'Un son à écouter, une phrase à écrire, une correction mot à mot. On peut fournir une version lente.', OU_CADRE + ' Voix de synthèse.'),
  intro('Jeudi, 12 h 30 : Radio JM diffuse sa première brève. Un élève sourd de la classe a besoin du texte. Écris-le pour lui.'),
  ...module('dictee-breve.h5p', 1000, 520, 'Dictée : la brève de Radio JM', 'Clique sur le haut-parleur, écoute, puis écris chaque phrase.'),
  retiens('Transcrire ou sous-titrer une émission, c\'est la rendre accessible à tous. Beaucoup de vidéos sont regardées sans le son : les sous-titres sont devenus indispensables.'),
]));

/* ===== 8. Audio Recorder + Speak the Words ===== */
ch.push(chapter('8. À ton micro', [
  fiche('Enregistreur (Audio Recorder)', 'L\'élève s\'enregistre dans le navigateur, se réécoute et télécharge son fichier. Rien n\'est envoyé sur un serveur.', 'partout où le micro est autorisé ; pas de score.'),
  intro('À toi de prendre l\'antenne ! Lis à voix haute la brève du chapitre 7, comme un ou une journaliste de radio : articule, souris, respire entre les phrases.'),
  L('H5P.AudioRecorder 1.0', {
    title: 'Ma brève à l\'antenne de Radio JM',
    l10n: { recordAnswer: 'Enregistrer', pause: 'Pause', continue: 'Reprendre', download: 'Télécharger', done: 'Terminé', retry: 'Recommencer',
      microphoneNotSupported: 'Ton navigateur ne permet pas d\'utiliser le micro.', microphoneInaccessible: 'Le micro n\'est pas accessible : autorise-le dans ton navigateur.',
      insecureNotAllowed: 'Le micro n\'est autorisé que sur une page sécurisée (https).', statusReadyToRecord: 'Clique sur « Enregistrer » pour commencer.',
      statusRecording: 'Enregistrement…', statusPaused: 'En pause. Clique pour reprendre.', statusFinishedRecording: 'C\'est enregistré ! Réécoute-toi.',
      downloadRecording: 'Télécharge ton enregistrement ou recommence.', retryDialogHeaderText: 'Recommencer ?', retryDialogBodyText: 'Ton enregistrement actuel sera effacé.',
      retryDialogConfirmText: 'Recommencer', retryDialogCancelText: 'Annuler', statusCantCreateTheAudioFile: 'Impossible de créer le fichier audio.' },
  }, 'Audio Recorder', 'Ma brève à l\'antenne'),
  fiche('Réponse orale (Speak the Words)', 'L\'élève répond à voix haute ; la reconnaissance vocale du navigateur transcrit et corrige.', 'Chrome ou Edge avec un micro uniquement ; ' + OU_CADRE),
  ...module('dis-le.h5p', 1000, 330, 'Réponds à voix haute', 'Appuie sur le bouton, puis réponds à voix haute.'),
]));

/* ===== 9. Questionnaire + Guess the Answer + Chart ===== */
const smc = (question, choices, inputType = 'radio') => L('H5P.SimpleMultiChoice 1.1', { question, inputType, alternatives: choices.map((t) => ({ text: t, feedback: { chosenFeedback: '', notChosenFeedback: '' } })) }, 'Simple Multi Choice', question.slice(0, 60));
ch.push(chapter('9. Ta classe et l\'info', [
  partie('Compter', 'chapitres 9 et 10'),
  fiche('Questionnaire', 'Un sondage sans bonne réponse : choix et réponses libres. Sur Lumi Nuage, l\'enseignant voit les réponses de la classe.', 'partout ; pas de score.'),
  intro('Radio JM prépare une émission sur « les ados et l\'info ». Elle commence par sonder les élèves. Réponds au sondage.'),
  L('H5P.Questionnaire 1.3', {
    questionnaireElements: [
      { library: smc('Comment t\'informes-tu le plus souvent ?', ['Les réseaux sociaux (vidéos courtes, posts)', 'La télévision', 'Ma famille ou mes amis', 'La radio ou les podcasts', 'Les sites ou applis de médias']), requiredField: true },
      { library: smc('Sur quel appareil ?', ['Un téléphone', 'Une télévision', 'Un ordinateur ou une tablette', 'Une radio']), requiredField: false },
      { library: L('H5P.OpenEndedQuestion 1.0', { question: 'Cite une information que tu as vue ou entendue cette semaine, et où tu l\'as trouvée.', inputRows: '3' }, 'Open Ended Question', 'Une info de la semaine'), requiredField: false },
    ],
    successScreenOptions: { enableSuccessScreen: true, successMessage: 'Merci ! Tes réponses aideront Radio JM à préparer son émission.' },
    uiElements: { buttonLabels: { prevLabel: 'Précédent', continueLabel: 'Suivant', nextLabel: 'Suivant', submitLabel: 'Envoyer' }, requiredMessage: 'Cette question demande une réponse', requiredText: 'obligatoire', submitScreenTitle: 'Tu as répondu à toutes les questions', submitScreenSubtitle: 'Clique ci-dessous pour envoyer' },
  }, 'Questionnaire', 'Sondage : les ados et l\'info'),
  fiche('Devine la réponse (Guess the Answer)', 'Une question, un temps de réflexion, puis la réponse révélée d\'un clic. Pour lancer un débat ou confronter une intuition aux chiffres.', 'partout ; pas de score.'),
  L('H5P.GuessTheAnswer 1.5', {
    taskDescription: 'Devine : dans la classe de 4e de Radio JM (26 élèves), quel est le moyen d\'information le plus cité ?',
    media: pic('mobile.jpg', 1200, 800, 'Une main tient un smartphone.', 'sebastianflores22'),
    solutionLabel: 'Clique pour voir la réponse.',
    solutionText: 'Les réseaux sociaux : 11 élèves sur 26. Regarde le graphique ci-dessous.',
  }, 'Guess the Answer', 'Devine la réponse'),
  fiche('Graphique (Chart)', 'Un camembert ou un histogramme fabriqué en saisissant quelques chiffres : pour apprendre à lire, et à questionner, une donnée.', 'partout ; pas de score.'),
  L('H5P.Chart 1.2', {
    graphMode: 'barChart',
    listOfTypes: [
      { text: 'Réseaux sociaux (11)', value: 11, color: '#1d3557', fontColor: '#ffffff' },
      { text: 'Télévision (6)', value: 6, color: '#457b9d', fontColor: '#ffffff' },
      { text: 'Famille ou amis (4)', value: 4, color: '#a8dadc', fontColor: '#1d3557' },
      { text: 'Sites ou applis de médias (3)', value: 3, color: '#ffd166', fontColor: '#1d3557' },
      { text: 'Radio ou podcasts (2)', value: 2, color: '#b5172f', fontColor: '#ffffff' },
    ],
    figureDefinition: 'Sondage de la classe de 4e de Radio JM (26 élèves, chiffres inventés pour l\'exercice) : comment t\'informes-tu le plus souvent ?',
  }, 'Chart', 'Graphique du sondage'),
  mc('Que peut-on conclure de ce graphique ?', [
    { t: 'Dans cette classe, moins d\'un élève sur deux cite d\'abord les réseaux sociaux.', ok: true, fb: '' },
    { t: 'La majorité des élèves de la classe s\'informe d\'abord sur les réseaux sociaux.', fb: '11 sur 26, c\'est 42 % : c\'est le premier choix, mais pas une majorité (plus de la moitié).' },
    { t: 'Les adolescents français s\'informent surtout sur les réseaux sociaux.', fb: 'Piège : une seule classe de 26 élèves ne représente pas tous les ados de France. Un sondage sérieux interroge un échantillon représentatif.' },
  ], 'Lire le graphique', { ok: 'Exact : « le plus cité » ne veut pas dire « la majorité », et une classe n\'est pas la France.' }),
]));

/* ===== 10. Arithmetic Quiz ===== */
ch.push(chapter('10. Les chiffres dans les titres', [
  fiche('Quiz de calcul (Arithmetic Quiz)', 'Des opérations tirées au hasard, chronométrées. Le contenu n\'est pas personnalisable : c\'est un type pensé pour les maths, montré ici en échauffement. Intérêt limité en EMI, à réserver aux projets avec les collègues de mathématiques.', OU_CADRE),
  intro('Les titres adorent les chiffres : « + 100 % », « deux fois plus »… Pour ne pas se laisser impressionner, il faut calculer vite. Échauffement !'),
  ...module('calcul-mental.h5p', 1000, 420, 'Calcul mental', 'Clique sur « Commencer » et réponds le plus vite possible.'),
  mc('Un titre annonce : « Radio JM : + 100 % d\'abonnés en une semaine ! ». Lundi, la radio avait 40 abonnés. Combien en a-t-elle une semaine plus tard ?', [
    { t: '80', ok: true },
    { t: '140', fb: '+ 100 % ne veut pas dire « + 100 abonnés » : c\'est 100 % de 40, soit 40 de plus.' },
    { t: '4 000', fb: 'Non : + 100 %, c\'est doubler. 40 devient 80.' },
  ], 'Le piège du pourcentage', { ok: 'Oui : + 100 %, c\'est doubler. Un titre impressionnant peut cacher de petits nombres.' }),
]));

/* ===== 11. Fill in the Blanks + Advanced Fill the Blanks ===== */
ch.push(chapter('11. Les questions du chapô', [
  partie('Les mots de l\'info', 'chapitres 11 à 14'),
  fiche('Texte à trous (Fill in the Blanks)', 'L\'élève tape les mots manquants ; plusieurs réponses peuvent être acceptées.', OU_NOTE),
  intro('Voici le chapô d\'un article sur Radio JM : <em>« Depuis lundi, douze élèves de 4e animent une radio en ligne au collège Jean-Moulin de Montval, pour apprendre à vérifier une information. »</em> Un bon chapô répond aux questions essentielles. Lesquelles ?'),
  L('H5P.Blanks 1.14', {
    text: '<p>Écris le mot interrogatif (qui, quoi, où, quand, pourquoi) auquel répond chaque morceau du chapô.</p>',
    questions: [
      '<p>« Depuis lundi » répond à la question *quand* ?</p>',
      '<p>« douze élèves de 4e » répond à la question *qui* ?</p>',
      '<p>« animent une radio en ligne » répond à la question *quoi* ?</p>',
      '<p>« au collège Jean-Moulin de Montval » répond à la question *où* ?</p>',
      '<p>« pour apprendre à vérifier une information » répond à la question *pourquoi* ?</p>',
    ],
    overallFeedback: [{ from: 0, to: 99, feedback: 'Les journalistes anglophones les appellent les « 5 W » : who, what, where, when, why.' }, { from: 100, to: 100, feedback: 'Parfait : tu connais les 5 questions du journaliste.' }],
    behaviour: { caseSensitive: false, acceptSpellingErrors: true },
    showSolutions: 'Voir la solution', tryAgain: 'Recommencer', checkAnswer: 'Vérifier', notFilledOut: 'Remplis tous les trous avant de voir la solution.',
  }, 'Fill in the Blanks', 'Les 5 questions du chapô'),
  fiche('Texte à trous avancé (Advanced Fill the Blanks)', 'Comme le texte à trous, mais chaque erreur prévisible a son propre commentaire : l\'erreur devient une explication.', OU_CADRE),
  ...module('mots-article.h5p', 1000, 470, 'Texte à trous : les mots de l\'article', 'Complète, puis clique sur « Vérifier » et lis les commentaires.'),
]));

/* ===== 12. Memory Game ===== */
const mem = (n, alt, mot, user) => ({ image: img(`images/mem-${n}.jpg`, 500, 500, PX(user)), imageAlt: alt, match: img(`images/mot-${n}.png`, 500, 500), matchAlt: mot });
ch.push(chapter('12. Les supports de l\'info', [
  fiche('Mémoire (Memory Game)', 'Le jeu de paires classique : ici, une photo d\'objet et le nom du média. Pour mémoriser du vocabulaire en jouant.', 'partout ; pas de score.'),
  intro('Retourne les cartes deux par deux : associe chaque objet au média qu\'il représente.'),
  L('H5P.MemoryGame 1.3', {
    cards: [
      mem('radio', 'Un vieux poste de radio.', 'La radio', 'max_types'),
      mem('journal', 'Des journaux posés sur une table.', 'La presse écrite', 'sweetlouise'),
      mem('tele', 'Un vieux téléviseur rouge.', 'La télévision', 'makamuki0'),
      mem('mobile', 'Une main tient un smartphone.', 'Les réseaux sociaux', 'sebastianflores22'),
      mem('podcast', 'Un micro de studio et une table de mixage.', 'Le podcast', '466654'),
      mem('affiches', 'Un mur couvert d\'affiches.', 'L\'affichage', 'Pexels'),
    ],
    behaviour: { useGrid: true, allowRetry: true },
    lookNFeel: { themeColor: '#1d3557' },
    l10n: { cardTurns: 'Cartes retournées :', timeSpent: 'Temps :', feedback: 'Bravo, toutes les paires sont trouvées !', tryAgain: 'Rejouer', closeLabel: 'Fermer',
      label: 'Jeu de mémoire. Trouve les paires.', done: 'Toutes les paires ont été trouvées.', cardPrefix: 'Carte %num sur %total :', cardUnturned: 'Face cachée.', cardTurned: 'Retournée.',
      cardMatched: 'Paire trouvée.', cardMatchedA11y: 'Les cartes vont ensemble !', cardNotMatchedA11y: 'Ces cartes ne vont pas ensemble. Essaie encore.' },
  }, 'Memory Game', 'Les supports de l\'info'),
]));

/* ===== 13. Flashcards ===== */
ch.push(chapter('13. Les sigles de l\'info', [
  fiche('Cartes-questions (Flashcards)', 'Une carte, une question, une réponse à taper : pour réviser du vocabulaire, carte après carte.', OU_CADRE),
  ...module('sigles.h5p', 1000, 900, 'Flashcards : les sigles de l\'info', 'Lis chaque définition et écris le sigle. L\'icône « i » donne un indice.'),
]));

/* ===== 14. Find the Words ===== */
ch.push(chapter('14. Mots cachés', [
  fiche('Mots cachés (Find the Words)', 'Une grille de lettres générée automatiquement à partir d\'une liste de mots.', OU_CADRE),
  ...module('mots-caches.h5p', 1000, 800, 'Mots cachés de l\'info', 'Trouve les dix mots en glissant la souris (ou le doigt) sur les lettres.'),
]));

/* ===== 15. Find Multiple Hotspots (repris de « Wikipédia en 1 h ») ===== */
ch.push(chapter('15. Se repérer dans Wikipédia', [
  partie('Chercher et vérifier', 'chapitres 15 à 19'),
  fiche('Trouve les zones (Find Multiple Hotspots)', 'Comme « Trouve la zone » (chapitre 6), mais avec plusieurs bonnes zones à trouver sur la même image. Module repris du parcours « Wikipédia en 1 h ».', OU_CADRE),
  ...module('/wiki-1h/interface-wikipedia.h5p', 1000, 1400, 'Se repérer dans un article Wikipédia', 'Clique sur les zones demandées dans la capture de l\'article.'),
]));

/* ===== 16. Image Sequencing (repris) ===== */
ch.push(chapter('16. Une histoire du savoir', [
  fiche('Remettre des images en ordre (Image Sequencing)', 'Des images à glisser dans le bon ordre : une chronologie, les étapes d\'un processus. Module repris du parcours « Wikipédia en 1 h ».', OU_CADRE),
  ...module('/wiki-1h/ordre-histoire-savoir.h5p', 1000, 950, 'Range les grandes étapes du savoir', 'Fais glisser les images dans l\'ordre chronologique, puis clique sur « Check ».'),
]));

/* ===== 17. Information Wall ===== */
ch.push(chapter('17. La boîte à outils du vérificateur', [
  fiche('Mur d\'informations (Information Wall)', 'Des fiches avec un champ de recherche qui filtre en direct : un annuaire, un glossaire, une boîte à outils.', OU_CADRE),
  ...module('boite-outils.h5p', 1000, 1150, 'La boîte à outils du vérificateur', 'Tape « image », « vidéo » ou « date » dans le champ de recherche pour filtrer les outils.'),
  mc('Une photo étonnante circule et tu veux savoir si elle a déjà été publiée avant. Quel outil choisis-tu en premier ?', [
    { t: 'Une recherche d\'image inversée (TinEye ou Google Lens).', ok: true },
    { t: 'La Wayback Machine.', fb: 'Elle archive des pages web, pas des photos isolées. Elle sert à voir une page à une date passée.' },
    { t: 'La recherche ICANN.', fb: 'Elle renseigne sur un nom de domaine (un site), pas sur une photo.' },
  ], 'Choisir l\'outil', { ok: 'Oui : la recherche inversée retrouve les publications plus anciennes de la même image.' }),
]));

/* ===== 18. KewAr Code ===== */
ch.push(chapter('18. Le QR code de l\'affiche', [
  fiche('QR code (KewAr Code)', 'Un QR code généré dans l\'activité : il peut mener à un site, un événement, un contact… Pratique pour relier une affiche papier à une ressource en ligne.', OU_CADRE),
  ...module('qr-affiche.h5p', 1000, 470, 'Le QR code de l\'affiche', 'Lis l\'affiche, puis clique sur le QR code pour voir l\'adresse.'),
  mc('Le QR code mène à <code>https://radio-jm.cadeaux-gratuits.example/connexion</code>, une page qui demande ton identifiant et ton mot de passe de l\'ENT. Que fais-tu ?', [
    { t: 'Je ne donne rien : le site n\'appartient pas à Radio JM et un cadeau contre des identifiants, c\'est un piège.', ok: true },
    { t: 'Je me connecte : l\'adresse contient « radio-jm ».', fb: 'Piège : le vrai nom du site est ce qui précède le premier « / », lu de droite à gauche : « cadeaux-gratuits.example ». « radio-jm » n\'est qu\'un préfixe que n\'importe qui peut choisir.' },
    { t: 'Je me connecte : l\'affiche est collée dans le collège, donc elle est officielle.', fb: 'N\'importe qui peut coller une affiche, ou un autocollant sur une vraie affiche. Le lieu ne garantit rien.' },
  ], 'Méfie-toi du QR code', { ok: 'Exact : on appelle cette arnaque le « quishing », l\'hameçonnage par QR code.' }),
  retiens('Un QR code cache une adresse. Avant d\'ouvrir la page, regarde <strong>l\'adresse complète</strong>. Et un vrai service ne te demande jamais ton mot de passe en échange d\'un cadeau.'),
]));

/* ===== 19. Game Map ===== */
ch.push(chapter('19. L\'archipel de la vérification', [
  fiche('Carte de jeu (Game Map)', 'Un parcours sur une carte : chaque étape contient un exercice et débloque la suivante. La carte entière raconte la démarche.', OU_CADRE),
  intro('Une photo choc circule : « Le gymnase du collège inondé ! » Avant d\'en parler à l\'antenne, Radio JM fait escale sur chaque île de la vérification.'),
  ...module('archipel.h5p', 1000, 680, 'Carte : l\'archipel de la vérification', 'Clique sur « Commencer », puis sur le port, et navigue d\'île en île jusqu\'au phare.'),
]));

/* ===== 20. Cornell Notes ===== */
ch.push(chapter('20. Prendre des notes', [
  partie('Écrire', 'chapitres 20 à 22'),
  fiche('Prise de notes (Cornell Notes)', 'Un document à gauche, trois zones de notes à droite (notes, questions, résumé) selon la méthode Cornell. Les notes se copient dans un traitement de texte.', OU_CADRE + ' Les notes ne sont pas conservées par le lien direct : penser à les copier.'),
  ...module('notes-cornell.h5p', 1000, 1050, 'Prise de notes : repérer une image fabriquée par une IA', 'Lis le texte et prends tes notes à droite. Clique sur « Copier » à la fin.'),
]));

/* ===== 21. Structure Strip + Essay ===== */
ch.push(chapter('21. Écrire sa brève', [
  fiche('Bandes de structure (Structure Strip)', 'Un texte découpé en parties colorées, avec une longueur conseillée pour chacune : un échafaudage pour apprendre à structurer un écrit.', OU_CADRE),
  ...module('ecrire-breve.h5p', 1000, 820, 'Écrire une brève', 'Écris chaque partie de ta brève, clique sur « Vérifier », puis « Copier ».'),
  fiche('Production écrite (Essay)', 'Une réponse rédigée, corrigée par mots-clés : l\'élève voit ce qu\'il a oublié, puis compare avec une réponse possible.', OU_NOTE),
  (() => {
    const e = essay('<p>Recopie ici le <strong>chapô</strong> de ta brève sur la rencontre avec Nadia Kerbal. Il doit dire <strong>qui, quoi, où et quand</strong>.</p>', [
      { w: 'Nadia Kerbal', alt: ['autrice', 'auteure', 'Kerbal'], yes: 'Tu dis qui vient.', no: 'Qui ? Nomme l\'invitée.' },
      { w: 'jeudi', alt: ['13 novembre'], yes: 'Tu dis quand.', no: 'Quand ? Donne le jour.' },
      { w: 'CDI', alt: ['centre de documentation'], yes: 'Tu dis où.', no: 'Où ? Précise le lieu.' },
      { w: 'BD', alt: ['bande dessinée', 'bandes dessinées'], yes: 'Tu dis de quoi il s\'agit.', no: 'Quoi ? Dis que c\'est une autrice de BD.' },
      { w: 'club', alt: ['Mordus'], yes: 'Tu cites le club qui organise.', no: 'Qui organise ? Le club « Les Mordus ».' },
    ], '<p>Jeudi 13 novembre à 12 h 30, l\'autrice de BD Nadia Kerbal rencontre les élèves au CDI du collège Jean-Moulin, à l\'invitation du club lecture « Les Mordus ». L\'entrée est libre.</p>', 'Le chapô de ma brève', { minimumLength: 80, pointsHost: 5 });
    e.params.overallFeedback = [{ from: 0, to: 59, feedback: 'Il manque des informations essentielles : relis les commentaires.' }, { from: 60, to: 100, feedback: 'Ton chapô répond aux questions essentielles. Compare-le avec la réponse possible.' }];
    e.params.behaviour.inputFieldSize = '3';
    return e;
  })(),
]));

/* ===== 22. Question Set ===== */
ch.push(chapter('22. Le grand quiz', [
  fiche('Série de questions (Question Set)', 'Plusieurs exercices enchaînés (QCM, vrai/faux, trous, glisser-déposer) avec un écran de résultat final.', OU_NOTE),
  L('H5P.QuestionSet 1.20', {
    introPage: { showIntroPage: true, title: 'Le grand quiz de Radio JM', introduction: '<p>Six questions sur tout le livre. Bonne chance !</p>', startButtonText: 'Commencer' },
    progressType: 'dots', passPercentage: 60,
    questions: [
      mc('Sous une photo, la mention « Photo d\'illustration » signifie que…', [
        { t: 'l\'image ne montre pas l\'événement raconté.', ok: true },
        { t: 'la photo a été retouchée.', fb: 'Une retouche se signale autrement. « Illustration » veut dire : image d\'ambiance, pas l\'événement.' },
        { t: 'la photo a été prise par le journaliste.', fb: 'C\'est le crédit qui dit qui a pris la photo.' },
      ], 'Photo d\'illustration'),
      tf('Un détail recadré d\'une photo authentique peut tromper.', true, 'Oui, comme la « vague » du chapitre 4.', 'Souviens-toi de la fresque du chapitre 4 : le détail faisait croire à une vraie vague.', 'Recadrage'),
      L('H5P.Blanks 1.14', {
        text: '<p>Complète.</p>', questions: ['<p>Le *chapô/chapeau/chapo* résume l\'article. Le *crédit* indique qui a pris la photo.</p>'],
        behaviour: { caseSensitive: false, acceptSpellingErrors: true },
        overallFeedback: [{ from: 0, to: 100 }], showSolutions: 'Voir la solution', tryAgain: 'Recommencer', checkAnswer: 'Vérifier' }, 'Fill in the Blanks', 'Vocabulaire'),
      mc('Une classe de 26 élèves dont 11 s\'informent sur les réseaux sociaux : que peut-on dire ?', [
        { t: 'C\'est le premier choix de cette classe, mais pas une majorité.', ok: true },
        { t: 'La majorité des ados français s\'informent sur les réseaux.', fb: 'Une classe n\'est pas un échantillon représentatif, et 11 sur 26 n\'est pas une majorité.' },
      ], 'Lire un sondage'),
      mc('Pour savoir où une photo a déjà été publiée, j\'utilise…', [
        { t: 'une recherche d\'image inversée.', ok: true },
        { t: 'le nombre de « J\'aime ».', fb: 'Les « J\'aime » mesurent le succès, pas l\'origine.' },
      ], 'Recherche inversée'),
      tf('Dans l\'adresse https://radio-jm.cadeaux-gratuits.example/connexion, le site s\'appelle « radio-jm ».', false, 'Exact : le nom de domaine est « cadeaux-gratuits.example ».', 'Non : on lit le nom de domaine juste avant le premier « / », de droite à gauche : « cadeaux-gratuits.example ».', 'Nom de domaine'),
    ],
    texts: { prevButton: 'Question précédente', nextButton: 'Question suivante', finishButton: 'Terminer', textualProgress: 'Question @current sur @total' },
    endGame: { showResultPage: true, showSolutionButton: true, showRetryButton: true, noResultMessage: 'Terminé', message: 'Ton résultat :', scoreBarLabel: 'Tu as @finals point(s) sur @totals',
      overallFeedback: [{ from: 0, to: 59, feedback: 'Reprends les chapitres où tu as hésité, puis recommence.' }, { from: 60, to: 99, feedback: 'Bien joué, tu es prêt ou prête pour Radio JM !' }, { from: 100, to: 100, feedback: 'Parfait : tu pourrais diriger la rédaction de Radio JM !' }],
      solutionButtonText: 'Voir les solutions', retryButtonText: 'Recommencer', finishButtonText: 'Terminer' },
  }, 'Question Set', 'Le grand quiz'),
  text('<p style="font-size:0.8em;color:#555555"><strong>Crédits.</strong> Photos Pixabay (licence Pixabay) : trilemedia (rue sous la pluie, retouchée pour l\'exercice), garten-gg et Hans (marchés de Noël), buzukis (cadeaux), '
    + 'TheDigitalArtist, Walkerssk, philriley427 et dnovac (tour Eiffel), wal_172619 (fresque), mxwegele (vendeur), Studio-Lannach (studio de radio), max_types (radio), 466654 (micro), '
    + 'sweetlouise (journaux), makamuki0 (téléviseur), sebastianflores22 (smartphone), Pexels (affiches), GregMontani (drapeau européen), StockSnap (élèves), AS_Photography (ordinateur), Alexandra_Koch (robot). '
    + 'Voix de la dictée : synthèse vocale. Carte de l\'archipel, article, dépêche, post, vidéo et podcast : maquettes dessinées pour l\'exercice. '
    + 'Radio JM, le collège Jean-Moulin de Montval, le <em>Courrier de Montval</em>, l\'agence APM, Léa Morel, Inès, Malo, Nadia Kerbal, la marque « Pas de Loup » et le site « cadeaux-gratuits.example » sont inventés. '
    + 'Les chapitres 15 et 16 reprennent deux modules du parcours « Wikipédia en 1 h ».</p>', 'Crédits'),
]));

const book = { ...base, chapters: ch };
book.showCoverPage = true;
book.bookCover = {
  coverDescription: '<p style="text-align:center">Tome 2 de la vitrine EMI : vingt-huit autres types d\'activités interactives, autour de la radio des élèves d\'un collège.</p>'
    + '<p style="text-align:center;font-size:0.9em">Cycle 4 · CDI</p>',
  coverMedium: image('images/studio.jpg', 1200, 800, 'Une animatrice de radio sourit dans un studio, casque à la main, devant un micro.', 'Couverture', PX('Studio-Lannach')),
};
Object.assign(book, {
  read: 'Commencer', displayTOC: 'Afficher le sommaire', hideTOC: 'Masquer le sommaire',
  nextPage: 'Chapitre suivant', previousPage: 'Chapitre précédent', chapterCompleted: 'Chapitre terminé !',
  partCompleted: '@pages chapitres sur @total terminés', incompleteChapter: 'Chapitre non terminé',
  navigateToTop: 'Revenir en haut', markAsFinished: "J'ai terminé ce chapitre",
  fullscreen: 'Plein écran', exitFullscreen: 'Quitter le plein écran',
  bookProgressSubtext: '@count chapitres sur @total', interactionsProgressSubtext: '@count activités sur @total',
  submitReport: 'Envoyer mes résultats', restartLabel: 'Recommencer', summaryHeader: 'Bilan',
  allInteractions: 'Toutes les activités', unansweredInteractions: 'Activités sans réponse',
  scoreText: '@score / @maxscore', leftOutOfTotalCompleted: '@left activités terminées sur @max',
  noInteractions: 'Aucune activité', score: 'Score', summaryAndSubmit: 'Bilan et envoi',
  noChapterInteractionBoldText: "Tu n'as encore fait aucune activité.",
  noChapterInteractionText: 'Fais au moins une activité avant de voir ton bilan.',
  yourAnswersAreSubmittedForReview: 'Tes réponses ont été envoyées.',
  bookProgress: 'Progression dans le livre', interactionsProgress: 'Activités terminées', totalScoreLabel: 'Score total',
  a11y: { progress: 'Chapitre @chapter sur @total.', menu: 'Afficher ou masquer le sommaire.' },
});
book.behaviour = { ...base.behaviour, baseColor: '#1d3557', defaultTableOfContents: true, progressIndicators: true, progressAuto: true, displaySummary: true };
fs.writeFileSync(OUT, JSON.stringify(book));
console.log('livre :', ch.length, 'chapitres');
