# Dessine la 4e de couverture inventée « Cap sur Kepler » (Je découvre, étape 6)
# et écrit quatrieme.json : positions (%) des mots-indices pour les hotspots.
import json, random
from PIL import Image, ImageDraw, ImageFont
W, H = 1200, 820
F = '/usr/share/fonts/truetype/dejavu/'
serif = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', 40)
serifB = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf', 40)
titre = ImageFont.truetype(F + 'DejaVuSans-Bold.ttf', 30)
petit = ImageFont.truetype(F + 'DejaVuSans.ttf', 20)
im = Image.new('RGB', (W, H), '#e9e2d0')
d = ImageDraw.Draw(im)
# le livre (dos) : panneau bleu nuit étoilé
X0, Y0, X1, Y1 = 90, 40, W - 90, H - 40
d.rounded_rectangle((X0 + 10, Y0 + 12, X1 + 10, Y1 + 12), 14, fill='#bdb4a0')
d.rounded_rectangle((X0, Y0, X1, Y1), 14, fill='#14213d')
random.seed(4)
for _ in range(160):
    x, y = random.randint(X0 + 10, X1 - 10), random.randint(Y0 + 10, Y1 - 10)
    r = random.choice([1, 1, 1, 2])
    if 195 < y < 460 or (320 < x < 660 and 610 < y < 720): continue
    d.ellipse((x - r, y - r, x + r, y + r), fill='#8da2c8')
d.text((X0 + 60, Y0 + 45), 'CAP SUR KEPLER', font=titre, fill='#ffd166')
d.text((X0 + 60, Y0 + 85), 'Inès Moreau', font=petit, fill='#c9d3e8')
# résumé, mot à mot, avec surligneur sur les indices
txt = ('En 2150, la Terre est devenue trop chaude pour y vivre. Lina, douze ans, embarque à bord '
       'd’un immense vaisseau en route vers une nouvelle planète. Mais le robot qui pilote le navire '
       'se met à désobéir…')
CLUES = {'En 2150,': 'date', 'vaisseau': 'vaisseau', 'planète.': 'planete', 'robot': 'robot'}
x, y, lh, maxx = X0 + 60, Y0 + 170, 62, X1 - 60
pos = {}
words = txt.split(' ')
i = 0
toks = []
while i < len(words):
    if words[i] == 'En' and words[i + 1] == '2150,':
        toks.append('En 2150,'); i += 2
    else:
        toks.append(words[i]); i += 1
for t in toks:
    f = serifB if t in CLUES else serif
    w = d.textlength(t, font=f)
    if x + w > maxx:
        x, y = X0 + 60, y + lh
    if t in CLUES:
        word = t.rstrip(',.')
        ww = d.textlength(word, font=f)
        d.rounded_rectangle((x - 6, y + 2, x + ww + 6, y + 50), 8, fill='#ffd166')
        d.text((x, y), word, font=f, fill='#14213d')
        d.text((x + ww, y), t[len(word):], font=serif, fill='#f1f1f1')
        pos[CLUES[t]] = ((x + w + 26) / W * 100, (y + 27) / H * 100)
        x += 44
    else:
        d.text((x, y), t, font=f, fill='#f1f1f1')
    x += w + d.textlength(' ', font=serif)
# code-barres + éditeur + tampon « Genre : ? »
bx, by = X1 - 270, Y1 - 150
d.rectangle((bx - 14, by - 14, bx + 214, by + 104), fill='#ffffff')
random.seed(9)
xx = bx
while xx < bx + 200:
    wbar = random.choice([2, 2, 3, 4])
    d.rectangle((xx, by, xx + wbar - 1, by + 70), fill='#111111'); xx += wbar + random.choice([2, 3])
d.text((bx, by + 76), 'ISBN 978-2-0000-0000-0', font=ImageFont.truetype(F + 'DejaVuSans.ttf', 13), fill='#111111')
d.text((X0 + 60, Y1 - 60), 'Éditions Imaginaires · 12,90 €', font=petit, fill='#c9d3e8')
sx, sy = X0 + 250, Y1 - 150
d.rounded_rectangle((sx, sy, sx + 300, sy + 70), 10, outline='#ffd166', width=4)
d.text((sx + 22, sy + 14), 'GENRE : ?', font=ImageFont.truetype(F + 'DejaVuSans-Bold.ttf', 34), fill='#ffd166')
pos['genre'] = ((sx + 340) / W * 100, (sy + 35) / H * 100)
im.save('media/quatrieme-kepler.jpg', quality=90)
json.dump({k: [round(a, 1), round(b, 1)] for k, (a, b) in pos.items()}, open('quatrieme.json', 'w'))
print(pos)
