// Joue tout le scénario : à chaque question, d'abord chaque mauvais choix (vérifie le blocage), puis le bon.
import http from 'http'; import fs from 'fs'; import path from 'path';
import { chromium } from 'playwright-core';
const [dir, out] = process.argv.slice(2);
const C = JSON.parse(fs.readFileSync(path.join(dir, 'content/content.json'), 'utf8')).branchingScenario.content;
const strip = (s) => (s || '').replace(/<[^>]+>/g, '').trim();
const root = path.resolve('.');
const html = `<!doctype html><html><head><meta charset="utf-8"><script src="/node_modules/h5p-standalone/dist/main.bundle.js"></script></head>
<body style="margin:0;background:#fff"><div id="h5p" style="width:1000px"></div><script>
new H5PStandalone.H5P(document.getElementById('h5p'),{h5pJsonPath:'/pkg',frameJs:'/node_modules/h5p-standalone/dist/frame.bundle.js',frameCss:'/node_modules/h5p-standalone/dist/styles/h5p.css'});
</script></body></html>`;
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.end(html); return; }
  const f = u.startsWith('/pkg') ? path.join(dir, u.slice(4)) : path.join(root, u);
  fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; res.end(); return; }
    const ext = path.extname(f); res.setHeader('Content-Type', { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' }[ext] || 'application/octet-stream'); res.end(d); });
}).listen(8767);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1000, height: 760 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
p.on('response', (r) => r.status() >= 400 && !r.url().includes('favicon') && errs.push('404 ' + r.url()));
await p.goto('http://localhost:8767/'); await p.waitForTimeout(4000);
const fr = p.frames().find((f) => f !== p.mainFrame()) || p.mainFrame();
let shot = 0; const snap = async (tag) => { await p.waitForTimeout(900); await p.screenshot({ path: `${out}-${String(shot++).padStart(2, '0')}-${tag}.png` }); };
const SHOTS = Number(process.env.SHOTS || 12);
await snap('start');
await fr.click('.h5p-start-button');
const done = new Set(); const order = ['Sam', 'Lina', 'Noé']; let friend = 0; const log = []; let wrongTested = 0;
const qText = async () => strip(await fr.locator('.h5p-branching-question-title:visible, .h5p-branching-question .h5p-question-title:visible').first().innerText().catch(() => ''));
for (let step = 0; step < 400; step++) {
  await p.waitForTimeout(1100);
  const fbBtn = fr.locator('.h5p-branching-scenario-feedback-dialog button:visible').first();
  if (await fbBtn.count()) { await fbBtn.click(); continue; }
  const alts = fr.locator('.h5p-branching-question-alternative:visible');
  if (await alts.count()) {
    const texts = (await alts.allInnerTexts()).map((t) => t.trim());
    const node = C.find((n) => n.type.library.startsWith('H5P.BranchingQuestion') && n.type.params.branchingQuestion.alternatives.every((a, i) => strip(a.text) === texts[i]) && (texts[0].startsWith('Sam') ? (n.type.params.branchingQuestion.alternatives.length === texts.length) : true));
    if (!node) { log.push('question inconnue : ' + texts.join(' / ')); await snap('inconnu'); break; }
    const id = C.indexOf(node); const A = node.type.params.branchingQuestion.alternatives;
    if (texts[0].startsWith('Sam')) { // carrefour
      if (friend < 3) { log.push('ami : ' + order[friend]); await alts.nth(friend++).click(); continue; }
      if (texts.length < 4) { log.push('pas de sortie au carrefour'); break; }
      await snap('carrefour'); await alts.nth(3).click(); log.push('sortie'); continue;
    }
    const wrong = A.map((a, i) => i).filter((i) => A[i].nextContentId === id && !done.has(id + ':' + i));
    if (wrong.length) {
      const i = wrong[0]; done.add(id + ':' + i);
      if (shot < SHOTS) await snap('question');
      await alts.nth(i).click(); await p.waitForTimeout(1100);
      const fb = strip(await fr.locator('.h5p-branching-scenario').innerText());
      if (!fb.includes('Mauvaise piste')) { log.push(`PAS DE BLOCAGE q${id} alt${i} : ${fb.slice(0, 80)}`); await snap('pb'); }
      else wrongTested++;
      if (shot < SHOTS) await snap('mauvais');
      continue;
    }
    const replay = A.findIndex((a) => strip(a.text) === 'Revoir la scène');
    if (replay >= 0 && !done.has(id + ':r')) { done.add(id + ':r'); await alts.nth(replay).click(); log.push(`revoir q${id}`); continue; }
    const ok = A.findIndex((a) => a.nextContentId !== id && strip(a.text) !== 'Revoir la scène');
    await alts.nth(ok).click(); await p.waitForTimeout(1100);
    const fb = strip(await fr.locator('.h5p-branching-scenario').innerText());
    if (!fb.includes('Bonne piste')) { log.push(`pas de retour positif q${id}`); }
    if (shot < SHOTS) await snap('bon');
    continue;
  }
  const end = fr.locator('.h5p-end-button:visible');
  if (await end.count()) { await snap('fin'); log.push('écran de fin'); break; }
  const next = fr.locator('.h5p-proceed-button:visible, .h5p-feedback-button:visible, button.h5p-joubelui-button:visible').first();
  if (await next.count()) { if (shot < 5) await snap('scene'); await next.click(); continue; }
  log.push('bloqué'); await snap('bloque'); console.log((await fr.locator('body').innerHTML()).slice(0, 3000)); break;
}
console.log(log.join('\n')); console.log('mauvais choix bloqués :', wrongTested); console.log(JSON.stringify(errs.slice(0, 10)));
await b.close(); srv.close();
