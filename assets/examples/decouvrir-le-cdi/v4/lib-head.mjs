// Livre interactif « Découvrir le CDI, comme Matilda » v4 (EMI 6e, 1 h) — clone les params réels du gabarit.
// Usage : node build.mjs <gabarit-interactivebook extrait> <content.json de sortie> <dossier media>
import fs from 'fs';
import crypto from 'crypto';

const IB = process.argv[2];
const OUT = process.argv[3];
const MEDIA = process.argv[4];
const tpl = JSON.parse(fs.readFileSync(`${IB}/content/content.json`, 'utf8'));
const clone = (o) => JSON.parse(JSON.stringify(o));
const guid = () => crypto.randomUUID();
const byLib = (lib) => { let r; const w = (n) => { if (r) return; if (n && typeof n === 'object') { if (n.library === lib && n.params) { r = n.params; return; } Object.values(n).forEach(w); } }; w(tpl); return clone(r); };
const meta = (contentType, title) => ({ contentType, license: 'U', title, authors: [], changes: [], extraTitle: title });
const sub = (library, params, contentType, title) => ({ params, library, subContentId: guid(), metadata: meta(contentType, title) });
const chapter = (title, items) => ({
  params: { content: items.map(c => ({ content: c, useSeparator: 'auto' })) },
  library: 'H5P.Column 1.18', subContentId: guid(), metadata: meta('Column', title),
});

