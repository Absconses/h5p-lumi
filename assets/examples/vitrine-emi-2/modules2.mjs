// Modules en cadre du tome 2 de la vitrine EMI (types refusés par la Column du livre).
// usage : node modules2.mjs <dossier_gabarits_extraits> <dossier_sortie>
// Chaque module part du content.json de son gabarit (libellés déjà en français quand ils existent)
// et remplace le contenu. Fil rouge : « Radio JM », la radio des élèves du collège Jean-Moulin de Montval (fictif).
import fs from 'fs';
import { merge, sub, img, guid } from './defaults.mjs';
import { text, mc, tf } from './fr.mjs';
import { dragText } from './cp.mjs';
const [TPL, OUT] = process.argv.slice(2);
const tpl = (d) => JSON.parse(fs.readFileSync(`${TPL}/${d}/content/content.json`, 'utf8'));
const save = (name, c) => { fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(c)); console.log('ok', name); };
const PX = (user) => ({ license: 'U', author: `${user} (Pixabay)`, source: 'https://pixabay.com', title: 'Licence Pixabay' });
const image = (path, w, h, alt, copyright) => sub('H5P.Image 1.1', {
  contentName: 'Image', alt, title: alt, decorative: false, expandImage: "Agrandir l'image", minimizeImage: "Réduire l'image",
  file: img(path, w, h, copyright),
}, 'Image', alt.slice(0, 60));

/* 1. Image Juxtaposition : la même rue, avant et après retouche ---------------------------------- */
save('avant-apres', merge(tpl('imagejuxtaposition'), {
  taskDescription: '<p>Fais glisser le curseur : à gauche la photo d\'origine, à droite la même photo après quelques réglages.</p>',
  imageBefore: { imageBefore: image('images/rue-avant.jpg', 1200, 800, 'Une rue sous la pluie, ciel gris, pavés mouillés.', PX('trilemedia')), labelBefore: "Photo d'origine" },
  imageAfter: { imageAfter: image('images/rue-apres.jpg', 1200, 800, 'La même rue, couleurs chaudes et lumière dorée, comme un jour de soleil.', PX('trilemedia (retouche pour l\'exercice)')), labelAfter: 'Après retouche' },
  behavior: { startingPosition: 50, sliderOrientation: 'horizontal', sliderColor: '#ffd60a' },
  a11y: { imageVisibleMessage: 'Image visible à @percentage %' },
}));

/* 2. Image Pairing : le détail et l'image entière ------------------------------------------------ */
const pair = (d, dw, dh, full, fw, fh, alt, user) => ({
  image: img(`images/detail-${d}.jpg`, dw, dh, PX(user)), imageAlt: `Détail : ${alt[0]}`,
  match: img(`images/${full}.jpg`, fw, fh, PX(user)), matchAlt: alt[1],
});
save('detail-image', merge(tpl('imagepair'), {
  taskDescription: 'Chaque petite image est un détail recadré. Fais-la glisser sur la photo entière dont elle vient.',
  cards: [
    pair('fresque', 390, 260, 'fresque', 1200, 736, ['une vague géante', 'Des passants sous la pluie devant une fresque de vagues peinte sur un mur.'], 'wal_172619'),
    pair('vendeur', 450, 250, 'vendeur', 1200, 802, ['un parasol turquoise', 'Un vendeur ambulant pousse son chariot sous la pluie.'], 'mxwegele'),
    pair('tour-foule', 480, 280, 'tour-foule', 1200, 810, ['une foule immense sur une avenue', 'La tour Eiffel vue de près ; au loin, des touristes sur le Champ-de-Mars.'], 'philriley427'),
    pair('marche-foule', 460, 300, 'marche-foule', 1200, 900, ['un chalet de bois décoré', 'Un marché de Noël très fréquenté sur une grande place.'], 'garten-gg'),
  ],
  behaviour: { allowRetry: true },
  l10n: { checkAnswer: 'Vérifier', tryAgain: 'Recommencer', showSolution: 'Voir la solution', score: 'Tu as @score point(s) sur @total' },
}));

