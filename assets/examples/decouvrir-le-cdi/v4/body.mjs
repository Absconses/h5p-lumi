/* ================= V4 : 3 temps, roadmaps de genres, chemin buissonnier, tâche finale ================= */
// Usage : node build.mjs <gabarit extrait> <content.json> <media>   (build.mjs = lib-head.mjs + body.mjs)

/* ---------- Petits blocs de mise en forme ---------- */
const accroche = (html) => `<p style="font-size:1.05em"><em>${html}</em></p>`;
const decouvre = (html) => box(`<p><strong>🔍 Je découvre</strong></p>${html}`, '#eef4fb');
const avecAide = (html) => `<h3>🤝 Je m'entraîne, avec de l'aide si besoin</h3>${html}`;
const seul = (html) => `<h3>✋ Je fais seul·e</h3>${html}`;
const rayon = (html) => box(`<p><strong>🚶 Direction les rayons</strong></p>${html}`, '#e8f6ee');
const bonus = (html) => box(`<p><strong>⚡ Défi bonus</strong> <em>(si tu as fini avant les autres)</em></p>${html}`, '#fdf0e6');
const pouce = (title) => `<h3>🆘 Coup de pouce</h3><p>${title}</p>`;

/* ---------- Texte à trous (production) ---------- */
const BL = byLib('H5P.Blanks 1.14');
const blanks = (task, lines, title, fb) => {
  const p = clone(BL);
  p.text = `<p>${task}</p>`;
  p.questions = lines.map(l => `<p>${l}</p>`);
  p.behaviour = { ...p.behaviour, caseSensitive: false, acceptSpellingErrors: true, enableSolutionsButton: true, enableRetry: true, autoCheck: false };
  p.overallFeedback = fb || [
    { from: 0, to: 59, feedback: 'Relis le « Je découvre » plus haut, puis réessaie.' },
    { from: 60, to: 99, feedback: 'Presque ! Regarde les cases en rouge.' },
    { from: 100, to: 100, feedback: 'Bravo, tu l’as trouvé tout·e seul·e !' },
  ];
  Object.assign(p, { scoreBarLabel: 'Tu as :num points sur :total', notFilledOut: 'Remplis toutes les cases avant de voir la correction.', answerIsCorrect: '« :ans » est juste', answerIsWrong: '« :ans » n’est pas juste' });
  return sub('H5P.Blanks 1.14', p, 'Fill in the Blanks', title);
};

/* ---------- Glisser-déposer sur une image ---------- */
const DQ = byLib('H5P.DragQuestion 1.14');
// zones et étiquettes en pixels de l'image ; DragQuestion veut x/y en % et largeur/hauteur en em (16 px pour size.width).
const dragOnImage = (imgName, labels, title, intro) => {
  const p = clone(DQ);
  const bg = file(imgName);
  const W = bg.width, H = bg.height;
  const em = (px) => px / 16;
  p.question.settings = { size: { width: W, height: H }, background: bg };
  const lw = 176, lh = 34;
  p.question.task.elements = labels.map((l, i) => ({
    x: (l.from[0] / W) * 100, y: (l.from[1] / H) * 100, width: em(lw), height: em(lh),
    dropZones: labels.map((_, j) => String(j)),
    type: sub('H5P.AdvancedText 1.1', { text: `<p style="text-align:center">${l.label}</p>` }, 'Text', l.label),
    backgroundOpacity: 100, multiple: false,
  }));
  p.question.task.dropZones = labels.map((l, i) => ({
    x: ((l.to[0] - (lw + 16) / 2) / W) * 100, y: ((l.to[1] - (lh + 8) / 2) / H) * 100,
    width: em(lw + 16), height: em(lh + 8), correctElements: [String(i)], showLabel: false,
    backgroundOpacity: 40, tipsAndFeedback: { tip: l.tip || '', feedbackOnCorrect: l.ok || '', feedbackOnIncorrect: l.no || '' },
    single: true, autoAlign: true, label: `<div>${l.label}</div>`, type: { library: 'H5P.DragQuestionDropzone 0.1' },
  }));
  p.behaviour = { ...p.behaviour, applyPenalties: false, enableScoreExplanation: false, enableFullScreen: false, showTitle: false };
  p.overallFeedback = [
    { from: 0, to: 59, feedback: 'Regarde bien où pointent les flèches, puis recommence.' },
    { from: 60, to: 99, feedback: 'Presque ! Une ou deux étiquettes sont mal placées.' },
    { from: 100, to: 100, feedback: 'Parfait : tu connais toutes les parties d’un livre !' },
  ];
  Object.assign(p, { scoreShow: 'Vérifier', submit: 'Vérifier', tryAgain: 'Recommencer', scoreBarLabel: 'Tu as :num points sur :total', grabbableSuffix: 'Posée dans la zone {num}.', dropzonePrefix: 'Zone {num} sur {total}.' });
  const q = sub('H5P.DragQuestion 1.14', p, 'Drag and Drop', title);
  return intro ? [text(`<p>${intro}</p>`, `${title} (consigne)`), q] : [q];
};

