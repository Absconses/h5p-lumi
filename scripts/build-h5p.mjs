#!/usr/bin/env node
/* =====================================================================
 *  build-h5p.mjs — portage Node de Build-H5PPackage.ps1 (Linux/macOS/CI)
 *
 *  Assemble un .h5p à partir d'un GABARIT + d'un content.json :
 *    1. extrait le gabarit, vide content/ ;
 *    2. écrit content.json (UTF-8 sans BOM) + médias (-> content/images/)
 *       et audios (-> content/audios/) ;
 *    3. met à jour h5p.json : titre, langue 'fr', et déclare dans
 *       preloadedDependencies TOUTES les bibliothèques utilisées par le
 *       contenu (+ leur closure via les library.json) — sinon
 *       « Unable to find constructor » et composite vide ;
 *    4. refuse d'empaqueter si une bibliothèque utilisée est absente du
 *       gabarit (au lieu de produire un paquet qui plante dans Lumi) ;
 *    5. re-zippe (séparateurs '/').
 *
 *  Nécessite les commandes `unzip` et `zip`.
 *
 *  node build-h5p.mjs --template gabarit.h5p --content content.json \
 *       --out sortie.h5p [--title "Titre"] [--media a.jpg b.png] [--audio x.wav]
 * ===================================================================== */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const args = { media: [], audio: [] };
for (let i = 2, key = null; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) { key = a.slice(2); if (!(key in args)) args[key] = true; continue; }
  if (Array.isArray(args[key])) args[key].push(a); else args[key] = a;
}
for (const k of ['template', 'content', 'out']) {
  if (typeof args[k] !== 'string') { console.error(`Argument manquant : --${k}`); process.exit(1); }
}
const title = typeof args.title === 'string' ? args.title : path.basename(args.out, '.h5p');

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'h5pbuild_'));
try {
  execFileSync('unzip', ['-q', path.resolve(args.template), '-d', work]);
  const manifestPath = path.join(work, 'h5p.json');
  if (!fs.existsSync(manifestPath)) throw new Error('Gabarit invalide : h5p.json absent.');

  const contentDir = path.join(work, 'content');
  fs.rmSync(contentDir, { recursive: true, force: true });
  fs.mkdirSync(contentDir, { recursive: true });
  const raw = fs.readFileSync(args.content, 'utf8').replace(/^﻿/, '');
  const content = JSON.parse(raw);
  fs.writeFileSync(path.join(contentDir, 'content.json'), raw, 'utf8');

  const copyInto = (files, sub) => {
    if (!files.length) return;
    const dir = path.join(contentDir, sub);
    fs.mkdirSync(dir, { recursive: true });
    for (const f of files) fs.copyFileSync(f, path.join(dir, path.basename(f)));
  };
  copyInto(args.media, 'images');
  copyInto(args.audio, 'audios');

  // Chaque fichier référencé par le contenu doit exister dans le paquet
  const missingFiles = [];
  const walkPaths = (n) => {
    if (Array.isArray(n)) return n.forEach(walkPaths);
    if (n && typeof n === 'object') {
      if (typeof n.path === 'string' && /^(images|audios|videos|files)\//.test(n.path) &&
          !fs.existsSync(path.join(contentDir, n.path))) missingFiles.push(n.path);
      Object.values(n).forEach(walkPaths);
    }
  };
  walkPaths(content);
  if (missingFiles.length) throw new Error('Médias référencés mais non fournis : ' + [...new Set(missingFiles)].join(', '));

  // Bibliothèques utilisées + closure
  const used = new Set();
  const walkLibs = (n) => {
    if (Array.isArray(n)) return n.forEach(walkLibs);
    if (n && typeof n === 'object') {
      if (typeof n.library === 'string' && /^\S+ \d+\.\d+$/.test(n.library)) used.add(n.library);
      Object.values(n).forEach(walkLibs);
    }
  };
  walkLibs(content);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const key = (d) => `${d.machineName} ${d.majorVersion}.${d.minorVersion}`;
  const folder = (k) => { const [m, v] = k.split(' '); return path.join(work, `${m}-${v}`); };

  const missingLibs = [...used].filter(k => !fs.existsSync(folder(k)));
  if (missingLibs.length) throw new Error('Bibliothèques absentes du gabarit (greffer avec Graft-H5PLibraries.ps1) : ' + missingLibs.join(', '));

  const closure = new Set();
  const queue = [...used];
  while (queue.length) {
    const cur = queue.shift();
    if (closure.has(cur)) continue;
    closure.add(cur);
    const lj = path.join(folder(cur), 'library.json');
    if (fs.existsSync(lj)) {
      for (const d of JSON.parse(fs.readFileSync(lj, 'utf8')).preloadedDependencies || []) {
        if (d.machineName) queue.push(key(d));
      }
    }
  }

  const deps = (manifest.preloadedDependencies || []).filter(d => d.machineName);
  const have = new Set(deps.map(key));
  let added = 0;
  for (const k of closure) {
    if (have.has(k) || !fs.existsSync(folder(k))) continue;
    const [m, v] = k.split(' ');
    const [maj, min] = v.split('.').map(Number);
    deps.push({ machineName: m, majorVersion: maj, minorVersion: min });
    have.add(k); added++;
  }
  manifest.preloadedDependencies = deps;
  manifest.title = title;
  manifest.extraTitle = title;
  manifest.language = 'fr';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');

  const out = path.resolve(args.out);
  fs.rmSync(out, { force: true });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync('zip', ['-q', '-r', '-X', '-D', out, '.'], { cwd: work });

  const ko = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`OK : ${out} (${ko} Ko) — ${used.size} bibliothèques utilisées, ${deps.length} déclarées (+${added}).`);
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
