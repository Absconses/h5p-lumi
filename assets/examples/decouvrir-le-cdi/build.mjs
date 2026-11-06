// Livre « Ma première visite au CDI » (EMI 6e, 45 min), v2 pour le lecteur hors ligne.
// Le parcours suit l'ordre d'une vraie première visite : trouver le CDI, comprendre à quoi il sert,
// choisir un roman, trouver un documentaire, emprunter, puis une mission dans les rayons.
// usage : node build.mjs <repo_h5p-lumi> <gabarit_reporter_extrait> <media> <sortie_dir> <gabarit_personalityquiz_extrait>
//   → <sortie>/livre.json (Interactive Book) et <sortie>/quel-lecteur.json (Personality Quiz, en cadre)
import fs from 'fs';
const [REPO, TPL, MEDIA, OUT, PQ] = process.argv.slice(2);
const EX = `${REPO}/assets/examples/vitrine-emi-2`;
const { lib, sub, guid, merge } = await import(`${EX}/defaults.mjs`);
const { text, mc, tf, scs, summary } = await import(`${EX}/fr.mjs`);
const { dragText, markWords, sortInto } = await import(`${EX}/cp.mjs`);
const L = (library, params, ct, title) => lib(library, TPL, params, ct, title);
const geo = JSON.parse(fs.readFileSync(`${MEDIA}/geo.json`, 'utf8'));

/* ---------- médias ---------- */
const size = (name) => {
  const b = fs.readFileSync(`${MEDIA}/${name}`);
  if (name.endsWith('.png')) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  let i = 2; while (i < b.length) { const m = b[i + 1], len = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) }; i += 2 + len; }
};
const OWN = { license: 'U', author: 'Module CDI (dessin original)' };
const PIERRE = { license: 'U', author: 'Professeur-documentaliste' };
const file = (name, copyright = OWN) => ({ path: `images/${name}`, mime: name.endsWith('.png') ? 'image/png' : 'image/jpeg', copyright, ...size(name) });
const image = (name, alt, copyright) => sub('H5P.Image 1.1', {
  contentName: 'Image', alt, title: alt, decorative: false, expandImage: "Agrandir l'image", minimizeImage: "Réduire l'image", file: file(name, copyright),
}, 'Image', alt.slice(0, 60));

/* ---------- mise en page (sobre : le fond porte le sens) ---------- */
const etape = (n, titre, min, html) => text(`<h2 style="color:#1d3557">${n}. ${titre}</h2>`
  + `<p style="color:#6b7280;font-size:0.9em">⏱ environ ${min} minutes</p>${html}`, `Étape ${n}`);
const retiens = (html) => text(`<div style="background-color:#fff6dd">`
  + `<p style="background-color:#fff6dd"><strong>📌 Je retiens</strong></p>${html.replace(/<p>/g, '<p style="background-color:#fff6dd">').replace(/<li>/g, '<li style="background-color:#fff6dd">')}</div>`, 'Je retiens');
const consigne = (html) => text(`<p><strong>${html}</strong></p>`, 'Consigne');
const chapter = (title, items) => ({
  library: 'H5P.Column 1.18', subContentId: guid(),
  params: { content: items.map((c) => ({ content: c, useSeparator: 'auto' })) },
  metadata: { contentType: 'Column', license: 'U', title },
});

/* ---------- briques spécifiques ---------- */
// Trouver une zone sur une image (une seule bonne)
const findZone = (img, task, spots, none, title) => L('H5P.ImageHotspotQuestion 1.8', {
  imageHotspotQuestion: {
    backgroundImageSettings: file(img),
    hotspotSettings: {
      taskDescription: task, noneSelectedFeedback: none, showFeedbackAsPopup: true,
      hotspot: spots.map((s) => ({ userSettings: { correct: s.ok, feedbackText: s.fb }, computedSettings: { x: s.r.x, y: s.r.y, width: s.r.w, height: s.r.h, figure: 'rectangle' } })),
      l10n: { retryText: 'Réessayer', closeText: 'Fermer' },
    },
  },
  scoreBarLabel: 'Tu as :num point sur :total', a11yRetry: "Réessayer l'exercice.",
}, 'Find the Hotspot', title);