/* ================= COUVERTURE ================= */
const cover = `<h2 style="text-align:center">🔎 Découvrir le CDI</h2>
<p style="text-align:center">Le CDI, c’est un endroit pour se repérer… et pour découvrir <strong>ce que tu aimes lire</strong>.</p>
<p style="text-align:center"><strong>🎯 Ta mission, à la fin de cette heure :</strong> tracer <strong>ton parcours de lecteur</strong>. Tu trouveras un livre que tu aimes, tu te situeras sur la carte de ton genre, tu choisiras le livre suivant, et un documentaire sur une de tes passions.</p>
<p style="text-align:center">⭐ étape indispensable pour la mission (si tu es en retard, fais-la en priorité) · 🌿 chemin buissonnier · ⚡ défi bonus</p>
<p style="text-align:center"><em>EMI · 6e · environ 1 heure · 9 étapes</em></p>`;

/* ===== Ch.1 Où est le CDI ? ===== */
const ch1 = chapter('1. Où est le CDI ?', [
  text(`${banner('Étape 1', 'Où se trouve le CDI ?', 3)}
<p>Tu dois savoir trouver le <strong>CDI</strong> (le <strong>Centre de Documentation et d’Information</strong>) sans qu’on t’y emmène. Sur le plan, repère d’abord le <strong>pavillon Bellevue</strong>, puis cherche la grande salle <strong>juste à côté du hall rond et du salon des visiteurs</strong>.</p>`, 'Intro'),
  findHotspot('plan-ecole.jpg', 'Clique sur le CDI sur le plan.', [
    { ok: true, x: 52.2, y: 32.6, w: 10.1, h: 14.8, fb: 'Bravo ! Le CDI se trouve dans le pavillon Bellevue, juste à côté du hall rond et du salon des visiteurs.' },
    { ok: false, x: 84.5, y: 0, w: 15.5, h: 22.5, fb: 'Ici, c’est la villa Rouge. Le CDI est plus près du centre du plan, dans le pavillon Bellevue.' },
    { ok: false, x: 88.5, y: 29, w: 11.5, h: 50, fb: 'Ici, c’est la villa Blanche. Cherche plutôt le hall rond du pavillon Bellevue.' },
    { ok: false, x: 35.5, y: 33.5, w: 8.5, h: 17, fb: 'Ça, c’est le petit gymnase ! Le CDI est un peu plus à droite, après le hall rond.' },
  ], 'Pas tout à fait. Repère le hall rond (un cercle sur le plan) : le CDI est la grande salle juste à sa droite.', 'Trouver le CDI'),
  text(retiens('<p>Le CDI est au <strong>pavillon Bellevue</strong>, à côté du <strong>hall</strong> rond et du <strong>salon des visiteurs</strong>.</p>'), 'Je retiens'),
  image('plan-cdi.jpg', 'Zoom sur le plan : le CDI à côté du hall rond et du salon des visiteurs', 'Zoom CDI'),
]);

/* ===== Ch.2 À quoi sert le CDI ? ===== */
const ch2 = chapter('2. À quoi sert le CDI ?', [
  text(`${banner('Étape 2', 'À quoi sert le CDI ?', 6)}
${decouvre('<p>Souviens-toi de la <strong>carte mentale</strong> que nous avons construite ensemble en classe. Elle montre les <strong>4 grandes missions</strong> du CDI.</p>')}`, 'Intro'),
  image('carte-mentale-cdi.jpg', 'Carte mentale : le CDI permet de s’informer, d’apprendre, de produire et de vivre ensemble', 'Carte mentale'),
  text(avecAide('<p>Lis bien chaque proposition : certaines ont un piège.</p>'), 'Accompagné'),
  mc('Qu’est-ce qu’on peut faire au CDI ? <strong>Coche toutes les bonnes réponses.</strong>', [
    ['Lire un magazine ou un journal jeunesse', true, 'Oui : c’est s’informer.'],
    ['Faire une recherche pour un exposé', true, 'Oui : c’est apprendre.'],
    ['Emprunter un roman pour le lire chez soi', true, 'Oui : le CDI prête des livres.'],
    ['Jouer à un jeu de société à l’heure du midi', true, 'Oui : c’est vivre ensemble et se détendre, dans le calme.'],
    ['Préparer un exposé en groupe en parlant très fort', false, 'Travailler en groupe, oui ! Mais à voix basse, pour respecter ceux qui lisent.'],
    ['Manger son goûter en lisant un magazine', false, 'Lire un magazine, oui. Mais on ne mange pas au CDI, pour protéger les livres.'],
  ], 'Que faire au CDI ?'),
  text(seul('<p>Voici des élèves que tu n’as jamais vus. Que viennent-ils faire au CDI ?</p>'), 'Seul'),
  dragText('Glisse la bonne mission dans chaque phrase.', [
    'Léa feuillette le dernier numéro d’un magazine d’actualité. Elle vient *s’informer*.',
    'Tom révise sa leçon à la table d’étude. Il vient *apprendre*.',
    'Inès crée une affiche sur Canva pour son exposé. Elle vient *produire*.',
    'Noah joue à un jeu de société avec ses camarades le midi. Il vient *vivre ensemble et se détendre*.',
    'Sarah consulte un documentaire sur les volcans. Elle vient *s’informer*.',
    'La classe accroche ses affiches sur la grille d’exposition. Elle vient *produire*.',
  ], 'Les 4 missions'),
  text(retiens('<p>Au CDI, je peux <strong>m’informer</strong>, <strong>apprendre</strong>, <strong>produire</strong> et <strong>vivre ensemble / me détendre</strong>. C’est un lieu calme qui appartient à tous : je respecte les autres et les documents.</p>'), 'Je retiens'),
]);

