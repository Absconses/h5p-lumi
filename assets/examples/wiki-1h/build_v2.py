#!/usr/bin/env python3
"""Wikipédia en 1 heure — v2 (6e).
Repart du livre de Pierre (params réels clonés), réécrit les textes pour des 6e,
remet en natif ce qui peut l'être et garde en iframe les types refusés par la Column.
usage: python3 -I build_v2.py <livre_extrait> <out_dir_extrait> <base_url_partage>"""
import json, copy, uuid, sys, os, re, shutil

src, out, BASE = sys.argv[1], sys.argv[2], sys.argv[3].rstrip('/')
PLAYER = 'https://h5p-offline-player.vercel.app/embed?src='
old = json.load(open(f'{src}/content/content.json', encoding='utf-8'))

def find(lib, n=0):
    k = 0
    for ch in old['chapters']:
        for x in ch['params']['content']:
            if x['content']['library'].startswith(lib):
                if k == n: return copy.deepcopy(x['content'])
                k += 1
    raise KeyError(lib)

def sid(): return str(uuid.uuid4())

def item(library, params, title, ctype):
    return {'content': {'library': library, 'params': params, 'subContentId': sid(),
                        'metadata': {'contentType': ctype, 'license': 'U', 'title': title}},
            'useSeparator': 'auto'}

def reuse(content, title, **patch):
    content['params'].update(patch)
    content['subContentId'] = sid()
    content['metadata'] = {'contentType': content['metadata'].get('contentType', ''), 'license': 'U', 'title': title}
    return {'content': content, 'useSeparator': 'auto'}

def text(html, title='Texte'):
    return item('H5P.AdvancedText 1.1', {'text': html}, title, 'Text')

def resolve(path):
    """Les images ont pu changer d'extension (allègement) : retrouve le fichier réel."""
    stem = os.path.splitext(path)[0]
    for ext in ('.jpg', '.jpeg', '.png'):
        if os.path.exists(f'{src}/content/{stem}{ext}'): return stem + ext
    raise FileNotFoundError(path)

def image(path, alt, w, h, title='Image', decorative=False):
    from PIL import Image as PI
    path = resolve(path); w, h = PI.open(f'{src}/content/{path}').size
    mime = 'image/jpeg' if path.endswith(('.jpg', '.jpeg')) else 'image/png'
    return item('H5P.Image 1.1', {'decorative': decorative, 'contentName': 'Image', 'expandImage': "Agrandir l'image",
                                  'minimizeImage': "Réduire l'image", 'alt': alt,
                                  'file': {'path': path, 'mime': mime, 'copyright': {'license': 'U'}, 'width': w, 'height': h}},
                title, 'Image')

def iframe(url, w, h, title):
    """Cadre : la hauteur = largeur x h/w (pas de défilement interne), largeur mini 280 px."""
    return item('H5P.IFrameEmbed 1.0', {'source': url, 'width': str(w), 'height': str(h), 'minWidth': '280',
                                        'resizeSupported': True}, title, 'Iframe Embedder')

def module(file, w, h, title, consigne):
    url = PLAYER + f'{BASE}/{file}'
    return [text(f'<p><strong>{consigne}</strong></p>', 'Consigne'),
            iframe(url, w, h, title),
            text(f'<p style="font-size:0.9em">Le cadre est trop petit ? '
                 f'<a href="{url}" target="_blank" rel="noopener">Ouvrir l\'activité en grand</a> '
                 f'(cette activité n\'est pas comptée dans ton score).</p>', 'Lien')]

def chapter(title, items):
    return {'library': 'H5P.Column 1.18', 'subContentId': sid(),
            'params': {'content': items},
            'metadata': {'contentType': 'Column', 'license': 'U', 'title': title}}

