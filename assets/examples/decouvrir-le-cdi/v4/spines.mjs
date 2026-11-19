// Génère 4 images de l'étagère des romances (Agamotto « Je découvre la cote »).
import { chromium } from 'playwright-core';
const OUT = process.argv[2];
const books = [
  ['ANG', 'Le Bal des étoiles', '#c9184a', 52], ['BEN', 'Un été à Saint-Malo', '#457b9d', 44], ['COL', 'Lettres à Inès', '#e9c46a', 60],
  ['DUP', 'Le Garçon du phare', '#2a9d8f', 48], ['HAN', "L'été où je suis devenue jolie", '#f4a3b5', 66], ['KIN', 'Coeurs en orbite', '#6d597a', 50],
  ['LEG', 'Rendez-vous à minuit', '#e76f51', 46], ['MAR', 'La Promesse de Nina', '#264653', 56], ['ROU', 'Deux billets pour Rome', '#8ab17d', 50],
];
const step = Number(process.argv[3]);
const spine = ([l, t, c, w], i) => {
  const target = l === 'HAN';
  const hiPast = step === 2, hiLet = step === 3 && target, hiAlpha = step === 4;
  const dim = (step === 3 && !target) ? 'opacity:.35;' : '';
  return `<div class="b" style="width:${w + 30}px;background:${c};${dim}">
  <div class="t">${t}</div>
  <div class="lab">
    <div class="pa ${hiPast ? 'hi' : ''}"></div>
    <div class="le ${hiLet || hiAlpha ? 'hi' : ''} ${hiAlpha && target ? 'big' : ''}">${l}</div>
  </div></div>`;
};
const cap = {
  1: 'Dans un rayon, je ne vois que le <b>dos</b> des livres. En bas de chaque dos, une petite étiquette : la <b>cote</b>. Elle a deux parties.',
  2: '<b>1. La pastille de couleur</b> donne le <b>genre</b>. Ici, elles sont toutes roses : je suis au rayon <b>romance</b>.',
  3: '<b>2. Les 3 lettres</b> sont le début du <b>nom de l’autrice</b> : Jenny <b>Han</b> → <b>HAN</b>.',
  4: 'Les livres suivent l’<b>ordre alphabétique</b> de ces lettres : ANG, BEN, COL, DUP, <b>HAN</b>, KIN… Je trouve mon livre sans tout regarder.',
}[step];
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;width:1000px;height:690px;background:#f3ead8;font-family:'DejaVu Sans',Arial,sans-serif;position:relative;overflow:hidden}
.shelf{position:absolute;left:40px;right:40px;top:30px;height:470px;display:flex;justify-content:center;align-items:flex-end;gap:8px;padding:0 20px;border-bottom:18px solid #8b5a2b}
.b{height:440px;border-radius:4px 4px 0 0;position:relative;box-shadow:inset -6px 0 0 rgba(0,0,0,.15);display:flex;flex-direction:column;align-items:center}
.b:nth-child(odd){height:415px}.b:nth-child(3n){height:455px}
.t{writing-mode:vertical-rl;transform:rotate(180deg);color:#fff;font-weight:bold;font-size:15px;margin-top:14px;text-shadow:0 1px 2px rgba(0,0,0,.4);flex:1;white-space:nowrap;overflow:hidden}
.lab{width:52px;background:#fff;border-radius:6px;margin:10px 0 12px;padding:6px 0;display:flex;flex-direction:column;align-items:center;gap:5px}
.pa{width:22px;height:22px;border-radius:50%;background:#ff7eb6;border:1px solid #c45a8a}
.le{font-weight:bold;font-size:15px;color:#222;padding:1px 3px}
.hi{outline:4px solid #e63946;outline-offset:3px;border-radius:6px}
.big{background:#ffe066}
.cap{position:absolute;left:0;right:0;bottom:0;height:150px;box-sizing:border-box;padding:18px 40px;background:#1d3557;color:#fff;font-size:25px;line-height:1.4;display:flex;align-items:center;justify-content:center;text-align:center}
.arrow{position:absolute;top:22px;left:90px;right:90px;height:4px;background:#e63946}
.arrow:after{content:'';position:absolute;right:-6px;top:-8px;border-left:16px solid #e63946;border-top:10px solid transparent;border-bottom:10px solid transparent}
</style><div class="shelf">${books.map(spine).join('')}</div>${step === 4 ? '<div class="arrow"></div>' : ''}<div class="cap"><div>${cap}</div></div>`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1000, height: 690 } });
await p.setContent(html); await p.screenshot({ path: OUT });
await b.close();
