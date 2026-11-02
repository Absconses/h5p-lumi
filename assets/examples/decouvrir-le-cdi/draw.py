# Visuels du module « Ma première visite au CDI », tous dessinés ici (aucun droit à céder).
# usage : python3 draw.py <dossier_polices> <dossier_sortie>
# Produit les images + geo.json (positions en % des zones utiles aux exercices).
import json, sys, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONTS, OUT = sys.argv[1:3]
INTER = '/usr/share/fonts/opentype/inter/Inter-{}.otf'
def F(size, w='Bold'): return ImageFont.truetype(INTER.format(w), size)
def B(size): return ImageFont.truetype(f'{FONTS}/Bebas.ttf', size)

NAVY, CORAL, CREAM, TEAL, SAND, INK = '#1d3557', '#e76f51', '#f6f3ec', '#2a9d8f', '#e9c46a', '#22223b'
geo = {}

def ctext(d, xy, s, font, fill, anchor='mm', **k): d.text(xy, s, font=font, fill=fill, anchor=anchor, **k)

def wrap(d, s, font, width):
    words, lines, cur = s.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

# ------------------------------------------------------------------ 1. Plan simplifié
W, H = 1400, 840
im = Image.new('RGB', (W, H), CREAM); d = ImageDraw.Draw(im)
BLD, EDGE = '#dde3ea', NAVY
def bld(box, label=None, fill=BLD, lab_xy=None, size=22, color=NAVY):
    d.rounded_rectangle(box, 6, fill=fill, outline=EDGE, width=3)
    if label:
        x = lab_xy or ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)
        for i, line in enumerate(label.split('\n')):
            ctext(d, (x[0], x[1] + i * (size + 4) - (label.count('\n')) * (size + 4) / 2), line, F(size), color)
# allées / cour
d.rectangle((0, 0, W, H), fill=CREAM)
d.rounded_rectangle((520, 440, 990, 800), 18, fill='#cfe3c8', outline='#8fb98a', width=3)
ctext(d, (755, 640), "Cour d'honneur", F(26, 'SemiBold'), '#3c6e47')
d.ellipse((700, 690, 810, 760), outline='#8fb98a', width=3)
# bâtiments
bld((300, 50, 470, 110), 'Préau', size=20)
bld((250, 135, 410, 245), 'Abeilles', size=20)
bld((50, 270, 330, 420), 'Primaires')
bld((560, 70, 820, 170), 'Grand gymnase', size=21)
bld((840, 120, 1000, 280), 'Chapelle', size=21)
bld((420, 440, 500, 680), 'Oran-\ngerie', size=16)
d.ellipse((340, 690, 490, 820), fill=BLD, outline=EDGE, width=3); ctext(d, (415, 755), 'Préau\nsous coupole', F(16), NAVY, align='center')
# aile nord du pavillon Bellevue
north = (420, 300, 1110, 420)
d.rounded_rectangle(north, 6, fill='#c9d6e8', outline=EDGE, width=4)
rooms = [(420, 300, 560, 420), (560, 300, 660, 360), (690, 300, 860, 420), (860, 300, 940, 420), (940, 300, 1110, 420)]
for r in rooms: d.rectangle(r, outline=EDGE, width=3)
ctext(d, (490, 360), 'Petit\ngymnase', F(19), NAVY, align='center')
ctext(d, (610, 330), 'Salon', F(15), NAVY)
# hall rond (repère)
d.ellipse((560, 345, 680, 465), fill='#f4d6c8', outline=CORAL, width=4); ctext(d, (620, 405), 'Hall', F(22), CORAL)
# escalier symbolique
for i in range(6): d.line((875, 315 + i * 17, 925, 315 + i * 17), fill=EDGE, width=2)
# aile est du pavillon Bellevue
d.rounded_rectangle((1010, 420, 1110, 760), 6, fill='#c9d6e8', outline=EDGE, width=4)
d.ellipse((1000, 700, 1120, 820), fill='#c9d6e8', outline=EDGE, width=4)
ctext(d, (1060, 560), 'Bureaux', F(17), NAVY)
# étiquette du pavillon
d.rounded_rectangle((1130, 600, 1380, 660), 30, fill=NAVY)
ctext(d, (1255, 630), 'Pavillon Bellevue', F(22), 'white')
d.line((1130, 630, 1112, 630), fill=NAVY, width=4)
# villas
bld((1160, 30, 1370, 170), 'Villa Rouge', fill='#efc5bd', color='#8c2f1b')
bld((1170, 230, 1370, 540), 'Villa\nBlanche', fill='#ffffff')
# rose des vents + légende
cx, cy = 90, 750
d.polygon([(cx, cy - 55), (cx - 14, cy), (cx + 14, cy)], fill=NAVY); d.polygon([(cx, cy + 55), (cx - 14, cy), (cx + 14, cy)], outline=NAVY, fill=CREAM)
ctext(d, (cx, cy - 70), 'N', F(20), NAVY)
ctext(d, (1385, 822), "Plan simplifié de l'établissement (sans échelle)", F(17, 'Medium'), '#55606e', anchor='rm')
im.save(f'{OUT}/plan-simplifie.png', optimize=True)
pct = lambda b: dict(x=round(b[0] / W * 100, 2), y=round(b[1] / H * 100, 2), w=round((b[2] - b[0]) / W * 100, 2), h=round((b[3] - b[1]) / H * 100, 2))
geo['plan'] = dict(W=W, H=H, cdi=pct(rooms[2]), villaRouge=pct((1160, 30, 1370, 170)), villaBlanche=pct((1170, 230, 1370, 540)),
                   petitGym=pct(rooms[0]), chapelle=pct((840, 120, 1000, 280)), grandGym=pct((560, 70, 820, 170)), classe=pct(rooms[4]))