/* 3. Dictation : la brève de Radio JM ------------------------------------------------------------- */
const au = (f) => [{ path: `audios/${f}`, mime: 'audio/mpeg', copyright: { license: 'U' } }];
const dict = tpl('dictation');
save('dictee-breve', merge(dict, {
  taskDescription: '<p>Écoute chaque phrase de la brève lue à l\'antenne de Radio JM, puis écris-la. Le bouton escargot la relit plus lentement.</p>',
  sentences: [
    'Depuis lundi, douze élèves du collège Jean-Moulin animent une radio en ligne.',
    "L'émission est diffusée chaque jeudi à midi et demi.",
    'Avant de parler au micro, les élèves vérifient chaque information.',
  ].map((t, i) => ({ description: `Phrase ${i + 1}`, sample: au(`dictee-${i + 1}.mp3`), sampleAlternative: au(`dictee-${i + 1}-lent.mp3`), text: t })),
  overallFeedback: [{ from: 0, to: 60, feedback: 'Réécoute les phrases lentement : la radio, ça s\'écoute deux fois !' }, { from: 61, to: 99, feedback: 'Presque parfait, regarde les mots soulignés.' }, { from: 100, to: 100, feedback: 'Parfait : tu pourrais rédiger les sous-titres de Radio JM !' }],
  behaviour: { ...dict.behaviour, tries: 3, triesAlternative: 3 },
  l10n: { generalFeedback: 'Tu as fait @total erreur(s).' },
  a11y: { yourResult: 'Tu as @score point(s) sur @total', shouldHaveBeen: 'Il fallait', enterText: 'Écris ce que tu as entendu.' },
}));

/* 4. Speak the Words : réponds à voix haute ------------------------------------------------------- */
save('dis-le', merge(tpl('SpeakTheWords'), {
  question: 'Quel média transmet l\'information uniquement par le son ? Appuie sur le bouton et réponds à voix haute.',
  acceptedAnswers: ['la radio', 'radio', 'une radio', 'le podcast', 'podcast', 'un podcast', 'les podcasts', 'la radio et le podcast'],
  inputLanguage: 'fr-FR',
  incorrectAnswerText: 'Ce n\'est pas ça. Réessaie !', correctAnswerText: 'Bonne réponse : la radio (et le podcast) !',
  l10n: {
    retryLabel: 'Recommencer', showSolutionLabel: 'Voir la solution', speakLabel: 'Appuie pour parler', listeningLabel: 'Je t\'écoute…',
    correctAnswersText: 'Réponse(s) attendue(s) :', userAnswersText: 'J\'ai compris :', noSound: 'Je ne t\'ai pas entendu : vérifie que le micro est autorisé.',
    unsupportedBrowserHeader: 'Ton navigateur ne sait pas reconnaître la voix', unsupportedBrowserDetails: 'Ouvre cette activité dans Chrome ou Edge, avec un micro.',
    a11yShowSolution: 'Voir la solution.', a11yRetry: 'Recommencer l\'exercice.',
  },
}));

/* 5. Arithmetic Quiz : échauffement --------------------------------------------------------------- */
save('calcul-mental', merge(tpl('arithmeticquiz'), {
  intro: 'Échauffement : multiplie vite !',
  quizType: 'arithmetic', arithmeticType: 'multiplication', equationType: 'intermediate', maxQuestions: 10,
  UI: { score: 'Score :', time: 'Temps : @time', resultPageHeader: 'Terminé !', go: 'C\'est parti !', startButton: 'Commencer', retryButton: 'Recommencer',
    correctText: 'Juste', incorrectText: 'Faux, c\'était :num', humanizedQuestion: 'Combien font :arithmetic ?', equalitySign: 'égale',
    plusOperator: 'plus', subtractionOperator: 'moins', multiplicationOperator: 'fois', divisionOperator: 'divisé par', slideOfTotal: 'Question :num sur :total' },
}));

