// Livre interactif « Qui t'informe ? Le journalisme à l'ère de l'IA » (EMI, 4e-3e, environ 1 h).
// D'après la tribune de Fabrice Fries, président de l'AFP (Le Monde, 2 juin 2026) : idées reformulées,
// citations courtes et créditées.
// Chaque chapitre = une Course Presentation courte (3 à 5 diapos) qui découpe la notion, puis une
// activité notée native dans la page (lisible à toutes les tailles d'écran).
// usage : node build.mjs <dossier_gabarit_interactivebook_extrait> <sortie content.json>
import fs from 'fs';
import { text, image, mc, tf, sub, guid } from './fr.mjs';
import { el, pic, txt, slide, cp, dragText, markWords, sortInto, essay } from './cp.mjs';
const [TPL, OUT] = process.argv.slice(2);
const base = JSON.parse(fs.readFileSync(`${TPL}/content/content.json`, 'utf8'));

const INK = '#1c2230', RED = '#b23a2e', BLUE = '#23577a', LINE = '#d8d2c4';
const PX = (user) => ({ license: 'U', author: `${user} (Pixabay)`, source: 'https://pixabay.com', title: 'Licence Pixabay' });

/* --- styles des diapos (tailles en em : la CP met tout à l'échelle) --- */
const nb = (t) => t.replace(/ ([?:!;»])/g, '&nbsp;$1').replace(/« /g, '«&nbsp;');
const kick = (t) => `<p style="font-size:0.95em;letter-spacing:0.08em;text-transform:uppercase;color:${RED};margin:0 0 0.15em"><strong>${nb(t)}</strong></p>`;
const H = (t) => `<p style="font-size:1.8em;line-height:1.15;color:${INK};margin:0"><strong>${nb(t)}</strong></p>`;
const P = (t, s = 1.1) => `<p style="font-size:${(s * 1.22).toFixed(2)}em;line-height:1.35;color:${INK};margin:0 0 0.55em">${nb(t)}</p>`;
const box = (html, { bg = '#ffffff', fg = INK, border = LINE } = {}) =>
  `<div style="background-color:${bg};color:${fg};border:${border === LINE ? 1 : 2}px solid ${border};border-radius:0.35em;padding:0.45em 0.7em;margin:0 0 0.45em">${html}</div>`;
const head = (k, t) => txt(5, 4, 90, 17, kick(k) + H(t), 'Titre');

const chapter = (title, items) => ({
  library: 'H5P.Column 1.18', subContentId: guid(),
  params: { content: items.map((c) => ({ content: c, useSeparator: 'auto' })) },
  metadata: { contentType: 'Column', license: 'U', title },
});
const consigneCP = (t) => text(`<p>${t} <em>Avance avec la flèche ▶ sous les diapositives.</em></p>`, 'Consigne');
const ch = [];