# ------------------------------------------------------------------ 2. Couvertures inventées
def grad(w, h, top, bottom):
    g = Image.new('RGB', (w, h)); gd = ImageDraw.Draw(g)
    t, b = Image.new('RGB', (1, 1), top).getpixel((0, 0)), Image.new('RGB', (1, 1), bottom).getpixel((0, 0))
    for y in range(h):
        k = y / (h - 1); gd.line((0, y, w, y), fill=tuple(int(t[i] + (b[i] - t[i]) * k) for i in range(3)))
    return g

def stars(d, w, h, n, seed, col='#ffffff'):
    r = random.Random(seed)
    for _ in range(n):
        x, y, s = r.randint(0, w), r.randint(0, int(h * 0.6)), r.choice([1, 1, 2, 2, 3])
        d.ellipse((x - s, y - s, x + s, y + s), fill=col)

CW, CH = 360, 540
def cover(name, title, author, top, bottom, art, tcol='white', acol='#f1f1f1', tfont=None):
    im = grad(CW, CH, top, bottom); d = ImageDraw.Draw(im)
    art(d, im)
    f = tfont or B(54)
    lines = wrap(d, title.upper(), f, CW - 50)
    y = 40
    for l in lines: ctext(d, (CW / 2, y), l, f, tcol, anchor='mt'); y += f.size * 0.95
    ctext(d, (CW / 2, CH - 34), author, F(18, 'SemiBold'), acol)
    im.save(f'{OUT}/couv-{name}.jpg', quality=88)

def art_enquete(d, im):
    for i, (x, y) in enumerate([(70, 470), (110, 430), (95, 380), (140, 340), (120, 290)]):
        d.ellipse((x, y, x + 22, y + 34), fill='#5a1e1e'); d.ellipse((x + 4, y - 14, x + 12, y - 6), fill='#5a1e1e')
    d.ellipse((150, 200, 290, 340), outline='#f2e9e4', width=14); d.line((272, 322, 335, 395), fill='#f2e9e4', width=22)
    d.ellipse((168, 218, 272, 322), fill='#3d0c11')
    ctext(d, (220, 270), '13', B(70), '#e9c46a')
def art_fantasy(d, im):
    stars(d, CW, CH, 60, 1)
    d.ellipse((230, 150, 310, 230), fill='#fff3c4')
    base = 470
    d.polygon([(40, base), (40, 330), (60, 300), (80, 330), (80, 380), (120, 380), (120, 280), (140, 240), (160, 280), (160, 380),
               (200, 380), (200, 320), (220, 290), (240, 320), (240, 400), (300, 400), (300, 350), (320, 330), (340, 350), (340, base)], fill='#1b1035')
    for x in (55, 135, 215, 315): d.rectangle((x, 345, x + 10, 362), fill='#f7d070')
def art_fantastique(d, im):
    d.ellipse((240, 120, 320, 200), fill='#d9e4c8')
    d.polygon([(70, 520), (70, 330), (180, 250), (290, 330), (290, 520)], fill='#0b0f0b')
    d.rectangle((150, 360, 210, 440), fill='#c9d77a'); d.line((180, 360, 180, 440), fill='#0b0f0b', width=5); d.line((150, 400, 210, 400), fill='#0b0f0b', width=5)
    d.ellipse((160, 372, 176, 388), fill='#0b0f0b'); d.ellipse((186, 372, 202, 388), fill='#0b0f0b')
    d.ellipse((166, 376, 172, 382), fill='#e63946'); d.ellipse((192, 376, 198, 382), fill='#e63946')
