// Livre vitrine « S'informer, vérifier, publier » (EMI, cycle 4) : un type H5P différent par chapitre.
// Natifs (notés sur Lumi Nuage quand le type a un score) + types refusés par la Column en cadre
// (H5P.IFrameEmbed, lecteur hors ligne, jamais notés). Chaque chapitre commence par une fiche technique.
// usage : node book.mjs <gabarit_interactivebook_reporter_extrait> <base_url_partage> <c.json journalisme-ia> <iv-base.json> <tl-credits.json> <sortie>
import fs from 'fs';
import { text, image, mc, tf, scs, summary, sub, guid } from './fr.mjs';
import { dragText, markWords, essay } from './cp.mjs';
const [TPL, BASE, JIA, IVB, TLC, OUT] = process.argv.slice(2);
const base = JSON.parse(fs.readFileSync(`${TPL}/content/content.json`, 'utf8'));
const jia = JSON.parse(fs.readFileSync(JIA, 'utf8'));
const ivBase = JSON.parse(fs.readFileSync(IVB, 'utf8'));
const tlc = JSON.parse(fs.readFileSync(TLC, 'utf8'));
const clone = (o) => JSON.parse(JSON.stringify(o));
const fresh = (o) => { const c = clone(o); const w = (n) => { if (n && typeof n === 'object') { if (n.subContentId) n.subContentId = guid(); Object.values(n).forEach(w); } }; w(c); return c; };

const PLAYER = 'https://h5p-offline-player.vercel.app/embed?src=';
const RAW = 'https://raw.githubusercontent.com/Absconses/h5p-lumi/main/partage';
const NARROW = '&custom-css=' + encodeURIComponent('https://cdn.jsdelivr.net/gh/Absconses/h5p-lumi@main/partage/embed-960.css');

/* ---------- briques communes ---------- */
const iframe = (url, w, h, title) => sub('H5P.IFrameEmbed 1.0',
  { source: url, width: String(w), height: String(h), minWidth: '280', resizeSupported: true }, 'Iframe Embedder', title);
