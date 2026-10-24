/* =====================================================================
 *  virtual-tour.mjs — fabriques pour H5P.ThreeImage 0.5 (Virtual Tour 360)
 *
 *  Versions = celles de assets/templates/gabarit-virtualtour.h5p.
 *  Fiche : references/virtual-tour.md
 *
 *  Usage :
 *      import * as vt from '<chemin>/virtual-tour.mjs';
 *      const s0 = vt.scene({ id: 0, name: 'Le CDI', src: vt.img('images/cdi.jpg', 3840, 1920, credit),
 *                            camera: vt.pos360(40, 52),
 *                            interactions: [ vt.hotspot(vt.pos360(20, 50), vt.goTo(1), 'Vers le plateau') ] });
 *      const content = vt.tour([s0, s1], { title: 'Ma visite' });
 *
 *  REGLES VERIFIEES PAR RENDU :
 *   1. Scene 360 : la position est « yaw,pitch » en radians. pos360(u, v) prend
 *      la position en % de l'image equirectangulaire (u = gauche->droite,
 *      v = haut->bas) : yaw = PI/2 + 2*PI*u, pitch = PI*(0.5 - v).
 *   2. Scene statique : la position est « x%,y% » (posStatic).
 *   3. La bonne reponse est TOUJOURS la premiere (SingleChoiceSet ET Summary) :
 *      le lecteur melange l'affichage.
 * ===================================================================== */

import crypto from 'crypto';

export const guid = () => crypto.randomUUID();

/* ---- Positions -------------------------------------------------------- */
export const pos360 = (u, v) =>
  `${Math.PI / 2 + 2 * Math.PI * (u / 100)},${Math.PI * (0.5 - v / 100)}`;
export const posStatic = (x, y) => `${x}%,${y}%`;

/* ---- Medias ----------------------------------------------------------- *
 *  credit = { title, author, source, license, version }  (license : 'CC BY-SA',
 *  'CC0 1.0', 'PD', 'C', 'U'… ; version : '4.0' pour CC BY-SA 4.0)
 * ---------------------------------------------------------------------- */
export const img = (path, width, height, credit = { license: 'U' }) => ({
  path, mime: path.endsWith('.png') ? 'image/png' : 'image/jpeg', copyright: credit, width, height,
});

const meta = (contentType, title, extra = {}) => ({ contentType, license: 'U', title, ...extra });
const sub = (library, params, contentType, title, extra) =>
  ({ library, params, subContentId: guid(), metadata: meta(contentType, title, extra) });

/* ---- Actions (le contenu d'un point d'interet) ----------------------- */
export const goTo = (nextSceneId) =>
  sub('H5P.GoToScene 0.1', { nextSceneId }, 'Go To Scene', 'Aller à la scène');

export const text = (html, title = 'Texte') =>
  sub('H5P.AdvancedText 1.1', { text: html }, 'Text', title);

export const image = (file, alt, title = alt) =>
  sub('H5P.Image 1.1', {
    contentName: 'Image', file, alt, title, decorative: false,
    expandImage: "Agrandir l'image", minimizeImage: "Réduire l'image",
  }, 'Image', title);

// questions = [{ q: '<p>…</p>', a: ['bonne', 'fausse', 'fausse'] }]
export const singleChoice = (questions, title = 'Quiz', { passPercentage = 100 } = {}) =>
  sub('H5P.SingleChoiceSet 1.11', {
    choices: questions.map(({ q, a }) => ({ subContentId: guid(), question: q, answers: a })),
    overallFeedback: [{ from: 0, to: 100 }],
    behaviour: { autoContinue: true, timeoutCorrect: 2000, timeoutWrong: 3000, soundEffectsEnabled: true,
      enableRetry: true, enableSolutionsButton: true, passPercentage },
    l10n: { nextButtonLabel: 'Question suivante', showSolutionButtonLabel: 'Voir la solution',
      retryButtonLabel: 'Recommencer', solutionViewTitle: 'Solutions', correctText: 'Bravo !',
      incorrectText: 'Pas tout à fait…', shouldSelect: 'Il fallait choisir cette réponse',
      shouldNotSelect: 'Il ne fallait pas choisir cette réponse', muteButtonLabel: 'Couper le son',
      closeButtonLabel: 'Fermer', slideOfTotal: 'Question :num sur :total',
      scoreBarLabel: 'Tu as :num point(s) sur :total', solutionListQuestionNumber: 'Question :num',
      a11yShowSolution: 'Afficher la solution', a11yRetry: "Recommencer l'exercice" },
  }, 'Single Choice Set', title);

// groups = [{ ok: 'affirmation juste', ko: ['fausse', 'fausse'], tip: 'indice' }]
export const summary = (intro, groups, title = 'Résumé') =>
  sub('H5P.Summary 1.10', {
    intro,
    summaries: groups.map(({ ok, ko, tip }) => ({
      subContentId: guid(), summary: [ok, ...ko], ...(tip ? { tip } : {}),
    })),
    overallFeedback: [{ from: 0, to: 100 }],
    solvedLabel: 'Progression :', scoreLabel: 'Erreurs :', resultLabel: 'Ton résultat',
    labelCorrect: 'Juste.', labelIncorrect: 'Faux, essaie encore.', alternativeIncorrectLabel: 'Faux',
    labelCorrectAnswers: 'Réponses justes.', tipButtonLabel: "Voir l'indice",
    scoreBarLabel: 'Tu as :num point(s) sur :total', progressText: 'Étape :num sur :total',
  }, 'Summary', title);

/* ---- Points d'interet et scenes -------------------------------------- */
export const hotspot = (interactionpos, action, labelText) => ({
  interactionpos, action,
  ...(labelText ? { labelText } : {}),
  label: { labelPosition: 'inherit', showLabel: 'inherit' },
});

export const scene = ({ id, name, src, camera, interactions = [], type = '360', description = '', icon = 'plus' }) => ({
  sceneId: id, sceneType: type, showBackButton: true, scenename: name, scenesrc: src,
  scenedescription: description,
  cameraStartPosition: camera || (type === '360' ? pos360(50, 50) : '-2.0943951023931953,0'),
  iconType: icon, interactions,
});

export const L10N_FR = {
  title: 'Visite virtuelle', playAudioTrack: 'Lancer la piste audio', pauseAudioTrack: 'Mettre en pause',
  sceneDescription: 'Description de la scène', resetCamera: 'Recentrer la vue',
  submitDialog: 'Valider', closeDialog: 'Fermer', expandButtonAriaLabel: "Afficher l'étiquette",
  backgroundLoading: "Chargement de l'image…", noContent: 'Aucun contenu',
};

export const tour = (scenes, { startSceneId = 0, title = 'Visite virtuelle', quality = 'high' } = {}) => ({
  threeImage: { scenes, startSceneId },
  behaviour: { sceneRenderingQuality: quality, label: { labelPosition: 'right', showLabel: true } },
  l10n: { ...L10N_FR, title },
});