def art_sf(d, im):
    stars(d, CW, CH, 90, 2)
    d.ellipse((90, 220, 280, 410), fill='#2ec4b6'); d.ellipse((120, 250, 200, 300), fill='#5eead4')
    d.arc((40, 280, 330, 350), 200, 340, fill='#ffd166', width=8); d.arc((40, 280, 330, 350), 0, 160, fill='#ffd166', width=8)
    d.polygon([(260, 470), (300, 400), (310, 470)], fill='#e5e5e5'); d.polygon([(285, 470), (300, 500), (290, 470)], fill='#ff7b00')
def art_romance(d, im):
    d.ellipse((110, 130, 250, 270), fill='#ffe8a3')
    hx, hy, s = 180, 360, 90
    d.ellipse((hx - s, hy - s / 2, hx, hy + s / 2), fill='#e5383b'); d.ellipse((hx, hy - s / 2, hx + s, hy + s / 2), fill='#e5383b')
    d.polygon([(hx - s + 4, hy + 12), (hx + s - 4, hy + 12), (hx, hy + s + 40)], fill='#e5383b')
def art_aventure(d, im):
    d.ellipse((240, 140, 320, 220), fill='#ffd166')
    d.polygon([(0, 380), (90, 230), (170, 380)], fill='#3a5a40'); d.polygon([(110, 380), (220, 200), (330, 380)], fill='#344e41')
    d.rectangle((0, 380, CW, CH), fill='#1d6fa5')
    for y in (410, 440, 470): d.arc((20, y, 340, y + 30), 200, 340, fill='#a8dadc', width=3)
    d.polygon([(130, 420), (230, 420), (210, 445), (150, 445)], fill='#6b4226'); d.line((180, 420, 180, 360), fill='#6b4226', width=4)
    d.polygon([(182, 362), (182, 412), (222, 412)], fill='#f1faee')
def art_animalier(d, im):
    for (x, y, s) in [(120, 380, 1), (210, 300, 1.2), (130, 220, 0.9)]:
        d.ellipse((x - 30 * s, y - 20 * s, x + 30 * s, y + 25 * s), fill='#7f4f24')
        for dx, dy in [(-34, -38), (-12, -50), (12, -50), (34, -38)]:
            d.ellipse((x + dx * s - 11 * s, y + dy * s - 13 * s, x + dx * s + 11 * s, y + dy * s + 13 * s), fill='#7f4f24')
def art_mythe(d, im):
    for i in range(6):
        m = 30 + i * 22; d.rectangle((m, 150 + i * 22, CW - m, 470 - i * 22), outline='#f4e3b2', width=6)
    d.rectangle((168, 300, 192, 320), fill='#f4e3b2')
def art_reel(d, im):
    d.rounded_rectangle((90, 210, 270, 460), 24, fill='#457b9d'); d.rounded_rectangle((130, 170, 230, 230), 20, outline='#457b9d', width=12)
    d.rectangle((120, 290, 240, 360), fill='#a8dadc'); d.line((120, 325, 240, 325), fill='#457b9d', width=4)

COVERS = [
    ('enquete', 'Le mystère du casier 13', 'Inès Morel', '#2b2d42', '#7a1c1c', art_enquete),
    ('fantasy', 'La couronne des brumes', 'Léo Arvel', '#3a0ca3', '#7209b7', art_fantasy),
    ('fantastique', "La maison d'en face", 'Nora Vilain', '#1b261b', '#3d4f3a', art_fantastique),
    ('sf', 'Mission Kepler-9', 'Sam Okoro', '#03045e', '#0b132b', art_sf),
    ('romance', 'Un été pour toi', 'Clara Dumas', '#ffafcc', '#ffc8dd', art_romance),
    ('aventure', "Les naufragés de l'île grise", 'Tom Berthier', '#90e0ef', '#caf0f8', art_aventure),
    ('animalier', 'Plume, renard des neiges', 'Ana Lund', '#e9f5f9', '#cfe8ef', art_animalier),
    ('mythe', 'Thésée et le labyrinthe', 'Hélène Kastri', '#9c6644', '#7f5539', art_mythe),
    ('reel', 'Ma vie en 6e B', 'Yanis Benali', '#f1faee', '#dfe7ec', art_reel),
]
for n, t, a, top, bot, art in COVERS:
    dark = n in ('enquete', 'fantasy', 'fantastique', 'sf', 'mythe')
    cover(n, t, a, top, bot, art, tcol='white' if dark else INK, acol='#eeeeee' if dark else '#333333')

