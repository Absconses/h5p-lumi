// Paramètres par défaut d'une bibliothèque H5P, en français : semantics.json + language/fr.json.
// Un groupe à un seul champ est « déplié » (H5P stocke directement la valeur du champ).
import fs from 'fs';
import crypto from 'crypto';
export const guid = () => crypto.randomUUID();

const build = (fields, fr = []) => {
  const o = {};
  fields.forEach((f, i) => {
    const t = fr[i] || {};
    const v = val(f, t);
    if (v !== undefined) o[f.name] = v;
  });
  return o;
};
const val = (f, t) => {
  if (f.type === 'group') {
    const g = build(f.fields, t.fields || []);
    return f.fields.length === 1 ? g[f.fields[0].name] : g;
  }
  if (f.type === 'list') return [];
  if (f.type === 'library' || f.type === 'image' || f.type === 'audio' || f.type === 'video' || f.type === 'file') return undefined;
  const d = t.default !== undefined ? t.default : f.default;
  return d;
};

export const defaults = (libDir) => {
  const sem = JSON.parse(fs.readFileSync(`${libDir}/semantics.json`, 'utf8'));
  let fr = [];
  try { fr = JSON.parse(fs.readFileSync(`${libDir}/language/fr.json`, 'utf8')).semantics; } catch (e) {}
  return build(sem, fr);
};

// fusion profonde : les objets se fusionnent, le reste (tableaux compris) remplace
export const merge = (a, b) => {
  if (b === undefined) return a;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const o = { ...a };
    for (const k of Object.keys(b)) o[k] = merge(a[k], b[k]);
    return o;
  }
  return b;
};

export const sub = (library, params, contentType, title) =>
  ({ library, params, subContentId: guid(), metadata: { contentType, license: 'U', title } });

// lib('H5P.Blanks 1.14', dossier_bibliothèques, {…}) → sous-contenu complet
export const lib = (library, libsDir, params, contentType, title) => {
  const [n, v] = library.split(' ');
  return sub(library, merge(defaults(`${libsDir}/${n}-${v}`), params), contentType, title);
};

export const img = (path, w, h, copyright = { license: 'U' }) =>
  ({ path, mime: path.endsWith('.png') ? 'image/png' : 'image/jpeg', copyright, width: w, height: h });
