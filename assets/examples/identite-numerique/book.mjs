// Livre interactif « Mon identité numérique » (cycle 4, EMI).
// Les types refusés par la Column (Impressive Presentation, Virtual Tour, GeoQuiz, Tabs, Grid Checker,
// Personality Quiz, Sort the Paragraphs, Crossword) sont publiés dans partage/identite-numerique/
// et affichés en cadre (H5P.IFrameEmbed) : entraînement, jamais noté. Tout ce qui est noté est natif.
// usage : node book.mjs <dossier_gabarit_interactivebook> <base_url_partage> <sortie content.json>
import fs from 'fs';
import { text, image, mc, tf, scs, summary, sub, guid } from './fr.mjs';
const [TPL, BASE, OUT] = process.argv.slice(2);
const base = JSON.parse(fs.readFileSync(`${TPL}/content/content.json`, 'utf8'));

const PLAYER = 'https://h5p-offline-player.vercel.app/embed?src=';
const NARROW = '&custom-css=' + encodeURIComponent('https://cdn.jsdelivr.net/gh/Absconses/h5p-lumi@main/partage/embed-960.css');

// Cadre : hauteur = largeur x h / w (pas de défilement), largeur mini 280 px. Ratios mesurés après « Vérifier ».
const iframe = (url, w, h, title) => sub('H5P.IFrameEmbed 1.0',
  { source: url, width: String(w), height: String(h), minWidth: '280', resizeSupported: true }, 'Iframe Embedder', title);