// Points à explorer sur une image
const hotspots = (img, alt, spots, title) => L('H5P.ImageHotspots 1.10', {
  image: file(img), backgroundImageAltText: alt, iconType: 'icon', icon: 'plus', color: '#e76f51',
  hotspots: spots.map(([xy, header, html]) => ({
    position: { x: +xy[0].toFixed(2), y: +xy[1].toFixed(2), legacyPositioning: false }, alwaysFullscreen: false, header,
    content: [sub('H5P.Text 1.1', { text: html }, 'Text', header)],
  })),
  hotspotNumberLabel: 'Point n° #num', closeButtonLabel: 'Fermer', containsAudioVideoLabel: 'Contient un son ou une vidéo',
}, 'Image Hotspots', title);

// Glisser-déposer d'images dans des zones (canevas W x H px ; 1 em = 16 px de canevas)
const dnd = ({ W, H, bg, items, zones, task, ok, ko, title }) => {
  const P = (v, t) => +(v / t * 100).toFixed(2), E = (v) => +(v / 16).toFixed(2);
  const elements = items.map((it) => ({
    type: image(it.img, it.alt), x: P(it.x, W), y: P(it.y, H), width: E(it.w), height: E(it.h),
    dropZones: zones.map((_, z) => String(z)), backgroundOpacity: 0, multiple: false,
  }));
  const dropZones = zones.map((z, k) => ({
    label: `<div>${z.label}</div>`, showLabel: z.show !== false, x: P(z.x, W), y: P(z.y, H), width: E(z.w), height: E(z.h),
    correctElements: items.map((it, i) => (it.zone === k ? String(i) : null)).filter((v) => v !== null),
    backgroundOpacity: z.opacity ?? 60, tipsAndFeedback: { tip: '', feedbackOnCorrect: z.fbOk || '', feedbackOnIncorrect: z.fbKo || '' },
    single: !!z.single, autoAlign: true,
  }));
  return L('H5P.DragQuestion 1.14', {
    scoreShow: 'Vérifier', submit: 'Envoyer', tryAgain: 'Recommencer',
    scoreExplanation: 'Chaque livre bien placé rapporte 1 point.',
    question: { settings: { size: { width: W, height: H }, ...(bg ? { background: file(bg) } : {}) }, task: { elements, dropZones } },
    overallFeedback: [{ from: 0, to: 99, feedback: ko }, { from: 100, to: 100, feedback: ok }],
    behaviour: { enableRetry: true, enableCheckButton: true, singlePoint: false, applyPenalties: false, enableScoreExplanation: false,
      dropZoneHighlighting: 'dragging', autoAlignSpacing: 2, enableFullScreen: false, showScorePoints: true, showTitle: false },
    localize: { fullscreen: 'Plein écran', exitFullscreen: 'Quitter le plein écran' },
    grabbablePrefix: 'Élément {num} sur {total}.', grabbableSuffix: 'Posé dans la zone {num}.',
    dropzonePrefix: 'Zone {num} sur {total}.', noDropzone: 'Aucune zone.', tipLabel: "Voir l'indice.", tipAvailable: 'Indice disponible',
    correctAnswer: 'Bonne réponse', wrongAnswer: 'Mauvaise réponse', feedbackHeader: 'Commentaire',
    scoreBarLabel: 'Tu as :num point(s) sur :total', scoreExplanationButtonLabel: 'Comment est calculé le score',
    a11yCheck: 'Vérifier les réponses.', a11yRetry: "Recommencer l'exercice.",
  }, 'Drag and Drop', title);
};

// Module en cadre (lecteur hors ligne), jamais noté
const PLAYER = 'https://h5p-offline-player.vercel.app/embed?src=';
const RAW = 'https://raw.githubusercontent.com/Absconses/h5p-lumi/main/partage/decouvrir-le-cdi';
const cadre = (fileName, ratio, title, html) => {
  const url = `${PLAYER}${RAW}/${fileName}`;
  return [
    text(`<p><strong>${html}</strong> Si un bouton « Open with its own scripts » apparaît, clique dessus : c'est normal.</p>`, 'Consigne'),
    sub('H5P.IFrameEmbed 1.0', { source: url, width: String(ratio[0]), height: String(ratio[1]), minWidth: '280', resizeSupported: true }, 'Iframe Embedder', title),
    text(`<p style="font-size:0.9em">Le cadre est trop petit ? <a href="${url}" target="_blank" rel="noopener">Ouvrir le questionnaire en grand</a>. Il n'y a pas de bonne réponse : il n'est pas compté dans ton score.</p>`, 'Lien'),
  ];
};

