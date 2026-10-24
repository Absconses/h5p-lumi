/* =====================================================================
 *  tabs.mjs — fabriques pour H5P.Tabs 1.1 (contenu en onglets)
 *
 *  Versions = celles de assets/templates/gabarit-tabs.h5p.
 *  Fiche : references/tabs.md
 *
 *  Usage :
 *      import { text, mc, tf } from '<chemin>/h5p-factories.mjs';
 *      import * as tb from '<chemin>/tabs.mjs';
 *      const content = tb.tabs([
 *        tb.tab('Qui ?',  [text('<p>…</p>'), mc(…)]),
 *        tb.tab('Quand ?', [text('<p>…</p>')]),
 *      ], { color: '#1d3557', placement: 'top' });
 *
 *  REGLES (verifiees dans le code de la bibliotheque et par rendu) :
 *   1. Un onglet = une H5P.Column 1.16 (PAS 1.18 : c'est la seule version
 *      autorisee par le semantics de Tabs 1.1).
 *   2. Le libelle de l'onglet = metadata.title de la Column. Sans titre,
 *      le lecteur affiche « Tab 1 », « Tab 2 »…
 *   3. Les briques de h5p-factories.mjs (text, mc, tf, blanks, markWords,
 *      dragText, essay, dialogcards, questionSet, image, audio…) se posent
 *      telles quelles dans un onglet : memes versions que le gabarit.
 *   4. Score : Tabs additionne les scores des exercices de tous les onglets
 *      et envoie un xAPI « completed » quand tout est fait -> resultats
 *      remontes dans Lumi Nuage.
 *   5. Un onglet deja reussi recoit une coche ; l'onglet actif est memorise
 *      (reprise la ou l'eleve s'est arrete).
 * ===================================================================== */

import crypto from 'crypto';

export const guid = () => crypto.randomUUID();

const meta = (contentType, title) => ({
  contentType, license: 'U', title, authors: [], changes: [], extraTitle: title,
});

/* ---- Un onglet = une Column 1.16 ------------------------------------- */
export const tab = (title, items) => ({
  params: { content: items.map(c => ({ content: c, useSeparator: 'auto' })) },
  library: 'H5P.Column 1.16',
  subContentId: guid(),
  metadata: meta('Column', title),
});

/* ---- Le content.json complet ------------------------------------------ *
 *  placement : 'dynamic' (haut sur petit ecran, gauche sinon), 'top', 'left'
 *  spread    : % de la largeur occupe par la barre d'onglets (50-100)
 *  color     : couleur des onglets ; background : fond du lecteur
 * ---------------------------------------------------------------------- */
export const tabs = (list, {
  placement = 'dynamic', spread = 70,
  color = '#1a73d9', background = 'rgba(255, 255, 255, 0)',
} = {}) => {
  if (!list.length) throw new Error('Tabs : il faut au moins un onglet');
  for (const t of list) {
    if (t.library !== 'H5P.Column 1.16') throw new Error(`Onglet « ${t.metadata?.title} » : doit etre H5P.Column 1.16`);
    if (!t.metadata?.title) throw new Error('Onglet sans titre : le lecteur afficherait « Tab N »');
  }
  return {
    tabs: list,
    behaviour: { tabPlacement: placement, tabSpread: spread, colorBase: color, colorBackground: background },
    l10n: { tab: 'onglet', noContent: "Il n'y a aucun contenu à afficher." },
    a11y: { tabList: 'Choisis un onglet.' },
  };
};