/* ===================================================================== */
/* 1. Tu demandes, il répond                                              */
/* ===================================================================== */
ch.push(chapter('1. Tu demandes, il répond', [
  text("<p>ChatGPT, Claude, Gemini, Le Chat… Les chatbots sont devenus un réflexe pour s'informer. Pour comprendre ce que l'IA change au journalisme, commence par ce que tu fais toi-même.</p>"
    + "<p><strong>Comment lire ce livre ?</strong> Chaque chapitre commence par une courte présentation, puis une activité notée. Ton score s'affiche à la fin du livre.</p>", 'Introduction'),
  consigneCP('Quatre diapositives : la dernière est une question.'),
  cp([
    slide([
      head('Situation', 'Une question ? Le chatbot répond.'),
      txt(5, 25, 54, 70,
        `<div style="background-color:${BLUE};color:#ffffff;border-radius:0.8em 0.8em 0.1em 0.8em;padding:0.5em 0.8em;margin:0 0 0.7em 3em;font-size:1.3em">Explique-moi l'actu de la semaine en cinq lignes, simplement.</div>`
        + `<div style="background-color:#ffffff;color:${INK};border:1px solid ${LINE};border-radius:0.8em 0.8em 0.8em 0.1em;padding:0.5em 0.8em;margin:0 3em 0 0;font-size:1.3em">Bien sûr ! Voici l'essentiel de la semaine :<br>1. … 2. … 3. …<br>Tu veux que je détaille un point ?</div>`,
        'Conversation'),
      txt(63, 27, 33, 66, P('Rapide, clair, et rien que pour toi : tu peux relancer, demander plus simple, plus court…')
        + P("La plupart du temps, on trouve la réponse <strong>« bien assez bonne »</strong>."), 'Commentaire'),
    ], 'Le réflexe chatbot'),
    slide([
      head('Ce que l\'IA sait faire', 'Un article devient « liquide »'),
      pic(5, 25, 30, 'journaux.jpg', 820, 600, 'Des journaux empilés sur un présentoir', PX('652234')),
      txt(5, 66, 30, 10, P('<strong>1 article de presse</strong>', 1), 'Légende'),
      txt(37, 36, 7, 16, `<p style="font-size:2.4em;color:${RED};margin:0">➜</p>`, 'Flèche', 'center'),
      txt(45, 24, 50, 17, box(P('un <strong>conte</strong> pour enfants', 1.1)), 'Forme 1'),
      txt(45, 42, 50, 17, box(P('une <strong>vidéo verticale</strong> de 3 minutes', 1.1)), 'Forme 2'),
      txt(45, 60, 50, 17, box(P('un <strong>podcast</strong> dans la langue de ton choix', 1.1)), 'Forme 3'),
      txt(5, 82, 90, 13, P("Le même contenu change de forme en quelques secondes : c'est ce qui rend ces outils si pratiques.", 1)),
    ], 'Contenus liquides'),
    slide([
      head('Attention', "… mais il lui arrive de dire n'importe quoi"),
      txt(5, 25, 56, 70, P("Un chatbot ne va pas voir les faits : il calcule la suite de mots <strong>la plus probable</strong>.")
        + P("Il produit donc des phrases <strong>plausibles</strong>, pas des faits <strong>vérifiés</strong>.")
        + P("Quand il invente une date, une citation ou une source, on dit qu'il <strong>« hallucine »</strong>."), 'Explication'),
      txt(65, 30, 30, 46, `<div style="background-color:#ffffff;border:2px solid ${RED};border-radius:0.4em;padding:0.6em 0.4em">`
        + `<p style="font-size:1.5em;line-height:1.25;color:${RED};margin:0"><strong>Plausible<br>≠<br>vérifié</strong></p></div>`, 'À retenir', 'center'),
    ], 'Hallucinations'),
    slide([
      head('À toi', 'Vrai ou faux ?'),
      el(5, 23, 90, 74, tf('Une réponse de chatbot bien écrite et sûre d\'elle a forcément été vérifiée.', false,
        "Exact, c'est faux : un chatbot écrit avec la même assurance qu'il ait raison ou tort. Une réponse fluide n'est pas une preuve.",
        "Piège : le ton sûr de lui et le texte bien rédigé donnent une impression de sérieux. Mais le chatbot calcule des phrases probables, il ne vérifie pas les faits.",
        'Réponse bien écrite = vérifiée ?')),
    ], 'Question'),
  ], 'Présentation : tu demandes, il répond'),
]));

/* ===================================================================== */
/* 2. La machine, premier lecteur : le trajet d'une info                 */
/* ===================================================================== */
const strip = (k) => pic(0, 72.2, 100, `trajet-${k}.png`, 1600, 250,
  `Trajet de l'information en 5 étapes : terrain, article signé, machines, chatbot, toi. Étape ${k} en cours.`
  + (k >= 4 ? ' Au chatbot se perdent la signature et les sources.' : '') + (k >= 5 ? ' Chez toi se perdent le clic et les revenus du média.' : ''));
