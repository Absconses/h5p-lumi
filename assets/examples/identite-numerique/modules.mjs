// Les modules « exotiques » du livre « Mon identité numérique » (refusés par la Column du livre,
// donc publiés à part et affichés en cadre). Un content.json par module, dans <sortie>/.
// usage : node modules.mjs <repo_h5p-lumi> <sortie>
import fs from 'fs';
import { text, image, mc, tf, guid } from './fr.mjs';
const [REPO, OUT] = process.argv.slice(2);
const vt = await import(`${REPO}/assets/lib/virtual-tour.mjs`);
const tb = await import(`${REPO}/assets/lib/tabs.mjs`);
const gq = await import(`${REPO}/assets/lib/geoquiz.mjs`);
const { gridChecker } = await import('./grid-checker.mjs');
const save = (name, c) => { fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(c)); console.log('ok', name); };

/* ---- 0. Personality Quiz : « Quel internaute es-tu ? » (mise en route, pas de bonne réponse) ---- */
const LUM = 'En pleine lumière', DIS = 'Discrétion', PIL = 'Pilote automatique', STR = 'Stratège';
const q = (t, answers) => ({ text: t, answers: answers.map(([a, p]) => ({ text: a, personality: p })) });
save('quiz-internaute', {
  showTitleScreen: false,
  titleScreen: { titleScreenIntroduction: '<p style="text-align:center"></p>' },
  personalitiesGroup: { personalities: [
    { name: LUM, description: "<p>Tu aimes montrer ce que tu fais et partager avec beaucoup de monde. Attention : plus ton compte est ouvert, plus ton iceberg grossit.</p><p>Ce livre va t'aider à garder le plaisir de partager sans tout dévoiler (chapitres 1 et 2).</p>" },
    { name: DIS, description: "<p>Tu publies peu et tu fais attention. Bien vu ! Mais même sans rien publier, tu laisses des traces : les applis enregistrent, les autres publient.</p><p>Le chapitre 3 risque de te surprendre.</p>" },
    { name: PIL, description: "<p>Tu cliques vite sur « J'accepte » et tu regardes peu les réglages. Pas de panique : tu n'es pas seul dans ce cas.</p><p>Ce livre va te montrer où regarder et comment reprendre la main (chapitre 5).</p>" },
    { name: STR, description: "<p>Tu réfléchis avant de publier et tu règles tes comptes. Bravo !</p><p>Ce livre va te montrer ce qui se passe sous la surface et quels sont tes droits si quelque chose dérape (chapitre 6).</p>" },
  ] },
  questionsGroup: { questions: [
    q('Ton compte principal sur un réseau social est…', [
      ['Public : plus j\'ai d\'abonnés, mieux c\'est', `${LUM}=2`], ['Privé : je choisis qui me suit', `${STR}=2, ${DIS}=1`],
      ['Je ne sais pas, je n\'ai jamais regardé', `${PIL}=2`], ['Je n\'ai pas de compte ou je ne publie rien', `${DIS}=2`]]),
    q('Une appli te demande l\'accès à ta position.', [
      ['J\'accepte, sinon elle ne marchera pas', `${PIL}=2`], ['J\'accepte « toujours », c\'est pratique', `${LUM}=1, ${PIL}=1`],
      ['Je choisis « seulement pendant l\'utilisation »', `${STR}=2`], ['Je refuse presque toujours', `${DIS}=2`]]),
    q('Un copain veut publier une photo de groupe où tu es.', [
      ['Pas de souci, qu\'il m\'identifie !', `${LUM}=2`], ['Je lui demande de me montrer la photo avant', `${STR}=2`],
      ['Je ne savais pas qu\'il devait me demander', `${PIL}=2`], ['Je préfère qu\'il me coupe de la photo', `${DIS}=2`]]),
    q('Les conditions d\'utilisation d\'une appli, tu…', [
      ['Clique sur « J\'accepte » sans lire', `${PIL}=2, ${LUM}=1`], ['Lis au moins ce qui parle de mes données', `${STR}=2`],
      ['Demande à un adulte avant de m\'inscrire', `${DIS}=1, ${STR}=1`], ['Ne sais pas de quoi il s\'agit', `${PIL}=2`]]),
    q('Si quelqu\'un tape ton nom dans un moteur de recherche…', [
      ['Il trouve plein de choses, et j\'aime ça', `${LUM}=2`], ['Je ne sais pas, je n\'ai jamais essayé', `${PIL}=2`],
      ['J\'ai déjà vérifié : rien de gênant', `${STR}=2`], ['Il ne trouve rien, je fais attention', `${DIS}=2`]]),
  ] },
  resultScreen: { animation: 'none', displayTitle: true, displayDescription: true, imagePosition: 'background' },
  visual: { isAnimationOn: true, showProgressBar: true, appearance: 'classic', colorButton: '#1d3557', colorProgressBar: '#e76f51' },
  l10n: { noQuestions: "Aucune question valide.", noPersonalities: 'Profils manquants ou en double.', start: 'Commencer',
    currentOfTotal: '@current sur @total', skip: 'Passer', reset: 'Recommencer', notFinished: "Le questionnaire n'est pas terminé." },
  a11y: { wheelStarted: 'La roue tourne, patiente un instant.', titleScreenWasOpened: "L'écran d'accueil est ouvert.",
    progressBar: 'Barre de progression', resultsTitle: 'Voici ton résultat.', standby: 'Patiente.' },
});

