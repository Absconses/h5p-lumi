// Dessine les images du scénario en HTML (Playwright) : style « dossier d'enquête », qui découle du sujet.
// Bureau de l'enquêteur, étiquette de scellé « Genre : ? » à remplir, quatrième de couverture lisible
// (Atkinson Hyperlegible, pensée pour les lecteurs fragiles), titres à la machine à écrire.
// usage : node render.mjs <dossier media>   → p1.jpg … p5.jpg, intro.jpg, hotspots.json
import fs from 'fs'; import path from 'path';
import { chromium } from 'playwright-core';
import { PIECES } from './pieces.mjs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Special+Elite&display=block" rel="stylesheet">';
const DESK = `background:#3b2a1e radial-gradient(circle at 30% 20%,#5a4030 0,#3b2a1e 60%,#2a1d14 100%);`;
const COLORS = { p1: '#7a2e2e', p2: '#2f4f6f', p3: '#3d3550', p3b: '#2f5d50', p4: '#8a5a1c', p4b: '#5b6b2f', p5: '#4a3b2a' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const mark = (s) => esc(s).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<span data-k="$2">$1</span>');

const piece = (k) => {
  const P = PIECES[k], c = COLORS[k];
  const L = P.texte.join(" ").length, size = L > 400 ? 23 : L > 330 ? 25 : 27;
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  *{box-sizing:border-box;margin:0}
  body{width:1280px;height:720px;${DESK}position:relative;overflow:hidden;font-family:'Atkinson Hyperlegible',sans-serif}
  .dossier{position:absolute;left:-40px;top:470px;width:420px;height:300px;background:#c9a46a;border-radius:8px;transform:rotate(-4deg);box-shadow:0 8px 20px #0008}
  .dossier b{position:absolute;left:70px;top:40px;font:26px 'Special Elite';color:#3b2a1e;letter-spacing:1px}
  .tag{position:absolute;left:40px;top:70px;width:250px;height:330px;background:#d8b77f;transform:rotate(-7deg);box-shadow:0 10px 24px #0009;
       clip-path:polygon(18% 0,82% 0,100% 12%,100% 100%,0 100%,0 12%);padding:72px 24px 0;font-family:'Special Elite';color:#2b1d12}
  .tag:before{content:'';position:absolute;left:50%;top:22px;width:26px;height:26px;margin-left:-13px;border-radius:50%;background:#3b2a1e;box-shadow:inset 0 0 0 5px #a8875a}
  .tag h3{font-size:25px;letter-spacing:2px;text-align:center;border-bottom:2px solid #2b1d12;padding-bottom:10px}
  .tag .n{font-size:58px;text-align:center;margin:12px 0 18px}
  .tag .g{font-size:27px}.tag .g span{display:inline-block;width:90px;border-bottom:2px dashed #2b1d12;text-align:center;color:#a3271f;font-size:36px}
  .stamp{position:absolute;left:62px;top:430px;transform:rotate(-14deg);border:4px solid #a3271f;color:#a3271f;font:30px 'Special Elite';padding:4px 14px;letter-spacing:3px;opacity:.85}
  .back{position:absolute;left:330px;top:44px;width:900px;height:632px;background:#f4ecdc;border-left:22px solid ${c};box-shadow:0 14px 34px #000a;padding:40px 70px 0 84px}
  .back h1{font:700 40px 'Atkinson Hyperlegible';color:${c};line-height:1.1}
  .back h2{font:22px 'Special Elite';color:#5a4a3a;margin:8px 0 26px;letter-spacing:1px}
  .back p{font-size:${size}px;line-height:1.5;color:#1e1a16;margin-bottom:12px}
  .back .q4{position:absolute;right:36px;bottom:22px;font:18px 'Special Elite';color:#8a7a68}
  .clip{position:absolute;left:1080px;top:18px;width:46px;height:120px;border:7px solid #9aa3ad;border-radius:24px;transform:rotate(8deg)}
  </style></head><body>
  <div class="dossier"><b>DOSSIER : LE CARTON</b></div>
  <div class="tag"><h3>SCELLÉ</h3><div class="n">N° ${P.n}</div><div class="g">Genre : <span>?</span></div></div>
  <div class="stamp">À IDENTIFIER</div>
  <div class="back"><h1>${esc(P.titre)}</h1><h2>${esc(P.auteur.toUpperCase())}</h2>${P.texte.map((t) => `<p>${mark(t)}</p>`).join('')}<div class="q4">quatrième de couverture</div></div>
  <div class="clip"></div>
  </body></html>`;
};

const intro = () => {
  const spines = [['#7a2e2e', 300], ['#2f4f6f', 270], ['#3d3550', 310], ['#2f5d50', 285], ['#8a5a1c', 300], ['#5b6b2f', 265], ['#4a3b2a', 295], ['#6b3f5e', 280]];
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  *{box-sizing:border-box;margin:0}
  body{width:1280px;height:720px;${DESK}position:relative;overflow:hidden}
  .box{position:absolute;left:90px;top:300px;width:620px;height:380px;background:#b98d55;box-shadow:0 18px 40px #000b;border-top:26px solid #a37a46}
  .box:after{content:'FRAGILE · LIVRES';position:absolute;left:40px;bottom:30px;font:30px 'Special Elite';color:#5b3d1e;letter-spacing:4px;opacity:.6}
  .books{position:absolute;left:120px;top:0;height:330px;display:flex;align-items:flex-end;gap:8px}
  .s{width:62px;border-radius:3px 3px 0 0;position:relative;box-shadow:inset -6px 0 0 #0003}
  .s i{position:absolute;left:13px;bottom:18px;width:36px;height:36px;border-radius:50%;border:3px dashed #f4ecdc;color:#f4ecdc;font:700 22px/30px 'Atkinson Hyperlegible';text-align:center;font-style:normal}
  .s b{position:absolute;left:24px;top:30px;width:14px;height:120px;background:#f4ecdc55;border-radius:3px}
  .file{position:absolute;left:770px;top:90px;width:440px;height:560px;background:#d8b77f;transform:rotate(3deg);box-shadow:0 14px 34px #000a;padding:50px 40px;font-family:'Special Elite';color:#2b1d12}
  .file h1{font-size:38px;letter-spacing:3px;border-bottom:3px solid #2b1d12;padding-bottom:12px}
  .file p{font-size:27px;line-height:1.55;margin-top:22px}
  .file .st{position:absolute;right:30px;bottom:44px;transform:rotate(-12deg);border:4px solid #a3271f;color:#a3271f;font-size:30px;padding:4px 14px;letter-spacing:3px}
  </style></head><body>
  <div class="box"><div class="books" style="top:-330px">${spines.map(([c, h]) => `<div class="s" style="background:${c};height:${h}px"><b></b><i>?</i></div>`).join('')}</div></div>
  <div class="file"><h1>AFFAIRE N° 6-27</h1><p>Objet : un carton de romans arrivé au CDI.</p><p>Problème : aucune pastille de genre.</p><p>Mission : repérer les polars.</p><div class="st">URGENT</div></div>
  </body></html>`;
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const hot = {};
const shoot = async (html, file, measure) => {
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  const overflow = await p.evaluate(() => { const b = document.querySelector('.back'); return b ? b.scrollHeight - b.clientHeight : 0; });
  if (overflow > 0) throw new Error(`${file} : le texte déborde de ${overflow}px`);
  if (measure) hot[measure] = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-k]')].map((s) => {
    const r = s.getClientRects()[0]; return [s.dataset.k, r.top + r.height / 2];
  })));
  // Les boutons d'indice vont dans les marges de la quatrième (jamais sur le texte) : marge gauche,
  // ou marge droite si un autre indice occupe déjà la même ligne.
  if (measure) { const used = []; for (const [k, y] of Object.entries(hot[measure])) {
    const right = used.some((u) => Math.abs(u - y) < 8); used.push(y);
    hot[measure][k] = [right ? 93.4 : 30.8, +((y / 720) * 100).toFixed(1)];
  } }
  await p.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 84 });
};
await shoot(intro(), 'intro.jpg');
for (const k of Object.keys(PIECES)) await shoot(piece(k), `${k}.jpg`, k === 'p1' && 'p1');
fs.writeFileSync(path.join(OUT, 'hotspots.json'), JSON.stringify(hot, null, 1));
console.log('images', fs.readdirSync(OUT).length, JSON.stringify(hot));
await b.close();
