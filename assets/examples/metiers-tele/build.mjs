// Visite virtuelle « Les métiers de la télé » (EMI, collège) — H5P.ThreeImage 0.5
// usage : node build.mjs <chemin/vers/virtual-tour.mjs> <sortie content.json>
import fs from 'fs';
const [, , LIB, OUT = 'content.json'] = process.argv;
const vt = await import(LIB);
const { pos360: P, posStatic: S, hotspot: H, goTo, text: T, image: I, singleChoice, summary, scene, img } = vt;

const PLATEAU = 0, REGIE = 1, REDAC = 2, MONTAGE = 3, TERRAIN = 4, BILAN = 5;

// ---------- Crédits ----------
const px = (title, author, id, slug) => ({ title, author: `${author} (Pixabay)`, source: `https://pixabay.com/photos/${slug}-${id}/`, license: 'U' });
const CR = {
  plateau: { title: 'Tv studio – Panorama', author: 'Sergej Majboroda via Poly Haven (Wikimedia Commons)',
    source: 'https://commons.wikimedia.org/wiki/File:Tv_studio_%E2%80%93_Panorama_(Sergej_Majboroda_via_Poly_Haven).jpg', license: 'CC0 1.0' },
  regie: px('Régie de télévision', 'This_is_Engineering', 4922421, 'engineer-engineering-broadcast'),
  consoleSon: px('Console de mixage son', 'This_is_Engineering', 4922411, 'engineer-engineering-broadcast'),
  redaction: px('Réunion', '089photoshootings', 1979261, 'people-business-meeting'),
  montage: px('Monteur et étalonneur', 'TheArkow', 5638146, 'man-editor-color-correction'),
  terrain: px('Journaliste reporter d\'images', 'Dylan_Agbagni', 6847555, 'journalist-camera-camcorder'),
  bilan: px('Plateau de télévision', 'This_is_Engineering', 4922434, 'engineer-engineering-broadcast'),
  melangeur: px('Mélangeur vidéo', 'cheese07', 4375908, 'tricaster-grass-valley'),
  micro: px('Micros canons', 'vanleuven0', 772576, 'microphone-shotgun-audio'),
  maquillage: px('Pinceaux de maquillage', 'dapictures_team', 2676392, 'makeup-beauty-brushes'),
  prompteur: px('Prompteur', 'Studio-Lannach', 6135431, 'teleprompter-camera-reporter'),
  camion: px('Cars régie satellite', 'Tho-Ge', 7204122, 'media-tv-watch-tv'),
};
const PHOTO = (f, c, w = 1280, h = 853) => img(`images/${f}`, w, h, c);