def mc(question, answers, title, fb_ok='', fb_ko=''):
    """answers = [(texte, correct, retour si choisie)]"""
    c = find('H5P.MultiChoice')
    p = c['params']
    p['question'] = f'<p>{question}</p>'
    p['answers'] = [{'text': f'<div>{t}</div>', 'correct': ok,
                     'tipsAndFeedback': {'tip': '', 'chosenFeedback': f'<div>{fb}</div>' if fb else '', 'notChosenFeedback': ''}}
                    for t, ok, fb in answers]
    p['overallFeedback'] = [{'from': 0, 'to': 99, 'feedback': fb_ko}, {'from': 100, 'to': 100, 'feedback': fb_ok}]
    p['behaviour']['type'] = 'auto'
    return reuse(c, title)

def truefalse(question, correct, fb_ok, fb_ko, n):
    c = find('H5P.TrueFalse', n)
    c['params']['question'] = f'<p>{question}</p>'
    c['params']['correct'] = 'true' if correct else 'false'
    c['params']['l10n']['wrongAnswerMessage'] = fb_ko
    c['params']['l10n']['correctAnswerMessage'] = fb_ok
    return reuse(c, question[:60])

def dragtext(task, lines, title):
    c = find('H5P.DragText')
    c['params']['taskDescription'] = f'<p>{task}</p>'
    c['params']['textField'] = '\n'.join(lines)
    c['params']['overallFeedback'] = [{'from': 0, 'to': 100}]
    c['params']['behaviour'].update({'instantFeedback': False, 'enableRetry': True, 'enableSolutionsButton': True})
    return reuse(c, title)

def scs(questions, title):
    """SingleChoiceSet : la 1re réponse est la bonne (le type mélange)."""
    l10n = {'nextButtonLabel': 'Question suivante', 'showSolutionButtonLabel': 'Voir la solution',
            'retryButtonLabel': 'Recommencer', 'solutionViewTitle': 'Solution', 'correctText': 'Bravo !',
            'incorrectText': 'Raté !', 'shouldSelect': 'Il fallait choisir cette réponse',
            'shouldNotSelect': 'Il ne fallait pas choisir cette réponse', 'muteButtonLabel': 'Couper le son',
            'closeButtonLabel': 'Fermer', 'slideOfTotal': 'Question :num sur :total',
            'scoreBarLabel': 'Tu as :num points sur :total', 'solutionListQuestionNumber': 'Question :num',
            'a11yShowSolution': 'Voir la solution.', 'a11yRetry': 'Recommencer l\'exercice.'}
    p = {'choices': [{'question': f'<p>{q}</p>', 'answers': [f'<p>{a}</p>' for a in ans], 'subContentId': sid()}
                     for q, ans in questions],
         'overallFeedback': [{'from': 0, 'to': 100}],
         'behaviour': {'autoContinue': True, 'timeoutCorrect': 2000, 'timeoutWrong': 3000, 'soundEffectsEnabled': False,
                       'enableRetry': True, 'enableSolutionsButton': True, 'passPercentage': 100},
         'l10n': l10n}
    return item('H5P.SingleChoiceSet 1.11', p, title, 'Single Choice Set')

def banner(path, alt):
    return image(path, alt, 1600, 1000, 'Bandeau')

IMG = 'images/'
ch = []

# --- 0. Mise en route --------------------------------------------------------------------------
ch.append(chapter('Et toi, Wikipédia ?', [
    text('<p>Dans ce livre, tu vas apprendre :</p><ul>'
         '<li>d\'où vient l\'idée de rassembler tout le savoir ;</li>'
         '<li>comment Wikipédia fonctionne et qui l\'écrit ;</li>'
         '<li>comment lire un article Wikipédia avec un regard critique.</li></ul>'
         '<p>Pour commencer, réponds à ce petit questionnaire. Il n\'y a pas de bonne ou de mauvaise réponse.</p>',
         'Objectifs'),
    *module('quiz-rapport-wikipedia.h5p', 1000, 1200, 'Questionnaire : et toi, Wikipédia ?',
            'Quel lecteur de Wikipédia es-tu ?'),
]))

