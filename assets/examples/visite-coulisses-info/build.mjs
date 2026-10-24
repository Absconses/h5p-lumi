// Visite virtuelle 360 « Dans les coulisses de l'info et des images » (EMI, collège)
// usage : node build.mjs <chemin/vers/virtual-tour.mjs> <sortie content.json>
import fs from 'fs';
const [, , LIB, OUT = 'content.json'] = process.argv;
const vt = await import(LIB);
const { pos360: P, posStatic: S, hotspot: H, goTo, text: T, singleChoice, summary, scene, img } = vt;

const CDI = 0, TV = 1, PHOTO = 2, BILAN = 3;

// ---------- Crédits (repris dans la scène Bilan) ----------
const CR = {
  cdi: { title: 'Biblioteca Regional de Murcia - Fondo', author: 'GALoPaX (Wikimedia Commons)',
    source: 'https://commons.wikimedia.org/wiki/File:Biblioteca_Regional_de_Murcia_-_Fondo.jpg', license: 'CC BY-SA', version: '4.0' },
  tv: { title: 'Tv studio – Panorama', author: 'Sergej Majboroda via Poly Haven (Wikimedia Commons)',
    source: 'https://commons.wikimedia.org/wiki/File:Tv_studio_%E2%80%93_Panorama_(Sergej_Majboroda_via_Poly_Haven).jpg', license: 'CC0 1.0' },
  photo: { title: 'Photo studio broadway hall – Panorama', author: 'Sergej Majboroda via Poly Haven (Wikimedia Commons)',
    source: 'https://commons.wikimedia.org/wiki/File:Photo_studio_broadway_hall_%E2%80%93_Panorama_(Sergej_Majboroda_via_Poly_Haven).jpg', license: 'CC0 1.0' },
  bilan: { title: 'Newspaper, magnifying glass', author: 'Anatoly777 (Pixabay)',
    source: 'https://pixabay.com/photos/newspaper-magnifying-glass-magnifier-3844071/', license: 'U' },
  staline: { title: 'Staline et Molotov au canal Moscou-Volga (1937), avec et sans Nikolaï Iejov', author: 'Photographie soviétique anonyme (Wikimedia Commons)',
    source: 'https://commons.wikimedia.org/wiki/File:Stalin_and_Molotov_along_the_Volga%E2%80%93Don_Canal,_Nikolai_Yezhov_removed.jpg', license: 'PD' },
};
const PANO = (f, c) => img(`images/${f}`, 3840, 1920, c);

const titre = (t) => `<h2 style="color:#1d3557">${t}</h2>`;

// ---------- Scène 0 : le CDI (point de départ) ----------
const cdi = scene({
  id: CDI, name: '1. Le CDI : ton QG d\'enquêteur', src: PANO('cdi.jpg', CR.cdi), camera: P(40, 53),
  description: '<p><strong>Mission :</strong> visite le plateau télé et le studio photo. Dans chaque salle, clique sur les <strong>+</strong> pour découvrir comment on fabrique une information ou une image, puis réponds au quiz. Termine par la salle du bilan.</p>',
  interactions: [
    H(P(40, 50), T(`${titre('Ta mission')}
<p>Chaque jour, tu vois des <strong>informations</strong> et des <strong>images</strong> : au JT, sur les réseaux sociaux, dans la presse. Mais elles ne tombent pas du ciel : <strong>quelqu'un les fabrique</strong>, avec des choix.</p>
<p>Ta mission : entrer dans les <strong>coulisses</strong> pour comprendre ces choix.</p>
<ol><li>Le <strong>plateau télé</strong> : comment se fabrique un journal télévisé ?</li>
<li>Le <strong>studio photo</strong> : une photo montre-t-elle toujours la réalité ?</li>
<li>La <strong>salle du bilan</strong> : vérifie ce que tu as retenu.</li></ol>
<p>Pour regarder autour de toi, fais glisser l'image avec la souris (ou le doigt).</p>`, 'Ta mission'), 'Ta mission'),
    H(P(27, 49), goTo(TV), 'Vers le plateau télé'),
    H(P(53, 50), goTo(PHOTO), 'Vers le studio photo'),
    H(P(88, 50), goTo(BILAN), 'Vers la salle du bilan'),
    H(P(76, 58), T(`${titre('Le CDI, ton allié pour vérifier')}
<p>Au CDI, tu trouves des <strong>sources fiables</strong> : dictionnaires, encyclopédies, documentaires, journaux et magazines.</p>
<p>Ces documents ont un <strong>auteur</strong>, un <strong>éditeur</strong> et une <strong>date</strong> : tu peux savoir <strong>qui</strong> parle et <strong>quand</strong>. C'est la première question à se poser face à une information.</p>
<p>Et si tu as un doute, le <strong>professeur documentaliste</strong> est là pour t'aider à chercher et à vérifier.</p>`, 'Le CDI'), 'Vérifier ses sources'),
    H(P(33, 59), T(`${titre('Le coin presse')}
<p>Le CDI est abonné à des journaux et magazines faits pour ton âge (par exemple des quotidiens ou des hebdomadaires jeunesse).</p>
<p>Un article de presse est écrit par un <strong>journaliste</strong> qui a <strong>recoupé</strong> ses informations : il les a vérifiées auprès de plusieurs sources avant de publier.</p>`, 'Le coin presse'), 'Le coin presse'),
  ],
});

