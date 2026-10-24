# Décor illustré de la carte des connexions : une coupe du monde, de l'espace au fond
# de l'océan, dessinée aux coordonnées du monde 3D (geom.json écrit par build.mjs).
# Couleurs sombres et désaturées : les photos et les lignes restent ce qu'on voit d'abord.
# Usage : node build.mjs (1er passage) && python3 map.py && node build.mjs
import json, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

G = json.load(open('geom.json'))
FX, FY, FW, FH = G['frame']
SX, SY, SW, SH = G['safe']   # zone vraiment visible dans la vue d'ensemble
IW = 3600; IH = round(IW * FH / FW)
s = IW / FW                                    # pixels par unité du monde
X = lambda x: (x - FX) * s
Y = lambda y: (y - FY) * s
FONT = 'fonts/'
bebas = lambda n: ImageFont.truetype(FONT + 'BebasNeue.ttf', round(n * s))
inter = lambda n, b=False: ImageFont.truetype(FONT + ('Inter-ExtraBold.ttf' if b else 'Inter-Regular.ttf'), round(n * s))
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
random.seed(7)

GROUND = 180                                   # niveau du sol / de la mer
SHORE_FR, SHORE_US = 3700, 6600                # côtes
im = Image.new('RGB', (IW, IH))
d = ImageDraw.Draw(im)

# --- ciel et espace : dégradé vertical ------------------------------------------
def lerp(a, b, t): return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
stops = [(FY, rgb('020309')), (-2600, rgb('05081a')), (-1400, rgb('0b1838')), (-200, rgb('16305a')), (GROUND, rgb('2a3e66'))]
for py in range(IH):
    y = FY + py / s
    for (y0, c0), (y1, c1) in zip(stops, stops[1:]):
        if y0 <= y <= y1:
            d.line([(0, py), (IW, py)], fill=lerp(c0, c1, (y - y0) / (y1 - y0))); break
    else:
        d.line([(0, py), (IW, py)], fill=stops[-1][1])

# étoiles (seulement dans l'espace)
for _ in range(900):
    x, y = random.uniform(FX, FX + FW), random.uniform(FY, -1500)
    r = random.choice([1, 1, 1, 2, 2, 3])
    a = 120 + int(135 * min(1, (-1500 - y) / 1500))
    d.ellipse([X(x) - r, Y(y) - r, X(x) + r, Y(y) + r], fill=(a, a, min(255, a + 20)))

# halo de l'atmosphère
glow = Image.new('L', (IW, IH)); gd = ImageDraw.Draw(glow)
gd.rectangle([0, Y(-500), IW, Y(GROUND)], fill=90)
glow = glow.filter(ImageFilter.GaussianBlur(60))
im = Image.composite(Image.new('RGB', (IW, IH), rgb('3d5a8a')), im, glow)
d = ImageDraw.Draw(im)

# nuages doux
cl = Image.new('L', (IW, IH)); cd = ImageDraw.Draw(cl)
for _ in range(26):
    x, y = random.uniform(FX, FX + FW), random.uniform(-1500, -500)
    w, h = random.uniform(300, 900), random.uniform(60, 140)
    cd.ellipse([X(x - w), Y(y - h), X(x + w), Y(y + h)], fill=random.randint(30, 60))
cl = cl.filter(ImageFilter.GaussianBlur(25))
im = Image.composite(Image.new('RGB', (IW, IH), rgb('8ea6c8')), im, cl)
d = ImageDraw.Draw(im)

# --- orbites ----------------------------------------------------------------------
def dashed(y, col, label, sub):
    for x in range(int(FX), int(FX + FW), 160):
        d.line([(X(x), Y(y)), (X(x + 90), Y(y))], fill=rgb(col), width=max(2, round(14 * s)))
    d.text((X(SX + 1500), Y(y) - 130 * s), label, font=inter(95, True), fill=rgb(col))
    d.text((X(SX + 1500), Y(y) + 40 * s), sub, font=inter(75), fill=(170, 180, 205))
dashed(-3900, '9b6fd0', 'ORBITE GÉOSTATIONNAIRE · 36 000 km', 'Satellites de télévision, de météo, d\'Internet « lent »')
dashed(-1750, 'b48ae0', 'ORBITE BASSE · 550 km', 'Constellations Internet (Starlink, OneWeb…)')
d.text((X(SX + SW - 2100), Y(SY + 60)), '(distances non respectées)', font=inter(56), fill=(120, 130, 160))

# --- sol : strates ------------------------------------------------------------------
def land(x0, x1):
    layers = [(GROUND, 'a39272', 26), (GROUND + 26, '3b2f22', 330), (GROUND + 356, '2c241b', 500), (GROUND + 856, '221c15', 3000)]
    for y, col, h in layers:
        d.rectangle([X(x0), Y(y), X(x1), Y(y + h)], fill=rgb(col))
    for _ in range(int((x1 - x0) / 25)):        # cailloux
        x, y = random.uniform(x0, x1), random.uniform(GROUND + 60, FY + FH)
        r = random.uniform(4, 14) * s * 3
        d.ellipse([X(x) - r, Y(y) - r, X(x) + r, Y(y) + r], fill=(58, 48, 36))
