// Prépare les vidéos du scénario « Conseiller un ami » : node video-build.mjs <dossier_clips> <map.json> <dossier_sortie>
// <map.json> : { "sam-arrive": "nom_du_clip_sans_extension", … }. Pour chaque scène : sous-titre incrusté (la réplique
// complète, car les clips générés coupent parfois la fin), encodage 720p léger, et une affiche (première image).
// Les répliques viennent de bs-render.mjs (champ bubble) : une seule source pour les images et les vidéos.
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { chromium } from 'playwright-core';
const [CLIPS, MAP, OUT] = process.argv.slice(2);
const map = JSON.parse(fs.readFileSync(MAP, 'utf8'));
const src = fs.readFileSync(new URL('./bs-render.mjs', import.meta.url), 'utf8');
const NOM = { SAM: 'Sam', LINA: 'Lina', NOE: 'Noé' };
const scenes = {};
for (const l of src.split(/\n(?=  ')/)) { // une entrée de SCENES peut tenir sur plusieurs lignes
  const m = l.match(/^  '([a-z0-9-]+)': \{ who: (\w+),/); if (!m) continue;
  scenes[m[1]] = { nom: NOM[m[2]], texte: (l.match(/bubble: '([^']+)'/) || [])[1], cote: (l.match(/cote: '([^']+)'/) || [])[1] };
}
fs.mkdirSync(`${OUT}/videos`, { recursive: true }); fs.mkdirSync(`${OUT}/images`, { recursive: true }); fs.mkdirSync(`${OUT}/tmp`, { recursive: true });
const html = (s) => `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:transparent} body{width:1280px;height:720px;position:relative;font-family:'DejaVu Sans',sans-serif}
.cap{position:absolute;left:36px;right:36px;bottom:26px;background:rgba(255,255,255,.96);border:4px solid #1d3557;border-radius:24px;padding:16px 26px 18px;font-size:30px;line-height:1.3;color:#1d2433;box-shadow:0 6px 0 rgba(0,0,0,.14)}
.cap b{display:inline-block;background:#1d3557;color:#fff;border-radius:12px;padding:1px 14px;margin-right:12px;font-size:25px}
.cote{position:absolute;right:70px;top:60px;background:#fff;border:4px solid #333;border-radius:10px;padding:12px 22px;font-family:'DejaVu Sans Mono',monospace;font-weight:bold;font-size:46px;color:#111;text-align:center;box-shadow:6px 6px 0 rgba(0,0,0,.18)}
.cote small{display:block;font-family:'DejaVu Sans',sans-serif;font-size:18px;font-weight:normal;color:#555}
</style>${s.cote ? `<div class="cote">${s.cote}<small>étiquette au dos du livre</small></div>` : ''}<div class="cap"><b>${s.nom}</b>${s.texte}</div>`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await b.newPage({ viewport: { width: 1280, height: 720 } });
for (const [k, clip] of Object.entries(map)) {
  const s = scenes[k]; if (!s) throw new Error(`scène inconnue : ${k}`);
  const png = `${OUT}/tmp/${k}.png`;
  await pg.setContent(html(s)); await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: png, omitBackground: true });
  const input = path.join(CLIPS, `${clip}.mp4`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-i', png, '-filter_complex', '[0:v]scale=1280:720[v];[v][1:v]overlay=0:0,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-c:a', 'aac', '-b:a', '80k', '-movflags', '+faststart', `${OUT}/videos/${k}.mp4`]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '0.5', '-i', `${OUT}/videos/${k}.mp4`, '-frames:v', '1', '-q:v', '4', `${OUT}/images/${k}.jpg`]);
}
await b.close();
console.log('vidéos', Object.keys(map).length);
