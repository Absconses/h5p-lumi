/* Module de demonstration H5P.Tabs : « Enquête sur une source » (EMI, cycle 4).
 * Une publication virale (fictive) a examiner onglet par onglet : Qui ? Quand ?
 * D'ou ? Pourquoi ? puis un verdict. Chaque onglet = texte + un exercice note.
 *
 * Usage : node build.mjs <sortie/content.json>
 * Puis  : python3 ../visite-coulisses-info/pack.py ../../templates/gabarit-tabs.h5p \
 *           <content.json> <dossier-vide> enquete-source.h5p "Enquête sur une source" [--slim]
 */
import fs from 'fs';
import { text, mc, tf, blanks } from '../../lib/h5p-factories.mjs';
import { tab, tabs } from '../../lib/tabs.mjs';

// Libelles francais des boutons (les fabriques sont en anglais par defaut)
const FR = {
  checkAnswer: 'Vérifier', submitAnswer: 'Valider', showSolution: 'Voir la solution',
  showSolutionButton: 'Voir la solution', showSolutions: 'Voir la solution', tryAgain: 'Recommencer',
  correctText: 'Correct !', incorrectText: 'Incorrect', missingText: 'Réponse manquante',
  trueText: 'Vrai', falseText: 'Faux',
  wrongAnswerMessage: 'Mauvaise réponse', correctAnswerMessage: 'Bonne réponse',
  score: 'Tu as obtenu @score point(s) sur @total', notFilledOut: "Remplis d'abord tous les trous.",
  solutionLabel: 'Bonne réponse :',
  checkAnswerButton: 'Vérifier', submitAnswerButton: 'Valider', showSolutionButton: 'Voir la solution',
  tryAgainButton: 'Recommencer', wrongAnswer: 'Mauvaise réponse', correctAnswer: 'Bonne réponse',
  noInput: 'Réponds avant de voir la solution', scoreBarLabel: 'Tu as :num point(s) sur :total',
};
const fr = (node) => {
  if (Array.isArray(node)) node.forEach(fr);
  else if (node && typeof node === 'object')
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'string' && k in FR) node[k] = FR[k];
      else fr(v);
    }
  return node;
};

const encadre = (html, c = '#1d3557') =>
  `<div style="border-left:6px solid ${c};background-color:#f1f4f9;padding:.8em 1em;border-radius:4px">${html}</div>`;

const POST = encadre(`<p><strong>@SanteNaturelle_Info</strong> · <em>il y a 3 h</em> · 48 000 partages</p>
<p>🚨 <strong>INCROYABLE !</strong> Des scientifiques ont prouvé que boire 3 litres de jus d'orange par jour
rend <strong>immunisé contre tous les rhumes</strong> ! Les laboratoires ne veulent pas que vous le sachiez !!
👉 Commandez notre jus « VitaMax » avec le lien ci-dessous.</p>`, '#e63946');