/* ---------- Médias embarqués (dimensions lues dans les JPEG) ---------- */
const jpegSize = (buf) => {
  let i = 2;
  while (i < buf.length) {
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xC0 && m <= 0xC3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error('JPEG sans SOF');
};
const file = (name, credit) => {
  const { width, height } = jpegSize(fs.readFileSync(`${MEDIA}/${name}`));
  return { path: `images/${name}`, mime: 'image/jpeg', copyright: { license: 'U', ...(credit ? { source: credit } : {}) }, width, height };
};
const IMG = byLib('H5P.Image 1.1');
const image = (name, alt, title) => {
  const p = clone(IMG);
  Object.assign(p, { file: file(name), alt, contentName: 'Image', expandImage: "Agrandir l'image", minimizeImage: "Réduire l'image" });
  return sub('H5P.Image 1.1', p, 'Image', title || alt);
};
const media = (name, alt) => ({ type: image(name, alt), disableImageZooming: false });

/* ---------- Texte ---------- */
const text = (html, title) => sub('H5P.AdvancedText 1.1', { text: html }, 'Text', title);
const banner = (n, label, min) => `<h2 style="color:#1d3557">${n} · ${label}</h2><p style="color:#555555"><em>⏱ environ ${min} minutes</em></p>`;
const box = (html, bg = '#eef4fb') => `<div style="background-color:${bg};padding:0.6em 1em;border-radius:6px">${html}</div>`;
const retiens = (html) => box(`<p><strong>📌 Je retiens</strong></p>${html}`, '#fff6dd');

/* ---------- QCM ---------- */
const MC = byLib('H5P.MultiChoice 1.16');
MC.UI.scoreBarLabel = 'Tu as :num points sur :total';
const mc = (question, answers, title, opts = {}) => {
  const p = clone(MC);
  p.question = `<p>${question}</p>`;
  p.answers = answers.map(([t, ok, fb]) => ({ text: `<div>${t}</div>`, correct: ok, tipsAndFeedback: { tip: '', chosenFeedback: fb ? `<div>${fb}</div>` : '', notChosenFeedback: '' } }));
  p.behaviour.type = answers.filter(a => a[1]).length > 1 ? 'multi' : 'single';
  p.behaviour.singlePoint = !!opts.singlePoint;
  p.overallFeedback = opts.feedback || [
    { from: 0, to: 99, feedback: 'Lis les commentaires sous tes réponses, puis réessaie !' },
    { from: 100, to: 100, feedback: 'Bravo !' },
  ];
  if (opts.media) p.media = media(opts.media, opts.alt);
  return sub('H5P.MultiChoice 1.16', p, 'Multiple Choice', title);
};

/* ---------- Vrai / Faux ---------- */
const TF = byLib('H5P.TrueFalse 1.8');
const tf = (q, ok, fbOk, fbNo, title) => {
  const p = clone(TF);
  p.question = `<p>${q}</p>`;
  p.correct = ok ? 'true' : 'false';
  p.behaviour.feedbackOnCorrect = fbOk;
  p.behaviour.feedbackOnWrong = fbNo;
  return sub('H5P.TrueFalse 1.8', p, 'True/False Question', title);
};

/* ---------- Glisser les mots ---------- */
const DT = byLib('H5P.DragText 1.10');
Object.assign(DT, { checkAnswer: 'Vérifier', submitAnswer: 'Vérifier', a11yCheck: 'Vérifier les réponses.', scoreBarLabel: 'Tu as :num points sur :total' });
const dragText = (task, lines, title, fb, mediaName, alt) => {
  const p = clone(DT);
  p.taskDescription = `<p>${task}</p>`;
  p.textField = lines.join('\n');
  p.overallFeedback = fb || [
    { from: 0, to: 59, feedback: 'Relis le « Je retiens » et réessaie : tu vas y arriver !' },
    { from: 60, to: 99, feedback: 'Pas mal du tout ! Regarde les erreurs en rouge et recommence.' },
    { from: 100, to: 100, feedback: 'Parfait, tu as tout bon !' },
  ];
  if (mediaName) p.media = media(mediaName, alt);
  return sub('H5P.DragText 1.10', p, 'Drag the Words', title);
};

/* ---------- Marquer les mots ---------- */
const MW = byLib('H5P.MarkTheWords 1.11');
const markWords = (task, html, title, fb) => {
  const p = clone(MW);
  p.taskDescription = `<p>${task}</p>`;
  p.textField = html;
  p.overallFeedback = fb || [
    { from: 0, to: 59, feedback: 'Cherche les mots qui parlent de science, de futur ou de technologie.' },
    { from: 60, to: 99, feedback: 'Bien vu ! Il reste un ou deux indices à trouver.' },
    { from: 100, to: 100, feedback: 'Excellent détective : tu as trouvé tous les indices !' },
  ];
  return sub('H5P.MarkTheWords 1.11', p, 'Mark the Words', title);
};

/* ---------- Point chaud (trouver sur l'image) ---------- */
const HQ = byLib('H5P.ImageHotspotQuestion 1.8');
const findHotspot = (imgName, task, hotspots, noneFb, title) => {
  const p = clone(HQ);
  p.imageHotspotQuestion.backgroundImageSettings = file(imgName);
  Object.assign(p.imageHotspotQuestion.hotspotSettings, {
    taskDescription: task,
    hotspot: hotspots.map(h => ({ userSettings: { correct: h.ok, feedbackText: h.fb }, computedSettings: { x: h.x, y: h.y, width: h.w, height: h.h, figure: 'rectangle' } })),
    noneSelectedFeedback: noneFb, showFeedbackAsPopup: true,
    l10n: { retryText: 'Réessayer', closeText: 'Fermer' },
  });
  p.scoreBarLabel = 'Tu as :num point sur :total';
  p.a11yRetry = "Réessayer l'exercice.";
  return sub('H5P.ImageHotspotQuestion 1.8', p, 'Find the Hotspot', title);
};

/* ---------- Accordéon ---------- */
const accordion = (panels, title) => sub('H5P.Accordion 1.0', {
  panels: panels.map(([t, html]) => ({ title: t, content: text(html, t) })), hTag: 'h3',
}, 'Accordion', title);

/* ---------- Résumé (Summary) ---------- */
const SU = byLib('H5P.Summary 1.10');
const summary = (intro, sets, title) => {
  const p = clone(SU);
  p.intro = `<p>${intro}</p>`;
  p.summaries = sets.map(s => ({ subContentId: guid(), summary: s.map(x => `<p>${x}</p>`), tip: '' }));
  p.overallFeedback = [
    { from: 0, to: 69, feedback: 'Reprends les chapitres où tu as hésité, puis recommence le bilan.' },
    { from: 70, to: 99, feedback: 'Très bien ! Tu connais déjà bien ton CDI.' },
    { from: 100, to: 100, feedback: 'Sans faute : tu es prêt·e à te débrouiller seul·e au CDI !' },
  ];
  Object.assign(p, { labelIncorrect: 'Incorrect, essaie encore !', scoreLabel: 'Erreurs :', solvedLabel: 'Progression :', progressText: 'Étape :num sur :total' });
  return sub('H5P.Summary 1.10', p, 'Summary', title);
};

/* ================= DONNÉES DU CDI (spécifiques à l'établissement) ================= */
// Pastilles de couleur des genres. Fantasy/Fantastique/SF = couleurs des affiches ; Enquête = rouge (fiche Quizinière).
// Vert = Humour (changement au CDI signalé par Pierre le 2026-11-06 ; avant : Animalier).
const GENRES = [
  ['Enquête', 'rouge', 'un crime, un mystère à résoudre, un détective ou un enquêteur'],
  ['Fantasy', 'bleu', 'un monde imaginaire, de la magie, des créatures (dragons, elfes…) et une grande quête'],
  ['Fantastique', 'noir', "notre monde réel où surgit quelque chose d'étrange et d'inexplicable qui fait peur"],
  ['Science-fiction', 'gris', 'le futur, les sciences, les robots, l’espace, des technologies qui n’existent pas encore'],
  ['Romance', 'rose', 'une histoire d’amour, d’amitié, des sentiments'],
  ['Humour', 'vert', 'des situations drôles, des personnages maladroits, des gags et des quiproquos'],
  ['Aventure', 'orange', 'un voyage, des dangers, des épreuves, de l’action'],
  ['Mythes et récits historiques', 'jaune', 'les dieux et héros des mythes, ou une histoire qui se passe dans le passé'],
  ['Littératures du réel', 'violet', 'la vie de tous les jours, des problèmes réels (école, famille, harcèlement…), des témoignages'],
];

const DEWEY = [
  ['000', 'Généralités, informatique', 'dictionnaires, encyclopédies, informatique'],
  ['100', 'Philosophie, psychologie', 'les grandes questions, les émotions'],
  ['200', 'Religions, mythologie', 'les religions du monde, les dieux grecs'],
  ['300', 'Sciences sociales', 'la société, les droits, l’argent, l’école, l’environnement'],
  ['400', 'Langues', 'grammaire, dictionnaires de langues'],
  ['500', 'Sciences', 'maths, physique, Terre, animaux, plantes'],
  ['600', 'Techniques, sciences appliquées', 'médecine, corps humain, cuisine, bricolage, transports'],
  ['700', 'Arts, loisirs, sports', 'peinture, musique, cinéma, sports'],
  ['800', 'Littérature', 'poésie, théâtre, contes'],
  ['900', 'Histoire, géographie', 'pays, voyages, histoire, biographies'],
];