# --- Partie 1 -----------------------------------------------------------------------------------
tl = find('H5P.Timeline')
tp = tl['params']['timeline']
tp['headline'] = 'Du premier écrit à Wikipédia'
for d in tp['date']:
    h = d['headline']
    if h.startswith('Chute'): d['startDate'] = '476'; d['headline'] = "Chute de l'Empire romain d'Occident"
    if h.startswith('Révolution'): d['headline'] = 'Révolution française'
    if h.startswith('Découverte'): d['headline'] = "Christophe Colomb arrive en Amérique"
    if h.startswith('Lancement'): d['startDate'] = '2001'; d['headline'] = 'Lancement de Wikipédia'
    if h.startswith('Avènement'): d['headline'] = 'Naissance d\'Internet'
tp['language'] = 'fr'
ch.append(chapter('1. Rassembler tout le savoir : un très vieux rêve', [
    banner(IMG + 'file-SMK7Tmoa.jpg', 'Partie 1 : Wikipédia à travers l\'histoire du projet encyclopédique'),
    text('<p>Depuis l\'invention de l\'écriture, les humains essaient de <strong>garder</strong> et de <strong>partager</strong> '
         'leurs connaissances. Wikipédia est la dernière étape de cette longue histoire.</p>'
         '<p>Fais défiler la frise : clique sur les flèches ou sur les dates.</p>', 'Introduction'),
    reuse(tl, 'Frise : du premier écrit à Wikipédia'),
    *module('ordre-histoire-savoir.h5p', 1000, 950, 'Range les grandes étapes du savoir',
            'Sans regarder la frise, range ces images de la plus ancienne à la plus récente.'),
]))

ch.append(chapter("2. L'Encyclopédie de Diderot (1751)", [
    text('<p>En 1751, Diderot et d\'Alembert publient l\'<em>Encyclopédie</em>. Voici le début de l\'article '
         '« Encyclopédie », écrit en français du XVIII<sup>e</sup> siècle (le « f » se lit « s »).</p>', 'Introduction'),
    image(IMG + 'file-qp-3a5j3dCe7ylUN-ddMgxZN3.jpg',
          "Extrait de l'Encyclopédie : « ENCYCLOPÉDIE. Ce mot signifie enchaînement de connaissances ; il est composé "
          "de la préposition grecque en, et des substantifs kyklos, cercle, et paideia, connaissance. En effet, le but "
          "d'une Encyclopédie est de rassembler les connaissances éparses sur la surface de la terre ; d'en exposer le "
          "système général aux hommes avec qui nous vivons, et de le transmettre aux hommes qui viendront après nous ; "
          "afin que les travaux des siècles passés n'aient pas été des travaux inutiles pour les siècles qui succéderont ; "
          "que nos neveux, devenant plus instruits, deviennent en même temps plus vertueux et plus heureux, et que nous "
          "ne mourions pas sans avoir bien mérité du genre humain. »", 1600, 1000, "Extrait de l'Encyclopédie"),
    text('<p><strong>En français d\'aujourd\'hui :</strong> « encyclopédie » vient du grec et veut dire '
         '« le cercle des connaissances ». Le but est de <strong>rassembler</strong> les savoirs du monde entier, de les '
         '<strong>expliquer</strong> à tous et de les <strong>transmettre</strong> aux générations futures, pour que les '
         'gens soient plus instruits, meilleurs et plus heureux.</p>', 'Traduction'),
    mc('Pourquoi le mot « encyclopédie » parle-t-il d\'un « cercle » ?', [
        ('Parce que les connaissances sont reliées entre elles', True, 'Oui : comme dans un cercle, chaque savoir est relié aux autres.'),
        ('Parce que les savants travaillaient autour d\'une table ronde', False, 'Non, le texte parle des connaissances, pas des savants.'),
        ('Parce que les livres étaient rangés en cercle', False, 'Non, il ne s\'agit pas du rangement des livres.'),
        ('Parce que les connaissances tournent en rond', False, 'Non : « tourner en rond » voudrait dire ne pas avancer.'),
    ], 'Le cercle des connaissances'),
    mc('D\'après le texte, à quoi sert l\'Encyclopédie ?', [
        ('À partager le savoir avec tous pour rendre les gens meilleurs', True,
         'Oui : « que nos neveux, devenant plus instruits, deviennent en même temps plus vertueux et plus heureux ».'),
        ('À garder les découvertes secrètes', False, 'Au contraire : il s\'agit de transmettre.'),
        ('À impressionner les puissants', False, 'Le texte parle des « hommes avec qui nous vivons », c\'est-à-dire de tout le monde.'),
        ('À réunir les savoirs utiles à l\'armée', False, 'Le texte parle des connaissances de toute la terre.'),
    ], "Le but de l'Encyclopédie"),
]))

