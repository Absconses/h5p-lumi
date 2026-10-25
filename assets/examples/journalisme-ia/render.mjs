// usage: node render.mjs <dir_extrait> <prefix> [largeur]
import http from 'http'; import fs from 'fs'; import path from 'path';
import { chromium } from 'playwright-core';
const [dir, out, W = '1000'] = process.argv.slice(2);
const root = path.resolve('.');
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="/node_modules/h5p-standalone/dist/main.bundle.js"></script></head>
<body style="margin:0"><div id="h5p" style="width:${W}px"></div><script>
new H5PStandalone.H5P(document.getElementById('h5p'),{h5pJsonPath:'/pkg',frameJs:'/node_modules/h5p-standalone/dist/frame.bundle.js',frameCss:'/node_modules/h5p-standalone/dist/styles/h5p.css'});
</script></body></html>`;
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.end(html); return; }
  const f = u.startsWith('/pkg') ? path.join(dir, u.slice(4)) : path.join(root, u);
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; res.end(); return; }
    const ext = path.extname(f); res.setHeader('Content-Type', {'.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'}[ext] || 'application/octet-stream'); res.end(d); });
}).listen(8812);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: +W, height: 900 } });
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto('http://localhost:8812/'); await p.waitForTimeout(4000);
const fr = p.frames().find(f => f !== p.mainFrame());
const shot = async (name) => {
  const h = await fr.evaluate(() => document.body.scrollHeight);
  const ifr = await p.$('iframe'); await ifr.evaluate((n, hh) => n.style.height = hh + 'px', h);
  await p.setViewportSize({ width: +W, height: Math.min(h + 20, 4000) }); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}-${name}.png`, fullPage: true });
};
await shot('cover');
await (await fr.$('.h5p-interactive-book-cover-readbutton')).click(); await p.waitForTimeout(2500);
for (let i = 0; i < 6; i++) {
  await p.waitForTimeout(1500);
  await shot(`ch${i + 1}`);
  // diapos de la CP du chapitre
  const cps = await fr.$$('.h5p-course-presentation');
  for (const c of cps) {
    if (!(await c.isVisible())) continue;
    const n = await c.$$eval('.h5p-slide', s => s.length);
    for (let k = 0; k < n; k++) {
      await c.screenshot({ path: `${out}-ch${i + 1}-s${k + 1}.png` });
      if (k < n - 1) { await c.evaluate(e => e.querySelector('.h5p-footer-next-slide').click()); await p.waitForTimeout(900); }
    }
  }
  const ok = await fr.evaluate(() => { const b = document.querySelector('.h5p-interactive-book-status-arrow.next'); if (!b) return false; b.click(); return true; });
  if (!ok) break;
}
await b.close(); srv.close();
