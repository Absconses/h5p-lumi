/* =====================================================================
 *  h5p-factories.mjs — fabriques de sous-contenus H5P reutilisables
 *
 *  Extrait du projet « oval-portrait » (parcours valide en production).
 *  Toutes les fabriques renvoient le wrapper standard H5P :
 *      { params, library, subContentId, metadata }
 *  directement utilisable dans une Column, un Interactive Book, un
 *  QuestionSet, etc.
 *
 *  Usage :
 *      import { chapter, text, mc, tf, blanks } from '<chemin>/h5p-factories.mjs';
 *
 *  Les VERSIONS de bibliotheques codees ici sont celles de
 *  assets/templates/gabarit-interactivebook.h5p. Si tu empaquettes avec un
 *  autre gabarit, verifie-les (un numero faux = « Unable to find constructor »).
 *
 *  REGLES A NE JAMAIS ENFREINDRE (verifiees en production) :
 *   1. Aucun champ media vide. H5P teste `!== undefined`, pas le contenu :
 *      `backgroundImage: {}` fait planter TOUT le chapitre. On omet la cle.
 *   2. `background-color`, jamais `background` : Lumi supprime le raccourci
 *      et un bandeau devient du texte blanc sur fond blanc.
 *   3. Pas de `position:absolute` dans un texte : `overflow:hidden` sur
 *      `.h5p-interactive-book-content` le rogne sans aucun message.
 * ===================================================================== */

import crypto from 'crypto';

export const guid = () => crypto.randomUUID();

/* --- Configuration injectee par le projet ---------------------------- *
 *  IMG       : { cle: { path, w, h } } — les images embarquees du projet
 *  glossify  : (html) => html — pose les infobulles ; identite par defaut
 *  GLOSS_CSS / GLOSS_KEY : injectes dans le premier bloc texte d'un chapitre
 * -------------------------------------------------------------------- */
let CFG = { IMG: {}, glossify: (h) => h, GLOSS_CSS: '', GLOSS_KEY: '' };
export const configure = (o) => { CFG = { ...CFG, ...o }; };

export const meta = (contentType, title) => ({
  contentType, license: 'U', title, authors: [], changes: [], extraTitle: title,
});

export const sub = (library, params, contentType, title) => ({
  params, library, subContentId: guid(), metadata: meta(contentType, title),
});

// doGloss = true  ->  les mots difficiles recoivent leur traduction au survol.
// Reserve aux blocs NARRATIFS : on ne glose ni les consignes ni les credits.
export const text = (html, title = 'Texte', doGloss = false) =>
  sub('H5P.AdvancedText 1.1', { text: doGloss ? CFG.glossify(html) : html }, 'Text', title);

export const image = (key, alt, title = 'Image') =>
  sub('H5P.Image 1.1', {
    decorative: false,
    contentName: 'Image',
    expandImage: 'Expand Image',
    minimizeImage: 'Minimize Image',
    alt,
    title: alt,
    file: {
      path: CFG.IMG[key].path, mime: 'image/jpeg',
      copyright: { license: 'U' },
      width: CFG.IMG[key].w, height: CFG.IMG[key].h,
    },
  }, 'Image', title);

export const audio = (path, title = 'Audio') =>
  sub('H5P.Audio 1.5', {
    playerMode: 'full',
    fitToWrapper: true,
    controls: true,
    autoplay: false,
    playAudio: 'Play audio',
    pauseAudio: 'Pause audio',
    contentName: 'Audio',
    audioNotSupported: "Votre navigateur ne supporte pas l'audio",
    files: [{ path, mime: 'audio/wav', copyright: { license: 'U' } }],
  }, 'Audio', title);

/* --- Multiple Choice --------------------------------------------- */
export const MC_UI = {
  checkAnswerButton: 'Check',
  submitAnswerButton: 'Submit',
  showSolutionButton: 'Show solution',
  tryAgainButton: 'Retry',
  tipsLabel: 'Hint',
  scoreBarLabel: 'You got :num out of :total points',
  tipAvailable: 'Hint available',
  feedbackAvailable: 'Feedback available',
  readFeedback: 'Read feedback',
  wrongAnswer: 'Wrong answer',
  correctAnswer: 'Correct answer',
  shouldCheck: 'Should have been checked',
  shouldNotCheck: 'Should not have been checked',
  noInput: 'Please answer before viewing the solution',
  a11yCheck: 'Check the answers.',
  a11yShowSolution: 'Show the solution.',
  a11yRetry: 'Retry the task.',
};