iv = find('H5P.InteractiveVideo')
iv['params']['interactiveVideo']['video']['startScreenOptions']['title'] = 'Wikipédia, une histoire rapide'
for it in iv['params']['interactiveVideo']['assets']['interactions']:
    for a in it['action']['params'].get('answers', []):
        a['text'] = a['text'].replace(' .', '.')
ch.append(chapter('3. 2001 : Wikipédia est née', [
    text('<p>Regarde la vidéo. Elle s\'arrête deux fois pour te poser une question.</p>', 'Consigne'),
    reuse(iv, 'Vidéo : la naissance de Wikipédia'),
]))

ch.append(chapter('4. Dictionnaire, encyclopédie ou Wikipédia ?', [
    dragtext('Fais glisser le bon mot dans chaque phrase.', [
        'Le *dictionnaire* donne la définition des mots.',
        'Le *dictionnaire* donne des exemples pour utiliser un mot dans une phrase.',
        "L'*encyclopédie* explique des sujets, des idées, des événements.",
        "L'*encyclopédie* papier est écrite par des spécialistes et vérifiée avant d'être publiée.",
        '*Wikipédia* peut être modifiée par n\'importe qui.',
        '*Wikipédia* change tout le temps : elle est mise à jour très vite.',
    ], 'Dictionnaire, encyclopédie ou Wikipédia'),
]))

# --- Partie 2 -----------------------------------------------------------------------------------
hs = find('H5P.ImageHotspots')
hs['params']['hotspotNumberLabel'] = 'Pilier #num'
hs['params']['containsAudioVideoLabel'] = 'Contient du son ou de la vidéo'
first = hs['params']['hotspots'][0]['content'][0]['params']
first['text'] = first['text'].replace('Ces 4 règles sont la base', 'Les 4 autres piliers sont la base')
for h in hs['params']['hotspots']:
    for cc in h['content']:
        cc['params']['text'] = cc['params']['text'].replace('"', '').replace('.L', '. L').replace(').C', '). C')
tfs = [
    ('Wikipédia cherche à présenter les informations de façon neutre.', True,
     'Oui, c\'est le pilier « point de vue neutre ».', 'Relis le pilier « point de vue neutre ».'),
    ('Tout le monde peut améliorer Wikipédia.', True,
     'Oui : le contenu est libre, chacun peut le modifier.', 'Relis le pilier « contenu libre ».'),
    ('Dans un article, on peut donner son avis personnel.', False,
     'Exact : pas d\'avis personnel, on décrit les faits.', 'Non : un article reste neutre, sans avis personnel.'),
    ('Il faut payer pour lire Wikipédia.', False,
     'Exact : Wikipédia est gratuite, elle vit grâce aux dons.', 'Non : Wikipédia est gratuite.'),
]
ch.append(chapter('5. Les 5 piliers de Wikipédia', [
    banner(IMG + 'file-pHniHLwFCSM3zGbx-GJ6CfGbp.jpg', 'Partie 2 : Wikipédia de l\'intérieur, comprendre son fonctionnement'),
    text('<p>Wikipédia repose sur <strong>5 grandes règles</strong>, appelées « piliers ». '
         'Clique sur chaque bouton <strong>ⓘ</strong> de l\'image pour lire l\'explication.</p>', 'Consigne'),
    reuse(hs, 'Les 5 piliers'),
    text('<p><strong>Vrai ou faux ?</strong></p>', 'Titre'),
    *[truefalse(q, ok, a, b, i) for i, (q, ok, a, b) in enumerate(tfs)],
]))

