// Rend les scènes du scénario « Conseiller un ami » : node bs-render.mjs <scene.html> <dossier_sortie> [<dossier_fonds> [scène,scène…]]
// <dossier_fonds> : illustrations Canva sans texte (fond-<scène>.jpg). Si le fond existe, il remplace le décor
// dessiné ; bulles, couvertures et cotes restent superposées en HTML (texte modifiable).
import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';
const [HTML, OUT, BG, ONLY] = process.argv.slice(2);
const SAM = { face: '👦', color: '#e76f51', name: 'Sam' };
const LINA = { face: '👧', color: '#2a9d8f', name: 'Lina' };
const NOE = { face: '🧒', color: '#457b9d', name: 'Noé' };
const ROM = { signR: 'ROMANS', colR: '#7b2cbf' }, DOC = { signR: 'DOCUMENTAIRES', colR: '#2a9d8f' }, BD = { signR: 'BD · MANGAS', colR: '#e85d04' };
const MANOIR = { color: '#3d348b', e: '🕵️', t: 'Le Mystère du manoir', a: 'Rose Duval' };
const SCENES = {
  'intro': { shelves: false, title: 'Midi, au CDI', sub: 'Trois amis ont besoin de tes conseils.', trio: [SAM, LINA, NOE] },
  /* --- fiches --- */
  'fiche-sam': { shelves: false, fiche: { who: SAM, classe: '6e B', demande: 'Il doit emprunter un livre pour le cours de français, avant vendredi.',
    lectures: ['Lit très peu', 'A abandonné son dernier roman au chapitre 2'], savoir: ['Passe ses mercredis sur les jeux vidéo', 'N’est venu au CDI qu’une seule fois', 'N’aime pas qu’on lui fasse la leçon'] } },
  'fiche-lina': { shelves: false, fiche: { who: LINA, classe: '6e A', demande: 'Elle prépare un exposé de SVT sur les volcans, à rendre lundi.',
    lectures: ['Grande lectrice de romans', 'Connaît par cœur le rayon des romans'], savoir: ['N’est jamais allée au rayon des documentaires', 'Veut des informations sûres et précises', 'Aime comprendre toute seule'] } },
  'fiche-noe': { shelves: false, fiche: { who: NOE, classe: '6e C', demande: 'Sa professeure demande à chaque élève d’emprunter un livre.',
    lectures: ['Ne lit que des mangas', 'A lu tous les <em>One Piece</em> du CDI'], savoir: ['Pense que « les mangas, ça ne compte pas »', 'A peur des gros livres sans images', 'Adore les histoires de pirates'] } },
  /* --- Sam --- */
  'sam-arrive': { who: SAM, ...ROM, seed: 3, bubble: 'Je dois emprunter un livre pour le cours de français… mais je ne sais pas du tout quoi prendre !' },
  'sam-jeux': { who: SAM, ...ROM, seed: 3, bubble: 'Ce que j’aime lire ? Rien… Les livres, c’est pas trop mon truc. Moi, je préfère les jeux vidéo.' },
  'sam-aime': { who: SAM, ...ROM, seed: 3, bubble: 'Mes jeux préférés ? Les jeux d’enquête ! Chercher des indices, interroger les suspects, trouver le coupable avant tout le monde.' },
  'sam-rayon': { who: SAM, ...ROM, seed: 5, bubble: 'Ouh là… Il y a des centaines de romans ici ! On commence par où ?' },
  'sam-deux': { who: SAM, ...ROM, seed: 5, bw: 560, by: 50, bubble: 'J’en ai trouvé deux avec la bonne pastille. Je prends lequel ?',
    covers: [MANOIR, { color: '#9a031e', e: '🔦', t: 'Nuit noire au collège', a: 'Hugo Brun' }] },
  'sam-livre': { who: SAM, ...ROM, seed: 3, bw: 400, by: 90, bubble: '<em>Le Mystère du manoir</em> : un vol, cinq suspects… Celui-là, je le veux !', cover: MANOIR, px: 880, py: 300 },
  /* --- Lina --- */
  'lina-arrive': { who: LINA, ...ROM, seed: 11, bw: 400, by: 70, bubble: 'Pour mon exposé sur les volcans, j’ai trouvé ce roman. C’est bien, non ?',
    cover: { color: '#bb3e03', e: '🌋', t: 'L’Enfant du volcan', a: 'roman' }, px: 880, py: 300 },
  'lina-rangement': { who: LINA, ...DOC, seed: 13, bubble: 'D’accord, il me faut un documentaire. Mais ici, il n’y a pas de pastilles… C’est rangé comment ?' },
  'lina-500': { who: LINA, signR: '500 · SCIENCES', colR: '#2a9d8f', seed: 13, bubble: 'Le rayon 500 est immense : les étoiles, les animaux, les plantes… Je ne vais jamais trouver les volcans !' },
  'lina-cote': { who: LINA, signR: '500 · SCIENCES', colR: '#2a9d8f', seed: 13, bw: 430, by: 60, bubble: 'J’ai trouvé <em>Tout sur les volcans</em> ! Mais sur le dos, il y a écrit ça…',
    cote: '551.21<br>MON', coteSub: 'étiquette au dos du livre', px: 880, py: 330 },
  'lina-magazine': { who: LINA, ...DOC, seed: 11, bw: 430, by: 60, bubble: 'Regarde : ce magazine a tout un dossier sur les volcans. Je peux m’en servir aussi ?',
    cover: { color: '#0a9396', e: '📰', t: 'Le Mag des curieux', a: 'n° 214 · dossier volcans' }, px: 880, py: 300 },
  'lina-contente': { who: LINA, ...DOC, seed: 11, bw: 400, by: 90, bubble: 'Merci ! Avec tout ça, mon exposé va être explosif !',
    cover: { color: '#bc4749', e: '🌋', t: 'Tout sur les volcans', a: 'Paul Monnier' }, px: 880, py: 300 },
  /* --- Noé --- */
  'noe-arrive': { who: NOE, ...ROM, seed: 19, bubble: 'La prof veut qu’on emprunte un livre… Mais moi, je ne lis que des mangas. Et les mangas, ça ne compte pas.' },
  'noe-manga': { who: NOE, ...BD, seed: 23, bubble: 'Tu es sûr que j’ai le droit ? Bon… Le problème, c’est que j’ai déjà lu tous les <em>One Piece</em> du CDI.' },
  'noe-aime': { who: NOE, ...BD, seed: 23, bubble: 'Ce que j’aime dans <em>One Piece</em> ? Les pirates, les trésors, et l’équipage qui reste soudé dans l’aventure !' },
  'noe-doute': { who: NOE, ...ROM, seed: 19, bw: 400, by: 70, bubble: 'Un roman, sans images ? Et si je n’aime pas… je serai obligé de le finir ?',
    cover: { color: '#1d6996', e: '🏴‍☠️', t: 'L’Île au trésor', a: 'R. L. Stevenson' }, px: 880, py: 300 },
  'noe-content': { who: NOE, ...ROM, seed: 19, bw: 400, by: 100, bubble: 'Alors je tente ! Des pirates et un trésor, ça me va.',
    cover: { color: '#1d6996', e: '🏴‍☠️', t: 'L’Île au trésor', a: 'R. L. Stevenson' }, px: 880, py: 300 },
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await b.newPage({ viewport: { width: 1200, height: 675 } });
for (const [name, p] of Object.entries(SCENES)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const fond = BG && path.resolve(BG, `fond-${name}.jpg`);
  if (fond && fs.existsSync(fond)) { p.bg = `file://${fond}`; if (p.who) p.tag = [40, 600, p.who.name]; }
  if (p.fiche && BG && fs.existsSync(path.resolve(BG, `portrait-${p.fiche.who.name}.jpg`))) p.fiche.pic = `file://${path.resolve(BG, `portrait-${p.fiche.who.name}.jpg`)}`;
  await pg.goto('about:blank');
  await pg.goto(`file://${path.resolve(HTML)}#${encodeURIComponent(JSON.stringify(p))}`);
  await pg.waitForFunction(() => window.ready);
  await pg.waitForTimeout(200);
  await pg.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 88 });
}
console.log('scènes', Object.keys(SCENES).length);
await b.close();
