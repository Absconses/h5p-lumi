// Teste Find the Words : glisse sur chaque mot de la grille, compte les mots trouvés.
// usage : node ftwtest.mjs <dossier_h5p_extrait> <largeur>
import http from 'http'; import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const require = createRequire(path.resolve('../v/x.js'));
const { chromium } = require('playwright-core');
const [dir, W] = process.argv.slice(2); const V = path.resolve('../v');
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="/node_modules/h5p-standalone/dist/main.bundle.js"></script></head>
<body style="margin:0"><div id="h5p" style="width:${W}px"></div><script>
new H5PStandalone.H5P(document.getElementById('h5p'),{h5pJsonPath:'/pkg',frameJs:'/node_modules/h5p-standalone/dist/frame.bundle.js',frameCss:'/node_modules/h5p-standalone/dist/styles/h5p.css'});
</script></body></html>`;
const srv = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.end(html); return; }
  const f = u.startsWith('/pkg') ? path.join(dir, u.slice(4)) : path.join(V, u);
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; res.end(); return; } if (f.endsWith('.js')) res.setHeader('Content-Type', 'text/javascript'); res.end(d); });
}).listen(8834);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: +W + 20, height: 1200 } });
await p.goto('http://localhost:8834/'); await p.waitForTimeout(5000);
const fr = p.frames().find((x) => x !== p.mainFrame());
const ifr = await p.$('iframe'); const ib = await ifr.boundingBox();
const info = await fr.evaluate(() => { const i = H5P.instances[0]; const g = i.grid; const c = document.querySelector('#drawing-canvas').getBoundingClientRect();
  return { es: g.elementSize, top: c.top, left: c.left, grid: g.wordGrid, words: i.vocabulary.words || null }; });
console.log('elementSize', info.es, 'canvas top', info.top);
const G = info.grid; const R = G.length, C = G[0].length;
const words = ['source','depeche','chapo','legende','credit','rumeur','radio','podcast','antenne','journal'];
const dirs = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
let tried = 0;
for (const w of words) { let done = false;
  for (let r = 0; r < R && !done; r++) for (let c = 0; c < C && !done; c++) for (const [dr, dc] of dirs) {
    let ok = true; for (let k = 0; k < w.length; k++) { const rr = r + dr*k, cc = c + dc*k; if (rr<0||cc<0||rr>=R||cc>=C||G[rr][cc]!==w[k]) { ok=false; break; } }
    if (!ok) continue; done = true; tried++;
    const pt = (rr, cc) => [ib.x + info.left + cc*info.es + info.es/2, ib.y + info.top + rr*info.es + info.es/2];
    const [x1,y1] = pt(r,c), [x2,y2] = pt(r+dr*(w.length-1), c+dc*(w.length-1));
    await p.mouse.move(x1,y1); await p.mouse.down(); await p.mouse.move(x2,y2,{steps:8}); await p.mouse.up(); await p.waitForTimeout(150); break; }
}
const found = await fr.evaluate(() => H5P.instances[0].vocabulary.getFound().length);
console.log('mots glissés', tried, 'trouvés', found);
await p.screenshot({ path: '/tmp/claude-0/ftw/shot.png' });
await b.close(); srv.close();