export const mc = (question, answers, title, { type = 'single', overall = [] } = {}) =>
  sub('H5P.MultiChoice 1.16', {
    question,
    answers: answers.map(a => ({
      text: `<div>${a.t}</div>`,
      correct: !!a.ok,
      tipsAndFeedback: {
        tip: '',
        chosenFeedback: a.fb ? `<div>${a.fb}</div>` : '',
        notChosenFeedback: a.nfb ? `<div>${a.nfb}</div>` : '',
      },
    })),
    behaviour: {
      enableRetry: true, enableSolutionsButton: true, enableCheckButton: true,
      type, singlePoint: false, randomAnswers: true,
      showSolutionsRequiresInput: true, confirmCheckDialog: false,
      confirmRetryDialog: false, autoCheck: false, passPercentage: 100,
      showScorePoints: true,
    },
    UI: MC_UI,
    media: { disableImageZooming: false },
    overallFeedback: overall.length ? overall : [{ from: 0, to: 100, feedback: '' }],
    confirmCheck: { header: 'Finish?', body: 'Are you sure you want to finish?', cancelLabel: 'Cancel', confirmLabel: 'Finish' },
    confirmRetry: { header: 'Retry?', body: 'Are you sure you want to retry?', cancelLabel: 'Cancel', confirmLabel: 'Retry' },
  }, 'Multiple Choice', title);

/* --- True / False ------------------------------------------------- */
export const tf = (question, correct, fbOk, fbNo, title) =>
  sub('H5P.TrueFalse 1.8', {
    question,
    correct: correct ? 'true' : 'false',
    l10n: {
      trueText: 'True', falseText: 'False',
      checkAnswer: 'Check', submitAnswer: 'Submit',
      showSolutionButton: 'Show solution', tryAgain: 'Retry',
      score: 'You got @score of @total points',
      wrongAnswerMessage: 'Wrong answer', correctAnswerMessage: 'Correct answer',
      scoreBarLabel: 'You got :num out of :total points',
      a11yCheck: 'Check the answers.', a11yShowSolution: 'Show the solution.',
      a11yRetry: 'Retry the task.',
    },
    behaviour: {
      enableRetry: true, enableSolutionsButton: true, enableCheckButton: true,
      confirmCheckDialog: false, confirmRetryDialog: false, autoCheck: false,
      feedbackOnCorrect: fbOk, feedbackOnWrong: fbNo,
    },
    media: { disableImageZooming: false },
    confirmCheck: { header: 'Finish?', body: 'Are you sure you want to finish?', cancelLabel: 'Cancel', confirmLabel: 'Finish' },
    confirmRetry: { header: 'Retry?', body: 'Are you sure you want to retry?', cancelLabel: 'Cancel', confirmLabel: 'Retry' },
  }, 'True/False Question', title);

/* --- Fill in the Blanks ------------------------------------------- */
export const blanks = (intro, questions, title, { separateLines = false } = {}) =>
  sub('H5P.Blanks 1.14', {
    text: intro,
    questions,
    overallFeedback: [{ from: 0, to: 100, feedback: 'You scored @score out of @total.' }],
    showSolutions: 'Show solution',
    tryAgain: 'Retry',
    checkAnswer: 'Check',
    submitAnswer: 'Submit',
    notFilledOut: 'Please fill in all the blanks first.',
    answerIsCorrect: "':ans' is correct",
    answerIsWrong: "':ans' is wrong",
    answeredCorrectly: 'Answer is correct',
    answeredIncorrectly: 'Answer is wrong',
    solutionLabel: 'Correct answer:',
    inputLabel: 'Blank input @num of @total',
    inputHasTipLabel: 'Tip available',
    tipLabel: 'Hint',
    behaviour: {
      enableRetry: true, enableSolutionsButton: true, enableCheckButton: true,
      autoCheck: false, caseSensitive: false, showSolutionsRequiresInput: true,
      separateLines, confirmCheckDialog: false, confirmRetryDialog: false,
      acceptSpellingErrors: false,
    },
    scoreBarLabel: 'You got :num out of :total points',
    a11yCheck: 'Check the answers.',
    a11yShowSolution: 'Show the solution.',
    a11yRetry: 'Retry the task.',
    a11yCheckingModeHeader: 'Checking mode',
    confirmCheck: { header: 'Finish?', body: 'Are you sure you want to finish?', cancelLabel: 'Cancel', confirmLabel: 'Finish' },
    confirmRetry: { header: 'Retry?', body: 'Are you sure you want to retry?', cancelLabel: 'Cancel', confirmLabel: 'Retry' },
  }, 'Fill in the Blanks', title);