/* 6. Advanced Fill the Blanks : le vocabulaire de l'article -------------------------------------- */
const blank = (ok, hint, wrongs) => ({ correctAnswerText: ok, hint, incorrectAnswersList: wrongs.map(([w, fb]) => ({ incorrectAnswerText: w, incorrectAnswerFeedback: fb, showHighlight: false, highlight: '-1' })) });
save('mots-article', merge(tpl('advancedblanks'), {
  content: {
    task: '<p>Complète avec le mot juste. Si tu te trompes, un commentaire t\'explique la différence.</p>',
    blanksText: '<p>1. Le court texte en gras sous le titre, qui résume l\'article, s\'appelle le ___.</p>'
      + '<p>2. Sous une photo, la ___ explique ce que montre l\'image.</p>'
      + '<p>3. Le ___ photo indique qui a pris la photo.</p>'
      + '<p>4. Le nom de la personne qui a écrit l\'article, c\'est la ___.</p>'
      + '<p>5. Une ___ est un texte bref et factuel qu\'une agence de presse envoie aux médias.</p>',
    blanksList: [
      blank('chapô/chapeau/chapo', 'Un mot qui se coiffe…', [['sous-titre', 'On dit plutôt chapô (ou chapeau) : il « coiffe » l\'article et en résume l\'essentiel.'], ['résumé', 'C\'est bien un résumé, mais il a un nom précis dans un journal : le chapô.']]),
      blank('légende', '', [['crédit', 'Le crédit dit QUI a pris la photo ; la légende dit CE QU\'elle montre.'], ['titre', 'Le titre est celui de l\'article ; sous la photo, c\'est la légende.']]),
      blank('crédit', '', [['légende', 'La légende décrit l\'image ; le crédit nomme son auteur ou son agence.'], ['copyright', 'Le symbole © accompagne souvent le crédit, mais le mot attendu est « crédit ».']]),
      blank('signature', '', [['légende', 'La légende concerne la photo. Le nom du ou de la journaliste, c\'est la signature.'], ['crédit', 'Le crédit concerne la photo. Pour l\'auteur de l\'article, on parle de signature.']]),
      blank('dépêche/depeche', 'Elle se dépêche d\'arriver dans les rédactions.', [['brève', 'Une brève est un article court publié par un média ; ce que l\'agence envoie, c\'est une dépêche.'], ['article', 'L\'article est écrit par le média ; l\'agence envoie des dépêches.']]),
    ],
  },
  overallFeedback: [{ from: 0, to: 99, feedback: 'Relis l\'anatomie de l\'article au chapitre 6 si besoin.' }, { from: 100, to: 100, feedback: 'Bravo, tu parles comme un ou une journaliste !' }],
  behaviour: { mode: 'typing', spellingErrorBehaviour: 'warn', caseSensitive: false },
  submitAnswer: 'Envoyer', spellingMistakeWarning: 'Vérifie l\'orthographe : @mistake', scoreBarLabel: 'Tu as :num point(s) sur :total',
}));
// le gabarit portait une image d'exemple : on la retire
{ const c = JSON.parse(fs.readFileSync(`${OUT}/mots-article.json`)); c.media = { disableImageZooming: false }; fs.writeFileSync(`${OUT}/mots-article.json`, JSON.stringify(c)); }