const etape = (k, titre, left, right) => slide([head(`Étape ${k} sur 5`, titre), left, txt(43, 20, 53, 52, right, 'Texte'), strip(k)], titre);

ch.push(chapter('2. La machine, premier lecteur', [
  text("<p>Suis une information <strong>du terrain jusqu'à ton écran</strong>. À chaque étape, regarde la frise en bas : qu'est-ce qui se perd en route ?</p>", 'Introduction'),
  consigneCP('Cinq étapes, une par diapositive.'),
  cp([
    etape(1, 'Sur le terrain, une journaliste enquête',
      pic(4, 21, 36, 'terrain.jpg', 820, 600, 'Une journaliste prend des notes dans un carnet, sur le terrain', PX('Engin_Akyurt')),
      P('Elle voit, elle interroge des témoins, elle vérifie.')
      + P("Elle dit ce qui est <strong>nouveau</strong> : ce qui vient d'arriver, ce qu'on ne savait pas encore.")
      + P("Une IA, elle, ne fait que reformuler ce qui existe déjà.")),
    etape(2, 'Elle publie un article signé',
      pic(4, 21, 36, 'journaux.jpg', 820, 600, 'Des journaux empilés sur un présentoir', PX('652234')),
      P('Son <strong>nom</strong>, la <strong>date</strong>, le <strong>média</strong> sont affichés.')
      + P("On sait qui a écrit, quand, et <strong>qui en répond</strong> si l'information est fausse.")),
    etape(3, 'Premier lecteur : une machine',
      pic(4, 21, 36, 'serveurs.jpg', 820, 600, 'Une salle de serveurs informatiques', PX('Schäferle')),
      P('Avant tout humain, des programmes lisent l\'article : ils le copient, le découpent, l\'analysent.')
      + P("Pour le président de l'AFP, la machine devient même <strong>« le premier lecteur »</strong> du journalisme.")),
    etape(4, 'Le chatbot mélange et reformule',
      txt(4, 21, 37, 50, box(P("<em>D'après plusieurs sources, un incendie a détruit un entrepôt cette nuit. Personne n'a été blessé.</em>", 1)
        + `<p style="font-size:0.85em;color:#777777;margin:0">Sources : [1] [2] [3]</p>`), 'Réponse du chatbot'),
      P("Le chatbot <strong>mélange</strong> l'article avec d'autres textes et le reformule.")
      + P('La <strong>signature</strong> disparaît, les <strong>sources</strong> se confondent : qui a vraiment vu cet incendie ?')),
    etape(5, 'Toi : tu as ta réponse… et tu ne cliques plus',
      txt(4, 20, 37, 52, ['Tu as ta réponse…', '… tu ne cliques plus vers le média…', '… moins de visites, moins de publicité…', '<strong>… moins d\'argent pour payer des journalistes.</strong>']
        .map((t, i) => `<div style="background-color:#ffffff;border:${i === 3 ? 2 : 1}px solid ${i === 3 ? RED : LINE};border-radius:0.3em;padding:0.15em 0.5em;margin:0 0 0.2em">${P(t, 0.82)}</div>`).join(''), 'Chaîne des conséquences'),
      P("Le journalisme devient <strong>invisible</strong>, alors que c'est lui qui a fourni l'information de départ.")
      + P("Dans le pire des cas, l'article n'est plus qu'une matière première pour entraîner l'IA.")),
  ], 'Présentation : le trajet d\'une information'),
  text('<p><strong>Complète le trajet.</strong> Fais glisser les mots dans les trous. Attention : deux mots ne servent à rien.</p>', 'Consigne'),
  dragText('',
    'Sur le terrain, la journaliste *vérifie* ce qu\'elle voit et entend.\n'
    + 'Son article porte sa *signature* : on sait qui en répond.\n'
    + 'Avant tout humain, des *machines* lisent l\'article.\n'
    + 'Le chatbot *mélange* les sources : on ne sait plus qui a écrit quoi.\n'
    + 'Comme on ne *clique* plus vers le site du média, il perd des *revenus*.',
    '*cite*\n*invente*', 'Complète le trajet'),
]));