/* --- Mark the Words ----------------------------------------------- */
export const markWords = (taskDescription, textField, title) =>
  sub('H5P.MarkTheWords 1.11', {
    taskDescription,
    textField,
    overallFeedback: [{ from: 0, to: 100, feedback: 'You found @score out of @total.' }],
    behaviour: { enableRetry: true, enableSolutionsButton: true, enableCheckButton: true, showScorePoints: true },
    checkAnswerButton: 'Check',
    submitAnswerButton: 'Submit',
    tryAgainButton: 'Retry',
    showSolutionButton: 'Show solution',
    correctAnswer: 'Correct!',
    incorrectAnswer: 'Incorrect!',
    missedAnswer: 'Answer not found!',
    displaySolutionDescription: 'Task is updated to contain the solution.',
    scoreBarLabel: 'You got :num out of :total points',
    a11yFullTextLabel: 'Full readable text',
    a11yClickableTextLabel: 'Full text where words can be marked',
    a11ySolutionModeHeader: 'Solution mode',
    a11yCheckingHeader: 'Checking mode',
    a11yCheck: 'Check the answers.',
    a11yShowSolution: 'Show the solution.',
    a11yRetry: 'Retry the task.',
  }, 'Mark the Words', title);

/* --- Essay -------------------------------------------------------- */
export const essay = (taskDescription, keywords, sample, title, { minimumLength = 60, pointsHost = 5 } = {}) =>
  sub('H5P.Essay 1.5', {
    taskDescription,
    placeholderText: 'Write your answer here…',
    solution: { introduction: '<p>A good answer could include:</p>', sample },
    keywords: keywords.map(k => ({
      keyword: k.w,
      alternatives: k.alt || [],
      options: { points: 1, occurrences: 1, caseSensitive: false, forgiveMistakes: true, feedbackIncluded: '', feedbackMissed: '' },
    })),
    behaviour: {
      minimumLength, inputFieldSize: '10', enableRetry: true, ignoreScoring: false,
      pointsHost, percentagePassing: 50, percentageMastering: 100, linebreakReplacement: 'space',
    },
    checkAnswer: 'Check',
    submitAnswer: 'Submit',
    tryAgain: 'Retry',
    showSolution: 'Show sample answer',
    feedbackHeader: 'Feedback',
    solutionTitle: 'Sample answer',
    remainingChars: 'Characters left: @chars',
    notEnoughChars: 'Please write at least @min characters.',
    messageSave: 'Saved.',
    ariaYourResult: 'You got @score out of @total points',
    ariaNavigatedToSolution: 'Navigated to sample solution.',
    scoreBarLabel: 'You got :num out of :total points',
    overallFeedback: [{ from: 0, to: 100, feedback: 'You got @score out of @total.' }],
  }, 'Essay', title);

/* --- Question Set ------------------------------------------------- */
export const questionSet = (title, introHtml, questions, passPercentage = 50) =>
  sub('H5P.QuestionSet 1.20', {
    introPage: {
      showIntroPage: !!introHtml,
      startButtonText: 'Start',
      title,
      introduction: introHtml || '',
    },
    progressType: 'dots',
    passPercentage,
    questions,
    disableBackwardsNavigation: false,
    randomQuestions: false,
    endGame: {
      showResultPage: true,
      showSolutionButton: true,
      showRetryButton: true,
      noResultMessage: 'Finished',
      message: 'Your result:',
      scoreBarLabel: 'You got @finals out of @totals points',
      overallFeedback: [
        { from: 0,  to: 49,  feedback: 'Keep going — read the text again and retry.' },
        { from: 50, to: 79,  feedback: 'Good work! Check the answers you missed.' },
        { from: 80, to: 100, feedback: 'Excellent — you know this story well!' },
      ],
      solutionButtonText: 'Show solution',
      retryButtonText: 'Retry',
      finishButtonText: 'Finish',
      submitButtonText: 'Submit',
      showAnimations: false,
      skippable: false,
      skipButtonText: 'Skip video',
    },
    override: { checkButton: true },
    texts: {
      prevButton: 'Previous', nextButton: 'Next',
      finishButton: 'Finish', submitButton: 'Submit',
      textualProgress: 'Question: @current of @total',
      jumpToQuestion: 'Question %d of %total',
      questionLabel: 'Question',
      readSpeakerProgress: 'Question @current of @total',
      unansweredText: 'Unanswered', answeredText: 'Answered',
      currentQuestionText: 'Current question',
      navigationLabel: 'Questions',
    },
  }, 'Question Set', title);