// Fiche métier : nom, ce qu'il fait, un détail concret
const M = (metier, role, plus) => `<h2 style="color:#1d3557">${metier}</h2><p>${role}</p>${plus ? `<p style="background-color:#eef3f8;padding:8px;border-left:4px solid #1d3557">${plus}</p>` : ''}`;
// étiquette = 1er nom avant « / » ou « ( » pour rester courte à l'écran
const short = (n) => n.split(/ \/ | \(| et /)[0];
const metier = (pos, nom, role, plus) => H(pos, T(M(nom, role, plus), nom), short(nom));
const photo = (pos, f, c, alt, label) => H(pos, I(PHOTO(f, c), alt, label), `📷 ${label}`);

// ---------- Scène 0 : le plateau (360) ----------
const plateau = scene({
  id: PLATEAU, name: '1. Le plateau', src: img('images/plateau-tv.jpg', 3840, 1920, CR.plateau), camera: P(42, 52),
  description: '<p><strong>Mission :</strong> un journal télévisé (JT) demande le travail de dizaines de personnes. Sur ce plateau, clique sur les <strong>+</strong> pour découvrir les métiers. Fais glisser l\'image pour regarder autour de toi. Puis visite la régie, la rédaction, la salle de montage et le terrain. Termine par le <strong>bilan</strong>.</p>',
  interactions: [
    H(P(44, 43), T(`<h2 style="color:#1d3557">Bienvenue sur le plateau !</h2>
<p>Ce soir, le JT dure 30 minutes. Mais pour ces 30 minutes, une équipe a travaillé toute la journée : sur le <strong>terrain</strong>, à la <strong>rédaction</strong>, en <strong>montage</strong>, en <strong>régie</strong> et ici, sur le <strong>plateau</strong>.</p>
<p>Ton défi : repérer <strong>qui fait quoi</strong>. Regarde tout autour de toi (même au plafond !), puis utilise les portes <strong>➜</strong> pour changer de salle.</p>`, 'Bienvenue'), 'Bienvenue !'),
    metier(P(41, 56), 'Le présentateur / la présentatrice',
      'Il ou elle <strong>lance les sujets</strong> du JT, mène les interviews et fait le lien entre les reportages. C\'est un <strong>journaliste</strong> : il a participé à la conférence de rédaction et connaît ses sujets.',
      'Il lit son texte sur un <strong>prompteur</strong> : un écran fixé devant la caméra qui fait défiler le texte. Il a aussi une <strong>oreillette</strong> pour entendre la régie.'),
    photo(P(52, 45), 'prompteur.jpg', CR.prompteur, 'Une journaliste règle un prompteur fixé devant une caméra.', 'Le prompteur'),
    metier(P(48, 50), 'Le cadreur / la cadreuse',
      'Derrière chaque caméra du plateau, un cadreur choisit le <strong>cadre</strong> : plan large sur tout le plateau, plan serré sur un visage. Il suit les ordres du réalisateur, qu\'il entend dans son casque.',
      'Sur un plateau de JT, il y a souvent 3 ou 4 caméras. Le réalisateur choisit à chaque instant laquelle passe à l\'antenne.'),
    metier(P(10, 30), 'Le machiniste et la grue',
      'Ce long bras articulé est une <strong>grue</strong> avec une caméra au bout. Elle permet des mouvements spectaculaires au-dessus du plateau. Le <strong>machiniste</strong> installe et déplace grues, rails et pieds de caméra.'),
    metier(P(30, 22), 'Le chef électricien / l\'éclairagiste',
      'Lève les yeux : des dizaines de <strong>projecteurs</strong> pendent au plafond. L\'éclairagiste les règle pour que les visages soient bien éclairés, sans ombre, et pour créer l\'<strong>ambiance</strong> du décor.',
      'La lumière d\'un JT est neutre et claire : elle doit inspirer <strong>confiance</strong>. Celle d\'un jeu télévisé est colorée et spectaculaire.'),
    metier(P(60, 43), 'L\'ingénieur du son / le perchman',
      'Chaque invité porte un petit <strong>micro-cravate</strong> accroché au col. L\'ingénieur du son règle le volume de chaque micro pour que tout soit clair. En reportage, le <strong>perchman</strong> tient un micro au bout d\'une longue perche, juste hors du cadre.'),
    photo(P(64, 50), 'micro.jpg', CR.micro, 'Deux micros canons, très directionnels, utilisés au bout d\'une perche.', 'Les micros canons'),
    metier(P(23, 63), 'Le régisseur / la régisseuse de plateau',
      'Avec son casque, il fait le lien entre la régie et le plateau. Il installe les invités, vérifie que tout est prêt et donne le <strong>compte à rebours</strong> avec les doigts avant le direct : 5, 4, 3, 2, 1… antenne !'),
    metier(P(36, 40), 'Le truquiste / l\'infographiste',
      'Le <strong>fond vert</strong> sert à l\'incrustation : le truquiste remplace le vert par une image (carte météo, ville, graphique). L\'<strong>infographiste</strong> crée les titres, cartes et schémas qui s\'affichent à l\'écran.',
      'Ces images sont <strong>construites</strong> : un présentateur peut sembler dehors alors qu\'il est en studio.'),
    metier(P(77, 57), 'Le chef décorateur',
      'Il imagine et fait construire les <strong>décors</strong> : le bureau du JT, ce coin canapé pour les interviews, les murs de couleur. Le décor donne l\'<strong>identité</strong> de l\'émission : sérieux pour l\'info, chaleureux pour un magazine.'),
    metier(P(92, 50), 'Le maquilleur / la maquilleuse',
      'Avant le direct, il maquille le présentateur et les invités. Ce n\'est pas pour être « beau » : sous les projecteurs, la peau <strong>brille</strong> et les traits paraissent fatigués. Le maquillage corrige ces effets de la lumière.'),
    photo(P(95, 57), 'maquillage.jpg', CR.maquillage, 'Une rangée de pinceaux de maquillage.', 'Les pinceaux'),
    metier(P(5, 52), 'Les écrans de retour',
      'Ces écrans montrent ce qui part <strong>à l\'antenne</strong>. Ils permettent à l\'équipe du plateau de voir l\'image que voient les téléspectateurs. Les décisions, elles, se prennent dans la <strong>régie</strong>.'),
    H(P(55, 60), goTo(REGIE), '➜ La régie'),
    H(P(30, 60), goTo(REDAC), '➜ La rédaction'),
    H(P(68, 53), goTo(MONTAGE), '➜ Le montage'),
    H(P(16, 58), goTo(TERRAIN), '➜ Le terrain'),
    H(P(87, 64), goTo(BILAN), '➜ Le bilan'),
  ],
});

// ---------- Scène 1 : la régie ----------
const regie = scene({
  id: REGIE, type: 'static', name: '2. La régie', src: PHOTO('regie.jpg', CR.regie, 1280, 854),
  description: '<p>La <strong>régie</strong> est le « cerveau » du direct : une salle sombre pleine d\'écrans, à côté du plateau. Clique sur les <strong>+</strong>.</p>',
  interactions: [
    metier(S(16, 26), 'Le mur d\'écrans',
      'Chaque écran montre une source : les caméras du plateau, les reportages prêts à partir, les duplex avec les journalistes sur le terrain, et l\'image qui part à l\'antenne.'),
    metier(S(56, 30), 'Le réalisateur / la réalisatrice',
      'C\'est le <strong>chef d\'orchestre</strong> du direct. Il regarde tous les écrans et décide à chaque seconde quelle image passe à l\'antenne : « Caméra 2… envoyez le reportage ! ». Il parle aux cadreurs dans leur casque.'),
    metier(S(40, 72), 'Le mélangeur vidéo',
      'Cette console permet de <strong>passer d\'une image à l\'autre</strong> : d\'une caméra à une autre, d\'un plateau à un reportage. Le truquiste y ajoute l\'incrustation et les titres.'),
    photo(S(52, 82), 'melangeur.jpg', CR.melangeur, 'Une main sur les boutons lumineux d\'un mélangeur vidéo.', 'Le mélangeur'),
    metier(S(76, 42), 'L\'ingénieur du son',
      'En régie son, il mélange tous les sons : micros des invités, son des reportages, jingle et musique du générique. Il veille à ce que le volume reste <strong>égal</strong> pendant tout le journal.'),
    photo(S(20, 88), 'console-son.jpg', CR.consoleSon, 'Deux techniciens penchés sur une grande console de mixage son.', 'La console son'),
    metier(S(26, 50), 'L\'assistant(e) réalisateur et le/la scripte',
      'L\'assistant suit le <strong>conducteur</strong> (le déroulé minute par minute du JT) et annonce le temps restant : « Reportage dans 10 secondes ! ». Le chronométrage est essentiel : le journal doit finir <strong>à l\'heure</strong>.'),
    H(S(8, 10), goTo(PLATEAU), '➜ Retour au plateau'),
  ],
});

// ---------- Scène 2 : la rédaction ----------
const redac = scene({
  id: REDAC, type: 'static', name: '3. La rédaction', src: PHOTO('redaction.jpg', CR.redaction),
  description: '<p>Dans la <strong>rédaction</strong>, les journalistes décident de ce qui sera dans le JT. Clique sur les <strong>+</strong>.</p>',
  interactions: [
    metier(S(50, 40), 'La conférence de rédaction',
      'Chaque matin, l\'équipe se réunit : quels sujets traiter aujourd\'hui ? Lesquels mettre en premier ? Combien de temps pour chacun ? On ne peut pas tout montrer : il faut <strong>choisir</strong>. C\'est la <strong>hiérarchie de l\'information</strong>.'),
    metier(S(88, 25), 'Le rédacteur en chef / la rédactrice en chef',
      'Il dirige la rédaction et a le <strong>dernier mot</strong> sur le choix des sujets. Il est responsable de ce qui est diffusé : il doit vérifier que les informations sont exactes et équilibrées.'),
    metier(S(57, 14), 'Le chef d\'édition',
      'Il construit le <strong>conducteur</strong> du journal : l\'ordre des sujets, leur durée, les lancements du présentateur. Pendant le direct, il peut changer l\'ordre si une nouvelle importante tombe.'),
    metier(S(30, 30), 'Les journalistes',
      'Ils <strong>enquêtent</strong> : ils appellent des témoins et des experts, vérifient les faits, comparent plusieurs <strong>sources</strong>. Puis ils écrivent le texte de leur reportage. Une règle : une info doit être <strong>recoupée</strong> avant d\'être diffusée.'),
    metier(S(75, 70), 'Le documentaliste',
      'Il retrouve dans les <strong>archives</strong> des images et des informations anciennes pour illustrer un sujet. Il indique aussi d\'où viennent ces images et si on a le droit de les diffuser.'),
    H(S(8, 10), goTo(PLATEAU), '➜ Retour au plateau'),
  ],
});

// ---------- Scène 3 : le montage ----------
const montage = scene({
  id: MONTAGE, type: 'static', name: '4. La salle de montage', src: PHOTO('montage.jpg', CR.montage),
  description: '<p>Les images tournées sur le terrain arrivent ici pour devenir un <strong>reportage</strong> d\'environ 1 min 30. Clique sur les <strong>+</strong>.</p>',
  interactions: [
    metier(S(30, 35), 'Le monteur / la monteuse',
      'Il choisit les meilleurs plans parmi des dizaines de minutes d\'images, les coupe et les met dans l\'ordre, avec le journaliste. Il pose ensuite la <strong>voix off</strong> du journaliste et les interviews.',
      'Monter, c\'est <strong>choisir</strong> : garder une phrase, en couper une autre, placer une image avant une autre. Ces choix changent le sens du reportage. Le monteur et le journaliste doivent rester fidèles à la réalité.'),
    metier(S(30, 72), 'L\'étalonneur',
      'Il corrige les <strong>couleurs</strong> et la lumière des images pour que tous les plans du reportage se ressemblent.'),
    metier(S(78, 45), 'Le mixeur son',
      'Il équilibre la voix du journaliste, le son des interviews et les bruits du lieu (le « son d\'ambiance »), pour que tout soit compréhensible.'),
    H(S(8, 10), goTo(PLATEAU), '➜ Retour au plateau'),
  ],
});

// ---------- Scène 4 : le terrain ----------
const terrain = scene({
  id: TERRAIN, type: 'static', name: '5. Sur le terrain', src: PHOTO('terrain.jpg', CR.terrain),
  description: '<p>Avant d\'arriver au JT, l\'information se recueille <strong>sur le terrain</strong>, ici pendant une manifestation. Clique sur les <strong>+</strong>.</p>',
  interactions: [
    metier(S(42, 55), 'Le JRI (journaliste reporter d\'images)',
      'C\'est un journaliste qui <strong>filme</strong> lui-même. Il porte une caméra d\'épaule et choisit ses images sur place. Souvent, il travaille en duo avec un <strong>journaliste rédacteur</strong> qui pose les questions et écrit le reportage.',
      'Sur la caméra, on voit le logo « 3 » : c\'est une équipe de <strong>France 3</strong>, la chaîne publique des informations régionales.'),
    metier(S(55, 22), 'Le micro de la caméra',
      'Au-dessus de la caméra, des micros enregistrent le son d\'ambiance. Pour une interview, l\'équipe utilise un micro à main ou un micro-cravate.'),
    metier(S(86, 60), 'Filmer un événement',
      'Pendant une manifestation, le JRI doit montrer ce qui se passe <strong>sans prendre parti</strong>, et en restant en sécurité. Ce qu\'il filme n\'est qu\'une <strong>partie</strong> de l\'événement : le reste est hors-champ.'),
    photo(S(28, 14), 'camion.jpg', CR.camion, 'Des camions de télévision avec une parabole sur le toit.', 'Le car régie'),
    metier(S(15, 30), 'Le technicien de transmission',
      'Pour un <strong>direct</strong> depuis le terrain, un technicien envoie les images à la chaîne par satellite (avec la parabole d\'un camion) ou par le réseau mobile. C\'est le « duplex » que tu vois au JT.'),
    H(S(8, 10), goTo(PLATEAU), '➜ Retour au plateau'),
  ],
});

// ---------- Scène 5 : le bilan ----------
const credits = Object.values(CR).map((c) =>
  `<li><a href="${c.source}" target="_blank" rel="noopener">${c.title}</a> : ${c.author}, ${c.license === 'U' ? 'licence Pixabay' : c.license}</li>`).join('');
const bilan = scene({
  id: BILAN, type: 'static', name: '6. Le bilan', src: PHOTO('bilan.jpg', CR.bilan, 1280, 854),
  description: '<p>Dernière étape : fais le quiz <strong>« Qui fait quoi ? »</strong>, puis remets dans l\'ordre le trajet d\'un sujet.</p>',
  interactions: [
    H(S(55, 45), singleChoice([
      { q: '<p>Qui décide quelle caméra passe à l\'antenne pendant le direct ?</p>', a: ['Le réalisateur', 'Le cadreur', 'Le maquilleur'] },
      { q: '<p>Qui a le dernier mot sur le choix des sujets du JT ?</p>', a: ['Le rédacteur en chef', 'Le présentateur', 'L\'ingénieur du son'] },
      { q: '<p>Qui filme lui-même ses images sur le terrain ?</p>', a: ['Le JRI', 'Le monteur', 'Le chef décorateur'] },
      { q: '<p>Qui choisit et assemble les plans d\'un reportage ?</p>', a: ['Le monteur', 'Le régisseur de plateau', 'L\'éclairagiste'] },
      { q: '<p>Qui donne le compte à rebours avant le direct, sur le plateau ?</p>', a: ['Le régisseur de plateau', 'Le documentaliste', 'Le truquiste'] },
      { q: '<p>Qui remplace le fond vert par une carte météo ?</p>', a: ['Le truquiste', 'Le perchman', 'Le rédacteur en chef'] },
    ], 'Qui fait quoi ?'), 'Quiz : qui fait quoi ?'),
    H(S(30, 75), summary('<p>Le trajet d\'un sujet du JT : pour chaque étape, choisis l\'affirmation <strong>juste</strong>.</p>', [
      { ok: '1. Le matin, la conférence de rédaction choisit les sujets.', ko: ['1. Le matin, le présentateur choisit seul les sujets.', '1. Le matin, le public vote pour les sujets.'] },
      { ok: '2. Une équipe part sur le terrain filmer et interroger des témoins.', ko: ['2. Les images sont inventées en studio.', '2. On copie des vidéos trouvées sur Internet sans vérifier.'] },
      { ok: '3. En salle de montage, on choisit et on assemble les meilleurs plans.', ko: ['3. En salle de montage, on garde toutes les images tournées.', '3. En salle de montage, on maquille les invités.'] },
      { ok: '4. Pendant le direct, le réalisateur envoie le reportage depuis la régie.', ko: ['4. Pendant le direct, le cadreur décide de tout.', '4. Pendant le direct, rien ne peut changer.'] },
    ], 'Le trajet d\'un sujet'), 'Le trajet d\'un sujet'),
    H(S(86, 88), T(`<h2 style="color:#1d3557">Crédits des images</h2><ul>${credits}</ul><p>Visite réalisée avec H5P (Virtual Tour 360).</p>`, 'Crédits'), 'Crédits'),
    H(S(8, 10), goTo(PLATEAU), '➜ Retour au plateau'),
  ],
});

const content = vt.tour([plateau, regie, redac, montage, terrain, bilan], { title: 'Les métiers de la télé' });
fs.writeFileSync(OUT, JSON.stringify(content, null, 1));
console.log('OK', OUT, content.threeImage.scenes.map((s) => `${s.scenename}: ${s.interactions.length}`).join(' | '));