// ---------- Scène 1 : le plateau du JT ----------
const tv = scene({
  id: TV, name: '2. Le plateau du journal télévisé', src: PANO('plateau-tv.jpg', CR.tv), camera: P(42, 51),
  description: '<p>Tu es sur le plateau d\'une chaîne de télévision. Explore les 5 points d\'intérêt, puis fais le <strong>quiz du plateau</strong>.</p>',
  interactions: [
    H(P(41, 55), T(`${titre('Le bureau du présentateur')}
<p>C'est ici que le présentateur lit le <strong>journal télévisé</strong> (JT). Il ne choisit pas seul les sujets : chaque matin, la <strong>conférence de rédaction</strong> décide quelles informations seront traitées, dans quel <strong>ordre</strong> et combien de temps.</p>
<p>Ce document s'appelle le <strong>conducteur</strong>. Mettre un sujet en premier, c'est dire qu'il est le plus important : c'est la <strong>hiérarchie de l'information</strong>.</p>
<p>Le présentateur lit son texte sur un <strong>prompteur</strong>, un écran placé devant la caméra.</p>`, 'Bureau du JT'), 'Le bureau du JT'),
    H(P(36, 40), T(`${titre('Le fond vert')}
<p>Ce mur vert sert à l'<strong>incrustation</strong> : à l'écran, le vert est remplacé par n'importe quelle image (une carte météo, une ville, un décor).</p>
<p>Le présentateur peut donc sembler être <strong>dehors</strong> ou <strong>devant une carte</strong> alors qu'il est en studio. Une image peut être <strong>construite</strong> : ce que tu vois n'est pas toujours le lieu réel.</p>`, 'Fond vert'), 'Le fond vert'),
    H(P(49, 49), T(`${titre('Les caméras')}
<p>Chaque caméra fait un <strong>cadrage</strong> : un plan large montre tout le plateau, un plan serré montre seulement le visage.</p>
<p>Choisir un cadrage, c'est choisir ce que le public va voir… et ce qu'il <strong>ne verra pas</strong> : tout ce qui reste en dehors du cadre s'appelle le <strong>hors-champ</strong>.</p>`, 'Caméras'), 'Les caméras'),
    H(P(30, 51), T(`${titre('Le logo de la chaîne')}
<p>Sur le décor, on lit « UA: СУМИ » : c'est le logo d'une chaîne <strong>publique</strong> ukrainienne de la ville de Soumy.</p>
<p>Le logo te dit <strong>qui</strong> produit l'information. En France aussi, il existe des chaînes <strong>publiques</strong> (France Télévisions) et des chaînes <strong>privées</strong>. Repérer la source, c'est le premier réflexe face à une vidéo, à la télé comme sur les réseaux sociaux.</p>`, 'Logo'), 'Qui parle ?'),
    H(P(77, 57), T(`${titre('Le coin canapé')}
<p>Ce décor plus coloré sert aux <strong>magazines</strong>, aux <strong>interviews</strong> et aux <strong>débats</strong>.</p>
<p>Dans un débat, les invités donnent souvent leur <strong>opinion</strong> (ce qu'ils pensent). Dans un reportage du JT, le journaliste présente des <strong>faits</strong> (ce qui s'est passé, vérifié). Savoir distinguer un <strong>fait</strong> d'une <strong>opinion</strong> est essentiel.</p>`, 'Coin canapé'), 'Fait ou opinion ?'),
    H(P(60, 62), singleChoice([
      { q: '<p>Qui décide de l\'ordre des sujets dans un journal télévisé ?</p>',
        a: ['La rédaction, lors de la conférence de rédaction', 'Le caméraman, pendant le tournage', 'Le public, en votant sur Internet'] },
      { q: '<p>À quoi sert le fond vert ?</p>',
        a: ['À remplacer le décor par une autre image', 'À reposer les yeux du présentateur', 'À améliorer le son du micro'] },
      { q: '<p>Comment appelle-t-on ce qui reste en dehors du cadre de la caméra ?</p>',
        a: ['Le hors-champ', 'Le gros plan', 'Le prompteur'] },
      { q: '<p>« Ce film est le meilleur de l\'année. » Cette phrase est…</p>',
        a: ['Une opinion', 'Un fait vérifié', 'Une source'] },
    ], 'Quiz du plateau'), 'Quiz du plateau'),
    H(P(12, 62), goTo(CDI), 'Retour au CDI'),
  ],
});