/* --- Dialog Cards (pre-enseignement du vocabulaire) ---------------- */
export const dialogcards = (title, description, pairs) =>
  sub('H5P.Dialogcards 1.9', {
    title,
    mode: 'normal',
    description,
    // Champs image/audio VOLONTAIREMENT absents : un objet media vide fait
    // planter le chapitre entier (cf. references/question-multichoice.md).
    dialogs: pairs.map(([front, back]) => ({
      text: `<p>${front}</p>`,
      answer: `<p>${back}</p>`,
      tips: {},
    })),
    behaviour: {
      enableRetry: true, disableBackwardsNavigation: false,
      scaleTextNotCard: false, randomCards: false,
      maxProficiency: 5, quickProgression: false,
    },
    answer: 'Retourner la carte',
    next: 'Suivante',
    prev: 'Précédente',
    retry: 'Recommencer',
    correctAnswer: 'Je le savais !',
    incorrectAnswer: 'Pas encore',
    round: 'Tour @round',
    cardsLeft: 'Cartes restantes : @number',
    nextRound: 'Passer au tour @round',
    startOver: 'Tout reprendre',
    showSummary: 'Suivant',
    summary: 'Bilan',
    summaryCardsRight: 'Cartes réussies :',
    summaryCardsWrong: 'Cartes à revoir :',
    summaryCardsNotShown: 'Cartes non vues :',
    summaryOverallScore: 'Score global',
    summaryCardsCompleted: 'Cartes maîtrisées :',
    summaryCompletedRounds: 'Tours terminés :',
    summaryAllDone: 'Bravo ! Tu maîtrises les @cards cartes.',
    progressText: 'Carte @card sur @total',
    cardFrontLabel: 'Recto',
    cardBackLabel: 'Verso',
    tipButtonLabel: 'Indice',
    audioNotSupported: "Votre navigateur ne supporte pas l'audio",
    confirmStartingOver: {
      header: 'Tout reprendre ?',
      body: 'Ta progression sera perdue.',
      cancelLabel: 'Annuler',
      confirmLabel: 'Reprendre',
    },
  }, 'Dialog Cards', title);

/* --- Drag the Words (banque de mots : on choisit, on ne produit pas) */
export const dragText = (taskDescription, textField, title) =>
  sub('H5P.DragText 1.10', {
    taskDescription,
    textField,
    overallFeedback: [{ from: 0, to: 100, feedback: 'Tu as @score sur @total.' }],
    checkAnswer: 'Vérifier',
    submitAnswer: 'Envoyer',
    tryAgain: 'Recommencer',
    showSolution: 'Voir la solution',
    dropZoneIndex: 'Zone @index.',
    empty: 'La zone @index est vide.',
    contains: 'La zone @index contient @draggable.',
    ariaDraggableIndex: '@index sur @count étiquettes.',
    tipLabel: 'Indice',
    correctText: 'Correct !',
    incorrectText: 'Incorrect !',
    resetDropTitle: 'Retirer le mot',
    resetDropDescription: 'Veux-tu retirer ce mot de la zone ?',
    grabbed: 'Étiquette saisie.',
    cancelledDragging: 'Déplacement annulé.',
    correctAnswer: 'Bonne réponse :',
    feedbackHeader: 'Correction',
    behaviour: {
      enableRetry: true, enableSolutionsButton: true,
      enableCheckButton: true, instantFeedback: false,
    },
    scoreBarLabel: 'Tu as :num sur :total points',
    a11yCheck: 'Vérifier les réponses.',
    a11yShowSolution: 'Afficher la solution.',
    a11yRetry: 'Recommencer la tâche.',
  }, 'Drag the Words', title);

/* --- Column / chapitre -------------------------------------------- */
// Le CSS des tooltips + le mode d'emploi sont injectes UNE FOIS par chapitre,
// dans son premier bloc de texte, mais seulement si le chapitre en contient.
export const chapter = (title, items) => {
  const usesGloss = items.some(
    c => c.library === 'H5P.AdvancedText 1.1' && c.params.text.includes('class="gl"')
  );
  if (usesGloss) {
    const first = items.find(c => c.library === 'H5P.AdvancedText 1.1');
    first.params.text = CFG.GLOSS_CSS + first.params.text + CFG.GLOSS_KEY;
  }
  return {
    params: { content: items.map(c => ({ content: c, useSeparator: 'auto' })) },
    library: 'H5P.Column 1.18',
    subContentId: guid(),
    metadata: meta('Column', title),
  };
};

/* ------------------------------------------------------------------ *
 *  Helpers de mise en page
 *  NB : `background-color` et non `background` — Lumi supprime le
 *  raccourci, ce qui donnerait du texte blanc sur fond blanc.
 * ------------------------------------------------------------------ */