/* ===== Ch.3 Chemin buissonnier : le voyage d'un livre (non noté) ===== */
const RAW = 'https://raw.githubusercontent.com/Absconses/h5p-lumi/main/partage/decouvrir-le-cdi/circuit-du-livre-v2.h5p';
const CSS = 'https://cdn.jsdelivr.net/gh/Absconses/h5p-lumi@main/partage/embed-960.css';
const CIRCUIT = `https://h5p-offline-player.vercel.app/embed?src=${RAW}`;
const GRAND = `https://h5p-offline-player.vercel.app/embed?src=${encodeURIComponent(RAW)}&custom-css=${encodeURIComponent(CSS)}`;
const ch3 = chapter('3. 🌿 Le voyage d’un livre', [
  text(`<h2 style="color:#2d6a4f">🌿 Chemin buissonnier · Le voyage d’un livre</h2><p style="color:#555555"><em>⏱ le temps que tu veux · rien n’est noté</em></p>
${accroche('Avec les livres, on voyage sans bouger de sa chambre. Mais le livre lui-même, d’où vient-il ? Lui aussi a fait un long voyage avant d’arriver sur l’étagère.')}
<p>Ici, pas d’exercice à réussir. <strong>Promène-toi</strong> sur la carte de la ville du livre en suivant « Le Secret du phare ». Avance avec la flèche →, arrête-toi où tu veux, reviens en arrière si ça te plaît.</p>`, 'Intro'),
  sub('H5P.IFrameEmbed 1.0', { source: CIRCUIT, width: '1000', height: '650', minWidth: '280', resizeSupported: true }, 'Iframe Embedder', 'Le circuit d’un livre'),
  text(`<p style="font-size:0.9em">Le cadre est trop petit ? <a href="${GRAND}" target="_blank" rel="noopener">Ouvrir le voyage du livre en grand</a>.</p>
<p><em>La prochaine fois que tu tiendras un livre du CDI, pense à tout ce chemin : une autrice, un éditeur, une imprimerie, une librairie… et le professeur documentaliste qui l’a préparé pour toi.</em></p>`, 'Fin de balade'),
]);

/* ===== Ch.4 Emprunter ===== */
const ch4 = chapter('4. Emprunter un livre', [
  text(`${banner('Étape 4', 'Emporter un livre chez soi', 4)}
${avecAide('<p>Souviens-toi de ce que nous avons fait ensemble au comptoir du CDI.</p>')}`, 'Intro'),
  dragText('<strong>Remets les étapes du prêt dans l’ordre.</strong>', [
    'Étape 1 → *Je choisis un livre dans les rayons*',
    'Étape 2 → *Je vais voir le professeur documentaliste avec le livre*',
    'Étape 3 → *Il enregistre le prêt à mon nom*',
    'Étape 4 → *Il me donne la date de retour*',
    'Étape 5 → *Je rapporte le livre avant la date prévue*',
    'Étape 6 → *Il enregistre le retour et je peux emprunter à nouveau*',
  ], 'Le prêt', [
    { from: 0, to: 59, feedback: 'Pense à l’ordre logique : choisir, faire enregistrer, lire, rapporter.' },
    { from: 60, to: 99, feedback: 'Presque ! Vérifie les étapes en rouge.' },
    { from: 100, to: 100, feedback: 'Parfait : tu sais emprunter un livre !' },
  ]),
  text(seul('<p>Et dans ces situations-là, que se passe-t-il ?</p>'), 'Seul'),
  tf('Je peux emporter un livre chez moi sans le faire enregistrer, si je le rapporte vite.', false,
    'Exact : un prêt doit toujours être enregistré, sinon le livre est considéré comme perdu.',
    'Non : sans enregistrement, personne ne sait où est le livre. On le fait toujours enregistrer.', 'Prêt enregistré'),
  tf('Mon cousin veut lire mon livre du CDI : je peux le lui prêter, puisqu’il est enregistré à mon nom.', false,
    'Exact : le livre est enregistré à ton nom, c’est toi qui en es responsable jusqu’au retour.',
    'Non : c’est justement parce qu’il est à ton nom que tu en es responsable. Si ton cousin est au collège, il peut l’emprunter lui-même.', 'Prêter à son cousin'),
]);