// ---------- Scène 2 : le studio photo ----------
const photo = scene({
  id: PHOTO, name: '3. Le studio photo', src: PANO('studio-photo.jpg', CR.photo), camera: P(40, 52),
  description: '<p>Bienvenue dans un studio photo. Ici, chaque image est <strong>préparée</strong>. Explore les 5 points d\'intérêt, puis fais le <strong>quiz du studio</strong>.</p>',
  interactions: [
    H(P(19, 46), T(`${titre('La lumière')}
<p>Ce grand parapluie blanc est une <strong>boîte à lumière</strong>. Elle adoucit la lumière pour que le visage paraisse plus lisse et plus beau.</p>
<p>La lumière change l'<strong>ambiance</strong> d'une photo : douce et chaude, la personne semble sympathique ; dure et sombre, elle peut sembler inquiétante. Le photographe choisit l'émotion qu'il veut provoquer.</p>`, 'Lumière'), 'La lumière'),
    H(P(37, 54), T(`${titre('Le décor')}
<p>Fauteuil, lit, moulures : ce coin ressemble à une chambre, mais c'est un <strong>décor</strong>.</p>
<p>Une photo peut être <strong>mise en scène</strong> : on place les objets et les personnes pour raconter une histoire. C'est normal en publicité ou dans la mode. Mais une <strong>photo de presse</strong>, elle, doit montrer un moment réel, sans mise en scène.</p>`, 'Décor'), 'Le décor'),
    H(P(59, 50), T(`${titre('La fenêtre : le cadre')}
<p>Regarde par la fenêtre : on voit un petit jardin. Si le photographe cadre serré sur la fenêtre, on pourrait croire que la maison est à la campagne !</p>
<p>Comme à la télé, le <strong>cadrage</strong> choisit ce qu'on montre. Une même scène, cadrée autrement, peut raconter une tout autre histoire.</p>`, 'Cadre'), 'Le cadre'),
    H(P(88, 52), T(`${titre('Le fond blanc')}
<p>Ce fond blanc arrondi s'appelle un <strong>cyclo</strong>. Il fait disparaître le décor : l'objet ou la personne semble flotter dans le vide.</p>
<p>Il facilite le <strong>détourage</strong> : sur ordinateur, on peut ensuite découper la personne et la coller sur n'importe quel autre fond.</p>`, 'Fond blanc'), 'Le fond blanc'),
    H(P(66, 44), T(`${titre('La retouche')}
<p>Après la prise de vue, la photo passe souvent par un logiciel de <strong>retouche</strong> : on corrige la lumière, on efface un bouton, on affine une silhouette.</p>
<p>Certaines retouches vont plus loin : sous Staline, en URSS, des personnes tombées en disgrâce étaient <strong>effacées</strong> des photos officielles (clique sur « Avant / après » pour voir un exemple). Aujourd'hui, l'<strong>intelligence artificielle</strong> peut même créer des photos de scènes qui n'ont jamais existé.</p>
<p>Le réflexe : chercher l'<strong>origine</strong> de l'image (par exemple avec une recherche d'image inversée) et la comparer avec d'autres sources.</p>`, 'Retouche'), 'La retouche'),
    H(P(73, 47), vt.image(img('images/retouche-staline.jpg', 1771, 790, CR.staline),
      'Deux versions de la même photo de 1937 : à gauche, Nikolaï Iejov marche à côté de Staline ; à droite, il a été effacé et remplacé par de l\'eau.',
      'Photo retouchée : Iejov a disparu'), 'Avant / après'),
    H(P(48, 62), singleChoice([
      { q: '<p>À quoi sert la boîte à lumière ?</p>',
        a: ['À adoucir la lumière sur le sujet', 'À enregistrer le son de la séance', 'À imprimer les photos du studio'] },
      { q: '<p>Une photo de presse doit…</p>',
        a: ['Montrer un moment réel, sans mise en scène', 'Toujours être retouchée pour être belle', 'Être prise uniquement en studio'] },
      { q: '<p>Le fond blanc du studio permet surtout…</p>',
        a: ['De détourer la personne pour changer le fond', 'De rendre la photo en noir et blanc', 'De cacher le photographe'] },
      { q: '<p>Tu vois une photo étonnante sur un réseau social. Quel est le bon réflexe ?</p>',
        a: ['Chercher son origine et la comparer à d\'autres sources', 'La partager tout de suite à tes amis', 'Croire qu\'elle est vraie si elle a beaucoup de « j\'aime »'] },
    ], 'Quiz du studio'), 'Quiz du studio'),
    H(P(3, 48), goTo(CDI), 'Retour au CDI'),
  ],
});