export const banner = (mod, label) =>
  `<p style="background-color:#1d3557;color:#fff;padding:.45em .9em;border-radius:4px;display:inline-block;letter-spacing:.06em;font-size:.82em;margin:0"><strong>${mod}</strong> &nbsp;·&nbsp; ${label}</p>`;

export const credit = (t) =>
  `<p style="font-size:.78em;color:#666;margin:.3em 0 0">${t}</p>`;

/** Encadre d'appel (consigne forte, rappel ethique...). */
export const callout = (html, color = '#1d3557') =>
  `<div style="background-color:#faf6f2;border-left:4px solid ${color};padding:.8em 1em;margin:1em 0">${html}</div>`;

/* ------------------------------------------------------------------ *
 *  Documentation Tool — fiche guidee multi-pages AVEC EXPORT
 *
 *  L'eleve remplit des champs page apres page, puis genere un document
 *  qu'il telecharge. Le seul type H5P qui produise un vrai livrable.
 *
 *  ⚠️ H5P.DocumentExportPage N'EST PAS dans gabarit-interactivebook.h5p.
 *     Empaqueter avec gabarit-interactivebook-reporter.h5p (greffe depuis
 *     gabarit-column.h5p via Graft-H5PLibraries.ps1), sinon la page
 *     d'export manque et la fiche ne s'exporte pas.
 *
 *  Pages acceptees par pagesList (semantics) :
 *     H5P.StandardPage 1.5 · H5P.GoalsPage 1.5
 *     H5P.GoalsAssessmentPage 1.4 · H5P.DocumentExportPage 1.5
 *  Elements acceptes par StandardPage.elementList :
 *     H5P.Text 1.1 · H5P.TextInputField 1.2 · H5P.Image 1.1 · H5P.Accordion 1.0
 * ------------------------------------------------------------------ */

/** Un champ de saisie. rows : '1' (ligne), '3' (petit), '10' (grand). */
export const textInput = (taskDescription, placeholderText, { rows = '3', required = false, max } = {}) =>
  sub('H5P.TextInputField 1.2', {
    taskDescription,
    placeholderText,
    inputFieldSize: rows,
    requiredField: required,
    ...(max ? { maximumLength: max } : {}),
    remainingChars: 'Caractères restants : @chars',
  }, 'Text Input Field', 'Champ');

/** Un paragraphe d'explication a l'interieur d'une page de fiche. */
export const docText = (html) =>
  sub('H5P.Text 1.1', { text: html }, 'Text', 'Texte');

/** Une page de la fiche. elements = [textInput(...) | docText(...) | image(...)] */
export const standardPage = (title, elements, helpText) =>
  sub('H5P.StandardPage 1.5', {
    elementList: elements,
    helpTextLabel: 'Besoin d\u2019aide ?',
    ...(helpText ? { helpText } : {}),
  }, 'Standard page', title);

/** La derniere page : celle qui fabrique le document a telecharger. */
export const exportPage = (description, { createLabel = 'Créer mon document', exportLabel = 'Télécharger' } = {}) =>
  sub('H5P.DocumentExportPage 1.5', {
    description,
    createDocumentLabel: createLabel,
    submitTextLabel: 'Envoyer',
    submitSuccessTextLabel: 'Ta fiche a bien été envoyée !',
    selectAllTextLabel: 'Tout sélectionner',
    exportTextLabel: exportLabel,
    helpTextLabel: 'Besoin d\u2019aide ?',
    requiresInputErrorMessage: 'Il reste des champs à remplir dans : @pages',
  }, 'Document export page', 'Export');

/** La fiche complete. pages = [standardPage(...), …, exportPage(...)] */
export const docTool = (taskDescription, pages, title = 'Fiche') =>
  sub('H5P.DocumentationTool 1.8', {
    taskDescription,
    pagesList: pages,
    i10n: {
      previousLabel: 'Étape précédente',
      nextLabel: 'Étape suivante',
      closeLabel: 'Fermer',
    },
  }, 'Documentation Tool', title);

/* ================================================================== *
 *  CLASSER, ORDONNER, RÉFLÉCHIR, REGARDER
 *  (ajout sept. 2026 — parcours Club Jeune Reporter)
 *
 *  Choisir le type selon l'INTENTION pédagogique, pas l'inverse :
 *    comprendre  → interactiveVideo, texte, cartes, accordéon
 *    agir        → dragZones (classer), sequence (ordonner), QCM…
 *    réfléchir   → reflection (Essay non noté + réponse modèle)
 *    produire    → docTool, StructureStrip, Cornell
 * ================================================================== */

