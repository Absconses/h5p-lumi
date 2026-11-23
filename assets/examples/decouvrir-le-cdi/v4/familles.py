# Dessine les deux images du chapitre « Tout ce qu'on trouve au CDI » :
#  - familles-cdi.jpg : les 4 familles et leurs 12 types de documents (Image Hotspots)
#  - tri-cdi.jpg : le fond du glisser-déposer (bac en haut, 4 zones en bas)
# et écrit familles.json (positions des hotspots en %, géométrie du tri en unités logiques 800 px).
import json
from PIL import Image, ImageDraw, ImageFont

F = '/usr/share/fonts/truetype/dejavu/'
B = lambda s: ImageFont.truetype(F + 'DejaVuSans-Bold.ttf', s)
R = lambda s: ImageFont.truetype(F + 'DejaVuSans.ttf', s)
EMO = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)

def emoji(ch, size):
    im = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((10, 10), ch, font=EMO, embedded_color=True)
    im = im.crop(im.getbbox())
    return im.resize((size, round(size * im.height / im.width)), Image.LANCZOS)

FAM = [
    ('Littérature', 'des histoires inventées, écrites avec des mots', '#7b2cbf', '#f1e6fb',
     [('📖', 'roman'), ('🎭', 'théâtre'), ('🏰', 'conte'), ('🪶', 'poésie')]),
    ('Bande dessinée', 'des histoires racontées en images', '#e85d04', '#fdebdc',
     [('💬', 'BD'), ('🎌', 'manga'), ('🖌️', 'roman graphique')]),
    ('Ressources documentaires', 'pour s’informer sur le monde réel', '#2a9d8f', '#e0f3f0',
     [('🌍', 'livre documentaire'), ('📰', 'magazine'), ('🔤', 'dictionnaire')]),
    ('Jeux et films', 'pour se détendre et découvrir autrement', '#c9184a', '#fbe3ea',
     [('🎲', 'jeu de société'), ('🎬', 'film')]),
]

def centered(d, cx, y, s, font, fill):
    d.text((cx - d.textlength(s, font=font) / 2, y), s, font=font, fill=fill)

# ---------- 1. Présentation : 2 x 2 cartes ----------
W, H = 1600, 1100
im = Image.new('RGB', (W, H), '#f7f3ea'); d = ImageDraw.Draw(im)
hot = {}
for k, (name, sub, col, bg, items) in enumerate(FAM):
    x0, y0 = 40 + (k % 2) * 780, 40 + (k // 2) * 530
    x1, y1 = x0 + 740, y0 + 490
    d.rounded_rectangle((x0, y0, x1, y1), 28, fill=bg, outline=col, width=5)
    d.rounded_rectangle((x0, y0, x1, y0 + 120), 28, fill=col); d.rectangle((x0, y0 + 90, x1, y0 + 120), fill=col)
    centered(d, (x0 + x1) / 2, y0 + 18, name, B(44), '#ffffff')
    centered(d, (x0 + x1) / 2, y0 + 74, sub, R(28), '#ffffff')
    n = len(items); slot = 740 / n
    for i, (e, lab) in enumerate(items):
        cx = x0 + slot * (i + 0.5)
        ic = emoji(e, 120 if n < 4 else 110)
        iy = y0 + 175
        im.paste(ic, (round(cx - ic.width / 2), iy), ic)
        words = lab.split(' ') if d.textlength(lab, font=B(32)) > slot - 20 else [lab]
        for j, wd in enumerate(words if len(words) < 3 else [' '.join(words[:-1]), words[-1]]):
            centered(d, cx, iy + 150 + j * 40, wd, B(32), '#222222')
        hot[lab] = [round((cx + ic.width / 2 + 6) / W * 100, 1), round((iy + 6) / H * 100, 1)]
im.save('media/familles-cdi.jpg', quality=90)

# ---------- 2. Fond du tri : unités logiques 800 x 600, dessin x2 ----------
LW, LH, S = 800, 600, 2
im = Image.new('RGB', (LW * S, LH * S), '#ffffff'); d = ImageDraw.Draw(im)
d.rounded_rectangle((10 * S, 8 * S, 790 * S, 178 * S), 14 * S, fill='#eef1f5', outline='#c5ccd6', width=2 * S)
centered(d, 400 * S, 14 * S, 'Glisse chaque étiquette dans sa famille', B(15 * S), '#5a6472')
zones = []
for k, (name, sub, col, bg, items) in enumerate(FAM):
    zx0 = 10 + k * 197; zx1 = zx0 + 187; zy0, zy1 = 192, 592
    d.rounded_rectangle((zx0 * S, zy0 * S, zx1 * S, zy1 * S), 14 * S, fill=bg, outline=col, width=3 * S)
    d.rounded_rectangle((zx0 * S, zy0 * S, zx1 * S, (zy0 + 74) * S), 14 * S, fill=col)
    d.rectangle((zx0 * S, (zy0 + 54) * S, zx1 * S, (zy0 + 74) * S), fill=col)
    ic = emoji(items[0][0], 30 * S)
    im.paste(ic, (round((zx0 + 93.5) * S - ic.width / 2), (zy0 + 6) * S), ic)
    words = name.split(' ')
    lines = [name] if len(words) == 1 or d.textlength(name, font=B(14 * S)) < 175 * S else [words[0], ' '.join(words[1:])]
    for j, ln in enumerate(lines):
        centered(d, (zx0 + 93.5) * S, (zy0 + 38 + j * 17 - (len(lines) - 1) * 6) * S, ln, B(13 * S), '#ffffff')
    zones.append({'name': name, 'x': zx0, 'y': zy0 + 78, 'w': 187, 'h': zy1 - zy0 - 82})
im.save('media/tri-cdi.jpg', quality=90)

json.dump({'hot': hot, 'zones': zones, 'size': [LW, LH]}, open('familles.json', 'w'), ensure_ascii=False, indent=1)
print(hot)