ch.append(chapter('6. Un article, beaucoup d\'auteurs', [
    text('<p>Sur Wikipédia, un article n\'est jamais écrit par une seule personne. '
         'Les auteurs discutent, se corrigent et citent leurs sources : c\'est l\'<strong>écriture collaborative</strong>.</p>',
         'Introduction'),
    *module('edition-collaborative.h5p', 1000, 1700, "La vie d'un article Wikipédia",
            'Remets dans l\'ordre la vie de l\'article « Pain au chocolat ».'),
]))

mtw = find('H5P.MarkTheWords')
mtw['params']['taskDescription'] = '<p>Clique sur les <strong>5 mots</strong> qui donnent un avis (ils ne sont pas neutres).</p>'
mtw['params']['textField'] = mtw['params']['textField'].replace(' .', '.')
ch.append(chapter('7. Règle n° 1 : rester neutre', [
    text('<p>Un article Wikipédia <strong>décrit les faits</strong>. Il ne dit pas si c\'est bien ou mal, beau ou laid. '
         'Quand un sujet fait débat, il présente <strong>les différents points de vue</strong>.</p>', 'Explication'),
    reuse(mtw, 'Repère les mots qui ne sont pas neutres'),
]))

sl = find('H5P.ImageSlider')
panels = [
    "Case 1. Philip Roth découvre une erreur sur Wikipédia : l'origine de son roman La Tache est attribuée à un faux "
    "événement. Il s'écrie : « Mais c'est faux ! C'est moi l'auteur, je sais ce qui m'a inspiré ! »",
    "Case 2. Roth essaie de corriger l'erreur en modifiant lui-même l'article. Il écrit : « Le roman est inspiré par un "
    "événement vrai. »",
    "Case 3. Wikipédia refuse sa modification. Un robot Wikipédia lui demande : « Un auteur n'est pas une source de "
    "confiance sur lui-même ? »",
    "Case 4. Fâché, Roth publie une lettre ouverte dans le journal The New Yorker : « Je suis l'unique source fiable sur "
    "l'origine de La Tache ! »",
    "Case 5. Grâce à cet article de journal, Wikipédia accepte de corriger. Le robot : « Voilà ce qu'il me fallait : un "
    "article de journal pour pouvoir sourcer l'information. » Roth : « Il fallait donc que je passe par The New Yorker "
    "pour être cru. »",
]
for s, alt in zip(sl['params']['imageSlides'], panels):
    img = s['params']['image']['params']
    img['alt'] = alt
sl['params']['a11y'] = {'nextSlide': 'Case suivante', 'prevSlide': 'Case précédente', 'gotoSlide': 'Aller à la case %slide'}
ch.append(chapter('8. Règle n° 2 : pas d\'avis personnel, même pour un auteur célèbre', [
    text('<p>Sur Wikipédia, on ne peut pas écrire ce qu\'on sait « de soi-même ». Il faut une <strong>source publiée</strong> '
         '(un livre, un journal…). Même un écrivain célèbre doit respecter cette règle !</p>'
         '<p>Lis la BD avec les flèches.</p>', 'Explication'),
    reuse(sl, "L'affaire Philip Roth (BD)"),
    mc('Pourquoi Wikipédia a-t-elle d\'abord refusé la correction de Philip Roth ?', [
        ('Parce qu\'il fallait une source publiée par quelqu\'un d\'autre', True,
         'Oui : sa parole ne suffisait pas, il fallait une source publiée, comme un article de journal.'),
        ('Parce que seuls les administrateurs peuvent modifier un article', False,
         'Non : tout le monde peut modifier un article.'),
        ('Parce que Wikipédia refuse de corriger les erreurs', False,
         'Non : à la fin, l\'erreur est corrigée.'),
        ('Parce que Philip Roth n\'avait pas de compte Wikipédia', False,
         'Non : on peut modifier sans compte. Le problème était l\'absence de source.'),
    ], 'Pourquoi ce refus ?'),
]))