/* ================= 1. Trouver le CDI ================= */
const g = geo.plan;
const ch1 = chapter('1. Trouver le CDI', [
  etape(1, 'Trouver le CDI', 4, `<p>C'est ta <strong>première visite au CDI</strong>, le <strong>Centre de Documentation et d'Information</strong>. Ce livre suit le trajet d'une vraie visite : d'abord trouver le CDI, puis comprendre à quoi il sert, choisir un roman, trouver un documentaire et l'emprunter.</p>
<p>Le CDI se trouve dans le <strong>pavillon Bellevue</strong>. Pour le repérer, cherche d'abord un repère facile : le <strong>hall rond</strong>. Le CDI est la grande salle juste <strong>à sa droite</strong>, de l'autre côté du petit couloir.</p>`),
  findZone('plan-simplifie.png', '<p><strong>Clique sur la salle du CDI.</strong></p>', [
    { ok: true, r: g.cdi, fb: 'Bravo ! Le CDI est dans le pavillon Bellevue, juste à droite du hall rond.' },
    { ok: false, r: g.petitGym, fb: "C'est le petit gymnase, à gauche du hall. Le CDI est de l'autre côté du hall." },
    { ok: false, r: g.classe, fb: "Tu es allé trop loin : après l'escalier, c'est une salle de classe. Reviens vers le hall." },
    { ok: false, r: g.chapelle, fb: "C'est la chapelle, au nord. Le CDI touche la cour d'honneur." },
    { ok: false, r: g.villaRouge, fb: 'La villa Rouge est un autre bâtiment. Le CDI est dans le pavillon Bellevue.' },
    { ok: false, r: g.villaBlanche, fb: 'La villa Blanche est un autre bâtiment. Cherche le hall rond du pavillon Bellevue.' },
  ], 'Pas ici. Repère le cercle orange du hall : le CDI est la grande salle juste à droite.', 'Trouver le CDI'),
  retiens('<p>Le CDI est au <strong>pavillon Bellevue</strong>, juste à droite du <strong>hall rond</strong>, face à la cour d\'honneur.</p>'),
]);

/* ================= 2. À quoi sert le CDI ? ================= */
const M = [
  { label: '<strong>S\'informer</strong>', ok: 'Oui : on vient chercher de l\'information.', ko: 'S\'informer, c\'est lire la presse ou un documentaire pour en savoir plus.' },
  { label: '<strong>Apprendre</strong>', ok: 'Oui : on vient travailler et réviser.', ko: 'Apprendre, c\'est réviser, faire ses devoirs, se faire aider.' },
  { label: '<strong>Produire</strong>', ok: 'Oui : on vient créer et montrer.', ko: 'Produire, c\'est fabriquer quelque chose : une affiche, un exposé, une expo.' },
  { label: '<strong>Vivre ensemble</strong>', ok: 'Oui : on vient se détendre et partager.', ko: 'Vivre ensemble, c\'est lire pour le plaisir, jouer, partager un film.' },
];
const ch2 = chapter('2. À quoi sert le CDI ?', [
  etape(2, 'À quoi sert le CDI ?', 6, `<p>Le CDI n'est pas seulement une bibliothèque. Voici la carte mentale construite en classe : elle montre ses <strong>4 grandes missions</strong>.</p>`),
  image('carte-mentale-cdi.jpg', 'Carte mentale : le CDI permet de s’informer, d’apprendre, de produire et de vivre ensemble', PIERRE),
  consigne('Que vient faire chaque élève au CDI ? Glisse chaque situation dans la bonne mission.'),
  sortInto([
    { t: 'Léa lit le dernier magazine d\'actualité', zone: 0 },
    { t: 'Sarah lit un documentaire sur les volcans', zone: 0 },
    { t: 'Tom révise sa leçon à la table d\'étude', zone: 1 },
    { t: 'Adam fait un exercice avec l\'aide du prof', zone: 1 },
    { t: 'Inès crée une affiche sur Canva', zone: 2 },
    { t: 'La classe accroche son expo sur la grille', zone: 2 },
    { t: 'Noah joue à un jeu de société le midi', zone: 3 },
    { t: 'Jade emprunte un roman pour le plaisir', zone: 3 },
  ], M, 'Les 4 missions', { W: 760, H: 470, iw: 10.4, ih: 3.4, perRow: 4 }),
  retiens('<p>Au CDI, je viens <strong>m\'informer</strong>, <strong>apprendre</strong>, <strong>produire</strong> et <strong>vivre ensemble</strong>. C\'est un lieu calme qui appartient à tous : je parle doucement et je prends soin des documents.</p>'),
]);