/** Accordéon à un seul volet : cache une correction jusqu'à ce qu'on l'ouvre. */
export const accordion = (panelTitle, html, title = 'Correction') =>
  sub('H5P.Accordion 1.0', {
    hTag: 'h3',
    panels: [{ title: panelTitle, content: sub('H5P.AdvancedText 1.1', { text: html }, 'Text', title) }],
  }, 'Accordion', title);

/* --- Drag and Drop (H5P.DragQuestion 1.14) --------------------------- *
 *  Unités : x / y en % du cadre ; width / height en em, où
 *  1 em = (largeur affichée / size.width) × 16 px. On fixe size.width à
 *  620 → le cadre fait 38,75 em de large, quelle que soit la largeur
 *  réelle (tout est mis à l'échelle).
 *  ⚠️ Pas de clé `background` : un média vide fait planter le chapitre.
 * -------------------------------------------------------------------- */
const DQ_W = 620;
const DQ_EM = DQ_W / 16;                        // 38,75 em
const lines = (t, wEm) => Math.max(1, Math.ceil(t.replace(/<[^>]+>/g, '').length / (wEm * 1.95)));
const boxH = (t, wEm) => lines(t, wEm) * 1.35 + 0.9;
const DQ_PAD = 1.2;     // bordure + marges internes ajoutées par H5P au rendu (mesuré)
const DQ_LABEL = 1.9;   // le libellé d'une zone s'affiche AU-DESSUS d'elle (mesuré)

const dqElement = (html, x, y, w, h, zoneCount) => ({
  x, y, width: w, height: h,
  dropZones: Array.from({ length: zoneCount }, (_, i) => String(i)),
  type: sub('H5P.AdvancedText 1.1', { text: `<p>${html}</p>` }, 'Text', 'Étiquette'),
  backgroundOpacity: 100,
  multiple: false,
});

const dqZone = (label, x, y, w, h, correct, { single = false, fbOk = '', fbKo = '', tip = '' } = {}) => ({
  label: `<div>${label}</div>`,
  showLabel: true,
  x, y, width: w, height: h,
  correctElements: correct.map(String),
  backgroundOpacity: 100,
  tipsAndFeedback: { tip, feedbackOnCorrect: fbOk, feedbackOnIncorrect: fbKo },
  single,
  autoAlign: true,
});

const dqParams = (taskDescription, elements, dropZones, heightEm) => ({
  scoreShow: 'Vérifier',
  submit: 'Envoyer',
  tryAgain: 'Recommencer',
  scoreExplanation: 'Une étiquette bien placée rapporte 1 point, une étiquette mal placée en retire 1.',
  question: {
    settings: { size: { width: DQ_W, height: Math.round(heightEm * 16) } },
    task: { elements, dropZones },
  },
  overallFeedback: [{ from: 0, to: 100, feedback: 'Tu as @score point(s) sur @total.' }],
  behaviour: {
    enableRetry: true, enableCheckButton: true, singlePoint: false,
    applyPenalties: false, enableScoreExplanation: false,
    dropZoneHighlighting: 'dragging', autoAlignSpacing: 2,
    enableFullScreen: false, showScorePoints: true, showTitle: false,
  },
  localize: { fullscreen: 'Plein écran', exitFullscreen: 'Quitter le plein écran' },
  grabbablePrefix: 'Étiquette {num} sur {total}.',
  grabbableSuffix: 'Placée dans la zone {num}.',
  dropzonePrefix: 'Zone {num} sur {total}.',
  noDropzone: 'Aucune zone.',
  tipLabel: 'Voir l’indice.',
  tipAvailable: 'Indice disponible',
  correctAnswer: 'Bonne réponse',
  wrongAnswer: 'Mauvaise réponse',
  feedbackHeader: 'Explication',
  scoreBarLabel: 'Tu as :num point(s) sur :total',
  scoreExplanationButtonLabel: 'Voir le détail du score',
  a11yCheck: 'Vérifier les réponses.',
  a11yRetry: 'Recommencer la tâche.',
  taskDescription,
});

/**
 * CLASSER : des étiquettes à déposer dans des catégories.
 *   zones : [{ label, fbOk?, fbKo?, tip? }]
 *   items : [{ t: 'texte', zone: indexDeLaZoneCorrecte }]
 * Mise en page automatique : réserve d'étiquettes en haut (2 colonnes),
 * zones en grille en dessous (2 colonnes), chaque zone assez haute pour
 * contenir toutes ses bonnes réponses.
 */