/* ---- 2. Grid Checker : « Qui peut voir quoi ? » (pas de score : entraînement) ---------------- */
save('qui-voit-quoi', gridChecker({
  title: 'Qui peut voir quoi ?',
  intro: '<p>Pour chaque information, coche <strong>toutes</strong> les personnes qui peuvent la voir. Puis clique sur « Vérifier ».</p>',
  type: 'multiple',
  columns: ['Mes abonnés', "N'importe qui", "L'entreprise du réseau social"],
  rows: [
    { text: 'Mon pseudo et ma photo de profil (compte public)', answers: [0, 1, 2] },
    { text: 'Mon pseudo et ma photo de profil (compte privé)', answers: [0, 1, 2] },
    { text: 'Une photo publiée sur un compte public', answers: [0, 1, 2] },
    { text: 'Une photo publiée sur un compte privé', answers: [0, 2] },
    { text: 'Ce que je tape dans la barre de recherche', answers: [2] },
    { text: 'Le temps que je passe sur chaque vidéo', answers: [2] },
    { text: "Ma position, quand l'appli y a accès", answers: [2] },
  ],
}));

/* ---- 3. Virtual Tour 360 : « Une journée de traces » (3 lieux, de 7 h 30 à 17 h) ---------------- */
const PH = (title, author, page) => ({ license: 'CC0 1.0', title, author: `${author} (Poly Haven)`, source: `https://polyhaven.com/a/${page}` });
const P = (h) => vt.text(h, 'Texte');
const scenes = [
  vt.scene({ id: 0, name: '7 h 30 · À la maison', camera: vt.pos360(45, 52),
    src: vt.img('images/pano-maison.jpg', 3840, 1920, PH('Lythwood Room', 'Greg Zaal', 'lythwood_room')),
    description: '<p>Le matin, avant même de partir au collège, tu as déjà laissé des traces. Clique sur les +.</p>',
    interactions: [
      vt.hotspot(vt.pos360(9, 60), P("<p><strong>7 h 02 : je déverrouille mon téléphone.</strong> Avant de me lever, j'ouvre trois applis. Chacune enregistre l'heure, la durée et le modèle de mon téléphone.</p><p>C'est une trace <strong>involontaire</strong> : je ne la vois pas, mais elle existe.</p>"), 'Le réveil'),
      vt.hotspot(vt.pos360(33, 52), P("<p><strong>Le selfie du miroir.</strong> Je le publie avant de partir. Derrière moi, on voit le calendrier du collège et le logo de mon club sur mon sweat.</p><p>C'est une trace <strong>volontaire</strong>… pleine d'indices. Avant de publier, je regarde l'arrière-plan.</p>"), 'Le miroir'),
      vt.hotspot(vt.pos360(60, 47), P("<p><strong>La météo du jour.</strong> Mon appli météo connaît ma position à quelques mètres près, tous les jours, parce que je l'ai autorisée « toujours ».</p><p>Mieux : « pendant l'utilisation de l'appli », ou une position approximative.</p>"), 'La fenêtre'),
      vt.hotspot(vt.pos360(71, 52), P("<p><strong>La console.</strong> Hier soir, j'ai joué en ligne. La plateforme a gardé mes heures de jeu, mes achats et la liste de mes amis. Mon pseudo de joueur est relié à mon adresse e-mail.</p>"), 'La console'),
      vt.hotspot(vt.pos360(18, 50), vt.goTo(1), 'Partir au collège'),
    ] }),
  vt.scene({ id: 1, name: '12 h 30 · Au collège', camera: vt.pos360(30, 55), icon: 'plus',
    src: vt.img('images/pano-college.jpg', 3840, 1920, PH('Newman Cafeteria', 'Savva Zakharov', 'newman_cafeteria')),
    description: '<p>Midi, à la cantine et dans le couloir des casiers. Clique sur les +.</p>',
    interactions: [
      vt.hotspot(vt.pos360(25, 61), P("<p><strong>La photo de la cantine.</strong> Un copain me prend en photo la bouche pleine et la publie avec mon nom : il m'<strong>identifie</strong>.</p><p>C'est une trace <strong>laissée par un autre</strong>. Il aurait dû me demander mon accord : c'est mon <strong>droit à l'image</strong>.</p>"), 'La cantine'),
      vt.hotspot(vt.pos360(72, 55), P("<p><strong>Les casiers.</strong> Mon casier a un cadenas, mon compte a un mot de passe. Je ne donne pas la combinaison du cadenas à toute la classe : pareil pour mon mot de passe, même à mon meilleur ami.</p>"), 'Les casiers'),
      vt.hotspot(vt.pos360(4, 52), P("<p><strong>Le distributeur.</strong> Je paie un jus avec ma carte de paiement. La banque enregistre l'heure, le lieu et le montant : une trace <strong>involontaire</strong> de plus.</p>"), 'Le distributeur'),
      vt.hotspot(vt.pos360(50, 51), vt.goTo(2), 'Après les cours'),
    ] }),
  vt.scene({ id: 2, name: '17 h · À la boutique de téléphones', camera: vt.pos360(32, 50),
    src: vt.img('images/pano-boutique.jpg', 3840, 1920, PH('Phone Shop', 'Philip Modin', 'phone_shop')),
    description: '<p>Après les cours, je vais revendre mon vieux téléphone. Clique sur les +, puis fais le bilan de la journée.</p>',
    interactions: [
      vt.hotspot(vt.pos360(25, 47), P("<p><strong>Revendre son téléphone.</strong> Avant, je sauvegarde mes photos, je me déconnecte de mes comptes et je fais une <strong>réinitialisation aux paramètres d'usine</strong>.</p><p>Sinon, le prochain propriétaire pourrait retrouver mes photos et mes messages.</p>"), 'Revendre'),
      vt.hotspot(vt.pos360(41, 38), P("<p><strong>La caméra.</strong> La boutique est filmée. C'est autorisé si un panneau le signale, et les images ne doivent pas être gardées plus d'un mois. Même hors ligne, on laisse des traces.</p>"), 'La caméra'),
      vt.hotspot(vt.pos360(75, 52), P("<p><strong>Un téléphone neuf.</strong> Au premier démarrage, il pose des dizaines de questions : localisation, publicité personnalisée, sauvegarde en ligne… Je prends le temps de lire, et je refuse ce qui ne m'est pas utile.</p>"), 'Un téléphone neuf'),
      vt.hotspot(vt.pos360(92, 57), P("<p><strong>« Votre e-mail pour la carte de fidélité ? »</strong> En échange de quelques réductions, le magasin garde la liste de tout ce que j'achète et peut m'envoyer de la publicité. J'ai le droit de refuser.</p>"), 'La caisse'),
      vt.hotspot(vt.pos360(50, 56), vt.singleChoice([
        { q: '<p>Le selfie du miroir est une trace…</p>', a: ['<p>volontaire, mais pleine d\'indices</p>', '<p>involontaire</p>', '<p>laissée par un autre</p>'] },
        { q: '<p>La photo de la cantine publiée par un copain est une trace…</p>', a: ['<p>laissée par un autre</p>', '<p>volontaire</p>', '<p>involontaire</p>'] },
        { q: '<p>Les heures de jeu gardées par la console sont une trace…</p>', a: ['<p>involontaire</p>', '<p>volontaire</p>', '<p>laissée par un autre</p>'] },
        { q: '<p>Avant de revendre mon téléphone, je dois surtout…</p>', a: ['<p>le réinitialiser aux paramètres d\'usine</p>', '<p>supprimer mes applis une par une</p>', '<p>changer la coque</p>'] },
      ], 'Bilan de la journée'), 'Bilan de la journée'),
    ] }),
];
save('journee-de-traces', vt.tour(scenes, { title: 'Une journée de traces' }));