/* ================= 3. Choisir un roman ================= */
const L3 = geo.livre;
const COVERS = [
  ['enquete', 'Le mystère du casier 13', 'Enquête'], ['fantasy', 'La couronne des brumes', 'Fantasy'],
  ['fantastique', "La maison d'en face", 'Fantastique'], ['sf', 'Mission Kepler-9', 'Science-fiction'],
  ['romance', 'Un été pour toi', 'Romance'], ['aventure', "Les naufragés de l'île grise", 'Aventure'],
];
const order = [3, 0, 5, 1, 4, 2]; // ordre d'affichage des couvertures (≠ ordre des zones)
const genreSort = dnd({
  W: 900, H: 660, title: 'Ranger les romans',
  items: order.map((k, i) => ({ img: `couv-${COVERS[k][0]}.jpg`, alt: `Couverture : ${COVERS[k][1]}`, x: 25 + i * 145, y: 12, w: 96, h: 144, zone: k })),
  zones: COVERS.map(([, , gname], k) => ({ label: gname, x: 25 + (k % 3) * 290, y: 190 + Math.floor(k / 3) * 235, w: 270, h: 215 })),
  ok: 'Parfait : tu sais lire une couverture !',
  ko: 'Regarde l\'image, le décor et le titre : chaque couverture donne un indice sur le genre.',
});
const ch3 = chapter('3. Choisir un roman', [
  etape(3, 'Choisir un roman', 15, `<p>Au CDI, les romans sont rangés par <strong>genre</strong> : enquête, fantasy, science-fiction, romance… Un petit rond de couleur, la <strong>pastille</strong>, collé sur le dos du livre, indique son genre. Avant de chercher, demande-toi quel lecteur tu es.</p>`),
  ...cadre('quel-lecteur.h5p', [1000, 640], 'Quel lecteur es-tu ?', 'Réponds aux 5 questions pour découvrir les genres qui pourraient te plaire.'),
  text('<p style="font-size:1.2em"><strong>Observer un livre comme un détective</strong></p><p>Pour savoir si un livre va te plaire <strong>sans le lire en entier</strong>, il faut savoir où chercher. Clique sur chaque <strong>+</strong>.</p>', 'Observer'),
  hotspots('livre-observe.png', 'Un roman vu de face, de dos et de derrière', [
    [L3.titre, 'Le titre et l\'auteur', '<p>Sur la <strong>première de couverture</strong> : le titre, le nom de l\'auteur et souvent l\'éditeur.</p>'],
    [L3.illustration, 'L\'illustration', '<p>Elle donne l\'ambiance : un décor, un personnage, des couleurs. C\'est ton <strong>premier indice</strong> sur le genre.</p>'],
    [L3.dos, 'Le dos', '<p>Quand le livre est rangé, on ne voit que lui. Le titre y est écrit dans la longueur.</p>'],
    [L3.pastille, 'La pastille', '<p>Sa <strong>couleur</strong> indique le genre du roman. Au CDI, chaque genre a sa couleur.</p>'],
    [L3.cote, 'La cote', '<p>L\'<strong>adresse</strong> du livre. Pour un roman : <strong>R</strong> + les <strong>3 premières lettres du nom de l\'auteur</strong> (ici Tom <strong>BER</strong>thier).</p>'],
    [L3.resume, 'Le résumé', '<p>Sur la <strong>quatrième de couverture</strong>. Lis-le : c\'est le meilleur moyen de savoir si l\'histoire va te plaire.</p>'],
  ], 'Observer un livre'),
  consigne('Où trouve-t-on chaque information ? Glisse la bonne partie du livre.'),
  dragText('',
    'Le titre et l\'illustration sont sur la *première de couverture*.\nLe résumé de l\'histoire est sur la *quatrième de couverture*.\nQuand le livre est rangé, on ne voit que son *dos*.\nLa *pastille* de couleur indique le genre du roman.\nLes 3 lettres de la cote viennent du nom de l\'*auteur*.',
    '*titre* *éditeur*', 'Parties du livre'),
  text('<p style="font-size:1.2em"><strong>Reconnaître un genre à sa couverture</strong></p><p>Six romans attendent d\'être rangés. Observe le décor, les objets et le titre de chaque couverture, puis glisse-la dans le bon rayon. Clique sur une couverture pour l\'agrandir si besoin.</p>', 'Couvertures'),
  genreSort,
  text(`<p style="font-size:1.2em"><strong>Fantasy, fantastique ou science-fiction ?</strong></p>
<p>Ces trois genres ont tous du <strong>surnaturel</strong>, et on les confond souvent. Lis les trois affiches (clique pour agrandir), puis complète.</p>`, 'Trois genres proches'),
  image('affiches-3-genres.jpg', 'Trois affiches : la fantasy, le fantastique et la science-fiction', PIERRE),
  dragText('',
    'En fantasy, le surnaturel vient de la *magie*, dans un monde *inventé*.\nDans le fantastique, quelque chose d\'*étrange* surgit dans notre monde *réel*.\nEn science-fiction, tout s\'explique par la *technologie*, souvent dans le *futur*.',
    '*passé*', 'Type de surnaturel'),
  markWords('<p><strong>Lis cette quatrième de couverture</strong> et clique sur les <strong>5 mots-indices</strong> qui montrent que c\'est un roman de science-fiction.</p>',
    '<p>En *2150*, la Terre est devenue trop chaude pour y vivre. Lina, douze ans, embarque avec sa famille à bord d’un immense *vaisseau* en route vers une nouvelle *planète*. Mais pendant le voyage, le *robot* qui pilote le navire se met à désobéir. Lina devra percer le secret de son intelligence *artificielle* avant qu’il ne soit trop tard…</p>',
    'Indices SF', [{ from: 0, to: 59, feedback: 'Cherche les mots qui parlent de futur, d\'espace ou de technologie.' }, { from: 60, to: 99, feedback: 'Bien vu ! Il reste un ou deux indices.' }, { from: 100, to: 100, feedback: 'Excellent détective !' }]),
  retiens('<p>Pour choisir un roman, j\'observe <strong>l\'illustration</strong> et <strong>le titre</strong>, je repère <strong>la pastille</strong> du genre et je lis <strong>la quatrième de couverture</strong>. Les romans sont rangés par genre, puis par <strong>ordre alphabétique du nom de l\'auteur</strong>.</p>'),
]);

