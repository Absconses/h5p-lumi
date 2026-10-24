// Demo : « L'Union européenne sur la carte » (cycle 3-4, géographie).
// Usage : node build.mjs <sortie content.json> [<gabarit-geoquiz.h5p dezippe>/H5P.GeoQuizFix-1.1/geojson-data]
import fs from 'fs';
import * as gq from '../../lib/geoquiz.mjs';

const [out = 'content.json', geodir] = process.argv.slice(2);
const areas = geodir ? fs.readdirSync(geodir).map((f) => f.replace('.geo.json', '')) : undefined;

const content = gq.quiz([
  gq.lieu('Où se trouve Paris, la capitale de la France ?', 'Paris', 48.8566, 2.3522),
  gq.lieu('Où se trouve Berlin, la capitale de l\'Allemagne ?', 'Berlin', 52.5200, 13.4050),
  gq.lieu('Où se trouve Rome, la capitale de l\'Italie ?', 'Rome', 41.9028, 12.4964),
  gq.lieu('Où se trouve Madrid, la capitale de l\'Espagne ?', 'Madrid', 40.4168, -3.7038),
  gq.lieu('Où se trouve Bruxelles, où siège la Commission européenne ?', 'Bruxelles', 50.8467, 4.3525),
  gq.lieu('Où se trouve Strasbourg, où siège le Parlement européen ?', 'Strasbourg', 48.5734, 7.7521),
  gq.pays('Clique sur la Pologne.', 'Pologne', 'POL'),
  gq.pays('Clique sur la Suède.', 'Suède', 'SWE'),
  gq.pays('Clique sur la Grèce.', 'Grèce', 'GRC'),
  gq.pays('Clique sur le Portugal.', 'Portugal', 'PRT'),
], {
  centre: [52, 12], zoom: 4, fond: gq.FONDS.plan,
  l10n: { intro: '<p><strong>L\'Union européenne sur la carte</strong></p><p>Clique au bon endroit. Pour une ville, plus tu es proche, plus tu gagnes de points (1000 au maximum). Pour un pays, clique n\'importe où à l\'intérieur.</p>' },
});

gq.validate(content, { areas });
fs.writeFileSync(out, JSON.stringify(content, null, 2));
console.log('OK', content.questions.length, 'questions ->', out);