/* ===== Ch.5 Lire un livre comme un détective ⭐ ===== */
const ch5 = chapter('5. ⭐ Un livre, de la couverture au dos', [
  text(`${banner('Étape 5', 'Observer un livre comme un détective', 7)}
${accroche('Pour choisir un livre, tu ne peux pas tous les lire en entier ! Il faut savoir où chercher les indices.')}
${avecAide('<p>Glisse chaque étiquette au bout de sa flèche.</p>')}`, 'Intro'),
  ...dragOnImage('parties-livre-vierge.jpg', [
    { label: 'Tranche', from: [12, 672], to: [515, 36], tip: 'C’est le côté où l’on voit les pages.' },
    { label: 'Quatrième de couverture', from: [200, 672], to: [158, 125], tip: 'C’est le dos plat du livre, derrière : souvent le résumé.' },
    { label: 'Première de couverture', from: [388, 672], to: [617, 233], tip: 'C’est ce qu’on voit en premier : titre, auteur, illustration.' },
    { label: 'Couverture', from: [100, 724], to: [591, 460], tip: 'C’est tout ce qui entoure le livre.' },
    { label: 'Dos', from: [300, 724], to: [130, 634], tip: 'C’est la seule partie visible quand le livre est rangé.' },
  ], 'Parties du livre'),
  text(decouvre(`<p>Regarde comment je lis la <strong>cote</strong>, l’« adresse » du livre collée sur le <strong>dos</strong>.</p>
<p>Sur le dos du roman <em>L’été où je suis devenue jolie</em>, de Jenny Han, je vois une <strong>pastille rose</strong> et les lettres <strong>HAN</strong>.</p>
<ul><li>Je me dis : la pastille rose, c’est le genre <strong>romance</strong>. Je vais donc au rayon des romances.</li>
<li>Puis : HAN, ce sont les <strong>3 premières lettres du nom de l’autrice</strong>. Dans le rayon, les livres sont rangés par ordre alphabétique : je cherche à la lettre <strong>H</strong>.</li></ul>
<p>Pour un <strong>documentaire</strong>, c’est pareil, mais la pastille est remplacée par un <strong>nombre</strong> (le sujet, étape 7).</p>`), 'Je découvre la cote'),
  text(seul(''), 'Seul'),
  blanks('Écris ce que tu trouveras sur le dos de ces livres.', [
    'Le roman <em>Le Secret du phare</em>, de Claire Dubois, est un roman d’enquête. Sur son dos : une pastille *rouge:Regarde la couleur du genre enquête* et les lettres *DUB:Les 3 premières lettres du nom de l’autrice*.',
    'Le documentaire <em>Tout sur les océans</em>, de Lucie Martin, est rangé en sciences. Sur son dos : un nombre de la classe *500* et les lettres *MAR*.',
  ], 'Lire une cote'),
  dragText('<strong>Où ranger chaque livre ?</strong> Tout dépend de sa nature.', [
    '« Le Secret du phare » raconte une histoire inventée : c’est un *roman*. Il est rangé par *genre*, grâce à sa *pastille*.',
    '« Tout sur les océans » explique le monde réel : c’est un *documentaire*. Il est rangé par *sujet*, grâce à son numéro *Dewey*.',
  ], 'Roman ou documentaire ?'),
  text(retiens(`<ul>
<li>Sur la <strong>première de couverture</strong> : le titre, l’auteur, l’illustration. Sur la <strong>quatrième</strong> : le résumé, pour savoir si le livre va me plaire.</li>
<li>La <strong>cote</strong> est sur le <strong>dos</strong>. Roman : <strong>pastille</strong> (genre) + 3 lettres de l’auteur. Documentaire : <strong>nombre Dewey</strong> (sujet) + 3 lettres de l’auteur.</li>
</ul>`), 'Je retiens'),
]);

/* ===== Roadmaps de genres (cartes du professeur documentaliste) ===== */
// NOMAPS=1 : version publique sans les cartes (elles contiennent des couvertures réelles).
const MAPS = [
  ['enquête et policier', 'policier'], ['fantasy', 'fantasy'], ['fantastique', 'fantastique'], ['science-fiction et dystopie', 'sf'], ['aventure', 'aventure'],
  ['romance', 'romance'], ['mythes et récits historiques', 'mythes'], ['humour', 'humour'], ['société et tranches de vie', 'societe'], ['roman classique', 'classique'],
];
// Une carte entière est illisible dans la colonne du livre : pour chaque genre, un diaporama
// carte entière → moitié gauche (niveaux 1-2) → moitié droite (niveaux 3-4), à pleine largeur.
// La carte entière en Image (proportions justes), puis un diaporama des deux moitiés zoomées
// (niveaux 1-2, niveaux 3-4). Les deux moitiés ont le même format : pas de vide sous le diaporama.
const roadmap = ([g, f]) => [
  image(`roadmap-${f}.jpg`, `Carte du genre ${g}, du plus accessible au moins accessible`, `Carte ${g}`),
  sub('H5P.ImageSlider 1.1', {
    // Liste à un seul champ : chaque élément EST la bibliothèque ImageSlide (pas { imageSlide: … }).
    imageSlides: [
      [`roadmap-${f}-a.jpg`, `Carte du genre ${g}, niveaux 1 et 2 (zoom)`],
      [`roadmap-${f}-b.jpg`, `Carte du genre ${g}, niveaux 3 et 4 (zoom)`],
    ].map(([img, alt]) => sub('H5P.ImageSlide 1.1', { image: image(img, alt, alt) }, 'Image Slide', alt)),
    aspectRatioMode: 'auto',
    a11y: { nextSlide: 'Niveaux 3 et 4', prevSlide: 'Niveaux 1 et 2', gotoSlide: 'Aller à l’image %slide' },
  }, 'Image Slider', `Zoom ${g}`),
];
const EMO = { policier: '🕵️', fantasy: '🐉', fantastique: '👻', sf: '🚀', aventure: '🧭', romance: '💗', mythes: '🏛️', humour: '😂', societe: '🏙️', classique: '🖋️' };
const ch6bis = chapter('6 bis. 🌿 Les cartes des genres', [
  text(`<h2 style="color:#2d6a4f">🌿 Chemin buissonnier · Les cartes des genres</h2><p style="color:#555555"><em>⏱ le temps que tu veux · rien n’est noté</em></p>
<p>Et si tu voyais tes lectures comme un <strong>voyage</strong> ?</p>
<p>Chacune de ces cartes dessine un <strong>parcours de lecteur</strong> à travers un genre : on part des îles les plus accessibles (niveau 1, souvent des BD) pour aller, petit à petit, vers le continent des grands textes (niveau 4). Elles servent à deux choses : <strong>te situer</strong> (où en es-tu, toi, dans ce genre ?) et, <strong>si l’envie t’en prend</strong>, <strong>avancer</strong> d’une étape pour mieux connaître un genre que tu aimes.</p>
<p>Personne ne t’oblige à aller jusqu’au bout : chaque île vaut le voyage. Prends ton temps, flâne d’une carte à l’autre, laisse-toi tenter par une couverture, même dans un genre que tu n’as jamais essayé.</p>
<p>Sous chaque carte, les flèches font un <strong>zoom</strong> : niveaux 1 et 2, puis niveaux 3 et 4. Un titre te fait de l’œil ? Note-le : il pourrait bien devenir ta prochaine lecture.</p>`, 'Intro cartes'),
  ...MAPS.flatMap(([g, f]) => [text(`<h3>${EMO[f]} ${g[0].toUpperCase() + g.slice(1)}</h3>`, `Titre ${g}`), ...roadmap([g, f])]),
]);

