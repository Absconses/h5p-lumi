import fs from 'fs';
import { dragText } from '/home/user/h5p-lumi/assets/examples/journalisme-ia/cp.mjs';
import { text, image, sub } from '/home/user/h5p-lumi/assets/examples/decouvrir-le-cdi/v4/scenario/fr.mjs';
const p = JSON.parse(fs.readFileSync('ivbase.json', 'utf8'));
const v = p.interactiveVideo.video;
v.startScreenOptions = { title: 'La cote de Lina', hideStartTitle: true, poster: { path: 'images/lina-cote.jpg', mime: 'image/jpeg', copyright: { license: 'U' }, width: 1280, height: 720 } };
v.textTracks = { videoTrack: [] };
v.files = [{ path: 'videos/lina-cote.mp4', mime: 'video/mp4', copyright: { license: 'U' } }, { path: 'videos/lina-cote.webm', mime: 'video/webm', copyright: { license: 'U' } }];
const dt = dragText('<p>Lina ne comprend pas l’étiquette <strong>551.21 MON</strong>. Explique-lui.</p>',
  'Le nombre 551.21 indique *le sujet* du livre.\nLes lettres MON sont le début du nom de *l’auteur*.',
  '*le titre* *l’éditeur* *le genre*', 'La cote de Lina');
dt.params.behaviour.enableSolutionsButton = false;
dt.params.overallFeedback = [{ from: 0, to: 99, feedback: '' }, { from: 100, to: 100, feedback: 'Exact ! Le nombre range le livre par sujet, les lettres le situent parmi les livres du même sujet.' }];
p.interactiveVideo.assets = { bookmarks: [], endscreens: [], interactions: [{
  x: 5, y: 5, width: 36, height: 16, duration: { from: 4.5, to: 6 }, pause: true,
  displayType: 'poster', buttonOnMobile: false, label: '<p>Explique la cote à Lina</p>', libraryTitle: 'Drag the Words',
  action: dt, visuals: { backgroundColor: 'rgb(255, 255, 255)', boxShadow: true }, goto: { url: { protocol: 'http://' }, visualize: false },
  adaptivity: {
    requireCompletion: true,
    correct: { allowOptOut: false, message: '' },
    wrong: { seekTo: 0, allowOptOut: false, message: '<p>Pas encore : regarde de nouveau l’étiquette avec Lina.</p>', seekLabel: 'Revoir la scène' },
  },
}] };
p.interactiveVideo.summary.task.params.summaries = [];
p.interactiveVideo.summary.displayAt = 3;
Object.assign(p.override, { autoplay: false, preventSkippingMode: 'both', showRewind10: false, retryButton: 'on', showSolutionButton: 'off' });
p.l10n.requiresCompletionWarning = 'Réponds correctement avant de continuer.';
const ivNode = sub('H5P.InteractiveVideo 1.26', p, 'Interactive Video', 'La cote de Lina');
const base = (type, extra) => ({ type, showContentTitle: false, proceedButtonText: 'Continuer', forceContentFinished: 'useBehavioural', feedback: { title: '', subtitle: '' }, contentBehaviour: 'useBehavioural', ...extra });
const content = [
  base(text('<div style="font-size:1.15em"><p>Lina a trouvé <em>Tout sur les volcans</em>, mais l’étiquette au dos la laisse perplexe.</p><p>Regarde la scène. <strong>La vidéo s’arrêtera et ne repartira que si ton explication est juste.</strong></p></div>', 'intro'), { nextContentId: 1 }),
  base(ivNode, { nextContentId: 2, forceContentFinished: 'enabled' }),
  base(image('images/lina-contente.jpg', 1280, 720, 'Lina : « Merci ! Avec tout ça, mon exposé va être explosif ! »', 'fin'), { nextContentId: -1 }),
];
fs.writeFileSync('iv/content/content.json', JSON.stringify({ branchingScenario: {
  title: 'La cote de Lina', content,
  startScreen: { startScreenTitle: '<p>La cote de Lina</p>', startScreenSubtitle: '<p>Un exercice bloquant dans une vidéo</p>', startScreenImage: { path: 'images/lina-cote.jpg', mime: 'image/jpeg', width: 1280, height: 720, copyright: { license: 'U' } }, startScreenAltText: 'Lina' },
  endScreens: [{ endScreenTitle: '<p>Bravo</p>', endScreenSubtitle: '<p>Tu sais lire une cote.</p>', contentId: -1, endScreenScore: 0 }],
  scoringOptionGroup: { scoringOption: 'no-score', includeInteractionsScores: false },
  behaviour: { enableBackwardsNavigation: false, forceContentFinished: false, randomizeBranchingQuestions: false },
  l10n: { startScreenButtonText: 'Commencer', endScreenButtonText: 'Recommencer', backButtonText: 'Revenir en arrière', disableProceedButtonText: 'Termine d’abord la vidéo', replayButtonText: 'Revoir la vidéo', scoreText: 'Ton score :', fullscreenAria: 'Plein écran' },
} }));