export const dragZones = (taskDescription, zones, items, title) => {
  const gap = 0.8, colW = (DQ_EM - 3 * gap) / 2;
  const itemW = colW - 0.8;
  const itemH = Math.max(...items.map(it => boxH(it.t, itemW)));
  const step = itemH + DQ_PAD;                   // hauteur rendue réelle (bordure + marge)
  // réserve : 2 colonnes
  const poolRows = Math.ceil(items.length / 2);
  const poolH = poolRows * (step + gap) + gap;
  // zones : 2 colonnes ; le libellé s'affiche AU-DESSUS de la zone → on lui réserve DQ_LABEL
  const perZone = zones.map((_, z) => items.filter(it => it.zone === z).length);
  const zoneH = Math.max(1, ...perZone) * (step + 0.3) + 0.6;
  const zoneRows = Math.ceil(zones.length / 2);
  const totalH = poolH + zoneRows * (DQ_LABEL + zoneH + gap) + gap;
  const pct = (em, tot) => +(em / tot * 100).toFixed(2);

  const elements = items.map((it, i) => {
    const c = i % 2, r = Math.floor(i / 2);
    return dqElement(it.t, pct(gap + c * (colW + gap) + 0.4, DQ_EM), pct(gap + r * (step + gap), totalH), itemW, itemH, zones.length);
  });
  const dropZones = zones.map((z, k) => {
    const c = k % 2, r = Math.floor(k / 2);
    const correct = items.map((it, i) => (it.zone === k ? i : -1)).filter(i => i >= 0);
    return dqZone(z.label, pct(gap + c * (colW + gap), DQ_EM), pct(poolH + DQ_LABEL + r * (DQ_LABEL + zoneH + gap), totalH),
      colW, zoneH, correct, { fbOk: z.fbOk || '', fbKo: z.fbKo || '', tip: z.tip || '' });
  });
  return sub('H5P.DragQuestion 1.14', dqParams(taskDescription, elements, dropZones, totalH), 'Drag and Drop', title);
};

/**
 * ORDONNER : remettre des étiquettes dans l'ordre (cases numérotées).
 *   itemsInOrder : textes dans l'ORDRE CORRECT (ils sont mélangés à l'affichage)
 *   slotLabels   : libellés des cases (défaut « 1 », « 2 »…)
 */
export const sequence = (taskDescription, itemsInOrder, title, { slotLabels, shuffleSeed = 7 } = {}) => {
  const gap = 0.8, colW = (DQ_EM - 3 * gap) / 2;
  const itemW = colW - 0.8;
  const itemH = Math.max(...itemsInOrder.map(t => boxH(t, itemW)));
  const step = itemH + DQ_PAD;
  const slotH = step + 0.4;
  const row = DQ_LABEL + slotH + gap;            // libellé au-dessus de chaque case
  const n = itemsInOrder.length;
  const totalH = gap + n * row;
  const pct = (em, tot) => +(em / tot * 100).toFixed(2);
  // mélange déterministe (pour que la réserve ne soit pas déjà dans l'ordre)
  let s = shuffleSeed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const order = itemsInOrder.map((_, i) => i).sort(() => rnd() - 0.5);
  if (order.every((v, i) => v === i)) order.reverse();

  const elements = order.map((orig, pos) =>
    dqElement(itemsInOrder[orig], pct(gap + 0.4, DQ_EM), pct(gap + DQ_LABEL + pos * row, totalH), itemW, itemH, n));
  // l'élément d'indice `pos` porte le texte `order[pos]` → la case k attend l'élément dont order[pos] === k
  const dropZones = itemsInOrder.map((_, k) =>
    dqZone(slotLabels ? slotLabels[k] : String(k + 1), pct(2 * gap + colW, DQ_EM), pct(gap + DQ_LABEL + k * row, totalH),
      colW, slotH, [order.indexOf(k)], { single: true }));
  return sub('H5P.DragQuestion 1.14', dqParams(taskDescription, elements, dropZones, totalH), 'Drag and Drop', title);
};

/* --- Réflexion (H5P.Essay 1.5, non notée) ---------------------------- *
 *  L'élève écrit librement ; en cliquant sur « Vérifier », il voit une
 *  réponse possible. Pas de score : c'est un moment de réflexion.
 * -------------------------------------------------------------------- */