const content = tabs([
  tab('1. L\'info', [
    text(`<h2>Enquête sur une source</h2>
<p>Cette publication circule sur les réseaux sociaux. Avant de la partager, mène l'enquête :
explore les onglets dans l'ordre, comme un journaliste qui vérifie une information.</p>${POST}
<p style="font-size:.85em;color:#555">Publication inventée pour l'exercice.</p>`),
    tf('<p>Une information partagée 48 000 fois est forcément vraie.</p>', false,
      'Exact : le nombre de partages mesure la popularité, pas la fiabilité.',
      'Non : une fausse information peut être très partagée, souvent parce qu\'elle surprend ou fait peur.',
      'Popularité'),
  ]),
  tab('2. Qui ?', [
    text(`<h3>Qui a écrit ?</h3><p>Premier réflexe : identifier l'<strong>auteur</strong>. Est-ce un
média connu, un organisme officiel, un expert, un particulier, une marque ? Clique sur son nom,
lis sa page « À propos », cherche-le dans un moteur de recherche.</p>`),
    mc('<p>Le compte « @SanteNaturelle_Info » vend le jus « VitaMax ». Qu\'en déduis-tu ?</p>', [
      { t: 'Il a un intérêt commercial à ce que tu croies l\'information', ok: true,
        fb: 'Oui : quand l\'auteur vend le produit dont il parle, il n\'est pas neutre.' },
      { t: 'Il est forcément spécialiste de la santé puisque son nom le dit',
        fb: 'Un nom de compte se choisit librement : il ne prouve aucune compétence.' },
      { t: 'Il est neutre puisqu\'il cite des scientifiques',
        fb: 'Il cite des « scientifiques » sans les nommer : impossible de vérifier.' },
    ], 'Qui parle ?'),
  ]),
  tab('3. Quand ?', [
    text(`<h3>Quand est-ce paru ?</h3><p>Une information peut être <strong>ancienne</strong> et ressortir
des années plus tard, hors de son contexte. Cherche la <strong>date de publication</strong> et la
date des faits racontés.</p>`),
    blanks('<p>Complète.</p>', [
      '<p>« Il y a 3 h » est la date de la *publication*, pas forcément celle de l\'*étude* citée.</p>',
    ], 'Les dates'),
  ]),
  tab('4. D\'où ?', [
    text(`<h3>D'où vient l'information ?</h3><p>Une affirmation sérieuse renvoie à une
<strong>source vérifiable</strong> : nom de l'étude, revue, chercheurs, lien. Pour vérifier, on
<strong>croise</strong> : d'autres médias fiables disent-ils la même chose ?</p>`),
    mc('<p>Quelles démarches t\'aident à vérifier cette information ? (plusieurs réponses)</p>', [
      { t: 'Chercher l\'étude citée dans un moteur de recherche', ok: true },
      { t: 'Consulter un site de vérification (AFP Factuel, Les Décodeurs…)', ok: true },
      { t: 'Lire les commentaires sous la publication pour voir si les gens y croient' },
      { t: 'Regarder si des médias reconnus en parlent', ok: true },
    ], 'Croiser les sources', { type: 'multi' }),
  ]),
  tab('5. Pourquoi ?', [
    text(`<h3>Pourquoi a-t-on publié ça ?</h3><p>Informer, convaincre, vendre, faire rire, faire
peur, gagner des clics… L'<strong>intention</strong> de l'auteur change tout. Repère les indices :
majuscules, points d'exclamation, émojis d'alerte, « on vous cache la vérité », lien d'achat.</p>`),
    mc('<p>Quelle est l\'intention principale de cette publication ?</p>', [
      { t: 'Vendre un produit', ok: true, fb: 'Oui : le lien d\'achat de « VitaMax » trahit l\'objectif.' },
      { t: 'Informer sur une découverte', fb: 'Une vraie découverte serait sourcée et nuancée.' },
      { t: 'Faire rire les lecteurs', fb: 'Rien n\'indique l\'humour ou la parodie ici.' },
    ], 'L\'intention'),
  ]),
  tab('6. Verdict', [
    text(`<h3>Ton verdict</h3><p>Auteur intéressé, aucune source, promesse miraculeuse, ton
alarmiste, lien d'achat : <strong>cette publication n'est pas fiable</strong>. On ne la partage pas.</p>
${encadre('<p><strong>Retiens 4 questions</strong> : <strong>Qui</strong> parle ? <strong>Quand</strong> ? <strong>D\'où</strong> vient l\'info ? <strong>Pourquoi</strong> l\'a-t-on publiée ?</p>')}`),
    tf('<p>Si une information me fait très peur ou me surprend beaucoup, je dois redoubler de prudence avant de la partager.</p>', true,
      'Bien vu : l\'émotion forte est le moteur n°1 des fausses informations.',
      'En fait si : les infox jouent sur l\'émotion pour être partagées sans réfléchir.',
      'Émotion'),
  ]),
], { color: '#1d3557', placement: 'top', spread: 100 });

fr(content);
const out = process.argv[2] || 'content.json';
fs.writeFileSync(out, JSON.stringify(content, null, 2));
console.log('OK', out, content.tabs.length, 'onglets');