/* ================= 4. Trouver un documentaire ================= */
const E = geo.etagere;
const SP = [['398.2', 'Contes de Grimm'], ['551.21', 'Les volcans'], ['551.5', 'La météo'], ['599.7', 'Le loup'], ['741.5', 'Dessiner un manga']];
const shown = [2, 4, 0, 3, 1];
const shelf = dnd({
  W: 1000, H: 900, bg: 'etagere.png', title: 'Ranger le rayon',
  items: shown.map((k, i) => ({ img: `dos-${SP[k][0].replace('.', '-')}.png`, alt: `Livre ${SP[k][1]}, cote ${SP[k][0]}`, x: 100 + i * 172, y: 85, w: 88, h: 304, zone: k })),
  zones: E.slots.map((s, k) => ({ label: `Place ${k + 1}`, show: false, x: E.slots[k].x * 10, y: E.slots[k].y * 9, w: s.w, h: s.h, single: true, opacity: 0 })),
  ok: 'Parfait : ton rayon est en ordre !',
  ko: 'Compare les nombres chiffre par chiffre, après la virgule aussi : 551.21 vient avant 551.5, comme 0,21 est plus petit que 0,5.',
});
const ch4 = chapter('4. Trouver un documentaire', [
  etape(4, 'Trouver un documentaire', 10, `<p>Les <strong>documentaires</strong> expliquent le monde réel : les volcans, le corps humain, la Révolution française… Ils ne sont pas rangés par genre mais par <strong>sujet</strong>, grâce à la <strong>classification Dewey</strong>, inventée en 1876 par l'Américain Melvil Dewey.</p>
<p>Dewey a partagé tous les savoirs en <strong>10 grandes classes</strong>, numérotées de 000 à 900. Sur la cote d'un documentaire, ce nombre indique le sujet.</p>`),
  image('dewey-classes.png', 'Les 10 classes de la classification Dewey, de 000 à 900'),
  consigne('Dans quelle classe ranger ce documentaire ? Réponds vite, aide-toi du tableau.'),
  scs([
    ['Le corps humain expliqué', ['600 Techniques', '500 Sciences', '300 Société']],
    ['Les dinosaures', ['500 Sciences', '900 Histoire', '600 Techniques']],
    ['Les règles du football', ['700 Sports', '300 Société', '600 Techniques']],
    ['Les pharaons d\'Égypte', ['900 Histoire', '200 Religions', '700 Arts']],
    ['Mon dictionnaire d\'anglais', ['400 Langues', '000 Généralités', '800 Littérature']],
    ['Les dieux grecs', ['200 Mythologie', '900 Histoire', '800 Littérature']],
    ['Recettes du monde', ['600 Techniques', '300 Société', '900 Géographie']],
  ], 'Dewey éclair'),
  text(`<p style="font-size:1.2em"><strong>Ranger le rayon</strong></p>
<p>Sur la cote d'un documentaire, il y a le <strong>nombre Dewey</strong> puis 3 lettres (le début du nom de l'auteur). Dans le rayon, on range les livres <strong>du plus petit nombre au plus grand</strong>, de gauche à droite. Attention aux chiffres après le point !</p>`, 'Ranger le rayon'),
  consigne('Cinq livres reviennent sur le chariot. Remets-les à leur place dans le rayon.'),
  shelf,
  retiens(`<ul><li>Romans : rangés par <strong>genre</strong> (pastille), puis par <strong>auteur</strong>, cote « R + 3 lettres ».</li>
<li>Documentaires : rangés par <strong>sujet</strong>, avec le <strong>nombre Dewey</strong> (000 à 900), du plus petit au plus grand.</li>
<li>Pour comparer, je lis chiffre par chiffre : 551.<strong>2</strong>1 avant 551.<strong>5</strong>.</li></ul>`),
]);