/* ---- 4. GeoQuiz : « Où voyagent mes données ? » ------------------------------------------------ */
const geo = gq.quiz([
  gq.lieu("Les sièges européens de TikTok et de Meta (Facebook, Instagram, WhatsApp) sont dans la même ville. Clique dessus.", 'Dublin (Irlande)', 53.3498, -6.2603),
  gq.pays("Facebook, Instagram, Snapchat et YouTube ont été créés dans le même pays. Clique sur ce pays.", 'États-Unis', 'USA'),
  gq.lieu("Le siège mondial de Meta est à Menlo Park, près de San Francisco. Clique dessus.", 'Menlo Park (Californie)', 37.4848, -122.1484),
  gq.lieu("TikTok appartient à l'entreprise ByteDance, créée à Pékin. Clique sur Pékin.", 'Pékin (Chine)', 39.9042, 116.4074),
  gq.lieu("Meta a construit un centre de données près du cercle polaire, à Luleå, pour refroidir ses serveurs avec l'air froid. Clique dessus.", 'Luleå (Suède)', 65.5848, 22.1547),
  gq.lieu("La CNIL, qui protège tes données personnelles en France, est à Paris. Clique dessus.", 'Paris (France)', 48.8566, 2.3522),
  gq.pays("Pour toute l'Europe, c'est l'autorité de protection des données de ce pays qui surveille TikTok et Meta. Clique sur ce pays.", 'Irlande', 'IRL'),
], { centre: [40, 10], zoom: 2, fond: gq.FONDS.plan,
  l10n: { intro: '<p>Tes données ne restent pas dans ton téléphone. Clique sur la carte pour suivre leur voyage. Plus tu cliques près, plus tu gagnes de points.</p>' } });
