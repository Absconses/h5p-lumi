// Modules en cadre du livre vitrine EMI : Branching Scenario « Partager ou vérifier ? » et Crossword.
// usage : node modules.mjs <dossier_sortie> <crossword_extrait>
import fs from 'fs';
import { text, image, sub } from './fr.mjs';
const [OUT, CW] = process.argv.slice(2);
const save = (name, c) => { fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(c)); console.log('ok', name); };

/* ---- Branching Scenario : le message du groupe de classe ------------------------------------- */
// Chaque nœud : contenu (texte, image) ou question à embranchement. L'index dans content[] = son id.
const node = (type, next, extra = {}) => ({
  type, showContentTitle: false, proceedButtonText: 'Continuer', forceContentFinished: 'useBehavioural',
  feedback: { title: '', subtitle: '' }, contentBehaviour: 'useBehavioural',
  ...(next === undefined ? {} : { nextContentId: next }), ...extra,
});
// alternatives : [texte, id suivant, {title, subtitle} si fin (-1)]
const bq = (question, alternatives) => node(sub('H5P.BranchingQuestion 1.0', {
  branchingQuestion: {
    question: `<p>${question}</p>`,
    alternatives: alternatives.map(([t, next, end]) => ({
      text: t, nextContentId: next,
      feedback: end ? { title: end[0], subtitle: end[1], endScreenScore: end[2] ?? 0 } : { title: '', subtitle: '' },
    })),
  },
}, 'Branching Question', question.replace(/<[^>]+>/g, '').slice(0, 60)));
const T = (html, next, title) => node(text(html, title), next);
const I = (file, w, h, alt, next) => node(image(`images/${file}`, w, h, alt, alt.slice(0, 60)), next);

const content = [
  /* 0 */ T("<p><strong>Mardi soir, 21 h 14.</strong> Ton téléphone vibre : un message dans le groupe de ta classe.</p>", 1, 'Mardi soir'),
  /* 1 */ I('chat.jpg', 840, 600, "Message de Noah dans le groupe « Les 4eB » : une capture d'un article « Fuite de gaz : le collège Jean-Moulin évacué, fermé demain » et le texte « DEMAIN PAS COURS, c'est passé aux infos !! Faites tourner ».", 2),
  /* 2 */ bq('Ton collège s\'appelle aussi Jean-Moulin. Que fais-tu ?', [
    ['Je transfère tout de suite à mes autres groupes : tout le monde doit savoir.', 3],
    ['Je regarde la capture de plus près avant de faire quoi que ce soit.', 6],
    ['Je réponds « trop bien 😂 » et je vais me coucher.', 5],
  ]),
  /* 3 */ T("<p>En vingt minutes, ton message a été transféré une quarantaine de fois. Ta cousine, dans un autre collège, l'a même mis en story.</p>", 4, 'Transféré'),
  /* 4 */ bq('<strong>Le lendemain matin, le collège est ouvert.</strong> Plusieurs élèves sont restés chez eux. Que fais-tu ?', [
    ['J\'écris dans tous les groupes que c\'était faux, et je m\'excuse.', -1,
      ['Tu as réparé', "Corriger publiquement, c'est courageux et utile : ton correctif circule à son tour. La prochaine fois, regarde la date et le lieu AVANT de partager."]],
    ['Je supprime mon message sans rien dire.', -1,
      ['Le mal est fait', "Supprimer ton message n'arrête pas les quarante copies déjà envoyées. Seul un correctif public peut les rattraper. Recommence pour trouver un meilleur chemin."]],
  ]),
  /* 5 */ T("<p>Tu n'as rien partagé, c'est déjà bien. Mais le lendemain, trois élèves de ta classe sont restés chez eux, persuadés que le collège était fermé. Personne n'avait vérifié, et tu en avais les moyens. <strong>Revenons à la capture.</strong></p>", 6, 'Rien fait'),
  /* 6 */ I('article.jpg', 1140, 600, "L'article complet du « Courrier du Rhône » (journal fictif) : rubrique Lyon, publié le 14 mars 2023, une fuite de gaz au collège Jean-Moulin du 5e arrondissement de Lyon.", 7),
  /* 7 */ bq("Voici l'article complet que Noah a capturé. Qu'est-ce qui cloche ?", [
    ["Il date du 14 mars 2023 et parle d'un collège Jean-Moulin de Lyon, pas du nôtre.", 9],
    ["Rien : c'est un vrai article de journal, donc l'information est vraie.", 8],
    ["Le journal n'existe pas, donc tout est inventé.", 8],
  ]),
  /* 8 */ T("<p><strong>Piège.</strong> Dans cette histoire, l'article est authentique : il y a bien eu une fuite de gaz. Mais il date de 2023 et concerne un autre collège qui porte le même nom. <strong>Une information vraie, sortie de son contexte (date, lieu), devient une fausse information.</strong> Relis la date et la rubrique.</p>", 6, 'Piège'),
  /* 9 */ bq('Bien vu : vieil article, autre ville. Pour être sûr que <strong>ton</strong> collège est ouvert demain, que fais-tu ?', [
    ["Je regarde l'ENT et le site du collège, puis je préviens le groupe de ce que j'ai trouvé.", -1,
      ['Enquêteur ou enquêtrice', "Tu as fait les trois gestes du vérificateur : regarder la date et le lieu, aller à la source officielle, puis prévenir les autres. Une capture d'écran n'est jamais une source : remonte toujours à l'original.", 10]],
    ['Je demande dans le groupe si quelqu\'un sait.', 10],
  ]),
  /* 10 */ T("<p>Cinq personnes répondent « oui c'est fermé, mon frère l'a vu aussi ». Personne n'a de source. <strong>Le nombre de messages ne fait pas une preuve</strong> : il faut une source officielle.</p>", 9, 'Le groupe'),
];