/* 7. Flashcards : les sigles de l'info ------------------------------------------------------------ */
const fc = (q, a, tip, photo, alt, user) => ({ text: q, answer: a, tip, image: img(`images/carte-${photo}.jpg`, 600, 450, PX(user)), imageAltText: alt });
save('sigles', merge(tpl('flashcards'), {
  description: 'Lis la définition et écris le sigle qui correspond (en lettres capitales ou non).',
  cards: [
    fc('Agence de presse française fondée en 1944 : ses dépêches alimentent les médias du monde entier.', 'AFP', 'Trois lettres, le F veut dire France.', 'journal', 'Des journaux posés sur une table.', 'sweetlouise'),
    fc('Autorité qui régule la radio, la télévision et les plateformes vidéo en France (elle a remplacé le CSA en 2022).', 'Arcom', 'Cinq lettres.', 'tele', 'Un vieux téléviseur rouge.', 'makamuki0'),
    fc('Commission qui veille à la protection de nos données personnelles en France.', 'CNIL', 'Quatre lettres, la dernière pour « Libertés ».', 'mobile', 'Une main tient un smartphone.', 'sebastianflores22'),
    fc('Règlement européen de 2018 sur la protection des données personnelles.', 'RGPD', 'Quatre lettres.', 'ue', 'Le drapeau européen.', 'GregMontani'),
    fc('Centre qui organise chaque année la Semaine de la presse et des médias dans l\'École.', 'CLEMI', 'Cinq lettres.', 'classe', 'Des élèves travaillent ensemble autour d\'une table.', 'StockSnap'),
    fc('Adresse d\'une page web, qui commence souvent par « https:// ».', 'URL', 'Trois lettres.', 'ordi', 'Un ordinateur portable ouvert sur un moteur de recherche.', 'AS_Photography'),
    fc('Programme capable de produire un texte ou une image à partir d\'une simple demande.', 'IA', 'Deux lettres.', 'ia', 'Le visage d\'un robot humanoïde.', 'Alexandra_Koch'),
  ],
  randomCards: true, caseSensitive: false,
  defaultAnswerText: 'Ta réponse', checkAnswerText: 'Vérifier', correctAnswerText: 'Juste', incorrectAnswerText: 'Faux',
  showSolutionText: 'Réponse attendue', ofCorrect: '@score bonnes réponses sur @total', answerShortText: 'R :',
}));

/* 8. Find the Words : mots cachés ----------------------------------------------------------------- */
save('mots-caches', merge(tpl('findthewords'), {
  taskDescription: 'Retrouve dans la grille dix mots de l\'information (sans accents).',
  wordList: 'source,depeche,chapo,legende,credit,rumeur,radio,podcast,antenne,journal',
  behaviour: { fillPool: 'abcdefghijklmnopqrstuvwxyz', preferOverlap: true, showVocabulary: true, enableShowSolution: true, enableRetry: true },
  l10n: { check: 'Vérifier', tryAgain: 'Recommencer', showSolution: 'Voir la solution', found: '@found mots trouvés sur @totalWords', timeSpent: 'Temps passé', score: 'Tu as trouvé @score mot(s) sur @total', wordListHeader: 'Les mots à trouver' },
}));

/* 9. Information Wall : la boîte à outils du vérificateur ---------------------------------------- */
const iw = tpl('informationwall');
const outil = (nom, sert, adresse, mots) => ({ panelTitle: nom, entries: [nom, sert, adresse, mots], keywords: mots });
save('boite-outils', merge(iw, {
  infoWall: {
    header: 'La boîte à outils du vérificateur',
    propertiesGroup: { properties: [
      { label: 'Outil', showLabel: false, searchInProperty: true, styling: { bold: true, italic: false } },
      { label: 'À quoi ça sert', showLabel: true, searchInProperty: true, styling: { bold: false, italic: false } },
      { label: 'Adresse', showLabel: true, searchInProperty: true, styling: { bold: false, italic: true } },
      { label: 'Mots-clés', showLabel: true, searchInProperty: true, styling: { bold: false, italic: false } },
    ] },
    panels: [
      outil('TinEye', 'Recherche d\'image inversée : retrouver où et depuis quand une photo circule sur le web.', 'tineye.com', 'image, photo, date'),
      outil('Google Lens', 'Recherche d\'image inversée depuis un téléphone : photographier une image pour trouver ses autres publications.', 'lens.google', 'image, photo, téléphone'),
      outil('Wayback Machine', 'Voir une page web telle qu\'elle était à une date passée, même si elle a été modifiée ou supprimée.', 'web.archive.org', 'archive, date, page supprimée'),
      outil('Extension InVID-WeVerify', 'Découper une vidéo en images fixes pour les rechercher, lire les métadonnées d\'un fichier.', 'weverify.eu/verification-plugin', 'vidéo, image, métadonnées'),
      outil('AFP Factuel', 'Le service de vérification de l\'Agence France-Presse : des rumeurs et infox déjà vérifiées.', 'factuel.afp.com', 'rumeur, infox, déjà vérifié'),
      outil('Recherche ICANN', 'Savoir quand un nom de domaine a été créé : un « journal » né la semaine dernière doit éveiller la méfiance.', 'lookup.icann.org', 'site, domaine, date, source'),
      outil('Les références de Wikipédia', 'En bas de chaque article, remonter aux sources citées et les lire soi-même.', 'fr.wikipedia.org', 'source, encyclopédie'),
    ],
    behaviour: { useFallbackImage: false, imageWidth: 150, imageHeight: 150, alternateBackground: true, offerFilterField: true, modeFilterField: 'or' },
    l10n: { noEntriesError: 'Aucune fiche.', noMatchesForFilter: 'Aucun outil ne correspond à « @query ».', enterToFilter: 'Tape un mot (image, vidéo, date…) pour filtrer les outils', listChanged: 'Liste modifiée : @visible outils sur @total.' },
  },
}));
// les panneaux du gabarit avaient une image vide : on la retire
{ const c = JSON.parse(fs.readFileSync(`${OUT}/boite-outils.json`)); c.infoWall.panels.forEach((p) => delete p.image); delete c.infoWall.behaviour.fallbackImage; fs.writeFileSync(`${OUT}/boite-outils.json`, JSON.stringify(c)); }

