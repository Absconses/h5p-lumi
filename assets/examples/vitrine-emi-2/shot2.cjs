// Capture d'une page HTML + positions (en %) des éléments à id, pour placer des zones H5P.
// usage : node shot2.cjs page.html largeur sortie.jpg [sélecteur]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [f, w, out, sel] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1.2 });
  await p.setViewportSize({ width: +w, height: 400 }); await p.goto('file://' + require('path').resolve(f)); await p.waitForTimeout(500);
  const el = sel ? await p.$(sel) : null;
  await (el || p).screenshot({ path: out, fullPage: !el, type: 'jpeg', quality: 88 });
  const box = await p.evaluate((sel) => {
    const root = (sel ? document.querySelector(sel) : document.body).getBoundingClientRect();
    const W = root.width, H = sel ? root.height : document.body.scrollHeight;
    const o = { W, H };
    document.querySelectorAll('[id]').forEach((e) => { const r = e.getBoundingClientRect();
      o[e.id] = { x: +((r.x - root.x) / W * 100).toFixed(1), y: +((r.y - root.y) / H * 100).toFixed(1), w: +(r.width / W * 100).toFixed(1), h: +(r.height / H * 100).toFixed(1) }; });
    return o; }, sel);
  fs.writeFileSync(out.replace(/\.jpg$/, '.json'), JSON.stringify(box, null, 1));
  await b.close();
})();