land(FX, SHORE_FR); land(SHORE_US, FX + FW)
# herbe
d.rectangle([X(FX), Y(GROUND - 18), X(SHORE_FR), Y(GROUND + 4)], fill=rgb('3d7a4a'))
d.rectangle([X(SHORE_US), Y(GROUND - 18), X(FX + FW), Y(GROUND + 4)], fill=rgb('3d7a4a'))
# gaine de fibre enterrée
fy = GROUND + 300
d.line([(X(FX), Y(fy)), (X(SHORE_FR - 60), Y(fy))], fill=rgb('1d6f86'), width=round(30 * s))
d.line([(X(SHORE_US + 60), Y(fy)), (X(FX + FW), Y(fy))], fill=rgb('1d6f86'), width=round(30 * s))
d.text((X(FX + 1600), Y(fy) + 30 * s), 'Fibres optiques enterrées sous les rues', font=inter(60), fill=rgb('7fd3e6'))

# --- océan ----------------------------------------------------------------------------
floor = [(SHORE_FR, GROUND), (SHORE_FR + 250, GROUND + 250), (SHORE_FR + 450, GROUND + 1100), (SHORE_FR + 750, 1950),
         (5300, 2020), (6000, 1980), (SHORE_US - 320, 1100), (SHORE_US - 120, GROUND + 200), (SHORE_US, GROUND)]
water = Image.new('RGB', (IW, IH))
wd = ImageDraw.Draw(water)
for py in range(int(Y(GROUND)), IH):
    t = max(0, min(1, (FY + py / s - GROUND) / 1900))
    wd.line([(0, py), (IW, py)], fill=lerp(rgb('1a5f86'), rgb('03111f'), t ** 0.8))
mask = Image.new('L', (IW, IH)); md = ImageDraw.Draw(mask)
md.polygon([(X(x), Y(y)) for x, y in floor], fill=255)
im.paste(water, (0, 0), mask)
d = ImageDraw.Draw(im)
# fond marin (sédiments)
sea = [(X(x), Y(y)) for x, y in floor]
d.polygon(sea + [(X(SHORE_US), Y(FY + FH)), (X(SHORE_FR), Y(FY + FH))], fill=rgb('2a2418'))
d.polygon([(X(x), Y(y)) for x, y in floor], outline=rgb('3d3424'))
d.line(sea, fill=rgb('5a4a30'), width=round(20 * s))
# re-remplir l'eau par-dessus le contour
im.paste(water, (0, 0), mask); d = ImageDraw.Draw(im)
# vagues
for x in range(SHORE_FR, SHORE_US, 120):
    d.arc([X(x), Y(GROUND - 30), X(x + 120), Y(GROUND + 30)], 0, 180, fill=rgb('7fc4e8'), width=max(2, round(10 * s)))
# câble sous-marin posé sur le fond (lueur orange)
def cable_path():
    pts = []
    for (x0, y0), (x1, y1) in zip(floor, floor[1:]):
        for k in range(20):
            t = k / 20; pts.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - 25))
    return [(X(x), Y(y)) for x, y in pts if SHORE_FR - 50 < x < SHORE_US + 50]
cg = Image.new('L', (IW, IH)); ImageDraw.Draw(cg).line(cable_path(), fill=255, width=round(70 * s))
cg = cg.filter(ImageFilter.GaussianBlur(10))
im = Image.composite(Image.new('RGB', (IW, IH), rgb('ff7a18')), im, cg.point(lambda v: v * 0.55))
d = ImageDraw.Draw(im)
d.line(cable_path(), fill=rgb('ffb066'), width=max(3, round(16 * s)))
d.text((X(4250), Y(2045)), 'Câble sous-marin transatlantique ≈ 6 000 km, posé sur le fond', font=inter(62, True), fill=rgb('ffb066'))

# --- bâtiments ---------------------------------------------------------------------
def building(x, w, h, col='202a3e', win='f6d27a', seed=0):
    d.rectangle([X(x), Y(GROUND - h), X(x + w), Y(GROUND)], fill=rgb(col))
    rnd = random.Random(seed)
    for wy in range(int(GROUND - h + 25), int(GROUND - 20), 45):
        for wx in range(int(x + 15), int(x + w - 15), 35):
            if rnd.random() < 0.45:
                d.rectangle([X(wx), Y(wy), X(wx + 14), Y(wy + 18)], fill=rgb(win))
# Lyon : petite ville + colline de Fourvière
d.pieslice([X(-1300), Y(GROUND - 380), X(-300), Y(GROUND + 380)], 180, 360, fill=rgb('1c2b26'))
d.rectangle([X(-840), Y(GROUND - 470), X(-760), Y(GROUND - 380)], fill=rgb('2a3540'))        # basilique
for i, (w, h) in enumerate([(160, 220), (120, 300), (180, 180), (140, 420), (160, 260)]):
    building(-250 + i * 210, w, h, seed=i)
