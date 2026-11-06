// usage: node render.mjs <dir_extrait> <out_prefix> [nSteps]
import http from 'http'; import fs from 'fs'; import path from 'path';
import { chromium } from 'playwright-core';
const [dir, out, nSteps = '3'] = process.argv.slice(2);
const root = path.resolve('.');
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="/node_modules/h5p-standalone/dist/main.bundle.js"></script></head>
<body style="margin:0;background:#fff"><div id="h5p" style="width:1000px"></div><script>
new H5PStandalone.H5P(document.getElementById('h5p'),{h5pJsonPath:'/pkg',frameJs:'/node_modules/h5p-standalone/dist/frame.bundle.js',frameCss:'/node_modules/h5p-standalone/dist/styles/h5p.css'}).then(()=>window.done=1).catch(e=>window.err=String(e));
</script></body></html>`;
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.end(html); return; }
  const f = u.startsWith('/pkg') ? path.join(dir, u.slice(4)) : path.join(root, u);
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; res.end(); return; }
    const ext = path.extname(f); res.setHeader('Content-Type', {'.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'}[ext] || 'application/octet-stream'); res.end(d); });
}).listen(8765);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
p.on('response', r => r.status() >= 400 && errs.push('404 ' + r.url()));
await p.goto('http://localhost:8765/');
await p.waitForTimeout(4000);
const fr = p.frames().find(f => f !== p.mainFrame()) || p.mainFrame();
for (let i = 0; i < +nSteps; i++) {
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `${out}-${String(i).padStart(2,'0')}.png` });
  const n = await fr.$('.h5p-impress-nav-button.next'); if (n) await n.click(); else break;
}
console.log(JSON.stringify(errs.slice(0, 20), null, 1));
await b.close(); srv.close();