/* ===== Ch.6 Les genres ⭐ ===== */
const ch6 = chapter('6. ⭐ Trouver ses genres préférés', [
  text(`${banner('Étape 6', 'Reconnaître les genres de romans', 10)}
${accroche('Tu as aimé un livre ? Le plus beau, c’est de trouver le suivant.')}
<p>Au CDI, les romans sont classés par <strong>genre</strong>. Savoir reconnaître un genre, c’est le premier pas pour trouver <strong>les livres qui te ressemblent</strong>.</p>`, 'Intro'),
  text(decouvre(`<p>Regarde comment je devine le genre d’un livre en lisant sa <strong>quatrième de couverture</strong> :</p>
<p style="padding-left:1em;border-left:3px solid #8aa;">En <strong>2150</strong>, la Terre est devenue trop chaude pour y vivre. Lina, douze ans, embarque à bord d’un immense <strong>vaisseau</strong> en route vers une nouvelle <strong>planète</strong>. Mais le <strong>robot</strong> qui pilote le navire se met à désobéir…</p>
<p>Je me dis : « 2150 », c’est le <strong>futur</strong>. « Vaisseau » et « planète », c’est l’<strong>espace</strong>. « Robot », c’est une <strong>technologie</strong> qui n’existe pas encore. Trois indices vont dans le même sens : c’est de la <strong>science-fiction</strong>.</p>`), 'Je découvre'),
  text(seul('<p>À ton tour, sur une autre quatrième de couverture.</p>'), 'Seul'),
  markWords('Clique sur les <strong>5 mots-indices</strong> qui montrent que c’est un <strong>roman d’enquête</strong>.',
    '<p>Le jour de la fête du collège, le trophée de football *disparaît* de la vitrine. Personne n’a rien vu… sauf Malik, qui remarque un *indice* étrange : une trace de peinture bleue. Avec son amie Jade, il mène l’*enquête*. Chaque *suspect* a un alibi. Qui pourra résoudre ce *mystère* ?</p>', 'Indices enquête',
    [
      { from: 0, to: 59, feedback: 'Cherche les mots qui parlent de vol, de crime, de détective.' },
      { from: 60, to: 99, feedback: 'Bien vu ! Il reste un ou deux indices à trouver.' },
      { from: 100, to: 100, feedback: 'Excellent détective : tu as trouvé tous les indices !' },
    ]),
  text(`${avecAide(`<p><strong>Fantasy, fantastique ou science-fiction ?</strong> Ces trois genres ont tous quelque chose de <strong>surnaturel</strong>, et on les confond souvent. Lis les trois affiches, puis fais l’exercice.</p>`)}`, 'Trois genres proches'),
  image('affiche-fantasy.jpg', 'Affiche : le genre Fantasy', 'Affiche Fantasy'),
  image('affiche-fantastique.jpg', 'Affiche : le genre Fantastique', 'Affiche Fantastique'),
  image('affiche-sf.jpg', 'Affiche : le genre Science-fiction', 'Affiche Science-fiction'),
  dragText('<strong>Quel type de surnaturel ?</strong> Glisse le bon mot.', [
    'En fantasy, le surnaturel vient de la *magie*, dans un monde inventé.',
    'Dans le fantastique, *quelque chose d’étrange* surgit dans notre monde réel et on hésite à y croire.',
    'En science-fiction, le surnaturel s’explique par une *technologie avancée*, souvent dans le futur.',
  ], 'Type de surnaturel'),
  text(seul('<p><strong>Devine le genre grâce à la couverture.</strong> Observe l’image, les couleurs, les personnages et le titre.</p>'), 'Couvertures'),
  ...[
    ['couv-romance.jpg', 'Couverture : L’été où je suis devenue jolie, de Jenny Han', 'Romance', ['Romance', 'Littératures du réel', 'Humour', 'Aventure'],
      { ok: 'Un garçon, une fille, une lumière d’été et un titre sur les sentiments : c’est une romance.', 'Littératures du réel': 'Tentant : l’histoire se passe dans la vie de tous les jours. Mais le titre et l’image parlent surtout d’amour.', Humour: 'Rien de drôle ni de maladroit ici : regarde le couple et la lumière douce.', Aventure: 'Pas de voyage dangereux ni d’épreuve : c’est une histoire de sentiments.' }],
    ['couv-sf.jpg', 'Couverture : L’Étoile de Pandore, de Peter F. Hamilton', 'Science-fiction', ['Fantasy', 'Science-fiction', 'Aventure', 'Littératures du réel'],
      { ok: 'Un vaisseau spatial et une autre planète : c’est de la science-fiction.', Fantasy: 'Il y a bien un monde inventé, mais avec un vaisseau, pas de la magie : c’est la technologie qui compte.', Aventure: 'Tentant, il y a du voyage ! Mais un voyage dans l’espace, avec un vaisseau : c’est le signe de la science-fiction.', 'Littératures du réel': 'Rien de notre vie de tous les jours ici : regarde le vaisseau et la planète.' }],
    ['couv-fantastique.jpg', 'Couverture : un livre de la collection Chair de poule', 'Fantastique', ['Enquête', 'Fantastique', 'Science-fiction', 'Humour'],
      { ok: 'Une créature inquiétante dans un décor ordinaire, une collection qui fait peur : c’est du fantastique.', Enquête: 'Il y a un mystère, c’est vrai. Mais ici, c’est une créature surnaturelle qui fait peur, pas un crime à résoudre.', 'Science-fiction': 'Aucune technologie du futur : c’est l’étrange qui surgit dans notre monde.', Humour: 'Le titre peut faire sourire, mais l’image veut surtout faire peur.' }],
    ['couv-fantasy.jpg', 'Couverture : Le Seigneur des Anneaux, de J.R.R. Tolkien', 'Fantasy', ['Mythes et récits historiques', 'Fantastique', 'Fantasy', 'Aventure'],
      { ok: 'Un magicien, un monde imaginaire, des épées : c’est de la fantasy.', 'Mythes et récits historiques': 'Tentant : on dirait le passé, avec des épées. Mais ce monde est inventé, avec de la magie.', Fantastique: 'Le fantastique se passe dans notre monde réel. Ici, le monde est entièrement inventé.', Aventure: 'Il y a bien une grande quête, mais avec un magicien : la magie fait de ce livre une fantasy.' }],
  ].map(([img, alt, ok, opts, fb], i) => mc('À quel genre appartient ce livre ?',
    opts.map(g => [g, g === ok, g === ok ? fb.ok : fb[g]]), `Couverture ${i + 1}`, { media: img, alt })),
  text(pouce('Tu hésites entre deux genres ? Ouvre ces fiches.'), 'Coup de pouce genres'),
  accordion(GENRES.map(([g, c, d]) => [g, `<p>On y trouve souvent : <strong>${d}</strong>.</p>`]), 'Les 9 genres'),
  text(rayon('<p>Lève-toi et va observer les <strong>pastilles</strong> sur le dos des romans. Reviens ensuite remplir l’exercice.</p>'), 'Rayons pastilles'),
  dragText('<strong>Quelle est la couleur de la pastille ?</strong> Glisse la couleur que tu as vue dans les rayons.',
    GENRES.map(([g, c]) => `${g} → pastille *${c}*`), 'Couleurs des genres'),
  text(bonus('<p>Trouve dans les rayons un roman dont <strong>tu hésites à deviner le genre</strong>. Compare ta réponse avec sa pastille : qu’est-ce qui t’a trompé·e ?</p>'), 'Bonus genres'),
  text(retiens('<p>Pour reconnaître un genre, j’observe <strong>la pastille</strong>, <strong>l’illustration</strong>, <strong>le titre</strong>, et je lis <strong>la quatrième de couverture</strong> pour y repérer des <strong>mots-indices</strong>.</p>'), 'Je retiens'),
]);