/* 10. Cornell Notes : lire et prendre des notes -------------------------------------------------- */
save('notes-cornell', merge(tpl('cornell'), {
  headline: 'Repérer une image fabriquée par une IA',
  instructions: '<p>Lis le texte à gauche. À droite, note les idées importantes, puis écris dans « Questions » ce que tu te demandes encore, et termine par un résumé en deux phrases.</p>',
  exerciseContent: text('<h3>Repérer une image fabriquée par une IA</h3>'
    + '<p>Des programmes d\'intelligence artificielle produisent aujourd\'hui des images très réalistes à partir d\'une simple phrase. Certaines sont faites pour amuser, d\'autres pour tromper.</p>'
    + '<p><strong>Les indices dans l\'image.</strong> On a longtemps conseillé de regarder les mains (doigts en trop), les textes illisibles sur les panneaux, les reflets ou les ombres incohérents, les arrière-plans qui se déforment. Ces indices existent encore, mais les outils progressent vite : une image sans défaut visible n\'est pas forcément authentique.</p>'
    + '<p><strong>Les indices autour de l\'image.</strong> Ce sont les plus solides. Qui a publié l\'image en premier ? Un média, une agence, un photographe se nomment. Est-ce qu\'un autre média sérieux montre la même scène, sous un autre angle ? Une recherche d\'image inversée retrouve-t-elle la première publication ?</p>'
    + '<p><strong>Les mentions.</strong> Certains réseaux et certains outils ajoutent une mention « contenu généré par IA » ou un filigrane. Leur absence ne prouve rien : ces marques peuvent être retirées.</p>'
    + '<p><strong>À retenir.</strong> Devant une image étonnante, ne cherche pas seulement « le défaut ». Cherche la source, le contexte et d\'autres témoignages.</p>', 'Texte à lire'),
  notesFields: { recallTitle: 'Questions', recallPlaceholder: 'Ce que je me demande, les mots à chercher…', notesTitle: 'Notes', notesPlaceholder: 'Les idées importantes du texte…', summaryTitle: 'Résumé', summaryPlaceholder: 'Mon résumé en deux phrases.' },
  l10n: { copy: 'Copier', copyToClipboardSuccess: 'Notes copiées dans le presse-papier', copyToClipboardError: 'Impossible de copier les notes', notesSaved: 'Notes enregistrées', save: 'Enregistrer' },
}));