export const reflection = (question, sample, title = 'Réflexion', { placeholder = 'Écris ta réponse ici…', minimumLength = 20 } = {}) =>
  sub('H5P.Essay 1.5', {
    taskDescription: question,
    placeholderText: placeholder,
    solution: { introduction: '<p>Une réponse possible (il y en a d’autres) :</p>', sample },
    keywords: [{ keyword: '*', alternatives: [], options: { points: 1, occurrences: 1, caseSensitive: false, forgiveMistakes: true, feedbackIncluded: '', feedbackMissed: '' } }],
    overallFeedback: [{ from: 0, to: 100, feedback: 'Merci ! Compare ta réponse avec celle proposée ci-dessous.' }],
    behaviour: {
      minimumLength, inputFieldSize: '3', enableRetry: true, ignoreScoring: true,
      pointsHost: 1, linebreakReplacement: ' ',
    },
    checkAnswer: 'Voir une réponse possible',
    submitAnswer: 'Envoyer',
    tryAgain: 'Modifier ma réponse',
    showSolution: 'Voir une réponse possible',
    feedbackHeader: 'Retour',
    solutionTitle: 'Une réponse possible',
    remainingChars: 'Caractères restants : @chars',
    notEnoughChars: 'Écris au moins @chars caractères.',
    messageSave: 'enregistré',
    ariaYourResult: 'Tu as @score point(s) sur @total',
    ariaNavigatedToSolution: 'Réponse possible affichée.',
    ariaCheck: 'Vérifier.',
    ariaShowSolution: 'Voir une réponse possible.',
    ariaRetry: 'Modifier ma réponse.',
  }, 'Essay', title);

/* --- Vidéo interactive (H5P.InteractiveVideo 1.27) -------------------- *
 *  youtube : URL complète (https://www.youtube.com/watch?v=…)
 *  interactions : [{ at: secondes, action: mc(...) | tf(...) | …, label? }]
 *  Chaque question met la vidéo en pause (pause:true) et s'affiche en
 *  « poster » au centre.
 * -------------------------------------------------------------------- */
export const interactiveVideo = (youtube, interactions, title, { startTitle = title } = {}) =>
  sub('H5P.InteractiveVideo 1.27', {
    interactiveVideo: {
      video: {
        startScreenOptions: { title: startTitle, hideStartTitle: false },
        textTracks: { videoTrack: [] },
        files: [{ path: youtube, mime: 'video/YouTube', copyright: { license: 'U' } }],
      },
      assets: {
        interactions: interactions.map(it => ({
          x: 10, y: 8, width: 32, height: 20,
          duration: { from: it.at, to: it.at + 1 },
          libraryTitle: it.action.metadata.contentType,
          action: it.action,
          pause: true,
          displayType: 'poster',
          buttonOnMobile: false,
          adaptivity: {
            correct: { allowOptOut: false, message: '' },
            wrong: { allowOptOut: false, message: '' },
            requireCompletion: false,
          },
          label: it.label || '',
        })),
        bookmarks: [],
        endscreens: [],
      },
    },
    override: {
      autoplay: false, loop: false, showBookmarksmenuOnLoad: false, showRewind10: true,
      preventSkipping: false, deactivateSound: false,
    },
    l10n: {
      interaction: 'Question', play: 'Lecture', pause: 'Pause', mute: 'Couper le son', unmute: 'Remettre le son',
      quality: 'Qualité', captions: 'Sous-titres', close: 'Fermer', fullscreen: 'Plein écran',
      exitFullscreen: 'Quitter le plein écran', summary: 'Résumé', bookmarks: 'Signets', endscreen: 'Fin',
      defaultAdaptivitySeekLabel: 'Continuer', continueWithVideo: 'Reprendre la vidéo',
      playbackRate: 'Vitesse', rewind10: 'Reculer de 10 s', navDisabled: 'Navigation désactivée',
      sndDisabled: 'Son désactivé', requiresCompletionWarning: 'Réponds à toutes les questions avant de continuer.',
      back: 'Retour', hours: 'heures', minutes: 'minutes', seconds: 'secondes', currentTime: 'Temps :',
      totalTime: 'Durée :', singleInteractionAnnouncement: 'Une question est apparue :',
      multipleInteractionsAnnouncement: 'Plusieurs questions sont apparues.',
      videoPausedAnnouncement: 'Vidéo en pause', content: 'Contenu', answered: '@answered réponse(s)',
      endcardTitle: '@answered question(s) sur @total', endcardInformation: 'Tu as répondu à @answered question(s).',
      endcardInformationOnSubmitButtonDisabled: 'Tu as répondu à @answered question(s).',
      endcardInformationNoAnswers: 'Tu n’as répondu à aucune question.',
      endcardInformationMustHaveAnswer: 'Réponds à au moins une question avant d’envoyer.',
      endcardSubmitButton: 'Envoyer mes réponses', endcardSubmitMessage: 'Tes réponses ont été envoyées !',
      endcardTableRowAnswered: 'Questions répondues', endcardTableRowScore: 'Score',
      endcardAnsweredScore: 'répondu', endCardTableRowSummaryWithScore: 'Tu as @score sur @total',
      endCardTableRowSummaryWithoutScore: 'Tu as répondu à @answered question(s)',
    },
  }, 'Interactive Video', title);