/* ================= 5. Emprunter ================= */
const ch5 = chapter('5. Emprunter un livre', [
  etape(5, 'Emprunter un livre', 4, '<p>Tu as trouvé ton livre ? Tu peux l\'<strong>emprunter</strong> pour le lire chez toi. Le prêt suit toujours les mêmes étapes, pour que chacun puisse profiter des livres.</p>'),
  consigne('Remets les étapes du prêt dans l\'ordre.'),
  dragText('',
    'Étape 1 → *Je choisis un livre dans les rayons*\nÉtape 2 → *Je le présente au professeur documentaliste*\nÉtape 3 → *Il enregistre le prêt à mon nom*\nÉtape 4 → *Il me donne la date de retour*\nÉtape 5 → *Je rapporte le livre à temps*\nÉtape 6 → *Il enregistre le retour du livre*',
    '', 'Le prêt'),
  tf('Je peux emporter un livre sans le faire enregistrer, si je le rapporte vite.', false,
    'Exact : un prêt est toujours enregistré, sinon personne ne sait où est le livre.',
    'Non : sans enregistrement, le livre est considéré comme perdu. On le fait toujours enregistrer.', 'Prêt enregistré'),
]);

/* ================= 6. Bilan et mission ================= */
const field = (task, ph, rows = '3') => sub('H5P.TextInputField 1.2', { taskDescription: task, placeholderText: ph, inputFieldSize: rows, requiredField: false, remainingChars: 'Caractères restants : @chars' }, 'Text Input Field', 'Champ');
const dtext = (html) => sub('H5P.Text 1.1', { text: html }, 'Text', 'Texte');
const page = (title, elements, helpText) => sub('H5P.StandardPage 1.5', { elementList: elements, helpTextLabel: 'Besoin d\'aide ?', ...(helpText ? { helpText } : {}) }, 'Standard page', title);
const passeport = sub('H5P.DocumentationTool 1.8', {
  taskDescription: 'Mon passeport lecteur',
  pagesList: [
    page('1. Mon profil', [
      dtext('<p>Reprends le résultat de « Quel lecteur es-tu ? » (étape 3).</p>'),
      field('Mon profil de lecteur et les genres qui pourraient me plaire :', 'Je suis plutôt… J\'aimerais lire de la…', '3'),
    ]),
    page('2. Les pastilles', [
      dtext('<p><strong>Dans les rayons des romans</strong>, observe les pastilles et note la couleur de <strong>trois genres</strong>.</p>'),
      field('Genre 1 et sa couleur :', 'Enquête : …', '1'),
      field('Genre 2 et sa couleur :', '… : …', '1'),
      field('Genre 3 et sa couleur :', '… : …', '1'),
    ], '<p>La pastille est le petit rond de couleur collé en bas du dos du livre, au-dessus de la cote.</p>'),
    page('3. Mon livre', [
      dtext('<p>Choisis un roman du genre qui te tente et note :</p>'),
      field('Titre et auteur :', '« … », de …', '1'),
      field('Sa cote :', 'R …', '1'),
      field('Deux indices qui m\'ont donné envie (illustration, titre, résumé…) :', 'L\'illustration montre… Le résumé parle de…', '3'),
    ], '<p>Lis la quatrième de couverture avant de choisir. Si le livre te plaît, emprunte-le !</p>'),
    sub('H5P.DocumentExportPage 1.5', {
      description: '<p>Bravo ! Clique sur <strong>Créer mon document</strong> pour voir ton passeport, puis <strong>Exporter</strong> pour le télécharger et le rendre à ton professeur.</p>',
      createDocumentLabel: 'Créer mon document', submitTextLabel: 'Envoyer', submitSuccessTextLabel: 'Ton passeport a été envoyé !',
      selectAllTextLabel: 'Tout sélectionner', exportTextLabel: 'Exporter', helpTextLabel: 'Besoin d\'aide ?',
      requiresInputErrorMessage: 'Des champs sont encore vides sur ces pages : @pages',
    }, 'Document export page', 'Exporter'),
  ],
  i10n: { previousLabel: 'Précédent', nextLabel: 'Suivant', closeLabel: 'Fermer' },
}, 'Documentation Tool', 'Mon passeport lecteur');
const ch6 = chapter('6. Bilan et mission', [
  etape(6, 'Bilan et mission dans les rayons', 6, '<p>Pour chaque ligne, clique sur la <strong>phrase juste</strong>.</p>'),
  summary('Choisis la phrase exacte.', [
    ['Le CDI est au pavillon Bellevue, près du hall.', 'Le CDI est dans la villa Rouge, près du préau.', 'Le CDI est dans la villa Blanche, au premier.'],
    ['Au CDI, je peux aussi lire pour le plaisir.', 'Au CDI, je viens seulement faire mes devoirs.', 'Au CDI, je peux discuter à voix haute.'],
    ['Les romans sont rangés par genre puis par auteur.', 'Les romans sont rangés par taille puis par titre.', 'Les romans sont rangés par date puis par auteur.'],
    ['La fantasy a la magie, la SF la technologie.', 'La fantasy a la technologie, la SF la magie.', 'La fantasy et la SF parlent du monde réel.'],
    ['Le livre 551.21 se range avant le livre 551.5.', 'Le livre 551.5 se range avant le livre 551.21.', 'Les deux livres vont dans deux rayons différents.'],
  ], 'Bilan'),
  text('<p style="font-size:1.2em"><strong>🎯 Mission dans les rayons</strong></p><p>Lève-toi et va dans les rayons : relève la couleur de trois pastilles, choisis un roman et remplis ton <strong>passeport lecteur</strong>. Si tu n\'as encore jamais emprunté de livre, c\'est le moment !</p>', 'Mission'),
  passeport,
]);