// ---------- Scène 3 : le bilan (image fixe) ----------
const credits = Object.values(CR).map((c) =>
  `<li><a href="${c.source}" target="_blank" rel="noopener">${c.title}</a> : ${c.author}, ${c.license === 'U' ? 'licence Pixabay' : c.license + (c.version ? ' ' + c.version : '')}</li>`).join('');
const bilan = scene({
  id: BILAN, type: 'static', name: '4. La salle du bilan', src: img('images/bilan.jpg', 1280, 885, CR.bilan),
  description: '<p>Dernière étape : clique sur la <strong>loupe</strong> pour faire le bilan de ta visite.</p>',
  interactions: [
    H(S(44, 50), summary('<p>Pour chaque série, choisis l\'affirmation <strong>juste</strong>.</p>', [
      { ok: 'Une information est fabriquée par des personnes qui font des choix.', ko: ['Une information arrive toute seule, sans aucun choix.', 'Une information est toujours neutre et complète.'] },
      { ok: 'Le cadrage montre une partie de la réalité, pas tout.', ko: ['Le cadrage montre toujours toute la scène.', 'Le cadrage ne sert qu\'à faire de belles images.'] },
      { ok: 'Une image peut être mise en scène, retouchée ou incrustée.', ko: ['Une photo est toujours une preuve de ce qui s\'est passé.', 'Seuls les films de cinéma utilisent des trucages.'] },
      { ok: 'Avant de croire ou partager, je cherche qui parle et je vérifie.', ko: ['Si beaucoup de gens partagent, c\'est forcément vrai.', 'Je partage d\'abord, je vérifierai plus tard.'] },
    ], 'Bilan de la visite'), 'Bilan de la visite'),
    H(S(80, 16), T(`${titre('Les 4 réflexes du détective de l\'info')}
<ol><li><strong>Qui parle ?</strong> Repère l'auteur, la chaîne, le site.</li>
<li><strong>Quand ?</strong> Vérifie la date : une vieille image peut ressortir des années plus tard.</li>
<li><strong>Fait ou opinion ?</strong> Distingue ce qui s'est passé de ce que quelqu'un en pense.</li>
<li><strong>Je recoupe !</strong> Compare avec d'autres sources fiables avant de partager.</li></ol>`, 'Les 4 réflexes'), 'Les 4 réflexes'),
    H(S(86, 86), T(`${titre('Crédits des images')}<ul>${credits}</ul><p>Visite réalisée avec H5P (Virtual Tour 360).</p>`, 'Crédits'), 'Crédits'),
    H(S(8, 12), goTo(CDI), 'Retour au CDI'),
  ],
});

const content = vt.tour([cdi, tv, photo, bilan], { title: "Dans les coulisses de l'info et des images" });
fs.writeFileSync(OUT, JSON.stringify(content, null, 1));
console.log('OK', OUT, content.threeImage.scenes.map((s) => `${s.scenename}: ${s.interactions.length}`).join(' | '));