# ------------------------------------------------------------------ 3. Un livre à observer (Image Hotspots)
W, H = 1200, 720
im = Image.new('RGB', (W, H), CREAM); d = ImageDraw.Draw(im)
fc = Image.open(f'{OUT}/couv-aventure.jpg').resize((300, 450))
im.paste(fc, (90, 160))
d.rectangle((90, 160, 390, 610), outline=INK, width=3)
ctext(d, (240, 120), 'Première de couverture', F(24), NAVY)
# dos
d.rectangle((520, 160, 590, 610), fill='#1d6fa5', outline=INK, width=3)
spine = Image.new('RGBA', (300, 60), (0, 0, 0, 0)); sd = ImageDraw.Draw(spine)
ctext(sd, (150, 30), "LES NAUFRAGÉS DE L'ÎLE GRISE", B(25), 'white')
im.paste(spine.rotate(90, expand=True), (525, 165), spine.rotate(90, expand=True))
d.ellipse((537, 470, 573, 506), fill='#ffffff', outline=INK, width=2)  # pastille (sans couleur imposée)
d.rectangle((526, 530, 584, 595), fill='white', outline=INK, width=2)
ctext(d, (555, 550), 'R', F(20), INK); ctext(d, (555, 575), 'BER', F(18), INK)
ctext(d, (555, 120), 'Dos', F(24), NAVY)
# quatrième
d.rectangle((720, 160, 1020, 610), fill='#e8f4f8', outline=INK, width=3)
ctext(d, (870, 120), 'Quatrième de couverture', F(24), NAVY)
blurb = ("Lou, Malik et Jeanne partent en voilier pour leurs vacances. Une tempête les jette sur une île "
         "qui n'est sur aucune carte. Pour rentrer, ils devront affronter la forêt, le froid… et leurs peurs.")
y = 200
for l in wrap(d, blurb, F(19, 'Regular'), 250): ctext(d, (745, y), l, F(19, 'Regular'), INK, anchor='lm'); y += 28
d.rectangle((900, 540, 1000, 590), fill='white', outline=INK, width=2)
for i in range(9): d.line((910 + i * 10, 548, 910 + i * 10, 582), fill=INK, width=2 if i % 2 else 4)
im.save(f'{OUT}/livre-observe.png', optimize=True)
geo['livre'] = dict(titre=(368 / W * 100, 182 / H * 100), illustration=(118 / W * 100, 455 / H * 100),
                    dos=(555 / W * 100, 190 / H * 100), pastille=(500 / W * 100, 488 / H * 100), cote=(612 / W * 100, 563 / H * 100),
                    resume=(760 / W * 100, 470 / H * 100), codebarre=(950 / W * 100, 565 / H * 100))

# ------------------------------------------------------------------ 4. Dewey : 10 classes
DEW = [('000', 'Généralités\nInformatique', '#6c757d'), ('100', 'Philosophie\nPsychologie', '#4ea8de'), ('200', 'Religions\nMythologie', '#7b2cbf'),
       ('300', 'Société', '#80b918'), ('400', 'Langues', '#f48c06'), ('500', 'Sciences\nde la nature', '#2a9d8f'),
       ('600', 'Techniques\nMédecine', '#1d3557'), ('700', 'Arts\nLoisirs Sports', '#e9c46a'), ('800', 'Littérature', '#c9184a'),
       ('900', 'Histoire\nGéographie', '#7f5539')]