d.text((X(-1200), Y(GROUND + 60)), 'LYON', font=bebas(170), fill=(235, 235, 245))
# antenne relais
ax = 1350
d.line([(X(ax), Y(GROUND)), (X(ax), Y(GROUND - 620))], fill=rgb('8fa3b8'), width=round(22 * s))
for k in range(4):
    d.line([(X(ax - 60), Y(GROUND - 600 + k * 30)), (X(ax + 60), Y(GROUND - 600 + k * 30))], fill=rgb('8fa3b8'), width=round(10 * s))
for r in (120, 200, 280):
    d.arc([X(ax - r), Y(GROUND - 600 - r), X(ax + r), Y(GROUND - 600 + r)], 200, 340, fill=rgb('f1c40f'), width=max(2, round(10 * s)))
d.text((X(ax + 90), Y(GROUND - 520)), 'Antenne relais', font=inter(60, True), fill=rgb('f1c40f'))
# data center
dx = 2750
d.rectangle([X(dx), Y(GROUND - 230), X(dx + 520), Y(GROUND)], fill=rgb('2f3b4f'))
for k in range(6):
    d.rectangle([X(dx + 30 + k * 82), Y(GROUND - 190), X(dx + 90 + k * 82), Y(GROUND - 30)], fill=rgb('17202e'))
    for j in range(5):
        d.rectangle([X(dx + 40 + k * 82), Y(GROUND - 175 + j * 28), X(dx + 50 + k * 82), Y(GROUND - 167 + j * 28)], fill=rgb('3fe0ff'))
d.text((X(dx), Y(GROUND - 320)), 'Data center', font=inter(60, True), fill=rgb('7fd3e6'))
# station d'atterrissement (sur la côte, le câble y sort de la mer)
sx = SHORE_FR - 330
d.rectangle([X(sx), Y(GROUND - 170), X(sx + 260), Y(GROUND)], fill=rgb('e8e2d0'))
d.polygon([(X(sx - 20), Y(GROUND - 170)), (X(sx + 130), Y(GROUND - 250)), (X(sx + 280), Y(GROUND - 170))], fill=rgb('b2442c'))
d.rectangle([X(sx + 100), Y(GROUND - 90), X(sx + 160), Y(GROUND)], fill=rgb('5a4a30'))
d.line([(X(sx + 130), Y(GROUND)), (X(sx + 130), Y(GROUND + 120)), (X(SHORE_FR + 150), Y(GROUND + 160))], fill=rgb('ffb066'), width=round(16 * s))
for i, t in enumerate(['Station', 'd\'atterrissement']):
    d.text((X(sx - 560), Y(GROUND - 330 + i * 75)), t, font=inter(62, True), fill=rgb('ffb066'))
# station côté américain + New York
ux = SHORE_US + 80
d.rectangle([X(ux), Y(GROUND - 150), X(ux + 220), Y(GROUND)], fill=rgb('e8e2d0'))
d.polygon([(X(ux - 20), Y(GROUND - 150)), (X(ux + 110), Y(GROUND - 220)), (X(ux + 240), Y(GROUND - 150))], fill=rgb('b2442c'))
d.line([(X(SHORE_US - 150), Y(GROUND + 160)), (X(ux + 110), Y(GROUND + 100)), (X(ux + 110), Y(GROUND))], fill=rgb('ffb066'), width=round(16 * s))
for i, (w, h) in enumerate([(150, 500), (120, 820), (170, 600), (110, 1100), (160, 700), (130, 900), (180, 520), (140, 760)]):
    building(SHORE_US + 420 + i * 190, w, h, col='1b2436', seed=10 + i)
d.text((X(SHORE_US + 2000), Y(GROUND + 60)), 'NEW YORK', font=bebas(170), fill=(235, 235, 245))

# --- noms des couches (marge gauche) -------------------------------------------------
for t, y, col in [('ESPACE', -3000, 'b26bd6'), ('CIEL', -1050, 'f1c40f'), ('SURFACE', -120, '2ecc71'), ('SOUS LE SOL', 700, '00d2ff')]:
    d.rectangle([X(SX + 60), Y(y - 140), X(SX + 85), Y(y + 140)], fill=rgb(col))
    d.text((X(SX + 140), Y(y - 160)), t, font=bebas(300), fill=(240, 240, 250))
d.rectangle([X(4250), Y(2150), X(4275), Y(2310)], fill=rgb('ff7a18'))
d.text((X(4320), Y(2125)), 'FOND DE L\'OCÉAN', font=bebas(200), fill=(240, 240, 250))

im.save('media/carte-fond.jpg', quality=88, optimize=True, progressive=True)
print('carte-fond', im.size)
