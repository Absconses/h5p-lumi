/* =====================================================================
 *  geoquiz.mjs — fabriques pour H5P.GeoQuiz 1.1 (Geography Quiz)
 *
 *  Versions = celles de assets/templates/gabarit-geoquiz.h5p (GeoQuiz 1.1.10
 *  PATCHE par le skill, voir references/geoquiz.md).
 *
 *  Usage :
 *      import * as gq from '<chemin>/geoquiz.mjs';
 *      const content = gq.quiz([
 *        gq.lieu('Où se trouve Sofia ?', 'Sofia', 42.6977, 23.3219),
 *        gq.pays('Clique sur la Bulgarie.', 'Bulgarie', 'BGR'),
 *      ], { centre: [50, 10], zoom: 4, fond: gq.FONDS.photo });
 *      gq.validate(content);   // leve une erreur si quelque chose cloche
 *
 *  REGLES VERIFIEES (lecture du code + rendu) :
 *   1. Question « lieu » : score = 1000 - distance en km (0 au-dela de 1000 km).
 *      Marqueur vert (= « correct » pour xAPI) a moins de 250 km.
 *   2. Question « pays » : 1000 si le clic tombe dans le pays, sinon 0. Code
 *      ISO 3166-1 alpha-3 (FRA, DEU…) present dans geojson-data/ de la lib.
 *   3. typeLocation et typeArea sont des CHAINES (« lat,lng » / « BGR ») : le
 *      groupe a un seul champ, H5P l'aplatit.
 *   4. Les questions sont melangees par le lecteur a chaque essai.
 *   5. Zoom 1 = monde entier 512 px de haut : la carte (16:9) depasse -> bandes
 *      grises. Zoom 2 pour le monde, 4 pour l'Europe, 5-6 pour la France.
 * ===================================================================== */

/* ---- Fonds de carte (valeurs de mapType) ------------------------------
 *  Les noms sont ceux de la lib d'origine. Leurs serveurs sont morts (Hydda,
 *  Stamen) ou exigent une cle (CARTO, 2026) : le gabarit patche les redirige
 *  tous vers des fonds Esri sans cle, indiques ci-dessous.                 */
export const FONDS = {
  plan: 'CartoDB.VoyagerNoLabels',      // -> plan gris clair SANS noms (Esri), zoom max 16
  photo: 'Esri.WorldImagery',           // vue satellite (Esri), sans noms
  relief: 'Stamen.TerrainBackground',   // -> relief ombre Esri (zoom max 13)
  physique: 'Stamen.Watercolor',        // -> carte physique Esri (zoom max 8)
};

/* ---- Libelles francais ------------------------------------------------ */
export const L10N_FR = {
  intro: '<p>Réponds aux questions en cliquant au bon endroit sur la carte.</p>',
  overallFeedback: 'Tu as obtenu @score points sur @total.',
  nextBtnLabel: 'Suivant',
  startBtnLabel: 'Commencer',
  retryBtnLabel: 'Recommencer',
  showSolutionsBtnLabel: 'Voir la solution',
};

const coord = (lat, lng) => `${+lat},${+lng}`;

/* ---- Questions -------------------------------------------------------- */
// Point precis : ville, monument, site… Le libelle s'affiche sur le marqueur solution.
export const lieu = (text, label, lat, lng) =>
  ({ locationType: 'location', text, locationLabel: label, typeLocation: coord(lat, lng) });

// Pays entier : iso3 = code alpha-3 (FRA, ITA, BGR…).
export const pays = (text, label, iso3) =>
  ({ locationType: 'area', text, locationLabel: label, typeArea: iso3 });

/* ---- Activite complete ------------------------------------------------ */
export const quiz = (questions, {
  centre = [46.6, 2.4], zoom = 4, fond = FONDS.plan,
  retry = true, solutions = true, l10n = {},
} = {}) => ({
  ...L10N_FR,
  ...l10n,
  mapType: fond,
  mapCenter: coord(centre[0], centre[1]),
  mapZoom: zoom,
  questions,
  behaviour: { enableRetry: retry, enableSolutionsButton: solutions },
});

/* ---- Validation ------------------------------------------------------- *
 *  areas : liste des codes disponibles (noms des fichiers geojson-data/ du
 *  gabarit, sans .geo.json). Facultatif mais conseille.
 * ---------------------------------------------------------------------- */
export const validate = (c, { areas } = {}) => {
  const err = [];
  const isCoord = (s) => typeof s === 'string' && /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(s)
    && Math.abs(+s.split(',')[0]) <= 90 && Math.abs(+s.split(',')[1]) <= 180;
  if (!Object.values(FONDS).includes(c.mapType) && c.mapType !== 'Hydda.Base') err.push(`mapType inconnu : ${c.mapType}`);
  if (!isCoord(c.mapCenter)) err.push(`mapCenter invalide : ${c.mapCenter}`);
  if (!(c.mapZoom >= 1 && c.mapZoom <= 20)) err.push(`mapZoom hors 1-20 : ${c.mapZoom}`);
  if (!Array.isArray(c.questions) || !c.questions.length) err.push('aucune question');
  (c.questions || []).forEach((q, i) => {
    const n = `question ${i + 1}`;
    if (!q.text) err.push(`${n} : text vide`);
    if (!q.locationLabel) err.push(`${n} : locationLabel vide`);
    if (q.locationType === 'location') {
      if (!isCoord(q.typeLocation)) err.push(`${n} : typeLocation doit etre "lat,lng" (${JSON.stringify(q.typeLocation)})`);
    } else if (q.locationType === 'area') {
      if (typeof q.typeArea !== 'string') err.push(`${n} : typeArea doit etre une chaine ISO3`);
      else if (areas && !areas.includes(q.typeArea)) err.push(`${n} : pays ${q.typeArea} absent de geojson-data/`);
    } else err.push(`${n} : locationType doit etre "location" ou "area"`);
  });
  if (err.length) throw new Error('GeoQuiz invalide :\n - ' + err.join('\n - '));
  return true;
};