// path : chemin sous partage/ (modules déjà publiés) ou fichier de ce livre (BASE)
const module = (path, w, h, title, consigne, { narrow = false, scripts = false } = {}) => {
  const url = `${PLAYER}${path.startsWith('/') ? RAW + path : `${BASE}/${path}`}${narrow ? NARROW : ''}`;
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
// Fiche technique pour le lecteur adulte : type, apport, où ça marche. Couleur de fond seule (Lumi garde background-color).
const fiche = (type, apport, ou) => text(`<p style="background-color:#eef2f7;font-size:0.88em;color:#33415c">`
  + `<strong>Fiche technique · ${type}.</strong> ${apport} <strong>Où :</strong> ${ou}</p>`, 'Fiche technique');
const OU_NOTE = 'noté sur Lumi Nuage (le score remonte dans le rapport du livre), fonctionne aussi par simple lien.';
const OU_CADRE = 'type refusé dans un chapitre de livre ; affiché en cadre depuis le lecteur hors ligne, donc jamais noté.';
const intro = (html) => text(`<p>${html}</p>`, 'Introduction');
const retiens = (html) => text(`<p><strong>À retenir.</strong> ${html}</p>`, 'À retenir');
const PX = (user) => ({ license: 'U', author: `${user} (Pixabay)`, source: 'https://pixabay.com', title: 'Licence Pixabay' });

const ch = [];

/* ===== 0. Avant-propos ===== */
const panel = (title, html) => ({ title, content: text(html, title) });
ch.push(chapter('Avant-propos : à l\'attention de la direction', [
  text('<p>Ce livre interactif est une <strong>vitrine</strong>. Sur un seul thème, l\'éducation aux médias et à l\'information (EMI) au cycle 4, '
    + 'il rassemble <strong>vingt-trois types d\'activités H5P</strong>. Chacun des dix-huit chapitres est bâti sur un type différent, et chacun est un vrai moment de cours, '
    + 'utilisable tel quel avec une classe de 4e ou de 3e.</p>'
    + '<p>Le fil conducteur suit le trajet d\'une information : <strong>la recevoir</strong> (chapitres 1 à 6), <strong>la vérifier</strong> (7 à 12), '
    + 'puis <strong>la partager et protéger ses données</strong> (13 à 17).</p>'
    + '<p><strong>Comment lire ce livre ?</strong> Chaque chapitre s\'ouvre sur une <span style="background-color:#eef2f7">&nbsp;fiche technique&nbsp;</span> '
    + 'destinée à l\'adulte : le type d\'activité, ce qu\'il apporte, et où il fonctionne. La suite s\'adresse aux élèves.</p>', 'Présentation'),
  sub('H5P.Accordion 1.0', {
    hTag: 'h3',
    panels: [
      panel('Comment ces modules sont-ils fabriqués ?',
        '<p>Avec un assistant d\'intelligence artificielle (Claude, d\'Anthropic) guidé par une méthode écrite pour le CDI, appelée <em>skill h5p-lumi</em>. '
        + 'La méthode impose de partir du contenu (ce que l\'élève doit apprendre à faire) avant de choisir la forme de l\'activité, '
        + 'de n\'utiliser que des images libres de droits et créditées, de rédiger des réponses fausses plausibles avec un retour qui explique le piège, '
        + 'et de vérifier chaque fichier avant de le livrer. Le professeur relit, corrige et teste.</p>'),
      panel('Où les élèves peuvent-ils l\'utiliser ?',
        '<ul><li><strong>Sur Lumi Nuage</strong>, quand on veut suivre les résultats de la classe.</li>'
        + '<li><strong>Par un simple lien</strong> (lecteur H5P hors ligne) : sans compte, sur ordinateur, tablette ou téléphone. Le lien peut être déposé sur l\'ENT.</li>'
        + '<li><strong>Dans l\'éditeur Lumi</strong> sur un poste du CDI, pour modifier le contenu.</li></ul>'),
      panel('Les résultats des élèves sont-ils suivis ?',
        '<p>Oui, sur Lumi Nuage, pour toutes les activités natives qui ont un score : quiz, textes à compléter, vidéo interactive, glisser-déposer… '
        + 'Les modules affichés en cadre (visite 360°, présentation 3D, quiz sur carte, onglets, grille, scénario, mots croisés…) servent à s\'entraîner : '
        + 'ils ne sont pas notés. Chaque fiche technique le précise.</p>'),
      panel('Et les données personnelles ?',
        '<p>Le lien direct ne demande aucun compte et n\'envoie les réponses à aucun serveur : la progression reste dans le navigateur de l\'élève. '
        + 'Le suivi des résultats passe par Lumi Nuage, à présenter au délégué à la protection des données avant un usage en classe.</p>'),
      panel('Peut-on modifier ou réutiliser ce livre ?',
        '<p>Oui. Le fichier <code>.h5p</code> s\'ouvre dans l\'éditeur Lumi : chaque texte, question et image se modifie. '
        + 'Chaque chapitre peut aussi devenir un module séparé, pour une séance précise.</p>'),
      panel('Quels liens avec le programme ?',
        '<p>Les quatre compétences de l\'EMI au cycle 4 sont travaillées :</p><ul>'
        + '<li><strong>utiliser les médias et les informations de manière autonome</strong> : chapitres 2, 3, 4 ;</li>'
        + '<li><strong>exploiter l\'information de manière raisonnée</strong> : chapitres 5 à 12 ;</li>'
        + '<li><strong>utiliser les médias de manière responsable</strong> : chapitres 1, 8, 13, 14 ;</li>'
        + '<li><strong>produire, communiquer, partager des informations</strong> : chapitres 15 et 16.</li></ul>'),
    ],
  }, 'Accordion', 'Questions fréquentes'),
  fiche('Accordéon (Accordion)', 'Des panneaux qu\'on ouvre un par un : une page dense reste lisible, chacun ouvre ce qui le concerne.', 'partout ; pas de score.'),
]));

/* ===== 1. Personality Quiz ===== */
ch.push(chapter('1. Quel internaute es-tu ?', [
  fiche('Questionnaire de personnalité (Personality Quiz)', 'Pas de bonne réponse : un profil à la fin. Idéal pour démarrer une séquence, chaque élève se situe avant d\'apprendre.', OU_CADRE),
  intro("Avant d'étudier les médias, regarde d'abord comment <strong>toi</strong>, tu t'en sers."),
  ...module('/identite-numerique/quiz-internaute.h5p', 1000, 620, 'Questionnaire : quel internaute es-tu ?',
    'Réponds aux questions. Il n\'y a ni bonne ni mauvaise réponse.', { scripts: true }),
]));

/* ===== 2. Timeline ===== */
const T = tlc;
const tla = (k, caption) => ({ media: T[k].thumb, caption, credit: `${T[k].artist.replace(/<[^>]+>/g, '')}, Wikimedia Commons, ${T[k].license}` });
const ev = (startDate, headline, html, asset = {}, tag = '') => ({ startDate, headline, text: `<p>${html}</p>`, asset, ...(tag ? { tag } : {}) });
ch.push(chapter('2. Cinq siècles de médias', [
  fiche('Frise chronologique (Timeline)', 'Une frise qu\'on fait défiler et qu\'on zoome : on voit les durées et les accélérations, ce qu\'une liste de dates ne montre pas.', 'partout ; pas de score. Les images viennent de Wikimedia Commons (lien en ligne).'),
  intro("De l'imprimerie à l'intelligence artificielle : fais défiler la frise avec les flèches. <strong>Observe les écarts</strong> : plus de quatre siècles entre l'imprimerie et la radio, une quinzaine d'années entre les réseaux sociaux et l'IA."),
  sub('H5P.Timeline 1.1', {
    timeline: {
      headline: 'Cinq siècles de médias', defaultZoomLevel: '0', height: 560, language: 'fr',
      text: "<p>Chaque nouveau média change <strong>qui</strong> peut publier, <strong>à quelle vitesse</strong> l'information circule, et <strong>comment</strong> on la vérifie.</p>",
      asset: tla('presse-gutenberg', "Reconstitution d'une presse de Gutenberg."),
      date: [
        ev('1450', "L'imprimerie de Gutenberg", "Vers 1450, à Mayence, Gutenberg imprime avec des caractères mobiles en métal. Un texte peut être copié en centaines d'exemplaires identiques.", tla('presse-gutenberg', "Reconstitution d'une presse de Gutenberg."), 'Imprimé'),
        ev('1631,05,30', 'La Gazette, premier journal français', "Théophraste Renaudot lance <em>La Gazette</em>, un hebdomadaire de nouvelles, sous le contrôle du roi.", tla('gazette-1631', 'Une page de La Gazette.'), 'Imprimé'),
        ev('1863,02,01', 'Le Petit Journal : la presse pour tous', "Vendu un sou, <em>Le Petit Journal</em> devient un quotidien populaire. Au début du XXe siècle, il dépasse le million d'exemplaires.", tla('petit-journal', 'Supplément illustré du Petit Journal, 1892.'), 'Imprimé'),
        ev('1881,07,29', 'La loi sur la liberté de la presse', "« L'imprimerie et la librairie sont libres. » Cette loi fonde la liberté de la presse en France ; elle punit aussi la diffamation et les fausses nouvelles.", {}, 'Droit'),
        ev('1922', 'La radio entre dans les foyers', "En France, les premières émissions régulières commencent au début des années 1920. L'information arrive en direct, par la voix.", tla('radio', 'Poste de radio des années 1940.'), 'Ondes'),
        ev('1949,06,29', 'Le premier journal télévisé', "Premier journal télévisé en France. Il faudra attendre les années 1960 pour que la télévision soit dans la plupart des foyers.", tla('televiseur', 'Téléviseur Téléavia, 1957.'), 'Ondes'),
        ev('1991,08,06', 'Le Web devient public', "Tim Berners-Lee, au CERN, ouvre le World Wide Web à tous. Chacun peut publier une page lisible dans le monde entier.", tla('serveur-web', 'Le premier serveur web, au CERN.'), 'Numérique'),
        ev('2004', 'Les réseaux sociaux', "Facebook (2004), YouTube (2005), Twitter (2006) : chacun devient diffuseur. L'information circule de personne à personne, triée par des algorithmes.", tla('reseaux-sociaux', "Icônes d'applications de réseaux sociaux."), 'Numérique'),
        ev('2007', "L'info dans la poche", "Avec le smartphone, on s'informe partout, en continu, souvent par les notifications et les fils d'actualité.", {}, 'Numérique'),
        ev('2022,11,30', "L'IA générative ouverte au public", "ChatGPT est ouvert à tous. Produire un texte, une image ou une voix crédibles devient facile, y compris pour tromper.", {}, 'Numérique'),
      ],
      era: [
        { startDate: '1450', endDate: '1921', headline: "L'ère de l'imprimé", text: '<p>Livres, gazettes, journaux.</p>' },
        { startDate: '1922', endDate: '1990', headline: "L'ère des ondes", text: '<p>Radio et télévision.</p>' },
        { startDate: '1991', endDate: '2026', headline: "L'ère du numérique", text: '<p>Web, réseaux sociaux, IA.</p>' },
      ],
    },
  }, 'Timeline', 'Cinq siècles de médias'),
  tf("Entre l'invention de l'imprimerie et celle de la radio, il s'est écoulé moins de cent ans.", false,
    'Exact : plus de quatre siècles et demi les séparent. Les médias se succèdent de plus en plus vite.',
    "Non : regarde la frise, plus de quatre siècles et demi séparent l'imprimerie (vers 1450) de la radio (années 1920).", 'Les écarts'),
]));

/* ===== 3. Virtual Tour + Drag Text ===== */
const dt = dragText('<p><strong>Fais glisser chaque métier à sa place.</strong> Deux étiquettes sont en trop.</p>',
  'Pendant le direct, c\'est le *réalisateur* qui choisit la caméra qui passe à l\'antenne. Le *rédacteur en chef* décide des sujets du journal. '
  + 'Sur le terrain, le *JRI* (journaliste reporter d\'images) filme lui-même ses images. De retour à la rédaction, le *monteur* assemble les plans du reportage. '
  + 'Sur le plateau, le *régisseur* donne le compte à rebours avant l\'antenne. Enfin, le *truquiste* remplace le fond vert par la carte météo.',
  '*présentateur* *maquilleur*', 'Qui fait quoi à la télé ?');
dt.params.overallFeedback = [{ from: 0, to: 99, feedback: 'Retourne dans la visite : chaque métier y est expliqué.' }, { from: 100, to: 100, feedback: 'Bravo : une info télévisée passe par beaucoup de mains.' }];
ch.push(chapter('3. Les métiers de la télé', [
  fiche('Visite virtuelle 360° (Virtual Tour)', 'L\'élève est sur le plateau : il regarde autour de lui et clique sur les points d\'intérêt. Le lieu porte le contenu.', `${OU_CADRE} L'exercice en dessous, lui, est noté.`),
  intro("Qui fabrique le journal télévisé ? Entre sur le plateau : fais glisser l'image pour regarder autour de toi, clique sur les <strong>+</strong>."),
  ...module('/metiers-tele.h5p', 1000, 620, 'Visite 360 : les métiers de la télé', 'Visite le plateau, puis la régie, la rédaction et la salle de montage.', { narrow: true }),
  dt,
  fiche('Texte à glisser (Drag Text)', 'Les mots se déposent dans le texte ; les étiquettes en trop empêchent de répondre par élimination.', OU_NOTE),
]));

/* ===== 4. Interactive Video ===== */
const CAT = ['Une information de presse', 'Une publicité', 'Une opinion', 'Une rumeur (infox)', 'Une parodie'];
// ok : index de la bonne catégorie ; fb : retour par catégorie (5 éléments)
const nature = (ok, fb, title) => mc('Ce message, c\'est…', CAT.map((t, i) => ({ t, ok: i === ok, fb: fb[i] })), title,
  { ok: 'Bien vu !', ko: 'Regarde les indices : qui parle, est-ce signalé, y a-t-il une source ?' });
const FB_PUB = 'Piège : regarde la mention « Partenariat rémunéré » et le code promo. Quelqu\'un est payé pour parler du produit.';
const FB_INFO = 'Piège : il n\'y a ni journaliste identifié, ni média, ni source.';
const FB_OPI = 'Piège : un avis personnel se signale par « franchement », « le pire »… Ici, il y a autre chose.';
const FB_RUM = 'Piège : rien ici ne cherche à faire peur ou à pousser au partage.';
const FB_PAR = 'Piège : un site parodique se présente comme tel et cherche à faire rire.';
const ivMC = [
  nature(0, ['Oui : un média identifié, une journaliste qui signe, un fait précis (dates, lieu) qu\'on peut vérifier auprès de la mairie.', FB_PUB.replace(/Piège.*/, 'Piège : rien n\'est à vendre ici.'), FB_OPI, FB_RUM, FB_PAR], 'Message 1'),
  nature(1, ['Piège : Léa n\'est pas journaliste, et elle est payée par la marque.', 'Oui : « Partenariat rémunéré » et un code promo. La loi oblige les influenceurs à signaler la publicité.', 'Piège : elle donne bien son avis, mais une marque la paie pour le donner. C\'est d\'abord une publicité.', FB_RUM, FB_PAR], 'Message 2'),
  nature(2, [FB_INFO, 'Piège : personne ne vend rien, il déconseille même le film.', 'Oui : « franchement », « le pire film » : c\'est un avis. Il a le droit de le donner, et tu as le droit de ne pas être d\'accord.', 'Piège : une opinion n\'est ni vraie ni fausse. C\'est un avis, signalé comme tel.', FB_PAR], 'Message 3'),
  nature(3, ['Piège : aucun média, aucun nom de médecin ou d\'étude. Une vraie info cite sa source.', 'Piège : rien n\'est à vendre… pour l\'instant.', 'Piège : le message ne se présente pas comme un avis, il affirme un « fait » sans preuve.', 'Oui : « URGENT », majuscules, « on vous cache », « partagez avant suppression » et aucune source : tous les signaux de l\'infox.', 'Piège : le ton n\'est pas drôle, il veut faire peur.'], 'Message 4'),
  nature(4, [FB_INFO + ' Et lis la mention sous le nom.', 'Piège : rien n\'est à vendre.', 'Piège : ce n\'est pas un avis, c\'est une blague.', 'Piège : une parodie ne cherche pas à tromper : elle se signale « site parodique ». Le danger, c\'est la capture partagée sans cette mention.', 'Oui : le site se dit parodique, et la situation est absurde. On rit… mais on ne le partage pas comme une vraie info.'], 'Message 5'),
];
const ivp = clone(ivBase);
const v = ivp.interactiveVideo.video;
v.startScreenOptions = { title: 'Mon fil d\'actualité', hideStartTitle: true,
  poster: { path: 'images/fil-actu-poster.jpg', mime: 'image/jpeg', copyright: { license: 'U' }, width: 1280, height: 720 } };
v.textTracks = { videoTrack: [] };
v.files = [
  { path: 'videos/fil-actu.mp4', mime: 'video/mp4', copyright: { license: 'U' } },
  { path: 'videos/fil-actu.webm', mime: 'video/webm', copyright: { license: 'U' } },
];
ivp.interactiveVideo.assets = {
  interactions: ivMC.map((action, i) => ({
    x: 62, y: 62, width: 10, height: 10, duration: { from: 6 + i * 7, to: 9.5 + i * 7 }, pause: true,
    displayType: 'button', buttonOnMobile: false, label: `<p>Message ${i + 1} : réponds</p>`, libraryTitle: 'Multiple Choice',
    action, visuals: { backgroundColor: 'rgb(255, 255, 255)', boxShadow: true }, goto: { url: { protocol: 'http://' }, visualize: false },
  })),
  bookmarks: [],
  endscreens: [],
};
// le gabarit laisse une diapositive de bilan vide : on la vide proprement (le livre fait déjà le bilan)
ivp.interactiveVideo.summary.task.params.summaries = [];
ivp.interactiveVideo.summary.displayAt = 3;
Object.assign(ivp.override, { autoplay: false, loop: false, showBookmarksmenuOnLoad: false, showRewind10: true, preventSkippingMode: 'none', deactivateSound: false, retryButton: 'on', showSolutionButton: 'on' });
ch.push(chapter("4. Mon fil d'actualité", [
  fiche('Vidéo interactive (Interactive Video)', 'La vidéo s\'arrête d\'elle-même et pose une question au bon moment : l\'élève ne peut pas regarder passivement.', OU_NOTE),
  intro("Dans un fil d'actualité, tout se ressemble : une info, une pub, un avis, une rumeur ou une blague ont la même forme. Regarde ce fil défiler. <strong>À chaque arrêt, clique sur le bouton et dis ce qu'est le message.</strong>"),
  sub('H5P.InteractiveVideo 1.27', ivp, 'Interactive Video', "Mon fil d'actualité"),
  retiens("Avant de croire ou de partager, je me demande <strong>qui parle</strong> (un média, une marque, une personne, un compte anonyme) et <strong>pourquoi</strong> (informer, vendre, donner son avis, faire peur, faire rire)."),
]));

/* ===== 5. Mark the Words ===== */
ch.push(chapter('5. Fait ou opinion ?', [
  fiche('Marquer les mots (Mark the Words)', 'L\'élève clique sur les mots eux-mêmes : on vérifie qu\'il repère les indices dans le texte, pas qu\'il devine une case.', OU_NOTE),
  intro("Un fait se vérifie ; une opinion se discute. Dans un même article, les deux sont souvent mêlés. Les <strong>mots qui jugent</strong> (adjectifs, adverbes) trahissent l'opinion."),
  markWords('<p><strong>Clique sur les 6 mots qui expriment un jugement</strong>, puis sur « Vérifier ».</p>',
    '<p>Le nouveau skatepark de Montval a ouvert samedi, rue des Écoles. Il a coûté 180 000 euros à la commune. Ce projet est *magnifique* : '
    + 'les rampes sont *superbes* et les jeunes ont *enfin* un endroit à eux. *Malheureusement*, le parking voisin compte seulement 12 places. '
    + 'La mairie annonce une ouverture de 9 h à 20 h. Bref, une réussite *incontestable*, malgré quelques riverains *grincheux*.</p>',
    'Fait ou opinion ?',
    [{ from: 0, to: 99, feedback: 'Cherche les mots qui donnent un avis : on pourrait les contester. Les chiffres, les dates et les lieux, eux, se vérifient.' },
      { from: 100, to: 100, feedback: 'Parfait : tu sépares ce qui se vérifie de ce qui se discute.' }]),
  mc('« Le skatepark a coûté 180 000 euros à la commune. » Cette phrase est…', [
    { t: 'Un fait : on peut le vérifier dans le budget de la mairie', ok: true, fb: 'Oui : un chiffre précis se vérifie, même s\'il peut être faux.' },
    { t: 'Une opinion : certains trouveront que c\'est trop cher', fb: 'Piège : « c\'est trop cher » serait une opinion. Le montant lui-même est un fait.' },
    { t: 'Une opinion, parce que le journaliste a choisi d\'en parler', fb: 'Piège : choisir un sujet est un choix de journaliste, mais la phrase elle-même est vérifiable.' },
  ], 'Fait ou opinion'),
]));

/* ===== 6. Agamotto ===== */
const crop = (file, alt, label, desc) => ({
  image: image(`images/${file}`, 1200, 800, alt, label, PX('Foundry')),
  labelText: label, description: `<p>${desc}</p>`,
});
ch.push(chapter('6. Le cadrage change le sens', [
  fiche('Diaporama à curseur (Agamotto)', 'Un curseur fait passer d\'une image à l\'autre en fondu : ici, on élargit le cadre et on voit le sens changer sous ses yeux.', 'partout ; pas de score. La question en dessous est notée sur Lumi Nuage.'),
  intro("Une photo ne montre jamais tout : le photographe, puis celui qui la publie, <strong>choisissent le cadre</strong>. Fais glisser le curseur et lis la légende qu'on pourrait écrire à chaque fois."),
  sub('H5P.Agamotto 1.6', {
    title: '<p>Trois cadrages d\'une même photo</p>',
    items: [
      crop('cadrage-1-serre.jpg', 'La Joconde seule sur un mur beige, une tête de visiteur en bas.', 'Cadrage serré',
        'Légende possible : « Un moment de calme face à la Joconde. » <em>Remarque : l\'image est floue. Un recadrage agrandit les pixels, c\'est souvent un indice.</em>'),
      crop('cadrage-2-moyen.jpg', 'La Joconde et, devant, des visiteurs qui lèvent leur téléphone.', 'Cadrage moyen',
        'Légende possible : « Les visiteurs photographient la Joconde. »'),
      crop('cadrage-3-large.jpg', 'Une foule compacte devant la Joconde, minuscule sur un grand mur.', 'Photo entière',
        'Légende possible : « Au Louvre, la foule se presse devant la Joconde. » C\'est la photo d\'origine : les trois légendes viennent de la même image.'),
    ],
    behaviour: { startImage: 1, snap: true, ticks: true, labels: true, transparencyReplacementColor: '#000000', imagesDescriptionsRatio: 70,
      image: 'Image', imageSlider: 'Curseur des images', mute: 'Couper le son', unmute: 'Activer le son',
      buttonFullscreenEnter: 'Plein écran', buttonFullscreenExit: 'Quitter le plein écran' },
  }, 'Agamotto', 'Trois cadrages d\'une même photo'),
  mc('Un site publie le cadrage serré avec la légende « Le Louvre est vide, les touristes ne viennent plus ». Qu\'en penses-tu ?', [
    { t: 'La photo est authentique, mais le cadrage cache la foule : la légende trompe', ok: true, fb: 'Exact : pas besoin de truquer une image pour tromper, il suffit de couper.' },
    { t: 'La photo est un montage, puisqu\'elle ne montre pas la foule', fb: 'Piège : rien n\'a été ajouté ni effacé. La photo est vraie, c\'est le cadre qui trompe.' },
    { t: 'La légende est vraie, puisque la photo ne montre personne', fb: 'Piège : une photo montre ce qui est dans le cadre, pas ce qui est autour.' },
    { t: 'On ne peut rien dire sans connaître le photographe', fb: 'Le photographe compte, mais ici on peut déjà comparer avec la photo entière : la légende est fausse.' },
  ], 'Le cadrage trompeur'),
]));

/* ===== 7. Impressive Presentation ===== */
ch.push(chapter("7. Le voyage d'une infox", [
  fiche('Présentation 3D (Impressive Presentation)', 'La caméra voyage dans un décor : on tourne dans une pièce, on plonge dans une spirale, on sort d\'une bulle. Le mouvement fait comprendre la circulation.', OU_CADRE),
  intro("Comment une fausse information naît-elle, puis s'emballe-t-elle jusqu'à enfermer les gens dans une bulle ? Suis son voyage avec la flèche ➜ en bas à droite."),
  ...module('voyage-infox.h5p', 1000, 650, "Présentation 3D : le voyage d'une infox", 'Suis les étapes du voyage, jusqu\'au quiz final.', { narrow: true, scripts: true }),
  scs([
    ['Pourquoi une infox circule-t-elle plus vite qu\'une info vérifiée ?', ['Elle provoque de l\'émotion (peur, colère) qui pousse à partager', 'Elle est toujours publiée par des médias connus', 'Elle est plus longue et plus détaillée']],
    ['Qu\'est-ce qu\'une bulle de filtres ?', ['Un fil qui ne montre que des contenus proches de ce que j\'aime déjà', 'Un réglage qui bloque les infox', 'Un groupe privé entre amis']],
    ['Quel est le meilleur réflexe devant un message choquant ?', ['Attendre et chercher la source avant de partager', 'Le partager pour prévenir mes amis', 'Le croire s\'il a beaucoup de « J\'aime »']],
  ], 'Le voyage d\'une infox'),
  fiche('Série de choix uniques (Single Choice Set)', 'Questions rapides, une à la fois, avec correction immédiate : bon pour vérifier ce qu\'on a retenu.', OU_NOTE),
]));

/* ===== 8. Branching Scenario ===== */
ch.push(chapter('8. Partager ou vérifier ?', [
  fiche('Scénario à embranchements (Branching Scenario)', 'Chaque choix mène à une suite différente : l\'élève vit les conséquences de sa décision et peut recommencer pour explorer les autres chemins.', OU_CADRE),
  intro("Mardi soir, un message arrive dans le groupe de ta classe. Ce que tu fais dans les cinq minutes qui suivent compte. <strong>Choisis, puis recommence pour voir les autres fins.</strong>"),
  ...module('partager-ou-verifier.h5p', 1000, 900, 'Scénario : partager ou vérifier ?', 'Clique sur « Commencer » et fais tes choix.'),
  tf("Un article authentique ne peut pas servir à diffuser une fausse information.", false,
    'Exact : un vrai article, sorti de son contexte (date, lieu), peut tromper autant qu\'un faux.',
    "Si : dans le scénario, l'article est vrai, mais il date de 2023 et parle d'un autre collège. Sorti de son contexte, il trompe.", 'Hors contexte'),
]));

/* ===== 9. Tabs ===== */
ch.push(chapter('9. Enquêter sur une source', [
  fiche('Onglets (Tabs)', 'Une enquête rangée en onglets : Qui ? Quand ? D\'où ? Pourquoi ? L\'élève voit la méthode d\'un coup d\'œil et la suit dans l\'ordre.', 'module noté quand il est utilisé seul sur Lumi Nuage ; dans ce livre, affiché en cadre, donc non noté.'),
  intro("Une publication « miracle » circule. Mène l'enquête comme un journaliste : ouvre les onglets <strong>dans l'ordre</strong> et fais l'exercice de chacun."),
  ...module('enquete-source.h5p', 1000, 980, 'Onglets : enquête sur une source', 'Ouvre les 6 onglets dans l\'ordre, de « L\'info » au « Verdict ».', { scripts: true }),
  retiens("Les quatre questions de l'enquête : <strong>qui</strong> publie, <strong>quand</strong>, <strong>d'où</strong> vient l'information (sa source), et <strong>pourquoi</strong> elle a été publiée."),
]));

/* ===== 10. Course Presentation (repris de « Qui t'informe ? ») ===== */
const j3 = fresh(jia.chapters[2].params.content);
ch.push(chapter('10. Le dividende du menteur', [
  fiche('Présentation de cours (Course Presentation) dans le livre', 'Des diapositives courtes qui découpent une notion difficile en étapes, avec une question dans la dernière diapositive. Repris du livre « Qui t\'informe ? ».', OU_NOTE),
  ...j3.map((x) => x.content),
]));

/* ===== 11. Drag and Drop (repris de « Qui t'informe ? ») ===== */
const j4 = fresh(jia.chapters[3].params.content);
ch.push(chapter("11. L'IA dans la rédaction", [
  fiche('Glisser-déposer (Drag and Drop)', 'Classer des étiquettes dans des zones : l\'élève doit trancher pour chaque cas, et voit ce qu\'il a mal rangé.', OU_NOTE),
  intro("L'intelligence artificielle aide déjà les journalistes : elle retranscrit, traduit, trie des milliers de documents. Mais Fabrice Fries, président de l'Agence France-Presse, fixe une limite : <strong>« On peut automatiser des tâches, jamais des responsabilités. »</strong> <span style=\"font-size:0.85em\">(<em>Le Monde</em>, 2 juin 2026)</span>"),
  ...j4.slice(3).map((x) => x.content),
]));

/* ===== 12. Sort the Paragraphs ===== */
ch.push(chapter('12. Wikipédia, une encyclopédie qui se vérifie', [
  fiche('Remettre dans l\'ordre (Sort the Paragraphs)', 'Des cartes à classer : l\'élève reconstitue un processus. Le score compte les enchaînements justes, pas seulement les places.', OU_CADRE),
  intro("Sur Wikipédia, tout le monde peut écrire. Alors pourquoi peut-on souvent s'y fier ? Parce qu'un article change pas à pas, sous le regard des autres, et que chaque affirmation doit citer une source."),
  ...module('/wiki-1h/edition-collaborative.h5p', 1000, 1700, "Remettre en ordre : la vie d'un article Wikipédia", 'Remets les étapes de la vie d\'un article dans l\'ordre, puis clique sur « Vérifier ».'),
  mc('Tu lis sur Wikipédia une phrase suivie de « [réf. nécessaire] ». Que signifie cette mention ?', [
    { t: "Aucune source ne prouve encore cette phrase : il faut s'en méfier", ok: true, fb: 'Exact : un contributeur signale qu\'il manque une source. La phrase est peut-être vraie, mais rien ne le prouve encore.' },
    { t: 'La phrase a été vérifiée par un expert', fb: 'Piège : c\'est l\'inverse. La mention signale une phrase NON sourcée.' },
    { t: "C'est un lien vers un autre article", fb: 'Piège : les liens sont en bleu. « Réf. nécessaire » signale un manque de source.' },
    { t: 'La page est protégée contre les modifications', fb: 'Piège : la protection est signalée par un cadenas, pas par cette mention.' },
  ], 'Référence nécessaire'),
]));

/* ===== 13. Grid Checker ===== */
ch.push(chapter('13. Privé, ça veut dire quoi ?', [
  fiche('Grille à cocher (Grid Checker)', 'Un tableau à double entrée : pour chaque information, qui peut la voir ? L\'élève coche case par case et voit ses erreurs en couleur.', `${OU_CADRE} Ce type n'a pas de score, même seul.`),
  intro("« Mon compte est privé, donc personne ne voit rien. » Vraiment ? Vérifie, information par information."),
  ...module('/identite-numerique/qui-voit-quoi.h5p', 1000, 600, 'Grille : qui peut voir quoi ?',
    'Coche toutes les personnes qui peuvent voir chaque information, puis clique sur « Vérifier ».', { scripts: true }),
  mc("Une abonnée fait une capture d'écran d'une story privée et l'envoie à toute la classe. Que montre cette situation ?", [
    { t: "Un contenu privé peut devenir public dès que quelqu'un le copie", ok: true, fb: 'Exact : le réglage protège la publication, pas les copies.' },
    { t: 'Le réseau social a mal protégé le compte', fb: "Piège : le réseau a fait son travail. C'est une personne autorisée qui a copié la story." },
    { t: "C'est impossible : on ne peut pas capturer une story privée", fb: "Piège : certaines applis préviennent quand on fait une capture, mais aucune ne peut l'empêcher vraiment." },
  ], 'La capture d\'écran'),
]));

/* ===== 14. GeoQuiz ===== */
ch.push(chapter('14. Où voyagent mes données ?', [
  fiche('Quiz sur carte (GeoQuiz)', 'L\'élève clique sur une carte du monde : situer les serveurs et les sièges des plateformes rend concret le trajet des données.', OU_CADRE),
  intro("Quand tu publies une vidéo depuis ta chambre, elle part sur des serveurs à l'autre bout de l'Europe, ou du monde. Qui la garde ? Quelle loi te protège ?"),
  ...module('/identite-numerique/voyage-donnees.h5p', 1000, 650, 'Quiz sur carte : où voyagent mes données ?', 'Réponds aux questions en cliquant sur la carte.', { scripts: true }),
  mc("Ton compte TikTok est géré par une société installée en Irlande, qui appartient à un groupe chinois. Quelle règle protège tes données ?", [
    { t: "Le RGPD, parce que TikTok propose ses services aux habitants de l'Union européenne", ok: true, fb: 'Exact : ce qui compte, c\'est où vivent les utilisateurs, pas où est le siège.' },
    { t: "Aucune, car l'entreprise n'est pas française", fb: 'Piège : le RGPD protège tous les habitants de l\'Union européenne, quelle que soit la nationalité de l\'entreprise.' },
    { t: 'La loi chinoise, car le groupe est chinois', fb: 'Piège : pour ses utilisateurs européens, TikTok doit respecter le RGPD.' },
    { t: 'La loi américaine, car Internet a été inventé aux États-Unis', fb: "Piège : l'histoire d'Internet ne décide pas de la loi qui s'applique à tes données." },
  ], 'Quelle loi me protège ?'),
]));

/* ===== 15. Documentation Tool ===== */
const page = (title, html, fields) => sub('H5P.StandardPage 1.5', {
  elementList: [
    sub('H5P.Text 1.1', { text: `<p>${html}</p>` }, 'Text', 'Consigne'),
    ...fields.map(([q, size = '3', req = false]) => sub('H5P.TextInputField 1.2', {
      taskDescription: q, placeholderText: '', inputFieldSize: size, requiredField: req, remainingChars: 'Caractères restants : @chars',
    }, 'Text Input Field', q.slice(0, 60))),
  ],
  helpTextLabel: 'Aide', helpText: '',
}, 'Standard Page', title);
ch.push(chapter("15. À toi d'enquêter", [
  fiche('Outil de documentation (Documentation Tool)', 'Une fiche guidée en plusieurs pages, que l\'élève remplit puis <strong>exporte en document Word</strong> à imprimer ou à rendre sur l\'ENT. Il produit une trace écrite.', 'partout ; pas de score automatique, l\'enseignant lit le document exporté.'),
  intro("Choisis une information qui circule en ce moment (sur un réseau social, dans un groupe, à la radio) et mène ta propre enquête avec la méthode du chapitre 9. À la fin, crée ton document."),
  sub('H5P.DocumentationTool 1.8', {
    taskDescription: 'Ma fiche d\'enquête',
    pagesList: [
      page("1. L'information", "Quelle information veux-tu vérifier ?", [['Recopie le titre ou la phrase qui circule.', '1', true], ["Où l'as-tu vue ? (réseau social, site, groupe de discussion, radio…)", '1']]),
      page('2. Qui ? Quand ?', 'Identifie l\'auteur et la date.', [["Qui l'a publiée ? Que sais-tu de cette source (média, marque, particulier, compte anonyme) ?", '3'], ['Quand a-t-elle été publiée ? Les faits racontés sont-ils récents ?', '3']]),
      page("3. D'où ? Pourquoi ?", 'Remonte à la source et cherche l\'intention.', [["Quelle source l'information cite-t-elle ? L'as-tu retrouvée ?", '3'], ["D'autres médias fiables en parlent-ils ? Lesquels ?", '3'], ['Pourquoi a-t-elle été publiée : informer, vendre, convaincre, faire peur, faire rire ?', '3']]),
      page('4. Mon verdict', 'Conclus ton enquête.', [['Fiable, pas fiable, ou je ne sais pas encore ? Justifie en deux ou trois phrases.', '3', true]]),
      sub('H5P.DocumentExportPage 1.5', {
        description: 'Clique sur « Créer le document » : tu obtiens un fichier Word avec toutes tes réponses, à imprimer ou à déposer sur l\'ENT.',
        createDocumentLabel: 'Créer le document', submitTextLabel: 'Envoyer', submitSuccessTextLabel: 'Ton document a été envoyé.',
        selectAllTextLabel: 'Tout sélectionner', exportTextLabel: 'Exporter', helpTextLabel: 'Aide', helpText: '',
        requiresInputErrorMessage: 'Ces pages contiennent des champs obligatoires à remplir avant de créer le document :',
      }, 'Document Export Page', 'Mon document'),
    ],
    i10n: { previousLabel: 'Page précédente', nextLabel: 'Page suivante', closeLabel: 'Fermer' },
  }, 'Documentation Tool', "Ma fiche d'enquête"),
]));

/* ===== 16. Dialog Cards + Crossword ===== */
const card = (front, back) => ({ text: `<p style="text-align:center">${front}</p>`, answer: `<p style="text-align:center">${back}</p>`, tips: {} });
ch.push(chapter("16. Les mots de l'EMI", [
  fiche('Cartes à retourner (Dialog Cards) puis mots croisés (Crossword)', 'D\'abord réviser (le mot au recto, la définition au verso), ensuite jouer pour vérifier qu\'on les retient.', 'cartes : partout, sans score ; mots croisés : en cadre, non notés.'),
  sub('H5P.Dialogcards 1.9', {
    title: '<p>Neuf mots pour parler des médias</p>', mode: 'normal',
    description: '<p>Lis le mot, cherche sa définition dans ta tête, puis retourne la carte.</p>',
    dialogs: [
      card('Source', "L'origine d'une information : la personne, le média ou le document d'où elle vient."),
      card('Infox', 'Une fausse information diffusée pour tromper (en anglais : <em>fake news</em>).'),
      card('Opinion', "Un avis personnel. On peut ne pas être d'accord : ce n'est pas un fait."),
      card('Parodie', "L'imitation humoristique d'un média, à ne pas prendre au sérieux."),
      card('Cadrage', 'Le choix de ce que montre une photo… et de ce qu\'elle laisse hors champ.'),
      card('Algorithme', "Le programme qui choisit ce que mon fil d'actualité me montre."),
      card('Contexte', 'La date, le lieu, les circonstances. Sans eux, une info vraie peut tromper.'),
      card('Hypertrucage', 'Le mot français pour <em>deepfake</em> : une vidéo ou une voix truquée par l\'IA.'),
      card('Sponsorisé', "Ce mot signale qu'un message est payé par une marque : c'est de la publicité."),
    ],
    behaviour: { enableRetry: true, disableBackwardsNavigation: false, scaleTextNotCard: false, randomCards: false, maxProficiency: 5, quickProgression: false },
    answer: 'Retourner', next: 'Suivante', prev: 'Précédente', retry: 'Recommencer', correctAnswer: 'Je savais', incorrectAnswer: 'Je ne savais pas',
    round: 'Tour @round', cardsLeft: 'Cartes restantes : @number', nextRound: 'Passer au tour @round', startOver: 'Recommencer',
    showSummary: 'Suivant', summary: 'Bilan', summaryCardsRight: 'Cartes sues :', summaryCardsWrong: 'Cartes à revoir :',
    summaryCardsNotShown: 'Cartes non montrées :', summaryOverallScore: 'Score global', summaryCardsCompleted: 'Cartes apprises :',
    summaryCompletedRounds: 'Tours terminés :', summaryAllDone: 'Bravo ! Tu as appris les @cards cartes en @max essais !',
    progressText: 'Carte @card sur @total', cardFrontLabel: 'Recto', cardBackLabel: 'Verso', tipButtonLabel: 'Voir l\'indice',
    audioNotSupported: 'Ton navigateur ne lit pas ce son',
    confirmStartingOver: { header: 'Recommencer ?', body: 'Ta progression sera perdue. Recommencer ?', cancelLabel: 'Annuler', confirmLabel: 'Recommencer' },
  }, 'Dialog Cards', 'Neuf mots pour parler des médias'),
  ...module('mots-croises-emi.h5p', 1000, 1150, "Mots croisés : les mots de l'EMI", 'Neuf définitions, neuf mots du livre : à toi de jouer.'),
]));

/* ===== 17. Summary + crédits ===== */
ch.push(chapter('17. Ce que je retiens', [
  fiche('Résumé à construire (Summary)', 'L\'élève reconstruit la synthèse phrase après phrase, en choisissant à chaque fois l\'affirmation juste : la trace écrite se fabrique en répondant.', OU_NOTE),
  summary('Choisis à chaque fois la phrase juste : elles forment ton résumé.', [
    ["Avant de partager, je regarde qui parle et pourquoi.", 'Avant de partager, je regarde le nombre de « J\'aime ».', 'Un message partagé par un ami est forcément fiable.'],
    ['Une photo authentique peut tromper par son cadrage ou sa légende.', 'Une photo authentique dit toujours la vérité.', 'Seules les photos retouchées peuvent tromper.'],
    ["Une info vraie sortie de son contexte (date, lieu) peut devenir fausse.", "Une info vraie le reste quelle que soit sa date.", "Un article de journal est toujours d'actualité."],
    ["Sur Wikipédia, une affirmation sérieuse cite une source que je peux vérifier.", "Sur Wikipédia, tout est vrai puisque tout le monde peut corriger.", "Sur Wikipédia, rien n'est fiable puisque tout le monde peut écrire."],
    ["Le RGPD protège mes données, même si l'entreprise est à l'étranger.", 'Le RGPD ne concerne que les entreprises françaises.', 'Un compte privé suffit à protéger toutes mes données.'],
  ], 'Ce que je retiens'),
  text('<p style="font-size:0.8em;color:#555555"><strong>Crédits.</strong> Photos Pixabay (licence Pixabay) : Foundry (salle de la Joconde), InstagramFOTOGRAFIN, Fotorech, anncapictures, ghcassel, Tho-Ge (fil d\'actualité) ; '
    + 'SplitShire et OrnaW (chapitres 10 et 11, repris du livre « Qui t\'informe ? »). Frise : images Wikimedia Commons, auteurs et licences indiqués sous chaque image. '
    + 'Les comptes, le journal « Le Courrier de Montval », « Le Courrier du Rhône », la marque « Pas de Loup » et le film « Galaxie 9 » sont inventés pour les exercices. '
    + 'Modules en cadre : voir les crédits à la fin de chacun.</p>', 'Crédits'),
]));

const book = { ...base, chapters: ch };
book.showCoverPage = true;
book.bookCover = {
  coverDescription: '<p style="text-align:center">L\'éducation aux médias et à l\'information en dix-huit chapitres, chacun bâti sur un type d\'activité interactive différent.</p>'
    + '<p style="text-align:center;font-size:0.9em">Cycle 4 · CDI</p>',
  coverMedium: image('images/cadrage-3-large.jpg', 1200, 800, 'Une foule de visiteurs photographie la Joconde au Louvre.', 'Couverture', PX('Foundry')),
};
// libellés d'interface en français (le gabarit est en anglais)
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