/* ===== Ch.7 Dewey ⭐ ===== */
const ch7 = chapter('7. ⭐ Les documentaires et la classification Dewey', [
  text(`${banner('Étape 7', 'Explorer le monde réel avec les documentaires', 7)}
${accroche('Un livre de recettes de cuisine n’invente pas d’histoire : il explique quelque chose de réel. C’est un documentaire.')}
<p>Les documentaires ne sont pas rangés par genre, mais par <strong>sujet</strong>, grâce à un système inventé en 1876 par l’Américain <strong>Melvil Dewey</strong>. Il a partagé tous les savoirs en <strong>10 grandes classes</strong>, de 000 à 900.</p>`, 'Intro'),
  image('dewey.jpg', 'Les 10 classes de la classification décimale de Dewey', 'Tableau Dewey'),
  text(decouvre(`<p>Regarde comment je range un livre de recettes de cuisine :</p>
<ol><li>Je me demande : <strong>de quoi parle-t-il ?</strong> De cuisine, c’est-à-dire de savoir-faire pratiques.</li>
<li>Je cherche la <strong>grande classe</strong> : les savoir-faire pratiques, ce sont les <strong>techniques</strong>. Donc <strong>600</strong>.</li>
<li>Le nombre exact est plus <strong>précis</strong> : pour la cuisine, c’est <strong>641</strong>. Plus le nombre est long, plus le sujet est précis.</li></ol>`), 'Je découvre Dewey'),
  text(avecAide(''), 'Accompagné'),
  dragText('<strong>Dans quelle classe Dewey ranger ces documentaires ?</strong> Aide-toi du tableau.', [
    'Les grands peintres du XXe siècle → *700 Arts et loisirs*',
    'Apprendre à programmer avec Scratch → *000 Informatique, généralités*',
    'Les étoiles et les planètes → *500 Sciences*',
    'Les droits de l’enfant expliqués → *300 Sciences sociales*',
    'La maison écolo, bricoler sans polluer → *600 Techniques*',
    'Mythes et dieux de l’Olympe → *200 Religions et mythologie*',
    'Grammaire facile du français → *400 Langues*',
    'Les grandes questions, qu’est-ce que le bonheur ? → *100 Philosophie et psychologie*',
    'La Révolution française → *900 Histoire et géographie*',
  ], 'Classer en Dewey'),
  text(pouce('Tu hésites ? Ouvre la classe qui te semble la bonne.'), 'Coup de pouce Dewey'),
  accordion(DEWEY.map(([n, t, ex]) => [`${n} — ${t}`, `<p>Exemples : ${ex}.</p>`]), 'Les 10 classes'),
  text(seul(''), 'Seul'),
  mc('Sur le dos d’un documentaire sur les volcans, tu lis : <strong>551.21 MON</strong>. Que veut dire <strong>MON</strong> ?', [
    ['Les trois premières lettres du nom de l’auteur', true, 'Oui : comme pour les romans. L’auteur s’appelle peut-être Monnier ou Montel.'],
    ['Les trois premières lettres du titre du livre', false, 'Non : le titre n’est pas dans la cote. Les lettres renvoient toujours à l’auteur.'],
    ['Les trois premières lettres du sujet, les montagnes', false, 'Tentant ! Mais le sujet est déjà donné par le nombre 551.21. Les lettres, elles, renvoient à l’auteur.'],
  ], 'Lire une cote de documentaire'),
  blanks('Complète avec le bon mot ou le bon nombre.', [
    'Les documentaires sont rangés par *sujet/thème* grâce à la classification *Dewey*.',
    'Un livre sur les animaux de la savane porte un nombre de la classe *500*.',
    'Un livre sur l’histoire du football porte un nombre de la classe *700:Le sport, c’est un loisir…*.',
  ], 'Texte Dewey'),
  text(rayon('<p>Choisis un sujet qui te passionne (le foot, les chats, l’espace, le dessin…). Cherche sa classe dans le tableau, puis va voir dans les rayons s’il y a des documentaires sur ce sujet. Retiens le nombre : il te servira pour la mission !</p>'), 'Rayons Dewey'),
  text(bonus('<p>Trouve dans les rayons le documentaire dont le <strong>nombre Dewey est le plus long</strong>. De quoi parle-t-il ? Pourquoi son nombre est-il si précis ?</p>'), 'Bonus Dewey'),
  text(retiens('<p>Romans → rangés par <strong>genre</strong> (pastille) puis par <strong>auteur</strong>. Documentaires → rangés par <strong>sujet</strong>, avec le <strong>nombre Dewey</strong> (000 à 900).</p>'), 'Je retiens'),
]);

