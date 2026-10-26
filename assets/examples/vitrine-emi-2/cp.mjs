// Briques en français pour un livre qui intègre des Course Presentation (CP 1.26 dans la Column 1.18
// d'Interactive Book), plus Drag Text, Mark the Words, Drag and Drop et Essay.
// Une CP garde un canevas 16:9 fixe, mis à l'échelle de la page : 1em = 16 px pour 640 px de large.
// Dans un livre (~860 px), 1em ≈ 21 px ; sur un téléphone (~360 px), 1em ≈ 9 px. D'où : peu de texte,
// police ≥ 1.1em, et des diapos courtes (3 à 5 par chapitre).
import { sub, guid } from './fr.mjs';

/* --- Course Presentation ------------------------------------------ */

// Élément positionné (x, y, w, h en % du canevas 16:9).
export const el = (x, y, w, h, action) => ({
  x, y, width: w, height: h, action,
  alwaysDisplayComments: false, backgroundOpacity: 0, displayAsButton: false,
  buttonSize: 'big', goToSlideType: 'specified', invisible: false,
});

// Image dans la CP : la hauteur se déduit du ratio de l'image pour ne pas la déformer
// (la CP étire l'image à la taille de sa boîte).
export const pic = (x, y, w, file, pw, ph, alt, copyright = { license: 'U' }) =>
  el(x, y, w, +(w * 16 / 9 * ph / pw).toFixed(2), sub('H5P.Image 1.1', {
    contentName: 'Image', alt, title: alt, decorative: false,
    expandImage: "Agrandir l'image", minimizeImage: "Réduire l'image",
    file: { path: `images/${file}`, mime: file.endsWith('.png') ? 'image/png' : 'image/jpeg', copyright, width: pw, height: ph },
  }, 'Image', alt.slice(0, 60)));

// Texte : la CP centre par défaut, on aligne à gauche sauf demande.
export const txt = (x, y, w, h, html, title = 'Texte', align = 'left') =>
  el(x, y, w, h, sub('H5P.AdvancedText 1.1', { text: `<div style="text-align:${align}">${html}</div>` }, 'Text', title));

export const slide = (elements, keyword) => ({
  elements, keywords: keyword ? [{ main: keyword }] : [],
  slideBackgroundSelector: {},
});

const L10N = {
  slide: 'Diapositive', score: 'Score', yourScore: 'Ton score', maxScore: 'Score maximum', total: 'Total',
  totalScore: 'Score total', showSolutions: 'Voir les solutions', retry: 'Recommencer', exportAnswers: 'Exporter le texte',
  hideKeywords: 'Masquer le menu', showKeywords: 'Afficher le menu', fullscreen: 'Plein écran', exitFullscreen: 'Quitter le plein écran',
  prevSlide: 'Diapositive précédente', nextSlide: 'Diapositive suivante', currentSlide: 'Diapositive actuelle',
  lastSlide: 'Dernière diapositive', solutionModeTitle: 'Quitter le mode solution', solutionModeText: 'Mode solution',
  summaryMultipleTaskText: 'Plusieurs activités', scoreMessage: 'Tu as obtenu :', shareFacebook: 'Partager sur Facebook',
  shareTwitter: 'Partager sur Twitter', shareGoogle: 'Partager sur Google+', summary: 'Bilan', solutionsButtonTitle: 'Voir les commentaires',
  printTitle: 'Imprimer', printIngress: 'Que veux-tu imprimer ?', printAllSlides: 'Toutes les diapositives',
  printCurrentSlide: 'La diapositive actuelle', noTitle: 'Sans titre',
  accessibilitySlideNavigationExplanation: 'Utilise les flèches gauche et droite pour changer de diapositive.',
  accessibilityCanvasLabel: 'Présentation. Utilise les flèches gauche et droite pour changer de diapositive.',
  accessibilityProgressBarLabel: 'Choisir la diapositive à afficher',
  containsNotCompleted: '@slideName contient une activité non terminée', containsCompleted: '@slideName contient une activité terminée',
  slideCount: 'Diapositive @index sur @total', containsOnlyCorrect: '@slideName : tout est juste',
  containsIncorrectAnswers: '@slideName contient des erreurs', shareResult: 'Partager le résultat',
  accessibilityTotalScore: 'Tu as @score points sur @maxScore', accessibilityEnteredFullscreen: 'Plein écran activé',
  accessibilityExitedFullscreen: 'Plein écran désactivé', confirmDialogHeader: 'Envoyer tes réponses',
  confirmDialogText: 'Tes réponses vont être envoyées. Continuer ?', confirmDialogConfirmText: 'Envoyer et voir le résultat',
  slideshowNavigationLabel: 'Navigation dans la présentation', confirmDialogConfirmLabel: 'Confirmer', confirmDialogCancelLabel: 'Annuler',
};

