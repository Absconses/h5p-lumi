// Rend les scènes du scénario « Conseiller un ami » : node bs-render.mjs <scene.html> <dossier_sortie>
import { chromium } from 'playwright-core';
import path from 'path';
const [HTML, OUT] = process.argv.slice(2);
const SAM = { face: '👦', color: '#e76f51', name: 'Sam' };
const LINA = { face: '👧', color: '#2a9d8f', name: 'Lina' };
const NOE = { face: '🧒', color: '#457b9d', name: 'Noé' };
const SCENES = {
  'intro': { shelves: false, title: 'Midi, au CDI', sub: 'Trois amis ont besoin de tes conseils.', trio: [SAM, LINA, NOE] },
  'sam-arrive': { who: SAM, signR: 'ROMANS', colR: '#7b2cbf', seed: 3,
    bubble: 'Je dois emprunter un livre pour le cours de français… mais je ne sais pas du tout quoi prendre !' },
  'sam-aime': { who: SAM, signR: 'ROMANS', colR: '#7b2cbf', seed: 3,
    bubble: 'Ce que j’aime ? Les jeux d’enquête ! Chercher des indices et trouver le coupable avant tout le monde.' },
  'sam-livre': { who: SAM, signR: 'ROMANS', colR: '#7b2cbf', seed: 3, bw: 400, by: 90,
    bubble: '<em>Le Mystère du manoir</em>… Celui-là a l’air trop bien !',
    cover: { color: '#3d348b', e: '🕵️', t: 'Le Mystère du manoir', a: 'Rose Duval' }, px: 880, py: 300 },
  'lina-arrive': { who: LINA, signR: 'DOCUMENTAIRES', colR: '#2a9d8f', seed: 11,
    bubble: 'Je prépare un exposé sur les volcans. Tu sais où je peux chercher ?' },
  'lina-cote': { who: LINA, signR: 'DOCUMENTAIRES', colR: '#2a9d8f', seed: 11, bw: 430, by: 60,
    bubble: 'J’ai trouvé <em>Tout sur les volcans</em> ! Mais sur le dos, il y a écrit ça…',
    cote: '551.21<br>MON', coteSub: 'étiquette au dos du livre', px: 880, py: 330 },
  'lina-contente': { who: LINA, signR: 'DOCUMENTAIRES', colR: '#2a9d8f', seed: 11, bw: 400, by: 90,
    bubble: 'Merci ! Avec ce livre, mon exposé va être explosif !',
    cover: { color: '#bc4749', e: '🌋', t: 'Tout sur les volcans', a: 'Paul Monnier' }, px: 880, py: 300 },
  'noe-arrive': { who: NOE, signR: 'ROMANS', colR: '#7b2cbf', seed: 19,
    bubble: 'La prof veut qu’on emprunte un livre… Mais moi, je ne lis que des mangas.' },
  'noe-manga': { who: NOE, signR: 'BD · MANGAS', colR: '#e85d04', seed: 23,
    bubble: 'J’ai adoré <em>One Piece</em> ! Les pirates, les trésors, les bateaux… Mais j’ai déjà lu tous ceux du CDI.' },
  'noe-content': { who: NOE, signR: 'ROMANS', colR: '#7b2cbf', seed: 19, bw: 400, by: 100,
    bubble: 'Des pirates et un trésor ? Je prends !',
    cover: { color: '#1d6996', e: '🏴‍☠️', t: 'L’Île au trésor', a: 'R. L. Stevenson' }, px: 880, py: 300 },
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await b.newPage({ viewport: { width: 1200, height: 675 } });
for (const [name, p] of Object.entries(SCENES)) {
  await pg.goto('about:blank');
  await pg.goto(`file://${path.resolve(HTML)}#${encodeURIComponent(JSON.stringify(p))}`);
  await pg.waitForFunction(() => window.ready);
  await pg.waitForTimeout(200);
  await pg.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 88 });
}
console.log('scènes', Object.keys(SCENES).length);
await b.close();
