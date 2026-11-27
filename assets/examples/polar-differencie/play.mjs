// Joue un chemin du scénario dans h5p-standalone et photographie chaque écran.
// usage (depuis un dossier qui contient node_modules/h5p-standalone) :
//   node play.mjs <paquet extrait> <préfixe captures> "choix 1|choix 2|…"     (W=420 : largeur téléphone)
import http from 'http'; import fs from 'fs'; import path from 'path';
import { chromium } from 'playwright-core';
const [dir, out, choicesArg = ''] = process.argv.slice(2);
const choices = choicesArg.split('|').filter(Boolean);
const root = path.resolve('.'); const W = Number(process.env.W || 1000);
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="/node_modules/h5p-standalone/dist/main.bundle.js"></script></head>
<body style="margin:0;background:#fff"><div id="h5p" style="width:${W}px"></div><script>
new H5PStandalone.H5P(document.getElementById('h5p'),{h5pJsonPath:'/pkg',frameJs:'/node_modules/h5p-standalone/dist/frame.bundle.js',frameCss:'/node_modules/h5p-standalone/dist/styles/h5p.css'});
</script></body></html>`;
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.end(html); return; }
  const f = u.startsWith('/pkg') ? path.join(dir, u.slice(4)) : path.join(root, u);
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; res.end(); return; }
    const ext = path.extname(f); res.setHeader('Content-Type', { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' }[ext] || 'application/octet-stream'); res.end(d); });
}).listen(8770);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: W, height: 800 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
p.on('response', (r) => r.status() >= 400 && !r.url().includes('favicon') && errs.push('404 ' + r.url()));
await p.goto('http://localhost:8770/'); await p.waitForTimeout(4000);
const fr = p.frames().find((f) => f !== p.mainFrame()) || p.mainFrame();
let shot = 0; const snap = async (t) => { await p.waitForTimeout(900); await p.screenshot({ path: `${out}-${String(shot++).padStart(2, '0')}-${t}.png`, fullPage: true }); };
await snap('start'); await fr.click('.h5p-start-button');
let ci = 0; const log = [];
for (let step = 0; step < 120; step++) {
  await p.waitForTimeout(1100);
  const fb = fr.locator('.h5p-branching-scenario-feedback-dialog:visible, .h5p-feedback-dialog:visible').first();
  if (await fb.count()) { await snap('retour'); log.push('retour : ' + (await fb.innerText()).replace(/\s+/g, ' ').slice(0, 90)); await fb.locator('button').first().click(); continue; }
  const alts = fr.locator('.h5p-branching-question-alternative:visible');
  if (await alts.count()) {
    if (ci >= choices.length) { await snap('stop'); log.push('fin des choix'); break; }
    await snap('question');
    const target = alts.filter({ hasText: choices[ci] });
    if (!(await target.count())) { log.push(`choix introuvable : ${choices[ci]}`); break; }
    log.push(`choix : ${choices[ci]}`); ci++; await target.first().click(); continue;
  }
  const end = fr.locator('.h5p-end-button:visible');
  if (await end.count()) { await snap('fin'); log.push('écran de fin'); break; }
  const ta = fr.locator('textarea:visible');
  if (await ta.count()) await ta.first().fill('Un polar, c’est quand quelqu’un mène une enquête pour trouver qui a fait un vol ou un crime.');
  const hs = fr.locator('.h5p-image-hotspot:visible');
  if (await hs.count() && !process.env.NOHS) { await hs.first().click(); await snap('hotspot'); await fr.locator('.h5p-image-hotspot-close-popup-button:visible').first().click().catch(() => {}); }
  const cpNext = fr.locator('.h5p-footer-next-slide:visible');
  if (await cpNext.count() && !(await fr.locator('textarea:visible').count())) { await cpNext.first().click(); await snap('diapo2'); }
  const next = fr.locator('.h5p-proceed-button:visible').first();
  if (await next.count()) { await snap('noeud'); await next.click(); continue; }
  log.push('bloqué'); await snap('bloque'); break;
}
console.log(log.join('\n')); console.log('erreurs', JSON.stringify(errs.slice(0, 10)));
await b.close(); srv.close();
