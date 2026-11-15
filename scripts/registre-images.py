#!/usr/bin/env python3
"""Registre des images utilisées dans un ensemble de modules H5P : repère les images reprises
d'un module à l'autre (même fichier, ou même crédit) pour qu'une image ne serve qu'une fois.

  python registre-images.py <dossier des modules>                 liste les doublons (code 1 s'il y en a)
  python registre-images.py <dossier des modules> --ecrire        écrit images-utilisees.json dans ce dossier
  python registre-images.py <dossier des modules> --verifier f.jpg  dit si ce fichier est déjà utilisé

Un « module » est un sous-dossier contenant content/content.json (un .h5p décompressé).
"""
import sys, os, re, json, glob, hashlib, html, collections

CREDIT = re.compile(r'Wikimedia|Flickr|Openverse|Unsplash|Pexels|Pixabay|CC BY|CC0|domaine public', re.I)

def texte(s):
    s = re.sub(r'<[^>]+>', ' ', s or '')
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def cle_credit(s):
    return re.sub(r'\W+', ' ', s.lower()).strip()[:90]

def empreinte(chemin):
    return hashlib.sha256(open(chemin, 'rb').read()).hexdigest()

def credits(o, trouves):
    """Relève les légendes de crédit (textes courts citant une banque ou une licence)."""
    if isinstance(o, dict):
        t = o.get('text')
        if isinstance(t, str):
            s = texte(t)
            if 0 < len(s) < 200 and CREDIT.search(s):
                trouves.add(s)
        for v in o.values():
            credits(v, trouves)
    elif isinstance(o, list):
        for v in o:
            credits(v, trouves)

def releve(racine):
    fichiers = collections.defaultdict(list)   # empreinte -> [(module, fichier)]
    par_credit = collections.defaultdict(lambda: {'credit': '', 'modules': set()})
    modules = sorted(d for d in os.listdir(racine) if os.path.isfile(os.path.join(racine, d, 'content', 'content.json')))
    for m in modules:
        base = os.path.join(racine, m, 'content')
        for f in sorted(glob.glob(os.path.join(base, 'images', '*'))):
            if os.path.isfile(f):
                fichiers[empreinte(f)].append((m, os.path.basename(f)))
        vus = set()
        try:
            credits(json.load(open(os.path.join(base, 'content.json'), encoding='utf-8')), vus)
        except (ValueError, OSError) as e:
            print(f"! {m} : content.json illisible ({e})", file=sys.stderr)
        for c in vus:
            k = cle_credit(c)
            par_credit[k]['credit'] = c
            par_credit[k]['modules'].add(m)
    return modules, fichiers, par_credit

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__); return 2
    racine = args[0]
    ecrire = '--ecrire' in sys.argv
    verifier = sys.argv[sys.argv.index('--verifier') + 1] if '--verifier' in sys.argv else None
    if verifier and verifier in args:
        args.remove(verifier)
    modules, fichiers, par_credit = releve(racine)

    if verifier:
        e = empreinte(verifier)
        if e in fichiers:
            print(f"DÉJÀ UTILISÉE : {os.path.basename(verifier)} est dans " + ', '.join(f"{m} ({f})" for m, f in fichiers[e]))
            return 1
        print(f"Libre : {os.path.basename(verifier)} n'est dans aucun module.")
        return 0

    dup_fichiers = {e: v for e, v in fichiers.items() if len({m for m, _ in v}) > 1}
    dup_credits = {k: v for k, v in par_credit.items() if len(v['modules']) > 1}
    print(f"{len(modules)} modules, {sum(len(v) for v in fichiers.values())} fichiers image, {len(par_credit)} crédits distincts.")
    if dup_fichiers:
        print(f"\nFichiers identiques dans plusieurs modules : {len(dup_fichiers)}")
        for v in sorted(dup_fichiers.values(), key=lambda v: -len(v)):
            print(f"  {v[0][1]} : " + ', '.join(sorted({m for m, _ in v})))
    if dup_credits:
        print(f"\nCrédits repris dans plusieurs modules : {len(dup_credits)}")
        for v in sorted(dup_credits.values(), key=lambda v: -len(v['modules'])):
            print(f"  {v['credit'][:80]} : " + ', '.join(sorted(v['modules'])))
    if not dup_fichiers and not dup_credits:
        print("Aucune image reprise d'un module à l'autre.")

    if ecrire:
        registre = {
            'fichiers': [{'sha256': e, 'usages': [{'module': m, 'fichier': f} for m, f in v]} for e, v in sorted(fichiers.items(), key=lambda x: x[1][0])],
            'credits': [{'credit': v['credit'], 'modules': sorted(v['modules'])} for _, v in sorted(par_credit.items())],
        }
        cible = os.path.join(racine, 'images-utilisees.json')
        json.dump(registre, open(cible, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(f"\nRegistre écrit : {cible}")
    return 1 if (dup_fichiers or dup_credits) else 0

if __name__ == '__main__':
    sys.exit(main())