/* ===== Ch.8 Je vérifie ===== */
const ch8 = chapter('8. Je vérifie avant la mission', [
  text(`${banner('Étape 8', 'Es-tu prêt·e pour la mission ?', 3)}
<p>Pour chaque ligne, clique sur la <strong>phrase juste</strong>. Si tu te trompes, retourne voir l’étape qui correspond.</p>`, 'Intro'),
  summary('Choisis la phrase exacte.', [
    ['Le CDI se trouve au pavillon Bellevue, à côté du hall.', 'Le CDI se trouve dans la villa Rouge, près du préau.', 'Le CDI se trouve dans la villa Blanche, au premier étage.'],
    ['Au CDI, je peux m’informer, apprendre, produire et me détendre.', 'Au CDI, je viens seulement faire des recherches obligatoires.', 'Au CDI, je peux bavarder librement avec mes amis.'],
    ['Pour emprunter un livre, je le fais enregistrer par le professeur documentaliste.', 'Pour emprunter un livre, je le prends simplement dans mon sac.', 'Pour emprunter un livre, je dois d’abord le lire en entier sur place.'],
    ['Les romans sont rangés par genre, puis par ordre alphabétique d’auteur.', 'Les romans sont rangés par taille, du plus petit au plus grand.', 'Les romans sont rangés par couleur de couverture, puis par titre.'],
    ['La fantasy utilise la magie, la science-fiction la technologie.', 'La fantasy utilise la technologie, la science-fiction la magie.', 'La fantasy et la science-fiction racontent toujours des histoires vraies.'],
    ['Les documentaires sont rangés par sujet grâce à la classification Dewey.', 'Les documentaires sont rangés par ordre alphabétique de titre.', 'Les documentaires sont rangés selon leur date de parution.'],
  ], 'Bilan'),
]);

