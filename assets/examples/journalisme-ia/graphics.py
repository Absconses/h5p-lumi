# Visuels du livre « Qui t'informe ? » : recadrages des photos Pixabay, frise du trajet (5 étapes), boucle du « slop ».
# usage : python3 graphics.py <raw> <media>
import sys, math
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
RAW, OUT = sys.argv[1:3]
F = '/usr/share/fonts/opentype/inter/Inter-'
def font(w, s): return ImageFont.truetype(F + w + '.otf', s)
INK, PAPER, RED, BLUE, GREY = (28, 34, 48), (246, 243, 236), (178, 58, 46), (35, 87, 122), (150, 150, 150)

def crop(src, out, w, h, fy=0.5, fx=0.5):
    im = Image.open(f'{RAW}/{src}').convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x = round((im.width - w) * fx); y = round((im.height - h) * fy)
    im.crop((x, y, x + w, y + h)).save(f'{OUT}/{out}', quality=84)

crop('L_2333329.jpg', 'couverture.jpg', 1600, 900, 0.4)
crop('L_3491097.jpg', 'terrain.jpg', 820, 600, 0.18)
crop('L_1172463.jpg', 'journaux.jpg', 820, 600, 0.5)
crop('L_2160321.jpg', 'serveurs.jpg', 820, 600, 0.5)
crop('L_407108.jpg', 'smartphone.jpg', 800, 652, 0.5)
crop('L_4214869.jpg', 'camera.jpg', 800, 750, 0.5, 0.35)

# Frise du trajet : 5 étapes, l'étape courante en couleur ; ce qui se perd apparaît (barré) à partir de l'étape 4.
ST = ['Terrain', 'Article signé', 'Machines', 'Chatbot', 'Toi']
LOST = {3: ['la signature', 'les sources'], 4: ['le clic', 'les revenus']}
W, H = 1600, 250
for k in range(5):
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    xs = [160 + i * 320 for i in range(5)]; y = 44
    d.line([(xs[0], y), (xs[-1], y)], fill=(205, 200, 190), width=10)
    d.line([(xs[0], y), (xs[k], y)], fill=INK, width=10)
    for i, x in enumerate(xs):
        cur = i == k; done = i < k
        r = 38 if cur else 28
        fill = BLUE if cur else (INK if done else (225, 220, 210))
        d.ellipse([x - r, y - r, x + r, y + r], fill=fill, outline=PAPER, width=5)
        d.text((x, y), str(i + 1), font=font('Bold', 36 if cur else 28), fill=PAPER if (cur or done) else GREY, anchor='mm')
        d.text((x, y + 74), ST[i], font=font('Bold', 42 if cur else 38),
               fill=BLUE if cur else (INK if done else GREY), anchor='mm')
        if i in LOST and i <= k:
            for j, t in enumerate(LOST[i]):
                f = font('SemiBold', 36); ty = y + 128 + j * 44
                d.text((x, ty), t, font=f, fill=RED, anchor='mm')
                tw = d.textlength(t, font=f); d.line([(x - tw / 2 - 4, ty + 2), (x + tw / 2 + 4, ty + 2)], fill=RED, width=3)
    im.save(f'{OUT}/trajet-{k + 1}.png')

# Boucle du « slop » : 4 étapes sur une ellipse, flèches dans le sens des aiguilles d'une montre.
im = Image.new('RGB', (1120, 720), PAPER); d = ImageDraw.Draw(im)
CX, CY, RX, RY = 560, 360, 345, 275
lab = [('Des IA', 'écrivent des textes'), ('Le web se remplit', 'de « bouillie IA »'),
       ('De nouvelles IA', "s'entraînent dessus"), ('Leurs réponses', 'se dégradent')]
ang = [-90, 0, 90, 180]
P = lambda a: (CX + RX * math.cos(math.radians(a)), CY + RY * math.sin(math.radians(a)))
for i in range(4):
    o = (46, 24) if i % 2 == 0 else (24, 46)  # dégagement des boîtes : haut/bas plus larges que les côtés
    a0, a1 = ang[i] + o[0], ang[i] + 90 - o[1]
    d.arc([CX - RX, CY - RY, CX + RX, CY + RY], a0, a1, fill=RED, width=12)
    hx, hy = P(a1); px, py = P(a1 - 3)
    tx, ty = hx - px, hy - py; n = math.hypot(tx, ty); tx, ty = tx / n, ty / n
    nx, ny = -ty, tx
    d.polygon([(hx + tx * 30, hy + ty * 30), (hx - tx * 8 + nx * 22, hy - ty * 8 + ny * 22), (hx - tx * 8 - nx * 22, hy - ty * 8 - ny * 22)], fill=RED)
for i, (a, b) in enumerate(lab):
    x, y = P(ang[i]); bw, bh = 410, 140
    d.rounded_rectangle([x - bw / 2, y - bh / 2, x + bw / 2, y + bh / 2], 18, fill='white', outline=INK, width=3)
    d.text((x, y - 27), a, font=font('Bold', 44), fill=INK, anchor='mm')
    d.text((x, y + 29), b, font=font('Regular', 38), fill=INK, anchor='mm')
d.text((CX, CY - 24), 'sans faits', font=font('Bold', 44), fill=RED, anchor='mm')
d.text((CX, CY + 28), 'nouveaux', font=font('Bold', 44), fill=RED, anchor='mm')
im.save(f'{OUT}/boucle-slop.png')
print('ok')
