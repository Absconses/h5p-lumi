#!/usr/bin/env python3
"""Corrige les 5 modules « hors livre » récupérés de Lumi et les remet en .h5p
usage: python3 -I fix_modules.py <runs_dir> <out_dir>"""
import json, os, re, sys, zipfile
runs, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

def load(name):
    return json.load(open(f'{runs}/{name}/content/content.json', encoding='utf-8'))

def pack(name, content, title):
    d = f'{runs}/{name}'
    h = json.load(open(f'{d}/h5p.json', encoding='utf-8'))
    h['title'] = title; h['language'] = 'fr'
    path = f'{out}/{name}.h5p'
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('h5p.json', json.dumps(h, ensure_ascii=False))
        z.writestr('content/content.json', json.dumps(content, ensure_ascii=False))
        for root, _, files in os.walk(d):
            for f in files:
                rel = os.path.relpath(os.path.join(root, f), d)
                if rel in ('h5p.json', 'content/content.json'): continue
                z.write(os.path.join(root, f), rel)
    print(f'{path}: {os.path.getsize(path)//1024} Ko')

# 1. Questionnaire d'entrée : on le garde tel quel (il marche bien), titre propre.
pack('quiz-rapport-wikipedia', load('quiz-rapport-wikipedia'), 'Et toi, Wikipédia ?')

# 2. Ordre des images : interface en français, consigne et légendes courtes.
c = load('ordre-histoire-savoir')
c['taskDescription'] = 'Range les images de la plus ancienne à la plus récente.'
c['altTaskDescription'] = 'Range les images de la plus ancienne à la plus récente.'
short = {
    "L'invention de l'écriture cunéiforme en Mésopotamie.": "L'écriture en Mésopotamie",
    "La Bibliothèque d'Alexandrie, l'un des plus grands centres de savoir de l'Antiquité, atteint son apogée.": "La bibliothèque d'Alexandrie",
    "L'invention de l'imprimerie par Gutenberg.": "L'imprimerie de Gutenberg",
    "L'Encyclopédie de Diderot et D’Alembert": "L'Encyclopédie",
    "Invention d'internet": "Internet",
    "Invention du Web": "Le Web",
    "Les 1er moteurs de recherche": "Les moteurs de recherche",
    "Lancement de Wikipédia": "Wikipédia",
}
for s in c['sequenceImages']:
    s['imageDescription'] = short.get(s['imageDescription'], s['imageDescription'])
c['l10n'].update({'totalMoves': 'Déplacements', 'timeSpent': 'Temps', 'score': 'Tu as @score points sur @total',
                  'checkAnswer': 'Vérifier', 'tryAgain': 'Recommencer', 'showSolution': 'Voir la solution',
                  'resume': 'Reprendre', 'audioNotSupported': 'Son indisponible',
                  'ariaPlay': 'Écouter le son de cette image', 'ariaMoveDescription': '@cardDesc déplacé de la place @posSrc à la place @posDes',
                  'ariaCardDesc': 'image à ranger'})
pack('ordre-histoire-savoir', c, 'Range les grandes étapes du savoir')

# 3. Édition collaborative : les numéros donnaient la réponse ; la phrase 8 est une conclusion, pas une étape.
c = load('edition-collaborative')
steps = [
    ("Création de l'article", "Quelqu'un crée l'article « Pain au chocolat » avec ce qu'il sait."),
    ("Ajout d'histoire", "Une autre personne ajoute l'origine autrichienne de la viennoiserie, avec des sources."),
    ("Le mot « chocolatine »", "Quelqu'un ajoute que, dans certaines régions, on dit « chocolatine »."),
    ("Débat", "Sur la page de discussion, on se demande comment présenter les deux noms."),
    ("Proposition de fusion", "Quelqu'un propose de réunir les articles « Pain au chocolat » et « Chocolatine »."),
    ("Accord", "Après discussion, tout le monde se met d'accord : une partie de l'article explique les noms régionaux, avec des sources."),
    ("Protection", "Comme certains modifient l'article sans arrêt, un administrateur le protège pour un temps."),
]
c['paragraphs'] = [f'<p><strong>{t}</strong> : {d}</p>' for t, d in steps]
c['taskDescription'] = ("<p>Voici la vie de l'article Wikipédia « Pain au chocolat ». "
                        "Remets les étapes dans l'ordre, de la première à la dernière.</p>"
                        "<p>Utilise les flèches ou fais glisser les cartes.</p>")
c['overallFeedback'] = [{'from': 0, 'to': 99, 'feedback': "Relis : on commence toujours par créer l'article, et la protection arrive en dernier."},
                        {'from': 100, 'to': 100, 'feedback': "Bravo ! Un article Wikipédia s'améliore pas à pas, grâce à beaucoup de personnes qui discutent et citent leurs sources."}]
pack('edition-collaborative', c, "La vie d'un article Wikipédia")

# 4. Zones à trouver sur l'interface : consigne plus claire, retour manquant.
c = load('interface-wikipedia')
q = c['imageMultipleHotspotQuestion']
q['backgroundImageSettings']['questionTitle'] = "Les parties d'un article Wikipédia"
fb = ['Le sommaire : il donne le plan de l\'article.', 'La page de discussion : on y débat des modifications.',
      "L'infobox : un résumé des informations clés.", 'Les références : les sources de l\'article.',
      "L'historique : toutes les modifications, avec leur date et leur auteur."]
for h, t in zip(q['hotspotSettings']['hotspot'], fb):
    h['userSettings']['feedbackText'] = t
q['hotspotSettings']['taskDescription'] = ("Clique sur les 5 parties de cet article : le sommaire, la page de discussion, "
                                           "l'infobox, les références et l'historique.")
q['hotspotSettings']['hotspotName'] = "parties de l'article"
pack('interface-wikipedia', c, "Se repérer dans un article Wikipédia")

# 5. Mots croisés : faute dans « Vérifiabilité », définitions raccourcies.
c = load('mots-croises-wikipedia')
clues = {
    'Wikipédien': 'Personne qui participe à Wikipédia',
    'Neutralité': 'Règle : présenter tous les points de vue sans donner son avis',
    'Vérificabilité': "Règle : chaque information doit pouvoir être vérifiée dans une source",
    'Contributeur': 'Personne qui écrit ou modifie des articles',
    'Patrouilleur': 'Bénévole qui surveille les modifications pour repérer le vandalisme',
    'Donateur': "Personne qui donne de l'argent pour faire vivre Wikipédia",
    'Encyclopédie': 'Ouvrage qui rassemble les connaissances, classées par thèmes ou par ordre alphabétique',
    'Vandalisme': "Modification faite exprès pour abîmer un article",
}
for w in c['words']:
    w['clue'] = clues.get(w['answer'], w['clue'])
    if w['answer'] == 'Vérificabilité': w['answer'] = 'Vérifiabilité'
c['taskDescription'] = '<p>Retrouve les mots importants de la séance.</p>'
pack('mots-croises-wikipedia', c, 'Les mots de Wikipédia')