save('partager-ou-verifier', {
  branchingScenario: {
    title: 'Partager ou vérifier ?',
    startScreen: { startScreenTitle: '<p>Partager ou vérifier ?</p>', startScreenSubtitle: "<p>Un message arrive dans le groupe de ta classe. À toi de choisir, et d'assumer les conséquences.</p>" },
    endScreens: [{ endScreenTitle: '<p>Fin</p>', endScreenSubtitle: '<p>Recommence pour explorer un autre chemin.</p>', contentId: -1, endScreenScore: 0 }],
    content,
    scoringOptionGroup: { scoringOption: 'no-score', includeInteractionsScores: false },
    behaviour: { enableBackwardsNavigation: true, forceContentFinished: false, randomizeBranchingQuestions: false },
    l10n: {
      startScreenButtonText: 'Commencer', endScreenButtonText: 'Recommencer', backButtonText: 'Revenir en arrière',
      disableProceedButtonText: "Termine d'abord cette étape", replayButtonText: 'Revoir la vidéo', scoreText: 'Ton score :',
      fullscreenAria: 'Plein écran',
    },
  },
});
// contrôle du graphe : chaque nextContentId pointe vers un nœud existant ou -1
content.forEach((n, i) => {
  const nexts = n.nextContentId !== undefined ? [n.nextContentId]
    : n.type.params.branchingQuestion.alternatives.map((a) => a.nextContentId);
  for (const x of nexts) if (x !== -1 && !(x >= 0 && x < content.length)) throw new Error(`nœud ${i} → ${x} inexistant`);
});

/* ---- Crossword : les mots de l'EMI ----------------------------------------------------------- */
const cw = JSON.parse(fs.readFileSync(`${CW}/content/content.json`, 'utf8'));
const W = (answer, clue) => ({ fixWord: false, orientation: 'across', answer, clue });
save('mots-croises-emi', { ...cw,
  taskDescription: '<p>Remplis la grille avec les mots du livre, puis clique sur « Vérifier ».</p>',
  words: [
    W('Source', "Origine d'une information : la personne, le média ou le document d'où elle vient"),
    W('Infox', 'Fausse information diffusée pour tromper (on dit aussi fake news)'),
    W('Opinion', 'Avis personnel : on peut ne pas être d\'accord, ce n\'est pas un fait'),
    W('Parodie', 'Imitation humoristique d\'un média, à ne pas prendre au sérieux'),
    W('Cadrage', 'Choix de ce que la photo montre… et de ce qu\'elle laisse hors champ'),
    W('Algorithme', 'Programme qui choisit ce que mon fil d\'actualité me montre'),
    W('Contexte', 'Date, lieu, circonstances : sans lui, une info vraie peut tromper'),
    W('Hypertrucage', 'Mot français pour « deepfake » : vidéo truquée par l\'IA'),
    W('Sponsorisé', 'Mot qui signale qu\'un message est payé par une marque'),
  ] });