const SOCIAL = {
  showFacebookShare: false, facebookShare: { url: '@currentpageurl', quote: 'I scored @score out of @maxScore on a task at @currentpageurl.' },
  showTwitterShare: false, twitterShare: { statement: 'I scored @score out of @maxScore on a task at @currentpageurl.', url: '@currentpageurl', hashtags: 'h5p, course' },
  showGoogleShare: false, googleShareUrl: '@currentpageurl',
};

// Pas de menu latéral de mots-clés (il mange un tiers de la largeur dans un livre),
// pas de diapo bilan (le livre fait déjà le bilan de tous les scores).
export const cp = (slides, title, bg = '#f6f3ec') => sub('H5P.CoursePresentation 1.26', {
  presentation: {
    slides, keywordListEnabled: false, keywordListAlwaysShow: false, keywordListAutoHide: false,
    keywordListOpacity: 90, globalBackgroundSelector: { fillGlobalBackground: bg },
  },
  l10n: L10N,
  override: {
    activeSurface: false, hideSummarySlide: true, summarySlideSolutionButton: true,
    summarySlideRetryButton: true, enablePrintButton: false, social: SOCIAL,
  },
}, 'Course Presentation', title);

/* --- Drag Text (avec distracteurs) --------------------------------- */
export const dragText = (taskDescription, textField, distractors, title) => sub('H5P.DragText 1.10', {
  taskDescription, textField, distractors,
  overallFeedback: [{ from: 0, to: 99, feedback: 'Relis la frise du trajet : à quelle étape chaque chose se perd-elle ?' }, { from: 100, to: 100, feedback: 'Bravo, tu as suivi tout le trajet !' }],
  checkAnswer: 'Vérifier', submitAnswer: 'Envoyer', tryAgain: 'Recommencer', showSolution: 'Voir la solution',
  dropZoneIndex: 'Zone @index.', empty: 'La zone @index est vide.', contains: 'La zone @index contient @draggable.',
  ariaDraggableIndex: '@index sur @count étiquettes.', tipLabel: 'Indice', correctText: 'Juste !', incorrectText: 'Faux !',
  resetDropTitle: 'Retirer le mot', resetDropDescription: 'Veux-tu retirer ce mot de la zone ?', grabbed: 'Étiquette saisie.',
  cancelledDragging: 'Déplacement annulé.', correctAnswer: 'Bonne réponse :', feedbackHeader: 'Correction',
  behaviour: { enableRetry: true, enableSolutionsButton: true, enableCheckButton: true, instantFeedback: false },
  scoreBarLabel: 'Tu as :num point(s) sur :total', a11yCheck: 'Vérifier les réponses.',
  a11yShowSolution: 'Voir la solution.', a11yRetry: "Recommencer l'exercice.",
}, 'Drag the Words', title);

/* --- Mark the Words ------------------------------------------------ */
// Un mot à marquer = *mot* entouré d'espaces (une seule « chaîne » sans espace).
export const markWords = (taskDescription, textField, title, overall) => sub('H5P.MarkTheWords 1.11', {
  taskDescription, textField,
  overallFeedback: overall,
  behaviour: { enableRetry: true, enableSolutionsButton: true, enableCheckButton: true, showScorePoints: true },
  checkAnswerButton: 'Vérifier', submitAnswerButton: 'Envoyer', tryAgainButton: 'Recommencer', showSolutionButton: 'Voir la solution',
  correctAnswer: 'Juste !', incorrectAnswer: 'Faux !', missedAnswer: 'Oublié !',
  displaySolutionDescription: 'La solution est affichée.', scoreBarLabel: 'Tu as :num point(s) sur :total',
  a11yFullTextLabel: 'Texte complet', a11yClickableTextLabel: 'Texte où l\'on peut marquer des mots',
  a11ySolutionModeHeader: 'Mode solution', a11yCheckingHeader: 'Mode correction',
  a11yCheck: 'Vérifier les réponses.', a11yShowSolution: 'Voir la solution.', a11yRetry: "Recommencer l'exercice.",
}, 'Mark the Words', title);