const areas = fs.readdirSync(`${process.argv[4]}/H5P.GeoQuiz-1.1/geojson-data`).map((f) => f.replace('.geo.json', ''));
gq.validate(geo, { areas });
save('voyage-donnees', geo);

/* ---- 5. Tabs : « Reprendre la main » (4 réflexes) ----------------------------------------------- */
const tabsContent = tb.tabs([
  tb.tab('Avant de publier', [
    text("<p>Voici le profil d'Inès, 14 ans (personnage inventé). Elle n'a rien publié de « grave »… Regarde bien.</p>"),
    image('images/profil-ines.jpg', 1400, 700, "Profil public d'Inès : pseudo ines.basket14, 4e B au collège Jean-Moulin, entraînement de basket le mardi à 18 h au gymnase Pasteur, anniversaire le 12 mars, photos d'un ballon au gymnase, de son chat Pixel et de sa maison sous la neige.", 'Profil d\'Inès',
      { license: 'U', title: 'Profil inventé ; photos Pixabay : picselweb, KAVOWO, PublicDomainPictures' }),
    mc("Qu'est-ce qu'un inconnu peut apprendre sur Inès grâce à ce profil ?", [
      { t: 'Son âge', ok: true, fb: "Oui : « 14 » dans son pseudo et sa date d'anniversaire." },
      { t: 'Son collège et sa classe', ok: true },
      { t: 'Où la trouver le mardi à 18 h', ok: true, fb: 'Oui : le gymnase et l\'horaire sont écrits dans la bio.' },
      { t: 'À quoi ressemble sa maison', ok: true, fb: 'Oui : « devant chez moi » + la photo.' },
      { t: 'Rien d\'utile : ce ne sont que des photos banales', fb: 'Piège : chaque détail est banal, mais ensemble ils permettent de savoir qui elle est, où et quand la trouver.' },
    ], 'Que révèle le profil ?', { type: 'multi' }),
    text("<p><strong>La règle des trois lecteurs.</strong> Avant de publier, imagine que ton professeur, ta grand-mère et un inconnu le lisent. Si l'un des trois te gêne, ne publie pas, ou enlève le détail qui en dit trop.</p>"),
  ]),
  tb.tab('Mes réglages', [
    text("<p>Dans chaque appli, ouvre <strong>Paramètres › Confidentialité</strong> et vérifie :</p><ul>"
      + '<li><strong>Compte privé</strong> : seuls tes abonnés acceptés voient tes publications (mais ton pseudo, ta photo de profil et ta bio restent visibles par tous) ;</li>'
      + '<li><strong>Qui peut m\'identifier</strong> ou me mentionner : « personne » ou « mes amis » ;</li>'
      + '<li><strong>Localisation</strong> : « jamais » ou « pendant l\'utilisation », et désactive le partage de position avec la carte des amis ;</li>'
      + '<li><strong>Qui peut m\'écrire</strong> : pas les inconnus.</li></ul>'),
    tf("Une appli de lampe torche a besoin d'accéder à ma position et à mes contacts.", false,
      "Exact : une appli ne doit demander que ce dont elle a besoin. Une lampe torche n'a besoin ni de ta position ni de tes contacts.",
      "Non : une lampe torche n'a besoin ni de ta position ni de tes contacts. Si elle les demande, c'est souvent pour collecter des données."),
  ]),
  tb.tab('Mes mots de passe', [
    text('<ul><li><strong>Un mot de passe différent</strong> pour chaque compte : si un site se fait pirater, les autres restent protégés.</li>'
      + '<li><strong>Long plutôt que compliqué</strong> : une phrase de passe de 4 mots ou plus, sans rapport avec toi.</li>'
      + '<li><strong>Jamais partagé</strong>, même avec ton meilleur ami.</li>'
      + '<li><strong>Double authentification</strong> : un code reçu sur ton téléphone en plus du mot de passe.</li></ul>'),
    mc('Quel mot de passe est le plus solide ?', [
      { t: 'violon-tartine-orage-Lune7', ok: true, fb: 'Oui : long, sans lien avec toi, facile à retenir pour toi seul.' },
      { t: 'ChatPixel2012', fb: "Piège : le nom de son chat est sur le profil d'Inès, et une année de naissance se devine." },
      { t: 'Azerty123!', fb: 'Piège : les majuscules et le « ! » ne suffisent pas, c\'est une suite de touches parmi les plus utilisées au monde.' },
      { t: 'ines.basket14', fb: 'Piège : c\'est son pseudo, que tout le monde peut lire.' },
    ], 'Le mot de passe le plus solide'),
  ]),
  tb.tab('Me chercher moi-même', [
    text("<p>Tape ton prénom et ton nom <strong>entre guillemets</strong> dans un moteur de recherche, puis ton pseudo. Regarde aussi l'onglet « Images ».</p>"
      + "<p>Ce que tu trouves, n'importe qui peut le trouver : un futur employeur, un nouveau club, un inconnu. Si quelque chose te gêne, le chapitre 6 explique comment le faire retirer.</p>"),
    tf('Si je supprime une publication, elle disparaît forcément de partout.', false,
      "Exact : une capture d'écran, un partage ou une copie peuvent survivre à la suppression.",
      "Non : quelqu'un a pu faire une capture d'écran ou la partager avant. Supprimer limite les dégâts, mais ne garantit rien."),
  ]),
], { placement: 'top', color: '#1d3557', spread: 100 });
save('reprendre-la-main', tabsContent);

