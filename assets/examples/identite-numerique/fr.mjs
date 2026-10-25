// Briques H5P en français (versions = gabarit-interactivebook / gabarit-tabs).
// mc() : la bonne réponse porte ok:true ; chaque mauvaise réponse a un retour (fb) qui
// explique le piège (règle des distracteurs intelligents, references/question-multichoice.md).
import crypto from 'crypto';
export const guid = () => crypto.randomUUID();
export const sub = (library, params, contentType, title) =>
  ({ library, params, subContentId: guid(), metadata: { contentType, license: 'U', title } });

export const text = (html, title = 'Texte') => sub('H5P.AdvancedText 1.1', { text: html }, 'Text', title);

export const image = (path, w, h, alt, title = 'Image', copyright = { license: 'U' }) =>
  sub('H5P.Image 1.1', {
    contentName: 'Image', alt, title: alt, decorative: false,
    expandImage: "Agrandir l'image", minimizeImage: "Réduire l'image",
    file: { path, mime: 'image/jpeg', copyright, width: w, height: h },
  }, 'Image', title);

const CONFIRM = {
  confirmCheck: { header: 'Terminer ?', body: 'Veux-tu vraiment terminer ?', cancelLabel: 'Annuler', confirmLabel: 'Terminer' },
  confirmRetry: { header: 'Recommencer ?', body: 'Veux-tu vraiment recommencer ?', cancelLabel: 'Annuler', confirmLabel: 'Recommencer' },
};

export const mc = (question, answers, title, { type = 'single', ok = '', ko = '' } = {}) =>
  sub('H5P.MultiChoice 1.16', {
    question: `<p>${question}</p>`,
    answers: answers.map((a) => ({
      text: `<div>${a.t}</div>`, correct: !!a.ok,
      tipsAndFeedback: { tip: '', chosenFeedback: a.fb ? `<div>${a.fb}</div>` : '', notChosenFeedback: a.nfb ? `<div>${a.nfb}</div>` : '' },
    })),
    behaviour: {
      enableRetry: true, enableSolutionsButton: true, enableCheckButton: true, type, singlePoint: false,
      randomAnswers: true, showSolutionsRequiresInput: true, confirmCheckDialog: false, confirmRetryDialog: false,
      autoCheck: false, passPercentage: 100, showScorePoints: true,
    },
    UI: {
      checkAnswerButton: 'Vérifier', submitAnswerButton: 'Envoyer', showSolutionButton: 'Voir la solution',
      tryAgainButton: 'Recommencer', tipsLabel: 'Indice', scoreBarLabel: 'Tu as :num point(s) sur :total',
      tipAvailable: 'Indice disponible', feedbackAvailable: 'Commentaire disponible', readFeedback: 'Lire le commentaire',
      wrongAnswer: 'Mauvaise réponse', correctAnswer: 'Bonne réponse', shouldCheck: 'Il fallait cocher',
      shouldNotCheck: 'Il ne fallait pas cocher', noInput: 'Réponds avant de voir la solution',
      a11yCheck: 'Vérifier les réponses.', a11yShowSolution: 'Voir la solution.', a11yRetry: "Recommencer l'exercice.",
    },
    media: { disableImageZooming: false },
    overallFeedback: [{ from: 0, to: 99, feedback: ko }, { from: 100, to: 100, feedback: ok }],
    ...CONFIRM,
  }, 'Multiple Choice', title);

export const tf = (question, correct, fbOk, fbNo, title) =>
  sub('H5P.TrueFalse 1.8', {
    question: `<p>${question}</p>`, correct: correct ? 'true' : 'false',
    l10n: {
      trueText: 'Vrai', falseText: 'Faux', checkAnswer: 'Vérifier', submitAnswer: 'Envoyer',
      showSolutionButton: 'Voir la solution', tryAgain: 'Recommencer', score: 'Tu as @score point(s) sur @total',
      wrongAnswerMessage: 'Mauvaise réponse', correctAnswerMessage: 'Bonne réponse',
      scoreBarLabel: 'Tu as :num point(s) sur :total', a11yCheck: 'Vérifier la réponse.',
      a11yShowSolution: 'Voir la solution.', a11yRetry: "Recommencer l'exercice.",
    },
    behaviour: {
      enableRetry: true, enableSolutionsButton: true, enableCheckButton: true, confirmCheckDialog: false,
      confirmRetryDialog: false, autoCheck: false, feedbackOnCorrect: fbOk, feedbackOnWrong: fbNo,
    },
    media: { disableImageZooming: false },
    ...CONFIRM,
  }, 'True/False Question', title);

// questions = [[énoncé, [bonne, fausse, fausse]]] : le lecteur mélange les réponses
export const scs = (questions, title) =>
  sub('H5P.SingleChoiceSet 1.11', {
    choices: questions.map(([q, a]) => ({ subContentId: guid(), question: `<p>${q}</p>`, answers: a.map((x) => `<p>${x}</p>`) })),
    overallFeedback: [{ from: 0, to: 100 }],
    behaviour: { autoContinue: true, timeoutCorrect: 2000, timeoutWrong: 3000, soundEffectsEnabled: false,
      enableRetry: true, enableSolutionsButton: true, passPercentage: 100 },
    l10n: { nextButtonLabel: 'Question suivante', showSolutionButtonLabel: 'Voir la solution', retryButtonLabel: 'Recommencer',
      solutionViewTitle: 'Solutions', correctText: 'Bravo !', incorrectText: 'Pas tout à fait…',
      shouldSelect: 'Il fallait choisir cette réponse', shouldNotSelect: 'Il ne fallait pas choisir cette réponse',
      muteButtonLabel: 'Couper le son', closeButtonLabel: 'Fermer', slideOfTotal: 'Question :num sur :total',
      scoreBarLabel: 'Tu as :num point(s) sur :total', solutionListQuestionNumber: 'Question :num',
      a11yShowSolution: 'Voir la solution', a11yRetry: "Recommencer l'exercice" },
  }, 'Single Choice Set', title);

// groups = [[juste, faux, faux], …] : la 1re affirmation de chaque groupe est la bonne
export const summary = (intro, groups, title) =>
  sub('H5P.Summary 1.10', {
    intro: `<p>${intro}</p>`,
    summaries: groups.map((g) => ({ subContentId: guid(), summary: g.map((x) => `<p>${x}</p>`) })),
    overallFeedback: [{ from: 0, to: 100 }],
    solvedLabel: 'Progression :', scoreLabel: 'Erreurs :', resultLabel: 'Ton résultat',
    labelCorrect: 'Juste.', labelIncorrect: 'Faux, essaie encore.', alternativeIncorrectLabel: 'Faux',
    labelCorrectAnswers: 'Réponses justes.', tipButtonLabel: "Voir l'indice",
    scoreBarLabel: 'Tu as :num point(s) sur :total', progressText: 'Étape :num sur :total',
  }, 'Summary', title);