/* ================= Livre ================= */
const book = L('H5P.InteractiveBook 1.11', {
  showCoverPage: true,
  bookCover: {
    coverDescription: '<p style="text-align:center">Trouver le CDI, comprendre à quoi il sert, choisir un roman, trouver un documentaire et l\'emprunter : suis le parcours d\'une vraie première visite.</p><p style="text-align:center"><em>6e · environ 45 minutes · 6 étapes</em></p>',
    coverMedium: image('couverture.jpg', 'Ma première visite au CDI : des rayons de livres colorés'),
  },
  chapters: [ch1, ch2, ch3, ch4, ch5, ch6],
  behaviour: { baseColor: '#1d3557', defaultTableOfContents: true, progressIndicators: true, progressAuto: true, displaySummary: true, enableRetry: true },
}, 'Interactive Book', 'Ma première visite au CDI').params;
fs.writeFileSync(`${OUT}/livre.json`, JSON.stringify(book));

/* ================= Module en cadre : Quel lecteur es-tu ? =================
   Format Personality Quiz 1.0 (et non 1.1) : le lecteur hors ligne, ouvert par lien /embed,
   joue ce type avec sa propre version 1.0.8. Un contenu 1.1 (personalitiesGroup, questionsGroup)
   y plante : « Cannot read properties of undefined (reading 'length') ».
   En 1.0 : listes à plat, champ personality = noms exacts séparés par « , » (pas de « =2 »),
   textes simples (pas de HTML), apostrophes typographiques, image: {} obligatoire. */
