const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1.5 });
  for (const [f, w] of process.argv.slice(2).map((x) => x.split(':'))) {
    await p.setViewportSize({ width: +w, height: 400 }); await p.goto('file://' + f); await p.waitForTimeout(300);
    await p.screenshot({ path: f.replace('.html', '.png'), fullPage: true }); }
  await b.close(); })();
