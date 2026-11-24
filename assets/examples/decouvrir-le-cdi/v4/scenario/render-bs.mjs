// Joue un chemin du Branching Scenario : node render-bs.mjs <dir_extrait> <out_prefix> "<texte choix 1>|<texte choix 2>|…"
import http from 'http'; import fs from 'fs'; import path from 'path';
import { chromium } from 'playwright-core';
const [dir, out, choicesArg = ''] = process.argv.slice(2);
const choices = choicesArg.split('|').filter(Boolean);
const root = path.resolve('.');
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="/node_modules/h5p-standalone/dist/main.bundle.js"></script></head>
<body style="margin:0;background:#fff"><div id="h5p" style="width:1000px"></div><script>
new H5PStandalone.H5P(document.getElementById('h5p'),{h5pJsonPath:'/pkg',frameJs:'/node_modules/h5p-standalone/dist/frame.bundle.js',frameCss:'/node_modules/h5p-standalone/dist/styles/h5p.css'}).then(()=>window.done=1).catch(e=>window.err=String(e));
</script></body></html>`;
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.end(html); return; }
  const f = u.startsWith('/pkg') ? path.join(dir, u.slice(4)) : path.join(root, u);
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; res.end(); return; }
    const ext = path.extname(f); res.setHeader('Content-Type', { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' }[ext] || 'application/octet-stream'); res.end(d); });
}).listen(8766);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1000, height: 760 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
p.on('response', (r) => r.status() >= 400 && !r.url().includes('favicon') && errs.push('404 ' + r.url()));
await p.goto('http://localhost:8766/');
await p.waitForTimeout(4000);
const fr = p.frames().find((f) => f !== p.mainFrame()) || p.mainFrame();
let shot = 0; const snap = async () => { await p.waitForTimeout(1200); await p.screenshot({ path: `${out}-${String(shot++).padStart(2, '0')}.png` }); };
await snap();
await fr.click('.h5p-start-button');
let ci = 0; const log = [];
for (let step = 0; step < 60; step++) {
  await p.waitForTimeout(1300);
  const alts = fr.locator('.h5p-branching-question-alternative:visible');
  const nAlt = await alts.count();
  if (nAlt) {
    if (ci >= choices.length) { await snap(); log.push('fin des choix'); break; }
    if (ci < 3) await snap();
    const target = alts.filter({ hasText: choices[ci] });
    if (!(await target.count())) { log.push(`choix introuvable : ${choices[ci]}`); await snap(); break; }
    log.push(`choix : ${choices[ci]}`); ci++;
    await target.first().click();
    continue;
  }
  const end = fr.locator('.h5p-end-button:visible');
  if (await end.count()) { await snap(); log.push('écran de fin'); break; }
  const next = fr.locator('.h5p-proceed-button:visible').first();
  if (await next.count()) { if (step < 4) await snap(); await next.click(); continue; }
  log.push('bloqué'); await snap(); break;
}
console.log(log.join('\n')); console.log(JSON.stringify(errs.slice(0, 10)));
await b.close(); srv.close();
