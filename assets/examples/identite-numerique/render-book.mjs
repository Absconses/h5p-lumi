// usage: node render-book.mjs <dir_extrait> <prefix> [pages]
import http from 'http'; import fs from 'fs'; import path from 'path';
import { chromium } from 'playwright-core';
const [dir, out, pages = '9'] = process.argv.slice(2);
const root = path.resolve('.');
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="/node_modules/h5p-standalone/dist/main.bundle.js"></script></head>
<body style="margin:0"><div id="h5p" style="width:1000px"></div><script>
new H5PStandalone.H5P(document.getElementById('h5p'),{h5pJsonPath:'/pkg',frameJs:'/node_modules/h5p-standalone/dist/frame.bundle.js',frameCss:'/node_modules/h5p-standalone/dist/styles/h5p.css'});
</script></body></html>`;
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.end(html); return; }
  const f = u.startsWith('/pkg') ? path.join(dir, u.slice(4)) : path.join(root, u);
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; res.end(); return; }
    const ext = path.extname(f); res.setHeader('Content-Type', {'.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'}[ext] || 'application/octet-stream'); res.end(d); });
}).listen(8811);
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy, args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 1000, height: 900 }, ignoreHTTPSErrors: true });
const p = await ctx.newPage();
await p.goto('http://localhost:8811/'); await p.waitForTimeout(5000);
const fr = p.frames().find(f => f !== p.mainFrame());
const read = await fr.$('.h5p-interactive-book-cover-readbutton'); if (read) await read.click();
for (let i = 0; i < +pages; i++) {
  await p.waitForTimeout(16000);
  // clic « Open with its own scripts » dans les cadres du player
  for (const f of p.frames()) {
    try { const btn = f.getByRole('button', { name: /own scripts/i }).first(); if (await btn.count()) { await btn.click({ timeout: 2000 }); console.log('page', i, ': clic own scripts'); await p.waitForTimeout(9000); } } catch (e) {}
  }
  const h = await fr.evaluate(() => document.body.scrollHeight);
  const ifr = await p.$('iframe'); await ifr.evaluate((n, hh) => n.style.height = hh + 'px', h);
  await p.setViewportSize({ width: 1000, height: Math.min(h + 20, 3800) });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}-${i}.png`, fullPage: true });
  const frames = p.frames().map(f => f.url()).filter(u => u.includes('vercel')).length;
  console.log('page', i, 'hauteur', h, 'cadres player', frames);
  const n = await fr.$('.h5p-interactive-book-status-arrow.next button, .h5p-interactive-book-status-arrow.next');
  if (!n) break; await n.click();
}
await b.close(); srv.close();