// consigne au-dessus (le cadre n'a pas de titre accessible), lien « Ouvrir en grand » en dessous
const module = (file, w, h, title, consigne, { narrow = false, scripts = false } = {}) => {
  const url = `${PLAYER}${BASE}/${file}${narrow ? NARROW : ''}`;
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

const retiens = (html) => text(`<p><strong>À retenir.</strong> ${html}</p>`, 'À retenir');
const ch = [];

ch.push(chapter('Avant de commencer', [
  text("<p>Ton <strong>identité numérique</strong>, c'est l'ensemble des traces que tu laisses en ligne, et l'image que les autres se font de toi à partir de ces traces. Dans ce livre, tu vas :</p>"
    + '<ul><li>découvrir les traces que tu ne vois pas ;</li><li>savoir qui peut voir quoi ;</li>'
    + '<li>suivre le voyage de tes données ;</li><li>apprendre à reprendre la main, et à faire retirer une photo.</li></ul>'
    + "<p><strong>Comment ça marche ?</strong> Certaines activités s'ouvrent dans un cadre : elles servent à t'entraîner et ne comptent pas dans ton score. Les questions en dessous, elles, comptent.</p>", 'Objectifs'),
  ...module('quiz-internaute.h5p', 1000, 620, 'Questionnaire : quel internaute es-tu ?',
    'Pour commencer : quel internaute es-tu ? Il n\'y a ni bonne ni mauvaise réponse.'),
]));

const L = { montre: 'Ce que je montre', autres: 'Ce que les autres publient sur moi', applis: 'Ce que les applis enregistrent', algo: 'Ce que les algorithmes devinent' };
ch.push(chapter("1. L'iceberg de mes traces", [
  text("<p>Ce que tu publies n'est que la partie visible. Descends dans l'iceberg, couche par couche, avec la flèche ➜ en bas à droite.</p>", 'Introduction'),
  ...module('iceberg.h5p', 1000, 650, "L'iceberg de mon identité numérique", "Parcours l'iceberg en 9 étapes.", { narrow: true, scripts: true }),
  text('<p><strong>À quelle couche de l\'iceberg appartient chaque trace ?</strong></p>', 'Consigne'),
  scs([
    ["Je commente la vidéo d'un youtubeur.", [L.montre, L.applis, L.algo]],
    ['Ma tante publie une photo de mon anniversaire.', [L.autres, L.montre, L.applis]],
    ["Mon appli de musique note que j'écoute la même chanson 20 fois.", [L.applis, L.montre, L.autres]],
    ['La plateforme range mon compte dans la case « fan de jeux vidéo, 13-15 ans ».', [L.algo, L.montre, L.applis]],
    ['Ma photo contient la date et le lieu où elle a été prise.', [L.applis, L.algo, L.autres]],
  ], 'Les couches de l\'iceberg'),
  mc("Lina n'a jamais rien publié sur un réseau social. A-t-elle une identité numérique ?", [
    { t: 'Oui : les applis qu\'elle utilise enregistrent ses traces, et les autres peuvent publier sur elle.', ok: true,
      fb: 'Exact : il suffit d\'utiliser un téléphone ou un site pour laisser des traces.' },
    { t: 'Non : sans publication, il n\'y a pas de traces.', fb: 'Piège : publier, c\'est seulement la pointe de l\'iceberg. Les traces involontaires existent sans rien publier.' },
    { t: 'Non, tant qu\'elle n\'a pas de compte à son nom.', fb: 'Piège : une copine peut publier une photo d\'elle, et les sites enregistrent ses visites même sans compte.' },
    { t: 'Oui, mais seulement si son téléphone est connecté à un compte public.', fb: 'Piège : public ou privé ne change rien aux traces que les applis enregistrent.' },
  ], 'Lina a-t-elle une identité numérique ?'),
]));

ch.push(chapter('2. Privé, ça veut dire quoi ?', [
  text("<p>« Mon compte est privé, donc personne ne voit rien. » Vraiment ? Vérifie, information par information.</p>", 'Introduction'),
  ...module('qui-voit-quoi.h5p', 1000, 600, 'Grille : qui peut voir quoi ?',
    'Coche toutes les personnes qui peuvent voir chaque information, puis clique sur « Vérifier ».', { scripts: true }),
  retiens("<strong>Privé ne veut pas dire secret.</strong> Le réglage « privé » choisit quelles personnes voient tes publications. Mais ton pseudo, ta photo de profil et ta bio restent visibles par tous, et l'entreprise du réseau social voit tout ce que tu fais dans l'appli."),
  mc('Inès passe son compte en privé. Qui peut encore voir ses publications ?', [
    { t: "Ses abonnés acceptés, et l'entreprise du réseau social", ok: true, fb: "Oui : l'entreprise stocke les publications sur ses serveurs, privées ou non." },
    { t: "Personne d'autre qu'elle", fb: 'Piège : « privé » ne veut pas dire « secret ». Ses abonnés les voient toujours.' },
    { t: "Seulement ses abonnés : l'entreprise n'y a plus accès", fb: "Piège : le réglage choisit les personnes, pas l'entreprise, qui garde tout sur ses serveurs." },
    { t: "Tout le monde, comme avant", fb: 'Non : le réglage limite bien les personnes qui voient ses publications aux abonnés qu\'elle a acceptés.' },
  ], 'Compte privé'),
  mc("Une abonnée fait une capture d'écran d'une story privée d'Inès et l'envoie à toute la classe. Que montre cette situation ?", [
    { t: "Un contenu privé peut devenir public dès que quelqu'un le copie", ok: true, fb: 'Exact : le réglage protège la publication, pas les copies.' },
    { t: 'Le réseau social a mal protégé le compte', fb: "Piège : le réseau a fait son travail. C'est une personne autorisée qui a copié la story." },
    { t: "C'est impossible : on ne peut pas capturer une story privée", fb: "Piège : certaines applis préviennent quand on fait une capture, mais aucune ne peut l'empêcher vraiment." },
  ], 'La capture d\'écran'),
]));

ch.push(chapter('3. Une journée de traces', [
  text("<p>Suis une journée ordinaire, de 7 h 30 à 17 h : à la maison, au collège, puis à la boutique de téléphones. Fais glisser l'image pour regarder autour de toi, clique sur les <strong>+</strong> et sur les portes.</p>", 'Introduction'),
  ...module('journee-de-traces.h5p', 1000, 620, 'Visite 360 : une journée de traces',
    'Visite les trois lieux et termine par le « Bilan de la journée » dans la boutique.', { narrow: true }),
  mc('Tu revends ton ancien téléphone. Que dois-tu faire avant ?', [
    { t: "Sauvegarder mes photos, me déconnecter de mes comptes, puis le réinitialiser aux paramètres d'usine", ok: true,
      fb: "Oui : la réinitialisation efface tout ce que le téléphone contient." },
    { t: 'Supprimer mes photos une par une, cela suffit', fb: 'Piège : tes comptes restent connectés (messagerie, réseaux sociaux) et des photos peuvent rester dans la corbeille.' },
    { t: 'Retirer la carte SIM : mes données sont dedans', fb: 'Piège : la carte SIM sert au réseau téléphonique. Photos et messages sont dans la mémoire du téléphone.' },
    { t: 'Rien : la boutique efface tout', fb: 'Piège : rien ne le garantit. C\'est à toi de le faire avant de le donner.' },
  ], 'Revendre son téléphone'),
  tf('Une photo prise avec un téléphone peut contenir le lieu exact où elle a été prise.', true,
    'Exact : ce sont les métadonnées (date, heure, appareil, coordonnées GPS).',
    'Si : les métadonnées de la photo contiennent souvent les coordonnées GPS du lieu.', 'Les métadonnées'),
]));

ch.push(chapter('4. Où voyagent mes données ?', [
  text("<p>Quand tu publies une vidéo depuis ta chambre, elle part sur des serveurs à l'autre bout de l'Europe, ou du monde. Qui la garde ? Quelle loi te protège ?</p>", 'Introduction'),
  ...module('voyage-donnees.h5p', 1000, 650, 'Quiz sur carte : où voyagent mes données ?',
    'Réponds aux 7 questions en cliquant sur la carte.', { scripts: true }),
  retiens("Le <strong>RGPD</strong> (Règlement général sur la protection des données) protège les habitants de l'Union européenne depuis 2018. Il s'applique à <strong>toute entreprise qui propose ses services en Europe</strong>, même si son siège est aux États-Unis ou en Chine. En France, la <strong>CNIL</strong> veille à son respect et reçoit les plaintes."),
  mc("Ton compte TikTok est géré par une société installée en Irlande, qui appartient à un groupe chinois. Quelle règle protège tes données ?", [
    { t: "Le RGPD, parce que TikTok propose ses services aux habitants de l'Union européenne", ok: true, fb: 'Exact : ce qui compte, c\'est où vivent les utilisateurs, pas où est le siège.' },
    { t: "Aucune, car l'entreprise n'est pas française", fb: 'Piège : le RGPD protège tous les habitants de l\'Union européenne, quelle que soit la nationalité de l\'entreprise.' },
    { t: 'La loi chinoise, car le groupe est chinois', fb: 'Piège : pour ses utilisateurs européens, TikTok doit respecter le RGPD.' },
    { t: 'La loi américaine, car Internet a été inventé aux États-Unis', fb: "Piège : l'histoire d'Internet ne décide pas de la loi qui s'applique à tes données." },
  ], 'Quelle loi me protège ?'),
  mc("En France, à partir de quel âge peux-tu accepter <strong>seul</strong> qu'un réseau social utilise tes données personnelles ?", [
    { t: '15 ans', ok: true, fb: "Exact : avant 15 ans, il faut aussi l'accord d'un parent." },
    { t: '13 ans', fb: "Piège : 13 ans, c'est l'âge minimum fixé par beaucoup de réseaux sociaux dans leurs conditions d'utilisation, pas la loi française." },
    { t: '18 ans', fb: "Piège : c'est la majorité, mais pour les données la loi française fixe 15 ans." },
    { t: '11 ans', fb: "Non : l'entrée au collège ne change rien. La loi française fixe 15 ans." },
  ], 'La majorité numérique'),
]));

ch.push(chapter('5. Reprendre la main', [
  text('<p>Quatre réflexes, un par onglet. Fais la petite activité de chaque onglet.</p>', 'Introduction'),
  ...module('reprendre-la-main.h5p', 1000, 1150, 'Onglets : reprendre la main',
    'Ouvre les 4 onglets : Avant de publier, Mes réglages, Mes mots de passe, Me chercher moi-même.', { scripts: true }),
  mc("Avant de publier une vidéo de ton entraînement de basket, que vérifies-tu d'abord ?", [
    { t: "Qu'on ne voit ni le nom du club, ni l'horaire, ni le lieu", ok: true, fb: 'Oui : ces détails disent où et quand te trouver.' },
    { t: 'Que mon compte est privé : alors je peux tout montrer', fb: 'Piège : un abonné peut copier la vidéo, et le réseau social la garde.' },
    { t: 'Que la vidéo a un joli filtre', fb: 'Cela ne protège rien : le filtre change l\'image, pas les informations qu\'elle donne.' },
    { t: 'Que la vidéo dure moins d\'une minute', fb: 'Une vidéo courte peut en dire autant qu\'une longue.' },
  ], 'Avant de publier'),
  tf('Utiliser le même mot de passe partout est sans danger, à condition qu\'il soit long.', false,
    'Exact : si un seul site se fait pirater, tous tes comptes sont ouverts.',
    'Non : si un seul site se fait pirater, le même mot de passe ouvre tous tes autres comptes.', 'Un mot de passe partout'),
]));

ch.push(chapter('6. Faire retirer une photo', [
  text("<p>Une photo de toi circule sans ton accord ? Tu as des droits : le <strong>droit à l'image</strong> (on doit te demander avant de publier une photo où tu es reconnaissable) et le <strong>droit à l'effacement</strong> (demander qu'on supprime des données sur toi).</p>", 'Introduction'),
  ...module('retirer-une-photo.h5p', 1000, 1250, 'Remettre en ordre : faire retirer une photo', 'Remets les 5 étapes dans le bon ordre.'),
  text("<p><strong>Harcèlement, moqueries, chantage ?</strong> N'attends pas : parles-en tout de suite à un adulte de confiance et appelle le <strong>3018</strong> (gratuit, anonyme, 7 jours sur 7, aussi par l'appli 3018). Le 3018 peut faire supprimer un contenu en quelques heures.</p>", '3018'),
  mc("Ton ami publie une photo de toi sans te demander. En a-t-il le droit ?", [
    { t: "Non : il doit te demander ton accord, c'est ton droit à l'image", ok: true, fb: "Exact : chacun décide si une photo où il est reconnaissable peut être publiée." },
    { t: "Oui, puisque c'est lui qui a pris la photo", fb: "Piège : prendre la photo ne donne pas le droit de publier ton image. C'est toi qui décides." },
    { t: 'Oui, si son compte est privé', fb: 'Piège : même sur un compte privé, la photo est vue et peut être copiée.' },
    { t: 'Oui, si la photo est réussie', fb: 'Une belle photo reste ton image : il faut quand même ton accord.' },
  ], "Le droit à l'image"),
]));

ch.push(chapter('7. Les mots pour le dire', [
  ...module('mots-croises-identite.h5p', 1000, 1000, "Mots croisés : les mots de l'identité numérique",
    'Remplis la grille avec les mots du livre, puis clique sur « Vérifier ».'),
  summary("Ce que je retiens : choisis à chaque fois la phrase juste.", [
    ["Mon identité numérique, c'est toutes mes traces, visibles ou non.", "Mon identité numérique, c'est seulement ce que je publie.", "Mon identité numérique disparaît quand je supprime mon compte."],
    ['Un compte privé cache mes publications aux inconnus, pas à la plateforme.', 'Un compte privé rend tout invisible.', "Un compte privé empêche les captures d'écran."],
    ["Le RGPD protège mes données, même si l'entreprise est à l'étranger.", "Le RGPD ne concerne que les entreprises françaises.", 'Le RGPD ne concerne que les adultes.'],
    ["Avant de publier la photo d'un ami, je lui demande son accord.", "Si c'est moi qui ai pris la photo, je peux la publier sans demander.", 'Une photo de groupe peut toujours être publiée.'],
    ['Pour faire retirer une photo, je garde une preuve puis je demande à la personne de la retirer.', 'Pour faire retirer une photo, je porte plainte à la CNIL en premier.', 'On ne peut jamais faire retirer une photo.'],
  ], 'Ce que je retiens'),
  text('<p style="font-size:0.8em;color:#555">Crédits : panoramas 360° de Poly Haven (CC0) par Greg Zaal, Savva Zakharov et Philip Modin ; '
    + "photos du profil d'Inès sur Pixabay (picselweb, KAVOWO, PublicDomainPictures) ; illustration de l'iceberg et profil d'Inès (personnage inventé) réalisés pour ce livre.</p>", 'Crédits'),
]));

const book = { ...base, chapters: ch };
book.bookCover = {
  coverDescription: "<p style=\"text-align:center\">Ce que tu montres en ligne n'est que la pointe de l'iceberg. Découvre le reste, et comment reprendre la main.</p>",
  coverMedium: image('images/couverture.jpg', 1600, 900, "Un iceberg : au-dessus de l'eau, ce que je montre ; en dessous, ce que les autres publient, ce que les applis enregistrent et ce que les algorithmes devinent.", 'Couverture'),
};
book.behaviour = { ...base.behaviour, baseColor: '#1d3557' };
fs.writeFileSync(OUT, JSON.stringify(book));
console.log('livre :', ch.length, 'chapitres');