const DET = 'Le détective', EXP = 'L’explorateur', REV = 'Le rêveur', SEN = 'Le cœur sensible';
const q = (t, answers) => ({ text: t, image: {}, answers: answers.map(([a, p]) => ({ text: a, personality: p, image: {} })) });
const pq = {
  titleScreen: { title: { text: 'Quel lecteur es-tu ?', display: true }, image: {}, skip: false },
  resultScreen: { animation: 'fade-in', displayTitle: true, displayDescription: true, imagePosition: 'inline' },
  personalities: [
    { name: DET, image: {}, description: 'Tu aimes les mystères, les indices et les frissons. Cherche les rayons Enquête et Fantastique.' },
    { name: EXP, image: {}, description: 'Tu aimes l’action, les voyages et la nature. Cherche les rayons Aventure et Animalier.' },
    { name: REV, image: {}, description: 'Tu aimes les mondes inventés, la magie ou le futur. Cherche les rayons Fantasy, Science-fiction et Mythes.' },
    { name: SEN, image: {}, description: 'Tu aimes les personnages, les sentiments et les histoires vraies. Cherche les rayons Romance et Littératures du réel.' },
  ],
  questions: [
    q('Un samedi idéal, c’est…', [['Résoudre une énigme ou un escape game', DET], ['Une randonnée ou une sortie au zoo', EXP], ['Jouer à un jeu vidéo de dragons', REV], ['Passer la journée avec mes amis', SEN]]),
    q('Au cinéma, tu choisis…', [['Un film qui fait un peu peur', DET], ['Un film de pirates ou de survie', EXP], ['Un film dans l’espace', REV], ['Une histoire d’amitié ou d’amour', SEN]]),
    q('Le héros que tu préfères…', [['Un détective qui remarque tout', DET], ['Une naufragée qui se débrouille', EXP], ['Un apprenti sorcier', REV], ['Un élève comme moi', SEN]]),
    q('Tu ouvres un livre. Tu veux d’abord…', [['Savoir qui est le coupable', DET], ['Partir loin de chez moi', EXP], ['Découvrir un monde inventé', REV], ['Ressentir des émotions', SEN]]),
    q('Ton objet porte-bonheur serait…', [['Une loupe', DET], ['Une boussole', EXP], ['Une baguette ou un robot', REV], ['Un carnet secret', SEN]]),
  ],
  startText: 'Commencer',
  progressText: 'Question @question sur @total',
  retakeText: 'Recommencer',
  animation: true,
  buttonColor: '1d3557',
  progressbarColor: 'e76f51',
};
fs.writeFileSync(`${OUT}/quel-lecteur.json`, JSON.stringify(pq));
console.log('ok livre + quel-lecteur (PersonalityQuiz 1.0)');