/* ===== Ch.9 La mission ⭐ (Documentation Tool, export du document) ===== */
const field = (task, ph, rows = '1') => sub('H5P.TextInputField 1.2', { taskDescription: task, placeholderText: ph, inputFieldSize: rows, requiredField: false, remainingChars: 'Caractères restants : @chars' }, 'Text Input Field', 'Champ');
const dtext = (html) => sub('H5P.Text 1.1', { text: html }, 'Text', 'Texte');
const page = (title, elements, helpText) => sub('H5P.StandardPage 1.5', { elementList: elements, helpTextLabel: 'Besoin d’aide ?', ...(helpText ? { helpText } : {}) }, 'Standard page', title);
const parcours = sub('H5P.DocumentationTool 1.8', {
  taskDescription: 'Mon parcours de lecteur',
  pagesList: [
    page('1. Je me repère', [
      dtext('<p>Dans les rayons des romans, trouve un livre d’un <strong>genre que tu aimes</strong> (ou qui te tente).</p>'),
      field('Prénom, nom et classe :', 'Léa Martin, 6e B'),
      field('Titre et auteur du roman :', '« … », de …'),
      field('Son genre et la couleur de sa pastille :', 'Enquête, pastille rouge'),
      field('Sa cote complète :', 'pastille + 3 lettres'),
    ], '<p>La cote est collée sur le dos du livre. Pour un roman : la pastille de couleur et les 3 premières lettres du nom de l’auteur.</p>'),
    page('2. Je me situe', [
      dtext(process.env.NOMAPS
        ? '<p>Demande à ton professeur la <strong>carte de ton genre</strong> (du niveau 1 au niveau 4).</p>'
        : '<p>Retourne voir la <strong>carte de ton genre</strong> (étape 6 bis), ou l’affiche près des rayons.</p>'),
      field('Sur la carte de mon genre, je me situe au niveau… parce que…', 'Niveau 2, parce que j’ai déjà lu…', '3'),
    ], '<p>Pas de bonne ou de mauvaise réponse : le niveau 1 n’est pas « pour les petits ». C’est juste le point de départ.</p>'),
    page('3. Je creuse', [
      dtext('<p>Trouve un <strong>deuxième livre</strong> qui ressemble au premier : le livre suivant sur la carte, le même auteur, ou le même genre. Va le chercher dans les rayons.</p>'),
      field('Titre et auteur :', '« … », de …'),
      field('Sa cote :', 'pastille + 3 lettres'),
      field('Il ressemble au premier parce que… (cite un indice de sa quatrième de couverture)', 'Comme dans le premier, il y a… La quatrième de couverture parle de…', '3'),
    ], '<p>Lis la quatrième de couverture : c’est là que se trouvent les mots-indices.</p>'),
    page('4. Je m’aventure', [
      dtext('<p>Trouve un <strong>documentaire</strong> sur une de tes passions.</p>'),
      field('Ma passion :', 'le foot, les chats, l’espace…'),
      field('Titre du documentaire :', '« … »'),
      field('Son nombre Dewey et sa grande classe :', '796, classe 700 Arts, loisirs, sports'),
    ], '<p>Cherche d’abord la grande classe dans le tableau Dewey (étape 7), puis va au rayon qui porte ce nombre. Tu ne sais pas quoi chercher ? Essaie le 500 (animaux, Terre, espace) ou le 700 (sports, dessin, musique).</p>'),
    page('5. J’emprunte', [
      field('Le livre que j’emprunte aujourd’hui (si j’en ai envie) :', '« … »'),
    ]),
    page('6. Je repense à mon heure', [
      field('Ce qui m’a le plus aidé·e aujourd’hui :', '', '3'),
      field('Ce qui a été difficile :', '', '3'),
      field('Le livre que j’ai le plus envie de lire :', '', '1'),
    ]),
    sub('H5P.DocumentExportPage 1.5', {
      description: '<p>Bravo ! Clique sur <strong>Créer mon document</strong> pour voir ton parcours, puis <strong>Exporter</strong> pour le télécharger et le rendre à ton professeur.</p>',
      createDocumentLabel: 'Créer mon document', submitTextLabel: 'Envoyer', submitSuccessTextLabel: 'Ton parcours a été envoyé !',
      selectAllTextLabel: 'Tout sélectionner', exportTextLabel: 'Exporter', helpTextLabel: 'Besoin d’aide ?',
      requiresInputErrorMessage: 'Des champs sont encore vides sur ces pages : @pages',
    }, 'Document export page', 'Exporter'),
  ],
  i10n: { previousLabel: 'Précédent', nextLabel: 'Suivant', closeLabel: 'Fermer' },
}, 'Documentation Tool', 'Mon parcours de lecteur');

const ch9 = chapter('9. ⭐ Ma mission : mon parcours de lecteur', [
  text(`<h2 style="color:#1d3557">🎯 Ma mission · Mon parcours de lecteur</h2><p style="color:#555555"><em>⏱ environ 15 minutes · dans les rayons</em></p>
${accroche('Un bon lecteur ne lit pas au hasard : il suit ses envies, d’un livre à l’autre. À toi de tracer ton propre chemin dans le CDI.')}
<p>Pars dans les rayons avec ta tablette ou ton ordinateur. Tu rempliras ton parcours page par page, <strong>au fil de tes découvertes</strong>.</p>`, 'Intro'),
  text(`<h3>Comment ton parcours sera regardé</h3>
<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
<tr><th>Critère</th><th>Ce qu’on regarde</th></tr>
<tr><td>1. Je me repère</td><td>Les cotes sont justes : on peut retrouver les livres dans les rayons.</td></tr>
<tr><td>2. Je creuse</td><td>Le 2ᵉ livre prolonge vraiment le 1ᵉʳ, et je l’explique avec un indice.</td></tr>
<tr><td>3. Je m’aventure</td><td>Le documentaire correspond à ma passion et à la bonne classe Dewey.</td></tr>
</table>`, 'Grille'),
  parcours,
]);

/* ================= LIVRE ================= */
const book = clone(tpl);
book.showCoverPage = true;
book.bookCover = { coverDescription: cover, coverMedium: image('carte-mentale-cdi.jpg', 'Le CDI, un espace informationnel', 'Couverture') };
book.chapters = [ch1, ch2, ch3, ch4, ch5, ch6, ...(process.env.NOMAPS ? [] : [ch6bis]), ch7, ch8, ch9];
fs.writeFileSync(OUT, JSON.stringify(book));
console.log('OK', book.chapters.length, 'chapitres');
