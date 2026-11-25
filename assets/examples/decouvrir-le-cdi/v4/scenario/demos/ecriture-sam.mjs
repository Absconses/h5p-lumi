import fs from 'fs';
import { cp, slide, txt, el, markWords } from '/home/user/h5p-lumi/assets/examples/journalisme-ia/cp.mjs';
import { sub } from '/home/user/h5p-lumi/assets/examples/journalisme-ia/fr.mjs';
const F = process.argv[2];
const root = JSON.parse(fs.readFileSync(F, 'utf8')); const C = root.branchingScenario.content;
const VID = 12, BQ = 13, NEXT = 14, CPI = C.length;
if (!C[BQ].type.params.branchingQuestion.question.includes('choisir')) throw new Error('index inattendu');
const manoir = `<p><strong>Le Mystère du manoir</strong> (quatrième de couverture)</p><p>Pendant la fête du manoir, le collier de la comtesse disparaît. Personne n'est sorti : le *voleur* est encore dans la maison. Cinq invités, cinq *suspects* . Jade note chaque *indice* dans son carnet, *interroge* le jardinier, la cuisinière, le neveu… Saura-t-elle démasquer le *coupable* avant minuit ?</p>`;
const nuit = `<p><strong>Nuit noire au collège</strong> (quatrième de couverture)</p><p>Hugo s'est endormi au CDI. Quand il se réveille, le collège est vide et plongé dans le noir. Des pas résonnent dans le couloir, une porte claque, la lumière s'allume toute seule… Hugo devra tenir jusqu'au matin, seul avec sa peur.</p>`;
const mtw = markWords(
  '<p>Sam adore <strong>chercher des indices, interroger les suspects, trouver le coupable</strong>. Clique, dans les deux résumés, sur les mots qui vont lui donner envie de lire.</p>',
  manoir + nuit, 'Les deux résumés',
  [{ from: 0, to: 99, feedback: 'Relis ce que Sam aime dans ses jeux : quels mots du résumé font penser à une enquête ?' },
   { from: 100, to: 100, feedback: 'Tous les mots de l’enquête sont dans le même livre. L’autre fait peur, mais on n’y enquête pas.' }]);
const area = sub('H5P.ExportableTextArea 1.3', { label: '<p>Mon conseil à Sam</p>', exportNotSupported: 'Export impossible sur cet appareil' }, 'Exportable Text Area', 'Mon conseil à Sam');
const pres = cp([
  slide([el(2, 3, 96, 94, mtw)], 'Les résumés'),
  slide([
    txt(4, 4, 92, 24, '<p style="font-size:1.25em">Sam attend ta réponse. <strong>Écris-lui en une ou deux phrases</strong> quel livre tu lui conseilles, et pourquoi. Sers-toi des mots que tu as repérés.</p>', 'Consigne'),
    el(4, 30, 92, 60, area),
  ], 'Mon conseil'),
], 'Choisir avec Sam');
pres.library = 'H5P.CoursePresentation 1.25';
C.push({ type: pres, nextContentId: BQ, showContentTitle: false, proceedButtonText: 'J’ai écrit mon conseil', forceContentFinished: 'useBehavioural', feedback: { title: '', subtitle: '' }, contentBehaviour: 'useBehavioural' });
C[VID].nextContentId = CPI;
const ok = (t) => ({ title: `<p>${t}</p>` });
C[BQ].type.params.branchingQuestion = {
  question: '<p>Compare ton conseil avec ceux de trois élèves de 6e. Lequel ressemble le plus au tien ?</p>',
  alternatives: [
    { text: '« Prends Nuit noire : ça fait peur, et toi tu aimes le suspense. »', nextContentId: CPI,
      feedback: { title: '<p>Mauvaise piste</p>', subtitle: '<p>Sam n’a jamais parlé de peur : il aime chercher et trouver. Dans <em>Nuit noire</em>, Hugo subit ce qui arrive, il n’enquête pas. Retourne à ton message : quels mots du résumé relient le livre à ses jeux ?</p>' } },
    { text: '« Le Manoir : un vol, cinq suspects, des indices… comme tes jeux. »', nextContentId: NEXT,
      feedback: { title: '<p>Bonne piste</p>', subtitle: '<p>Un seul livre, des mots tirés du résumé, et le lien avec ce que Sam aime : c’est un conseil qui donne envie, sans faire la leçon.</p>' } },
    { text: '« Prends les deux, comme ça tu verras lequel te plaît le plus. »', nextContentId: CPI,
      feedback: { title: '<p>Mauvaise piste</p>', subtitle: '<p>Sam a abandonné son dernier roman au chapitre 2 : avec deux livres, il a deux fois plus de chances d’abandonner. Il attend que tu l’aides à choisir. Reprends ton message : lequel, et pourquoi ?</p>' } },
    { text: 'Le mien ne ressemble à aucun des trois', nextContentId: NEXT,
      feedback: { title: '<p>Vérifie ton conseil</p>', subtitle: '<p>Trois critères : il nomme <strong>un seul livre</strong> ; il cite <strong>au moins un mot du résumé</strong> (vol, suspects, indices…) ; il le relie à <strong>ce que Sam aime</strong>, sans lui faire la leçon. Les trois y sont ? Alors ton conseil est bon, peut-être meilleur que ceux de la liste.</p>' } },
    { text: 'Revoir la scène', nextContentId: VID, feedback: { title: '', subtitle: '' } },
  ],
};
fs.writeFileSync(F, JSON.stringify(root));
console.log('CP index', CPI);