/* ===================================================================== */
/* 3. Le dividende du menteur                                             */
/* ===================================================================== */
ch.push(chapter('3. Vrai ou faux ? Le dividende du menteur', [
  text("<p>L'IA fabrique aussi des faux très réalistes. Mais le plus grand danger n'est peut-être pas celui que tu crois. Suis cette histoire (inventée), heure par heure.</p>", 'Introduction'),
  consigneCP('Quatre diapositives.'),
  cp([
    slide([
      head('14 h · un incendie éclate', "Une vague d'images fabriquées"),
      txt(5, 24, 48, 72, P("Un grand incendie éclate dans une usine. En quelques heures, des dizaines d'images et de vidéos <strong>fabriquées par IA</strong> circulent : flammes géantes, faux témoins, fausses déclarations.")
        + P('Aujourd\'hui, chaque grand événement est suivi de vagues de contenus artificiels, chaque jour plus réalistes.'), 'Texte'),
      pic(56, 22, 40, 'smartphone.jpg', 800, 652, "Des mains qui filment une scène avec un smartphone", PX('SplitShire')),
    ], '14 h'),
    slide([
      head('18 h · une vraie vidéo', '« C\'est un faux, c\'est de l\'IA ! »'),
      txt(5, 24, 90, 30, P("Une vidéo <strong>authentique</strong>, filmée par un salarié, montre le directeur de l'usine qui reconnaît que les alarmes étaient coupées."), 'Texte'),
      txt(12, 50, 76, 22, box(P('Le directeur répond : <strong>« Cette vidéo est un faux, fabriquée par IA ! »</strong>', 1.15), { border: RED }), 'Réplique'),
      txt(5, 78, 90, 18, P("Beaucoup de gens le croient : après tout, on sait que les faux existent…"), 'Texte'),
    ], '18 h'),
    slide([
      head('Le mot à retenir', 'Le « dividende du menteur »'),
      txt(5, 24, 48, 72, P('Comme tout le monde sait que des faux crédibles existent, un menteur peut faire passer un document <strong>vrai</strong> pour un faux.')
        + P("Il en tire un bénéfice : c'est son « dividende ». L'expression vient de l'anglais <em>liar's dividend</em>."), 'Définition'),
      txt(56, 24, 40, 34, box(P('<strong>Deepfake</strong><br>faire passer du <strong>faux</strong> pour du vrai', 1)), 'Deepfake'),
      txt(56, 58, 40, 34, box(P('<strong>Dividende du menteur</strong><br>faire passer du <strong>vrai</strong> pour du faux', 1), { border: RED }), 'Dividende'),
    ], 'Définition'),
    slide([
      head('Et après ?', 'On finit par douter de tout'),
      txt(5, 24, 90, 72, P("Le danger n'est pas seulement de croire un faux : c'est de <strong>ne plus croire le vrai</strong>.", 1.2)
        + P("D'où la valeur de ceux qui <strong>vérifient l'origine</strong> d'une image ou d'une vidéo : journalistes, cellules de vérification (<em>fact-checking</em>).")
        + P('Leur travail : retrouver qui a filmé, où, quand, et le prouver.'), 'Conclusion'),
    ], 'Douter de tout'),
  ], 'Présentation : le dividende du menteur'),
  mc('Laquelle de ces situations est un exemple de <strong>dividende du menteur</strong> ?', [
    { t: "Un footballeur filmé en train d'insulter un arbitre affirme que la vidéo, pourtant authentique, a été fabriquée par IA.", ok: true,
      fb: "Oui : la vidéo est vraie, mais il profite de l'existence des faux pour la faire passer pour un faux." },
    { t: "Un compte publie une vidéo fabriquée par IA où un ministre annonce la fin des vacances d'été.",
      fb: "Piège : c'est un deepfake, un faux qu'on fait passer pour du vrai. Le dividende du menteur, c'est l'inverse : faire passer du vrai pour du faux." },
    { t: "Un chatbot invente une citation d'un écrivain célèbre et l'attribue à un livre qui n'existe pas.",
      fb: "Piège : c'est une hallucination, une erreur de la machine. Personne ne ment ici pour se protéger." },
    { t: "Un élève doute d'une photo spectaculaire et cherche d'où elle vient avant de la partager.",
      fb: "Piège : douter et vérifier, c'est le bon réflexe ! Le dividende du menteur, c'est quelqu'un qui accuse un document vrai d'être faux pour s'en sortir." },
  ], 'Dividende du menteur', { ok: 'Bravo : tu ne confonds pas deepfake, hallucination et dividende du menteur.', ko: 'Relis la diapositive 3 : faux pour du vrai, ou vrai pour du faux ?' }),
]));

