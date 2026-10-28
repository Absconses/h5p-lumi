// Module de demonstration H5P.GridChecker : « Que puis-je faire avec cette image ? »
// (EMI cycle 4, licences Creative Commons). Usage : node build.mjs <sortie content.json>
import fs from 'fs';
import { gridChecker } from '../../lib/grid-checker.mjs';

const content = gridChecker({
  title: 'Que puis-je faire avec cette image ?',
  intro: '<p>Tu as trouvé une image pour ton exposé. Selon sa <strong>licence</strong>, '
    + 'coche <strong>tout</strong> ce que tu as le droit de faire, puis clique sur « Vérifier ».</p>'
    + '<p><em>Rappel : BY = citer l\'auteur · NC = pas d\'usage commercial · '
    + 'ND = pas de modification · SA = partager sous la même licence.</em></p>',
  type: 'multiple',
  columns: ['La partager (copier, diffuser)', 'La modifier (recadrer, retoucher)', 'L\'utiliser pour vendre', 'Ne pas citer l\'auteur'],
  rows: [
    { text: 'CC0 (domaine public)', answers: [0, 1, 2, 3] },
    { text: 'CC BY', answers: [0, 1, 2] },
    { text: 'CC BY-SA', answers: [0, 1, 2] },
    { text: 'CC BY-NC', answers: [0, 1] },
    { text: 'CC BY-ND', answers: [0, 2] },
    { text: 'CC BY-NC-ND', answers: [0] },
    { text: '© Tous droits réservés', answers: [] },
  ],
});

fs.writeFileSync(process.argv[2] || 'content.json', JSON.stringify(content, null, 2));
console.log('OK', content.rowsAndColumns.rows.length, 'lignes');
