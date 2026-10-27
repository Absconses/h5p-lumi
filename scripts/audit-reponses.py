# Audit des « tells » de longueur : la bonne réponse est-elle nettement la plus longue ?
# Couvre MultiChoice (QCM, y compris dans Question Set, Column, Book, Course Presentation…),
# Single Choice Set et Summary (la première réponse de chaque série est la bonne).
# usage : python3 scripts/audit-reponses.py paquet.h5p content.json …   (FULL=1 : textes entiers)
# Ligne « LONGUE » = la bonne réponse est la plus longue ET dépasse de plus de 25 % la moyenne des
# fausses. Objectif avant livraison : 0 ligne LONGUE (sauf séries d'étiquettes courtes réutilisées
# à l'identique d'une question à l'autre, où la longueur ne trahit rien).
import json, re, sys, zipfile
def txt(s): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()
rows = []
def walk(o, where):
    if isinstance(o, dict):
        lib = o.get('library', ''); lib = lib if isinstance(lib, str) else ''
        p = o.get('params', o)
        if lib.startswith('H5P.MultiChoice') and 'answers' in p:
            a = [(txt(x.get('text')), x.get('correct')) for x in p['answers']]
            rows.append((where, 'QCM', txt(p.get('question'))[:60], a))
        if lib.startswith('H5P.SingleChoiceSet'):
            for c in p.get('choices', []):
                rows.append((where, 'SCS', txt(c.get('question'))[:60], [(txt(x), i == 0) for i, x in enumerate(c.get('answers', []))]))
        if lib.startswith('H5P.Summary'):
            for c in p.get('summaries', []):
                rows.append((where, 'SUM', '', [(txt(x), i == 0) for i, x in enumerate(c.get('summary', []))]))
        for k, v in o.items(): walk(v, where)
    elif isinstance(o, list):
        for v in o: walk(v, where)
for f in sys.argv[1:]:
    if f.endswith('.h5p'):
        z = zipfile.ZipFile(f); d = json.loads(z.read('content/content.json'))
        h = json.loads(z.read('h5p.json')); d = {'library': h['mainLibrary'] + ' x', 'params': d}
    else: d = json.load(open(f))
    walk(d, f.split('/')[-1])
FULL = bool(__import__("os").environ.get("FULL"))
bad = 0
for w, t, q, a in rows:
    good = [len(x) for x, c in a if c]; other = [len(x) for x, c in a if not c]
    if not good or not other: continue
    longest = max(good) >= max(other); ratio = max(good) / (sum(other) / len(other))
    flag = 'LONGUE' if longest and ratio > 1.25 else ''
    bad += bool(flag)
    print(f"{flag:6} {ratio:4.1f} {w[:22]:22} {t} {q} | " + ' / '.join(('*' if c else '') + (x if FULL else x[:50]) for x, c in a))
print('total', len(rows), 'biaisées', bad)