/* ---- 6. Sort the Paragraphs : « Faire retirer une photo » -------------------------------------- */
const tpl = JSON.parse(fs.readFileSync(`${process.argv[5]}/content/content.json`, 'utf8'));
save('retirer-une-photo', { ...tpl,
  taskDescription: '<p>Une photo de toi circule sans ton accord. Remets les étapes dans le bon ordre.</p>',
  behaviour: { ...tpl.behaviour, scoringMode: 'positions' },
  overallFeedback: [
    { from: 0, to: 99, feedback: "Relis : on garde d'abord une preuve, on s'adresse ensuite à la personne, puis au réseau social, et la CNIL arrive en dernier." },
    { from: 100, to: 100, feedback: "Bravo ! Et à tout moment, si tu te sens harcelé, appelle le 3018 (gratuit, anonyme)." }],
  paragraphs: [
    "<p><strong>Je garde une preuve</strong> : une capture d'écran qui montre la photo, le compte qui l'a publiée et la date.</p>",
    '<p><strong>Je demande à la personne</strong> qui a publié la photo de la retirer.</p>',
    '<p><strong>Pas de réponse ?</strong> Je signale la photo au réseau social avec le bouton « Signaler ».</p>',
    "<p><strong>J'attends la réponse</strong> du réseau social : il a un mois pour me répondre.</p>",
    "<p><strong>Toujours rien ?</strong> Avec un parent, je dépose une plainte en ligne auprès de la CNIL.</p>",
  ] });

/* ---- 7. Crossword : les mots de l'identité numérique ------------------------------------------ */
const cw = JSON.parse(fs.readFileSync(`${process.argv[6]}/content/content.json`, 'utf8'));
const W = (answer, clue) => ({ fixWord: false, orientation: 'across', answer, clue });
save('mots-croises-identite', { ...cw,
  taskDescription: '<p>Remplis la grille avec les mots du livre.</p>',
  words: [
    W('Trace', 'Information que je laisse derrière moi à chaque action en ligne'),
    W('Pseudo', 'Nom inventé que j\'utilise sur Internet'),
    W('Métadonnées', 'Informations cachées dans une photo : date, heure, appareil, lieu'),
    W('Algorithme', 'Programme qui devine mes goûts à partir de ce que je regarde'),
    W('Identification', 'Quand un ami ajoute mon nom sur sa photo'),
    W('Confidentialité', 'Paramètres de… : ils règlent qui peut voir mon compte'),
    W('Réputation', 'E-… : l\'image que les autres se font de moi à partir de mes traces'),
    W('Cookie', 'Petit fichier qu\'un site dépose dans mon navigateur pour me reconnaître'),
    W('CNIL', 'Autorité française qui protège les données personnelles'),
  ] });
