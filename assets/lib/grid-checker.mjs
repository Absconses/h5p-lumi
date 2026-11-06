/* =====================================================================
 *  grid-checker.mjs — fabrique pour H5P.GridChecker 1.0 (grille a cocher)
 *
 *  Versions = celles de assets/templates/gabarit-gridchecker.h5p.
 *  Fiche : references/grid-checker.md
 *
 *  Usage :
 *      import { gridChecker } from '<chemin>/grid-checker.mjs';
 *      const content = gridChecker({
 *        title: 'Que puis-je faire avec cette image ?',
 *        intro: '<p>Coche ce que chaque licence autorise.</p>',
 *        type: 'multiple',                       // 'single' | 'multiple' | 'text'
 *        columns: ['Partager', 'Modifier'],
 *        rows: [
 *          { text: 'CC BY',       answers: [0, 1] },   // indices de colonnes justes
 *          { text: 'CC BY-ND',    answers: [0] },
 *          { text: 'Mon avis' },                       // pas d'answers -> ligne non corrigee
 *        ],
 *      });
 *
 *  REGLES (verifiees dans le code de la bibliotheque et par rendu) :
 *   1. Pas de score ni de xAPI : la grille colore les cases (vert / rouge /
 *      solution) mais n'envoie AUCUN resultat a la plateforme (Lumi Nuage
 *      n'enregistre rien) et n'affiche aucun total.
 *   2. Une ligne absente de "grid" n'est pas corrigee : toute case cochee y
 *      devient VERTE. Pour une grille d'auto-positionnement, omettre answers.
 *   3. "grid" est un groupe a un seul champ (gridRows) : H5P l'aplatit, on
 *      stocke donc directement la liste [{ gridRowId, gridRowColumns }].
 *   4. Les identifiants de lignes / colonnes servent dans des selecteurs CSS :
 *      UUID uniquement (pas d'espace ni de guillemet).
 *   5. Type 'text' : cases de saisie + bouton de telechargement CSV ; ce
 *      bouton charge PapaParse et FileSaver depuis cdnjs -> Internet requis.
 * ===================================================================== */

import crypto from 'crypto';

export const guid = () => crypto.randomUUID();

export const L10N_FR = {
  checkAnswers: 'Vérifier',
  tryAgain: 'Recommencer',
  showSolutions: 'Voir la solution',
  downloadResponses: 'Télécharger mes réponses',
  missingAnswersHeading: 'Il manque des réponses',
  missingAnswersBody: 'Au moins une ligne n\'a pas de réponse. Complète la grille puis vérifie à nouveau.',
};

const TYPES = ['single', 'multiple', 'text'];

export const gridChecker = ({
  title, intro = '', type = 'single', columns, rows,
  requireResponse = false, l10n = {},
}) => {
  if (!TYPES.includes(type)) throw new Error(`GridChecker : type « ${type} » inconnu (${TYPES.join(', ')})`);
  if (!columns?.length || !rows?.length) throw new Error('GridChecker : il faut au moins une ligne et une colonne');
  const cols = columns.map(text => ({ columnId: guid(), columnText: text }));
  const lines = rows.map(r => ({ rowId: guid(), rowText: r.text, answers: r.answers }));
  const grid = [];
  if (type !== 'text') {
    for (const r of lines) {
      if (!r.answers) continue;
      if (type === 'single' && r.answers.length !== 1) throw new Error(`Ligne « ${r.rowText} » : une grille 'single' attend exactement 1 bonne colonne`);
      for (const i of r.answers) if (!cols[i]) throw new Error(`Ligne « ${r.rowText} » : colonne ${i} inexistante`);
      grid.push({ gridRowId: r.rowId, gridRowColumns: r.answers.map(i => cols[i].columnId) });
    }
  }
  return {
    headline: title,
    ...(intro ? { bodyText: intro } : {}),
    gridBoxType: type,
    rowsAndColumns: {
      rows: lines.map(({ rowId, rowText }) => ({ rowId, rowText })),
      columns: cols,
    },
    requireResponse,
    grid,
    l10n: { ...L10N_FR, ...l10n },
  };
};