bl = find('H5P.Blanks')
bl['params']['text'] = '<p>Complète avec les mots : <strong>vérité, vérifiabilité, source</strong>.</p>'
bl['params']['questions'] = [
    '<p>Dans une encyclopédie papier, des spécialistes contrôlent tout avant de publier : on cherche la *vérité*.</p>',
    '<p>Sur Wikipédia, chaque information doit s\'appuyer sur une *source* que tout le monde peut consulter.</p>',
    '<p>Cette règle s\'appelle la *vérifiabilité*.</p>',
]
bl['params']['behaviour']['caseSensitive'] = False
ch.append(chapter('9. Règle n° 3 : tout doit être vérifiable', [
    text('<p>Wikipédia ne demande pas « est-ce que c\'est vrai ? » mais « <strong>où est-ce écrit ?</strong> ». '
         'Chaque information doit venir d\'une <strong>source fiable</strong> que chacun peut vérifier.</p>', 'Explication'),
    reuse(bl, 'Vérité ou vérifiabilité'),
    text('<p><strong>Source acceptée ou refusée ?</strong> Pour chaque source, dis si Wikipédia l\'accepte comme référence.</p>',
         'Consigne'),
    scs([
        ('Un article du journal <em>Le Monde</em>', ['Acceptée', 'Refusée']),
        ('Une discussion sur un forum', ['Refusée', 'Acceptée']),
        ('Un livre écrit par un universitaire', ['Acceptée', 'Refusée']),
        ('Une vidéo YouTube sans auteur connu', ['Refusée', 'Acceptée']),
        ('Une revue scientifique reconnue', ['Acceptée', 'Refusée']),
    ], 'Source acceptée ou refusée ?'),
]))

dc = find('H5P.Dialogcards')
dc['params']['title'] = '<p>Les rôles sur Wikipédia</p>'
dc['params']['description'] = '<p>Clique sur « Retourner » pour découvrir le rôle de chacun.</p>'
ch.append(chapter('10. Qui veille sur Wikipédia ?', [
    text('<p>Une encyclopédie papier est vérifiée <strong>avant</strong> d\'être publiée. '
         'Wikipédia est publiée tout de suite, puis vérifiée <strong>après</strong> par des milliers de bénévoles.</p>',
         'Explication'),
    dragtext('Fais glisser : « avant » ou « après » ?', [
        'Dans une encyclopédie papier, les spécialistes vérifient le texte *avant* la publication.',
        'Sur Wikipédia, les bénévoles vérifient les modifications *après* la publication.',
        'Sur Wikipédia, on peut corriger une erreur *après* sa publication, à tout moment.',
    ], 'Avant ou après ?'),
    text('<p><strong>Vidéo :</strong> comment Wikipédia lutte contre la désinformation (Wikimédia France, « A Wiki Minute »).</p>', 'Titre'),
    iframe('https://ladigitale.dev/digiview/#/v/6813cb1c810f4', 1600, 900, 'Vidéo : la lutte contre la désinformation'),
    reuse(dc, 'Les rôles sur Wikipédia'),
]))

# --- Partie 3 -----------------------------------------------------------------------------------
ch.append(chapter('11. Se repérer dans un article', [
    banner(IMG + 'file-iIZOmtiAQvYIVH-8-A5FAEd7W.jpg', "Partie 3 : se repérer dans l'interface de Wikipédia"),
    text('<p><strong>Vidéo :</strong> qu\'est-ce qui rend un article Wikipédia unique ? (« A Wiki Minute »)</p>', 'Titre'),
    iframe('https://ladigitale.dev/digiview/#/v/67fe651055701', 1600, 900, 'Vidéo : un article Wikipédia'),
    *module('interface-wikipedia.h5p', 1000, 1400, "Se repérer dans un article Wikipédia",
            'Trouve les 5 parties d\'un article.'),
]))

# --- Bilan --------------------------------------------------------------------------------------
es = find('H5P.Essay')
es['params']['taskDescription'] = ('<p>Explique Wikipédia à un camarade en quelques phrases. Donne :</p>'
                                   '<ul><li>un <strong>avantage</strong> ;</li><li>un <strong>inconvénient</strong> ;</li>'
                                   '<li>un <strong>conseil</strong> pour bien l\'utiliser.</li></ul>')
