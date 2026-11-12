# Construit partage/decouvrir-le-cdi/mur-dewey.h5p (Information Wall, H5P.InfoWall) à partir du
# paquet boite-outils.h5p de la vitrine EMI 2 : on garde ses bibliothèques, on remplace le contenu.
# Usage : python3 -I mur-dewey.py <boite-outils.h5p> <sortie.h5p>
import json, sys, zipfile

SRC, OUT = sys.argv[1], sys.argv[2]
D = [
    ('000', 'Généralités', 'ordinateurs, informatique, internet, programmer, jeux vidéo (création), encyclopédies, records, journaux, médias, bibliothèques'),
    ('100', 'Philosophie et psychologie', 'grandes questions, bonheur, liberté, émotions, peur, colère, amitié, rêves, la vie, la mort'),
    ('200', 'Religions et mythologie', 'religions du monde, dieux grecs, dieux égyptiens, mythologie, Bible, Coran, fêtes religieuses'),
    ('300', 'Société', 'droits de l’enfant, harcèlement, argent, métiers, école, politique, justice, police, écologie, pollution, environnement, fêtes et traditions'),
    ('400', 'Langues', 'langue française, grammaire, orthographe, anglais, espagnol, allemand, alphabets, apprendre une langue'),
    ('500', 'Sciences', 'mathématiques, espace, planètes, étoiles, astronomie, physique, chimie, Terre, volcans, météo, dinosaures, animaux sauvages, insectes, plantes, océans'),
    ('600', 'Techniques', 'corps humain, santé, médecine, cuisine, recettes, bricolage, inventions, robots, voitures, avions, trains, animaux de compagnie, chats, chiens, chevaux, jardinage'),
    ('700', 'Arts, loisirs et sports', 'dessin, peinture, manga (apprendre à dessiner), photographie, musique, cinéma, danse, sports, football, basket, judo, jeux, échecs, magie'),
    ('800', 'Littérature', 'poésie, théâtre, histoire de la littérature, écrivains'),
    ('900', 'Histoire et géographie', 'histoire, Égypte ancienne, Moyen Âge, chevaliers, châteaux forts, guerres mondiales, pays, voyages, cartes, atlas, biographies'),
]
content = {'infoWall': {
    'header': 'Le mur des 10 domaines Dewey',
    'propertiesGroup': {'properties': [
        {'label': 'Domaine', 'showLabel': False, 'searchInProperty': True, 'styling': {'bold': True, 'italic': False}},
        {'label': 'On y trouve', 'showLabel': True, 'searchInProperty': True, 'styling': {'bold': False, 'italic': False}},
    ]},
    'panels': [{'panelTitle': f'{n} {t}', 'entries': [f'{n} · {t}', ex]} for n, t, ex in D],
    'behaviour': {'useFallbackImage': False, 'imageWidth': 150, 'imageHeight': 150, 'alternateBackground': True, 'offerFilterField': True, 'modeFilterField': 'or'},
    'l10n': {'noEntriesError': 'Aucun domaine.', 'noMatchesForFilter': 'Aucun domaine ne parle de « @query ». Essaie un mot plus simple (foot, chat, espace…).',
             'enterToFilter': 'Tape un sujet qui te plaît (foot, chat, volcan, dessin…)', 'listChanged': 'Liste modifiée : @visible domaines sur @total.'},
}}
with zipfile.ZipFile(SRC) as zin, zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zout:
    for it in zin.infolist():
        n = it.filename
        if n.startswith('content/') and n != 'content/content.json':
            continue  # pas d'images de la boîte à outils
        data = zin.read(n)
        if n == 'content/content.json':
            data = json.dumps(content, ensure_ascii=False).encode()
        elif n == 'h5p.json':
            h = json.loads(data); h['title'] = 'Le mur des domaines Dewey'; data = json.dumps(h, ensure_ascii=False).encode()
        zout.writestr(it, data)
print('OK', OUT)