W, H = 1250, 560
im = Image.new('RGB', (W, H), CREAM); d = ImageDraw.Draw(im)
ctext(d, (W / 2, 50), 'LA CLASSIFICATION DEWEY : 10 GRANDES CLASSES', B(46), NAVY)
for i, (n, lab, col) in enumerate(DEW):
    x, y = 35 + (i % 5) * 240, 100 + (i // 5) * 225
    d.rounded_rectangle((x, y, x + 220, y + 205), 16, fill=col)
    tc = INK if col in ('#e9c46a', '#80b918', '#f48c06') else 'white'
    ctext(d, (x + 110, y + 62), n, B(78), tc)
    ctext(d, (x + 110, y + 150), lab, F(21), tc, align='center')
im.save(f'{OUT}/dewey-classes.png', optimize=True)

# ------------------------------------------------------------------ 5. Étagère + dos de documentaires
SPINES = [('551.21', 'VOL', 'Les volcans', '#e76f51'), ('398.2', 'GRI', 'Contes de Grimm', '#7b2cbf'), ('741.5', 'MAN', 'Dessiner un manga', '#e9c46a'),
          ('599.7', 'LOU', 'Le loup', '#7f5539'), ('551.5', 'MET', 'La météo', '#4ea8de')]
for cote, l3, titre, col in SPINES:
    s = Image.new('RGB', (110, 380), col); sd = ImageDraw.Draw(s)
    sd.rectangle((0, 0, 109, 379), outline=INK, width=3)
    t = Image.new('RGBA', (270, 70), (0, 0, 0, 0)); td = ImageDraw.Draw(t)
    tc = INK if col == '#e9c46a' else 'white'
    ctext(td, (135, 35), titre.upper(), B(34), tc)
    r = t.rotate(90, expand=True); s.paste(r, (20, 15), r)
    sd.rectangle((10, 292, 100, 368), fill='white', outline=INK, width=2)
    ctext(sd, (55, 314), cote, F(21), INK); ctext(sd, (55, 346), l3, F(20, 'SemiBold'), INK)
    s.save(f"{OUT}/dos-{cote.replace('.', '-')}.png", optimize=True)
W, H = 1000, 900
im = Image.new('RGB', (W, H), CREAM); d = ImageDraw.Draw(im)
d.rounded_rectangle((20, 20, W - 20, 420), 16, fill='#e9e4d8', outline='#b8ad94', width=3)
ctext(d, (W / 2, 50), 'Chariot des retours : 5 livres à ranger', F(24), '#5b5141')
# meuble
d.rectangle((40, 470, W - 40, 880), fill='#c49a6c', outline='#7f5539', width=6)
d.rectangle((60, 490, W - 60, 840), fill='#f3e6d3')
d.rectangle((40, 840, W - 40, 880), fill='#a47148')
ctext(d, (W / 2, 862), 'Rayon des documentaires : de gauche à droite', F(22), 'white')
slots = []
for i in range(5):
    x = 90 + i * 172; slots.append((x, 500, x + 140, 830))
    d.rounded_rectangle(slots[-1], 8, outline='#b08968', width=3)
    ctext(d, (x + 70, 815), str(i + 1), F(28), '#b08968')
im.save(f'{OUT}/etagere.png', optimize=True)
geo['etagere'] = dict(W=W, H=H, slots=[pct2 for pct2 in [dict(x=s[0] / W * 100, y=s[1] / H * 100, w=(s[2] - s[0]), h=(s[3] - s[1])) for s in slots]],
                      spines=[c for c, *_ in SPINES])

# ------------------------------------------------------------------ 6. Couverture du livre (1200 x 900)
W, H = 1200, 900
im = Image.new('RGB', (W, H), NAVY); d = ImageDraw.Draw(im)
r = random.Random(7)
for row in range(4):
    y0 = 120 + row * 190; x = 40
    d.rectangle((20, y0 + 165, W - 20, y0 + 180), fill='#a47148')
    while x < W - 60:
        w_, h_ = r.randint(28, 52), r.randint(110, 160)
        col = r.choice(['#e76f51', '#2a9d8f', '#e9c46a', '#f4a261', '#8ecae6', '#ffb4a2', '#b5838d', '#cdb4db', '#a8dadc'])
        d.rectangle((x, y0 + 165 - h_, x + w_, y0 + 165), fill=col, outline='#14213d', width=2)
        if r.random() < .5: d.ellipse((x + w_ / 2 - 7, y0 + 140, x + w_ / 2 + 7, y0 + 154), fill='white')
        x += w_ + r.randint(2, 6)
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
od.rounded_rectangle((150, 300, 1050, 600), 30, fill=(20, 33, 61, 228))
im.paste(ov, (0, 0), ov); d = ImageDraw.Draw(im)
ctext(d, (W / 2, 390), 'MA PREMIÈRE VISITE', B(110), 'white')
ctext(d, (W / 2, 490), 'AU CDI', B(110), SAND)
ctext(d, (W / 2, 565), '6e · Éducation aux médias et à l’information', F(26, 'Medium'), '#dbe4ee')
im.save(f'{OUT}/couverture.jpg', quality=88)

json.dump(geo, open(f'{OUT}/geo.json', 'w'), indent=1)
print('ok')