/* ===================================================================== */
/* 4. Des tâches, pas des responsabilités                                 */
/* ===================================================================== */
const col = (titre, items) => box(`<p style="font-size:1.3em;color:${RED};margin:0 0 0.3em"><strong>${titre}</strong></p>`
  + items.map((i) => P(i, 1.05)).join(''));
ch.push(chapter('4. Des tâches, pas des responsabilités', [
  text("<p>L'IA transforme déjà le travail des journalistes. Mais qu'est-ce qu'elle peut faire à leur place, et qu'est-ce qu'elle ne doit jamais faire ?</p>", 'Introduction'),
  consigneCP('Trois diapositives.'),
  cp([
    slide([
      head('Dans les rédactions', "L'IA travaille déjà"),
      txt(4, 24, 29, 72, col('Automatiser', ['retranscrire une interview enregistrée', 'reconnaître les visages pour légender une photo']), 'Automatiser'),
      txt(35.5, 24, 29, 72, col('Aider à produire', ['suggérer des titres', 'transformer un texte en vidéo']), 'Aider à produire'),
      txt(67, 24, 29, 72, col('Augmenter', ['fouiller d\'énormes masses de données pour y trouver une info']), 'Augmenter'),
    ], 'Ce que fait l\'IA'),
    slide([
      head('Ce qui ne se remplace pas', 'Ce qui prend de la valeur'),
      pic(5, 22, 36, 'camera.jpg', 800, 750, 'Une journaliste reporter d\'images filme dans la rue', PX('OrnaW')),
      txt(45, 23, 51, 74, P('Écrire vite et beaucoup compte moins : la machine le fait. Ce qui compte plus :', 1.05)
        + `<ul style="font-size:1.28em;color:${INK};margin:0;padding-left:1.1em;line-height:1.35">`
        + '<li>le <strong>reportage</strong> sur le terrain ;</li><li>les <strong>sources humaines</strong> : témoins, personnes rencontrées ;</li>'
        + '<li>les <strong>récits incarnés</strong> : de vraies personnes, de vrais lieux ;</li><li>la <strong>vérification</strong> des faits.</li></ul>', 'Liste'),
    ], 'Ce qui prend de la valeur'),
    slide([
      txt(8, 10, 84, 40, `<p style="font-size:1.75em;line-height:1.25;color:${INK};margin:0"><strong>« On peut automatiser des tâches, jamais des responsabilités. »</strong></p>`
        + `<p style="font-size:0.95em;color:#555555;margin:0.4em 0 0">Fabrice Fries, président de l'Agence France-Presse (AFP), <em>Le Monde</em>, 2 juin 2026</p>`, 'Citation', 'center'),
      txt(8, 55, 84, 10, P("C'est toujours le journaliste qui…", 1.1), 'Amorce', 'center'),
      ...['décide', 'vérifie', 'publie'].map((v, i) => txt(12 + i * 26, 67, 24, 20,
        `<div style="background-color:${BLUE};border-radius:0.35em;padding:0.35em 0.2em"><p style="font-size:1.5em;color:#ffffff;margin:0"><strong>${v}</strong></p></div>`, v, 'center')),
    ], 'La règle'),
  ], 'Présentation : des tâches, pas des responsabilités'),
  text("<p><strong>Range chaque étiquette dans la bonne colonne</strong>, puis clique sur « Vérifier ». Pose-toi la question : si ça tourne mal, qui en répond ?</p>", 'Consigne'),
  sortInto([
    { t: 'Retranscrire une interview', zone: 0 },
    { t: 'Décider de publier une info', zone: 1 },
    { t: 'Traduire un article', zone: 0 },
    { t: 'Interroger un témoin sur place', zone: 1 },
    { t: "Certifier qu'une photo est authentique", zone: 1 },
    { t: 'Proposer des idées de titres', zone: 0 },
    { t: "Signer l'article et en répondre", zone: 1 },
    { t: 'Trier des milliers de documents', zone: 0 },
  ], [
    { label: "<strong>Tâche</strong> confiée à l'IA", ok: 'Oui : ce sont des tâches longues que la machine peut faire, sous le contrôle du journaliste.',
      ko: "Attention : décider, certifier, signer, aller sur place, c'est le rôle d'un humain qui en répond." },
    { label: '<strong>Responsabilité</strong> du journaliste', ok: "Oui : ici, quelqu'un doit en répondre. L'IA peut aider, jamais décider à sa place.",
      ko: "Attention : retranscrire, traduire, trier, proposer des titres, ce sont des tâches qu'on peut confier à la machine, à condition de vérifier son travail." },
  ], 'Tâche ou responsabilité ?'),
]));