es['params']['placeholderText'] = 'Wikipédia, c\'est…'
kw = lambda k, alts: {'keyword': k, 'alternatives': alts, 'options': {'points': 1, 'occurrences': 1, 'caseSensitive': False,
      'forgiveMistakes': True, 'feedbackIncluded': '', 'feedbackMissed': '', 'feedbackIncludedWord': 'keyword',
      'feedbackMissedWord': 'none'}}
es['params']['keywords'] = [kw('avantage', ['avantages', 'point fort']),
                            kw('inconvénient', ['inconvenient', 'inconvénients', 'défaut', 'risque']),
                            kw('source', ['sources', 'vérifier', 'vérifie', 'comparer', 'compare'])]
es['params']['solution']['sample'] = es['params']['solution']['sample'].replace('Conseil :', 'Un conseil :')
ch.append(chapter('12. Explique Wikipédia à un camarade', [reuse(es, 'Explique Wikipédia')]))

ch.append(chapter('13. Les mots à retenir', [
    *module('mots-croises-wikipedia.h5p', 1000, 1000, 'Mots croisés : les mots de Wikipédia',
            'Remplis la grille avec les mots de la séance.'),
]))

new = copy.deepcopy(old)
new['chapters'] = ch
new['bookCover']['coverDescription'] = ('<p style="text-align:center">Comment fonctionne Wikipédia ? Qui l\'écrit ? '
                                        'Peut-on lui faire confiance ?</p>')
cover = new['bookCover']['coverMedium']['params']

cover['alt'] = 'Un élève montre le logo de Wikipédia, entouré de livres et de documents'

# chemins d'images : extension réelle + nettoyage des images inutilisées
js = json.dumps(new, ensure_ascii=False)
js = re.sub(r'images/[^"]+', lambda m: resolve(m.group(0)), js)
js = re.sub(r'"path": "(images/[^"]+\.jpg)", "mime": "image/png"', r'"path": "\1", "mime": "image/jpeg"', js)
new = json.loads(js)
if os.path.exists(out): shutil.rmtree(out)
shutil.copytree(src, out)
used = set(re.findall(r'(?:images|videos)/[^"]+', js))
for sub in ('images', 'videos'):
    for f in os.listdir(f'{out}/content/{sub}'):
        if f'{sub}/{f}' not in used: os.remove(f'{out}/content/{sub}/{f}')
json.dump(new, open(f'{out}/content/content.json', 'w', encoding='utf-8'), ensure_ascii=False)
h = json.load(open(f'{out}/h5p.json', encoding='utf-8'))
h['title'] = h['extraTitle'] = 'Wikipédia en 1 heure'
h['language'] = 'fr'
json.dump(h, open(f'{out}/h5p.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(f'{len(ch)} pages')

# dépendances : toutes les bibliothèques utilisées dans le contenu + leur fermeture
def closure(libs):
    seen, todo = {}, list(libs)
    while todo:
        n, v = todo.pop()
        key = f'{n}-{v}'
        if key in seen or not os.path.isdir(f'{out}/{key}'): continue
        j = json.load(open(f'{out}/{key}/library.json', encoding='utf-8'))
        seen[key] = j
        for d in j.get('preloadedDependencies', []):
            todo.append((d['machineName'], f"{d['majorVersion']}.{d['minorVersion']}"))
    return seen
used_libs = set(tuple(x.split(' ')) for x in re.findall(r'"library": "([\w.]+ \d+\.\d+)"', json.dumps(new)))
used_libs.add(('H5P.InteractiveBook', '1.11'))
libs = closure(used_libs)
h['preloadedDependencies'] = [{'machineName': j['machineName'], 'majorVersion': j['majorVersion'],
                               'minorVersion': j['minorVersion']} for j in libs.values()]
json.dump(h, open(f'{out}/h5p.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(libs), 'bibliothèques déclarées')