/* --- Drag and Drop : classer des étiquettes dans des zones ---------- */
// Canevas W x H px ; positions en %, tailles en em (1em = 16 px pour W px de large).
// items = [{ t, zone }] ; zones = [{ label, ok, ko }]
export const sortInto = (items, zones, title, { W = 620, H = 380, iw = 8.4, ih = 3, perRow = 4 } = {}) => {
  const Wem = W / 16, Hem = H / 16, gap = (Wem - perRow * iw) / (perRow + 1);
  const rows = Math.ceil(items.length / perRow);
  const zy = 0.6 + rows * (ih + 1.6) + 0.8;  // les étiquettes ont un cadre : on laisse de l'air                  // haut des zones, en em
  const zw = (Wem - gap * (zones.length + 1)) / zones.length;
  const pct = (v, tot) => +(v / tot * 100).toFixed(2);
  const elements = items.map((it, i) => ({
    type: sub('H5P.AdvancedText 1.1', { text: `<p style="font-size:0.9em;line-height:1.2;margin:0">${it.t}</p>` }, 'Text', it.t.slice(0, 40)),
    x: pct(gap + (i % perRow) * (iw + gap), Wem), y: pct(0.6 + Math.floor(i / perRow) * (ih + 1.6), Hem),
    width: iw, height: ih, dropZones: zones.map((_, z) => String(z)), backgroundOpacity: 100, multiple: false,
  }));
  const dropZones = zones.map((z, k) => ({
    label: `<div>${z.label}</div>`, showLabel: true,
    x: pct(gap + k * (zw + gap), Wem), y: pct(zy, Hem), width: +zw.toFixed(2), height: +(Hem - zy - 0.6).toFixed(2),
    correctElements: items.map((it, i) => (it.zone === k ? String(i) : null)).filter((v) => v !== null),
    backgroundOpacity: 100, tipsAndFeedback: { tip: '', feedbackOnCorrect: z.ok, feedbackOnIncorrect: z.ko },
    single: false, autoAlign: true,
  }));
  return sub('H5P.DragQuestion 1.14', {
    scoreShow: 'Vérifier', submit: 'Envoyer', tryAgain: 'Recommencer',
    scoreExplanation: 'Une étiquette bien placée rapporte 1 point.',
    question: { settings: { size: { width: W, height: H } }, task: { elements, dropZones } },
    overallFeedback: [{ from: 0, to: 99, feedback: 'Pose-toi la question : si ça tourne mal, qui en répond ?' }, { from: 100, to: 100, feedback: 'Parfait : tu sais distinguer une tâche d\'une responsabilité.' }],
    behaviour: {
      enableRetry: true, enableCheckButton: true, singlePoint: false, applyPenalties: false, enableScoreExplanation: false,
      dropZoneHighlighting: 'dragging', autoAlignSpacing: 2, enableFullScreen: false, showScorePoints: true, showTitle: false,
    },
    localize: { fullscreen: 'Plein écran', exitFullscreen: 'Quitter le plein écran' },
    grabbablePrefix: 'Étiquette {num} sur {total}.', grabbableSuffix: 'Posée dans la zone {num}.',
    dropzonePrefix: 'Zone {num} sur {total}.', noDropzone: 'Aucune zone.', tipLabel: "Voir l'indice.", tipAvailable: 'Indice disponible',
    correctAnswer: 'Bonne réponse', wrongAnswer: 'Mauvaise réponse', feedbackHeader: 'Commentaire',
    scoreBarLabel: 'Tu as :num point(s) sur :total', scoreExplanationButtonLabel: 'Comment est calculé le score',
    a11yCheck: 'Vérifier les réponses.', a11yRetry: "Recommencer l'exercice.",
  }, 'Drag and Drop', title);
};

/* --- Essay ----------------------------------------------------------- */
export const essay = (taskDescription, keywords, sample, title, { minimumLength = 150, pointsHost = 4 } = {}) => sub('H5P.Essay 1.5', {
  taskDescription, placeholderText: 'Écris ta réponse ici…',
  solution: { introduction: '<p>Une réponse possible :</p>', sample },
  keywords: keywords.map((k) => ({
    keyword: k.w, alternatives: k.alt || [],
    options: { points: 1, occurrences: 1, caseSensitive: false, forgiveMistakes: true, feedbackIncluded: k.yes || '', feedbackMissed: k.no || '' },
  })),
  behaviour: {
    minimumLength, inputFieldSize: '10', enableRetry: true, ignoreScoring: false, pointsHost,
    percentagePassing: 50, percentageMastering: 100, linebreakReplacement: ' ',
  },
  checkAnswer: 'Vérifier', submitAnswer: 'Envoyer', tryAgain: 'Recommencer', showSolution: 'Voir une réponse possible',
  feedbackHeader: 'Commentaire', solutionTitle: 'Réponse possible', remainingChars: 'Caractères restants : @chars',
  notEnoughChars: 'Écris au moins @chars caractères.', messageSave: 'Enregistré.',
  ariaYourResult: 'Tu as @score points sur @total', ariaNavigatedToSolution: 'Réponse possible affichée.',
  ariaCheck: 'Vérifier la réponse.', ariaShowSolution: 'Voir une réponse possible.', ariaRetry: 'Recommencer et améliorer ta réponse.',
  scoreBarLabel: 'Tu as :num point(s) sur :total',
  overallFeedback: [{ from: 0, to: 49, feedback: 'Pense au terrain, à la vérification, aux sources et à la responsabilité.' }, { from: 50, to: 100, feedback: 'Ta réponse touche l\'essentiel. Compare-la avec la réponse possible.' }],
}, 'Essay', title);

export { guid };