/* 11. Structure Strip : écrire sa brève ---------------------------------------------------------- */
const sec = (title, description, weight, colorBackground) => ({ title, description: `<p>${description}</p>`, weight, colorBackground, colorText: '#1c1c1c' });
save('ecrire-breve', merge(tpl('structurestrip'), {
  taskDescription: '<p><strong>Tu es journaliste à Radio JM.</strong> À partir de ces notes, écris une brève pour le site de la radio : '
    + '<em>jeudi 13 novembre, 12 h 30, CDI · club lecture « Les Mordus » · 3e rencontre avec une autrice de BD, Nadia Kerbal (personnage inventé) · 40 élèves inscrits · entrée libre, sans inscription.</em></p>'
    + '<p>Chaque bande de couleur est une partie de ta brève. La longueur attendue s\'affiche quand tu cliques sur « Vérifier ».</p>',
  sections: [
    sec('Titre', 'Court et précis : on doit comprendre de quoi il s\'agit en un coup d\'œil.', 1, '#ffd166'),
    sec('Chapô', 'Une ou deux phrases qui répondent à qui ? quoi ? où ? quand ?', 3, '#a8dadc'),
    sec('Développement', 'Les détails utiles : pourquoi, comment, une citation si tu en as une.', 5, '#cddafd'),
    sec('Infos pratiques', 'Ce que le lecteur doit savoir pour venir : lieu, heure, conditions.', 2, '#d8f3dc'),
  ],
  behaviour: { enableRetry: true, enableSolutionsButton: false, slack: 25, textLengthMin: 350, textLengthMax: 900, feedbackMode: 'onRequest' },
  l10n: { allSectionsGood: 'Les longueurs de toutes tes parties sont bonnes.', sectionTooShort: 'Ta partie « @title » est trop courte : il manque au moins @chars caractères.', sectionTooLong: 'Ta partie « @title » est trop longue : enlève au moins @chars caractères.', tryAgain: 'Recommencer' },
}));

/* 12. KewAr Code : le QR code de l'affiche ------------------------------------------------------- */
save('qr-affiche', merge(tpl('KewArCode'), {
  introduction: '<p><strong>Affiche collée près du CDI :</strong> « RADIO JM fête son lancement ! Scanne ce code et gagne un casque audio. »</p><p>Ne le scanne pas avec ton téléphone : clique sur le code pour voir l\'adresse vers laquelle il mène.</p>',
  codeType: 'url', url: { url: 'https://radio-jm.cadeaux-gratuits.example/connexion' },
  behaviour: { codeColor: '#1d3557', backgroundColor: '#ffffff', maxSize: '260px', alignment: 'center' },
  l10n: { url: 'Adresse (URL)', text: 'Texte' },
  a11y: { openCodeInformation: 'QR code. Afficher l\'adresse.', closeCodeInformation: 'Masquer l\'adresse.' },
}));

