const { chromium } = require('playwright');
(async () => {
  const dir = process.argv[2];
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: dir + '/rec', size: { width: 1280, height: 720 } } });
  const p = await ctx.newPage();
  await p.goto('file://' + dir + '/feed.html'); await p.waitForTimeout(1500);
  const t0 = Date.now(); await p.evaluate(() => window.start());
  await p.waitForTimeout(44000);
  console.log('lead', (t0 - 0));
  await ctx.close(); await b.close();
})();