/* ===================================================================== */
/* 5. Remonter à la source                                                */
/* ===================================================================== */
const fade = ['#ffffff', '#f3f0ea', '#e9e5dc', '#dfdacf'];
ch.push(chapter('5. Remonter à la source', [
  text("<p>Copier, résumer, remixer : avec l'IA, c'est instantané. Comment savoir encore d'où vient une information ? Et pourquoi l'IA elle-même a besoin des journalistes ?</p>", 'Introduction'),
  consigneCP('Trois diapositives.'),
  cp([
    slide([
      head('Traçabilité', 'Copiée, reformulée, remixée…'),
      txt(5, 23, 50, 74, P("Une information peut être copiée et transformée des milliers de fois. Pour lui faire confiance, il faut pouvoir :", 1.05)
        + `<ul style="font-size:1.28em;color:${INK};margin:0 0 0.5em;padding-left:1.1em;line-height:1.35"><li>retrouver son <strong>origine</strong> : qui l'a publiée en premier ?</li>`
        + '<li>suivre ses <strong>transformations</strong> : qui l\'a modifiée, et comment ?</li></ul>'
        + P("Les médias travaillent à « marquer » leurs contenus authentiques pour qu'on puisse les reconnaître.", 1.05), 'Texte'),
      txt(59, 23, 37, 74, ['<strong>Article d\'origine</strong>, signé et daté', 'Repris par un autre site', 'Résumé par un chatbot', 'Capture partagée sur un réseau… <strong>?</strong>']
        .map((t, i) => `<div style="background-color:${fade[i]};border:1px solid ${LINE};border-radius:0.35em;padding:0.3em 0.6em;margin:0 0 0.25em ${i * 0.8}em">${P(t, 0.92)}</div>`).join(''), 'Copies successives'),
    ], 'Traçabilité'),
    slide([
      head('Un cercle vicieux', 'La boucle de la « bouillie IA »'),
      txt(4, 23, 42, 74, P('Les IA apprennent sur des textes écrits par des humains, dont des articles de presse, souvent <strong>sans payer</strong> les médias.', 1)
        + P('Si le web se remplit de textes fabriqués par IA (le <em>slop</em>), les nouvelles IA apprennent sur cette bouillie et se dégradent.', 1)
        + P("Sans journalistes payés pour trouver des faits nouveaux, l'IA aussi s'appauvrit.", 1), 'Texte'),
      pic(47, 22, 50, 'boucle-slop.png', 1120, 720, "Cercle : des IA écrivent des textes, le web se remplit de bouillie IA, de nouvelles IA s'entraînent dessus, leurs réponses se dégradent ; au centre : sans faits nouveaux"),
    ], 'Bouillie IA'),
    slide([
      head('Conclusion de la tribune', 'Ce que le journalisme garantit'),
      ...[['Des faits établis', 'vérifiés et recoupés auprès de plusieurs sources'], ['Des méthodes transparentes', "on sait comment l'information a été obtenue"],
        ['Une chaîne de responsabilité', 'on sait qui a écrit, vérifié, publié']].map(([a, b], i) =>
        txt(4 + i * 31, 25, 29, 46, box(`<p style="font-size:1.1em;color:${BLUE};margin:0 0 0.3em"><strong>${a}</strong></p>` + P(b, 1.05)), a)),
      txt(5, 74, 90, 22, P("Selon Fabrice Fries, le journalisme sera de plus en plus jugé sur <strong>ce qu'il garantit</strong>, plus que sur ce qu'il produit.", 1.05), 'Conclusion'),
    ], 'Garanties'),
  ], 'Présentation : remonter à la source'),
  text('<p><strong>Enquête sur une dépêche</strong> (inventée pour l\'exercice). Clique sur les <strong>5 mots</strong> qui permettent de remonter à la source : <strong>quand</strong>, <strong>qui a écrit</strong>, <strong>pour quel média</strong>, et <strong>qui a donné l\'information</strong>.</p>', 'Consigne'),
  markWords('',
    '<p>Publié le *14/03/2026* à 7 h 45 par Thomas *Garnier* pour l\'agence *AFP* (Agence France-Presse).</p>'
    + '<p>Un incendie a détruit cette nuit un entrepôt du quartier de Gerland, à Lyon, ont annoncé les *pompiers* du Rhône. Sur place, leur porte-parole Julie *Morel* a précisé que personne n\'avait été blessé. Une enquête a été ouverte pour connaître l\'origine du feu.</p>',
    'Les indices de la source', [
      { from: 0, to: 99, feedback: "Le lieu et l'événement disent ce qui s'est passé, pas d'où vient l'info. Cherche la date, l'auteur, le média et les personnes qui ont donné l'information." },
      { from: 100, to: 100, feedback: 'Bravo : date, auteur, média, source officielle, source nommée. Tout ce que la réponse du chatbot avait perdu !' },
    ]),
  mc("Un chatbot te répond : « Un incendie a détruit un entrepôt à Lyon, sans faire de blessé. » <strong>Que te manque-t-il</strong> pour faire confiance à cette information ?", [
    { t: "Savoir qui l'a vérifiée et publiée en premier : l'auteur, le média, la date.", ok: true,
      fb: "Oui : c'est exactement ce que la dépêche donnait et que la réponse du chatbot a perdu." },
    { t: 'Rien : la réponse est claire et précise.', fb: 'Piège : clair ne veut pas dire vérifié (chapitre 1). Une réponse précise peut être inventée.' },
    { t: "Une image de l'incendie pour la rendre plus crédible.", fb: "Piège : une image se fabrique en quelques secondes avec l'IA (chapitre 3). Elle ne dit pas d'où vient l'info." },
    { t: 'La même réponse, donnée par un deuxième chatbot.', fb: "Piège : deux chatbots peuvent s'appuyer sur les mêmes textes, ou se tromper de la même façon. Ce n'est pas remonter à la source." },
  ], 'Que manque-t-il ?', { ok: 'Bravo : tu cherches la source, pas seulement la réponse.', ko: 'Repense à la dépêche : quels indices avaient disparu ?' }),
]));