/* 13. Game Map : l'archipel de la vérification ---------------------------------------------------- */
const gm = tpl('gamemap-rich');
const restrict = gm.gamemapSteps.gamemap.elements[0].accessRestrictions;
// x, y : centre de l'île en % (fond 1600 x 900) ; la pastille fait 4,4 % de large
const stage = (label, cx, cy, neighbors, contents, extra = {}) => ({
  id: guid(), label, content: { params: {}, dom: {} },
  telemetry: { x: String(cx - 2.2), y: String(cy - 3.9), width: '4.4', height: '7.8' },
  neighbors: neighbors.map(String), canBeStartStage: false, time: {}, accessRestrictions: restrict,
  contentsList: contents.map((c) => ({ contentType: { ...c, metadata: { ...c.metadata, authors: [], changes: [] } } })),
  specialStageExtraLives: 1, specialStageExtraTime: 1, specialStageLinkTarget: '_blank', alwaysVisible: false, overrideSymbol: false, ...extra,
});
const stages = [
  stage('Le port : une photo choc', 10, 76, [1], [text('<p><strong>Mercredi, 18 h.</strong> Une photo circule dans tous les groupes : « Le gymnase du collège inondé, plus de sport jusqu\'en juin ! » Radio JM veut en parler jeudi. Avant, l\'équipe doit faire escale sur chaque île de l\'archipel.</p><p>Clique sur l\'île de la Source pour commencer.</p>', 'Départ')], { canBeStartStage: true }),
  stage('Île de la Source', 28, 45, [0, 2], [mc('La photo a été publiée en premier par le compte « @info_choc_77 », créé il y a trois jours, sans nom ni contact. Que peut-on en dire ?', [
    { t: 'On ne sait pas qui est derrière : la source n\'est pas identifiable, il faut chercher ailleurs.', ok: true },
    { t: 'Le compte a beaucoup d\'abonnés, donc il est fiable.', fb: 'Le nombre d\'abonnés ne dit rien de la fiabilité : il s\'achète, et une infox en attire beaucoup.' },
    { t: 'Le nom contient « info » : c\'est un média.', fb: 'N\'importe qui peut mettre « info » dans un pseudo. Un média se présente : nom, adresse, responsables.' },
  ], 'La source')]),
  stage('Île de la Date', 47, 71, [1, 3], [tf('La recherche montre que cette photo a été publiée pour la première fois en 2019. Elle peut quand même montrer le gymnase cette semaine.', false,
    'Exact : si la photo existe depuis 2019, elle ne peut pas montrer ce qui se passe cette semaine.', 'Une photo publiée en 2019 ne peut pas montrer un événement de cette semaine : elle est sortie de son contexte.', 'La date')]),
  stage('Île de l\'Image', 61, 31, [2, 4], [mc('Quel outil permet de retrouver où et quand une photo a déjà été publiée ?', [
    { t: 'Une recherche d\'image inversée (TinEye, Google Lens…).', ok: true },
    { t: 'Un zoom sur la photo pour voir les détails.', fb: 'Zoomer aide à observer, mais ne dit pas où la photo a déjà circulé.' },
    { t: 'Le nombre de partages de la photo.', fb: 'Le nombre de partages mesure la viralité, pas l\'origine.' },
  ], 'L\'image')]),
  stage('Île des Recoupements', 77, 63, [3, 5], [dragText('<p><strong>Complète le message que Radio JM publie jeudi.</strong></p>',
    'La photo du gymnase inondé date de *2019* et vient d\'un autre *collège*. Nous avons appelé la *direction* : le gymnase est ouvert. Avant de partager, vérifiez la *source* et la *date*.',
    '*2026* *rumeur*', 'Le recoupement')]),
  stage('Le phare de la vérité', 90, 24, [4], [{}], { specialStageType: 'finish' }),
];
stages[5].contentsList = [{}];
save('archipel', merge(gm, {
  showTitleScreen: true,
  titleScreen: { titleScreenIntroduction: '<p style="text-align:center"><strong>L\'archipel de la vérification</strong><br>Une photo choc circule. Fais escale sur chaque île pour la vérifier, jusqu\'au phare.</p>' },
  headline: 'L\'archipel de la vérification',
  gamemapSteps: {
    backgroundImageSettings: { backgroundColor: 'rgb(43, 111, 158)', backgroundImage: img('images/archipel.jpg', 1600, 900, { license: 'U', author: 'Carte dessinée pour l\'exercice' }) },
    gamemap: { elements: stages, paths: [0, 1, 2, 3, 4].map((i) => ({ from: i, to: i + 1, visualsType: 'global', customVisuals: { colorPath: 'rgba(0, 0, 0, 0.7)', pathWidth: '0.2', pathStyle: 'dotted' } })) },
  },
  endScreen: {
    noSuccess: { endScreenTextNoSuccess: '<p style="text-align:center">Tu es arrivé au phare, mais certaines escales sont à revoir. Recommence pour tout vérifier !</p>' },
    success: { endScreenTextSuccess: '<p style="text-align:center"><strong>Bravo !</strong> Source, date, image, recoupement : tu as fait les quatre escales du vérificateur.</p>' },
    overallFeedback: [{ from: 0, to: 100 }],
  },
  behaviour: { enableRetry: true, enableSolutionsButton: true, map: { showLabels: true, roaming: 'complete' } },
}));