/* ===================================================================== */
/* 6. Et toi ?                                                            */
/* ===================================================================== */
ch.push(chapter('6. Et toi ?', [
  text('<h2>Mes trois réflexes</h2><ol>'
    + "<li><strong>Une réponse fluide n'est pas une info vérifiée.</strong> Un chatbot peut se tromper avec assurance.</li>"
    + '<li><strong>Je remonte à la source :</strong> qui a écrit ? quand ? pour quel média ? qui a donné l\'information ?</li>'
    + "<li><strong>Face à « c'est un faux ! », je cherche qui a vérifié.</strong> Un vrai document peut être accusé d'être faux.</li></ol>", 'Réflexes'),
  essay("<p>Fabrice Fries écrit qu'à l'ère de l'IA, le journalisme sera jugé sur ce qu'il <strong>garantit</strong>. En 3 à 5 phrases : <strong>qu'est-ce qu'un journaliste peut faire qu'un chatbot ne fait pas ?</strong> Donne au moins deux exemples vus dans ce livre.</p>", [
    { w: 'terrain', alt: ['sur place', 'reportage', 'enquête', 'enquêter'], yes: 'Tu parles du terrain.', no: 'Pense au travail sur le terrain.' },
    { w: 'vérifier', alt: ['vérifie', 'vérifié', 'vérifiée', 'vérification', 'vérifient'], yes: 'Tu parles de la vérification.', no: 'Pense à la vérification des faits.' },
    { w: 'témoin', alt: ['témoins', 'source', 'sources', 'interroger', 'interroge'], yes: 'Tu parles des sources humaines.', no: 'Pense aux témoins et aux sources.' },
    { w: 'responsabilité', alt: ['responsable', 'répond', 'signature', 'signe', 'signer', 'décide', 'décider'], yes: 'Tu parles de la responsabilité.', no: 'Pense à qui répond de l\'information.' },
  ], "<p>Un journaliste va sur le terrain : il voit les faits et interroge des témoins, alors qu'un chatbot ne fait que reformuler des textes qui existent déjà. Il vérifie chaque information avant de la publier. Enfin, il signe son article : il en est responsable, alors qu'une réponse de chatbot ne dit pas qui a écrit quoi.</p>",
  'Ce que garantit un journaliste'),
  text('<p style="font-size:0.8em;color:#555555">Source : Fabrice Fries, « Avec l\'IA, la machine devient un public du journalisme, et même son premier lecteur », tribune, '
    + '<a href="https://www.lemonde.fr/idees/article/2026/06/02/fabrice-fries-president-de-l-agence-france-presse-avec-l-ia-la-machine-devient-un-public-du-journalisme-et-meme-son-premier-lecteur_6696374_3232.html" target="_blank" rel="noopener"><em>Le Monde</em>, 2 juin 2026</a> '
    + '(idées reformulées pour des collégiens, citations courtes). Les situations des chapitres 2, 3 et 5 (incendie, usine, dépêche) sont inventées.<br>'
    + 'Photos : Pixabay (licence Pixabay) par Engin_Akyurt, 652234, Schäferle, SplitShire et OrnaW. Frise du trajet et boucle de la « bouillie IA » réalisées pour ce livre.</p>', 'Crédits'),
]));

const book = { ...base, chapters: ch };
book.bookCover = {
  coverDescription: '<p style="text-align:center">Avec l\'IA, la machine devient le premier lecteur du journalisme. Que change-t-elle à l\'information que tu reçois ? Et à quoi sert encore un journaliste ?</p>'
    + '<p style="text-align:center;font-size:0.85em">EMI · 4e-3e · environ 1 h · d\'après une tribune de Fabrice Fries, président de l\'AFP (<em>Le Monde</em>, 2 juin 2026)</p>',
  coverMedium: image('images/couverture.jpg', 1600, 900, 'Une forêt de caméras et d\'appareils photo de journalistes', 'Couverture', PX('Engin_Akyurt')),
};
book.behaviour = { ...base.behaviour, baseColor: '#1c2230' };
fs.writeFileSync(OUT, JSON.stringify(book));
console.log('livre :', ch.length, 'chapitres');
