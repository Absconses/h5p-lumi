# Décor de l'Impressive Presentation « L'iceberg de mon identité numérique ».
# Une seule image 4800 x 2900 = toute la toile 3D (1 px = 1 unité, origine au centre).
# Les 4 couches de l'iceberg portent le sens : ce que je montre / ce que les autres publient /
# ce que les applis enregistrent / ce que les algorithmes devinent.
# usage : python3 iceberg.py <dossier_media>
import sys, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else 'media'
W, H = 4800, 2900                          # y monde de -1350 (ciel) à +1550 (fond)
WL = -500                                  # ligne de flottaison (y monde)
P = lambda x, y: (x + W / 2, y + 1350)    # monde -> pixels
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
FD = '/usr/share/fonts/opentype/inter/'
font = lambda n, w='Bold': ImageFont.truetype(f'{FD}InterDisplay-{w}.otf', n)
sym = lambda n: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', n)
random.seed(7)

def lerp(a, b, t): return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

im = Image.new('RGB', (W, H))
d = ImageDraw.Draw(im)
wl = P(0, WL)[1]
sky0, sky1, sea0, sea1 = rgb('dff1fb'), rgb('b7def3'), rgb('2f86c4'), rgb('081c3a')
for y in range(H):
    if y < wl: c = lerp(sky0, sky1, y / wl)
    else: c = lerp(sea0, sea1, ((y - wl) / (H - wl)) ** 0.8)
    d.line([(0, y), (W, y)], fill=c)

# --- iceberg ------------------------------------------------------------------------------
def jag(pts, amp=26, step=90):
    """bord irrégulier : subdivise chaque segment et décale un peu les points"""
    out = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) // step))
        for i in range(n):
            t = i / n
            out.append((x0 + (x1 - x0) * t + random.uniform(-amp, amp), y0 + (y1 - y0) * t + random.uniform(-amp, amp)))
    return out

tip = [(-560, WL), (-430, -720), (-300, -820), (-200, -980), (-90, -1060), (10, -1120), (120, -1040),
       (230, -930), (300, -960), (420, -780), (600, WL)]
body = [(-600, WL), (-980, -200), (-1250, 200), (-1380, 700), (-1250, 1080), (-820, 1290), (0, 1330),
        (800, 1280), (1200, 1050), (1390, 640), (1230, 160), (960, -220), (640, WL)]
tipJ = jag(tip[:-1] + [tip[-1]], 18, 70)
bodyJ = jag(body, 34, 110)

# partie immergée : translucide, plus sombre en profondeur
under = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ud = ImageDraw.Draw(under)
ud.polygon([P(*p) for p in bodyJ], fill=(150, 205, 235, 165))
# facettes (bandes plus claires)
for (x0, y0, x1, y1) in [(-980, -200, -700, 300), (-1250, 200, -900, 760), (960, -220, 700, 260), (1230, 160, 900, 650)]:
    ud.line([P(x0, y0), P(x1, y1)], fill=(215, 240, 252, 120), width=10)
mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon([P(*p) for p in bodyJ], fill=255)
fac = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fac.paste(under, (0, 0), mask)
im = Image.alpha_composite(im.convert('RGBA'), fac)
# assombrir le bas de l'iceberg (profondeur)
shade = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(shade)
for y in range(int(wl), H):
    a = int(110 * ((y - wl) / (H - wl)) ** 1.2)
    sd.line([(0, y), (W, y)], fill=(8, 28, 58, a))
sm = Image.new('L', (W, H), 0); sm.paste(mask, (0, 0))
im.paste(Image.alpha_composite(im, shade).convert('RGB'), (0, 0), sm)
im = im.convert('RGB')
d = ImageDraw.Draw(im)
# pointe : blanche, ombrée à droite
d.polygon([P(*p) for p in tipJ], fill=rgb('f7fcff'))
d.polygon([P(10, -1120), P(120, -1040), P(230, -930), P(300, -960), P(420, -780), P(600, WL), P(60, WL), P(-20, -820)],
          fill=rgb('d6ebf7'))
d.line([P(*p) for p in tipJ] + [P(*tipJ[0])], fill=rgb('7fb6d8'), width=6)
# reflets de surface
for k in range(60):
    x = random.uniform(-2400, 2400); y = WL + random.uniform(8, 120)
    if -700 < x < 700 or x > 1300: continue
    L = random.uniform(40, 160)
    d.line([P(x, y), P(x + L, y)], fill=rgb('7fc0e8'), width=4)
d.line([P(-2400, WL), P(2400, WL)], fill=rgb('e8f6ff'), width=6)

# --- séparations de couches ------------------------------------------------------------------
def dashed(y, x0, x1, col='ffffff', w=5, dash=40, gap=26):
    x = x0
    while x < x1:
        d.line([P(x, y), P(min(x + dash, x1), y)], fill=rgb(col), width=w); x += dash + gap

def half_width(y):                       # largeur approx. de l'iceberg à la hauteur y (pour les pointillés)
    xs = []
    for (x0, y0), (x1, y1) in zip(body, body[1:] + body[:1]):
        if (y0 - y) * (y1 - y) <= 0 and y0 != y1:
            xs.append(x0 + (x1 - x0) * (y - y0) / (y1 - y0))
    return min(xs), max(xs)
for y in (100, 700):
    a, b = half_width(y); dashed(y, a + 30, b - 30, 'e4f3fb')

# --- titres de couches (sur l'iceberg) -------------------------------------------------------
def label(y, t, n=64, col='0b2545', sub=None):
    x, yy = P(0, y)
    d.text((x, yy), t, font=font(n), fill=rgb(col), anchor='mm')
    if sub: d.text((x, yy + n * 0.95), sub, font=font(int(n * 0.55), 'Medium'), fill=rgb(col), anchor='mm')
label(-610, 'CE QUE JE MONTRE', 54, '0b2545', 'traces volontaires')
label(-330, 'CE QUE LES AUTRES', 62, 'ffffff')
label(-260, 'PUBLIENT SUR MOI', 62, 'ffffff')
d.text(P(0, -185), 'traces laissées par les autres', font=font(36, 'Medium'), fill=rgb('ffffff'), anchor='mm')
label(330, 'CE QUE LES APPLIS', 64, 'ffffff')
label(405, 'ENREGISTRENT', 64, 'ffffff')
d.text(P(0, 480), 'traces involontaires', font=font(36, 'Medium'), fill=rgb('ffffff'), anchor='mm')
label(900, 'CE QUE LES ALGORITHMES', 64, 'ffffff')
label(975, 'DEVINENT', 64, 'ffffff')
d.text(P(0, 1050), 'données déduites', font=font(36, 'Medium'), fill=rgb('ffffff'), anchor='mm')

# --- pictogrammes simples dans chaque couche ---------------------------------------------------
def badge(x, y, glyph, bg, fg='ffffff', r=62, n=64):
    cx, cy = P(x, y)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=rgb(bg), outline=rgb('ffffff'), width=6)
    d.text((cx, cy + 2), glyph, font=sym(n), fill=rgb(fg), anchor='mm')
# pointe : profil, cœur, bulle
badge(-180, -860, '☺', 'e76f51'); badge(40, -980, '♥', 'e63946'); badge(250, -840, '✎', 'f4a261')
# autres : @, appareil photo (carré), bulle
badge(-520, -60, '@', '6a4c93', n=60); badge(0, -60, '▣', '6a4c93'); badge(520, -60, '❝', '6a4c93')
# applis : lieu, horloge, loupe
badge(-700, 580, '', '2a9d8f'); badge(0, 600, '◷', '2a9d8f', n=70); badge(700, 580, '', '2a9d8f')
cx, cy = P(-700, 580)                       # épingle de localisation
d.ellipse([cx - 24, cy - 40, cx + 24, cy + 8], fill=rgb('ffffff')); d.polygon([(cx - 21, cy - 6), (cx + 21, cy - 6), (cx, cy + 36)], fill=rgb('ffffff'))
d.ellipse([cx - 9, cy - 25, cx + 9, cy - 7], fill=rgb('2a9d8f'))
cx, cy = P(700, 580)                        # loupe (recherches)
d.ellipse([cx - 30, cy - 34, cx + 14, cy + 10], outline=rgb('ffffff'), width=9); d.line([(cx + 8, cy + 4), (cx + 30, cy + 28)], fill=rgb('ffffff'), width=12)
# algorithmes : cible, engrenage, point d'interrogation
badge(-620, 1160, '◎', 'e9c46a', '0b2545', n=70); badge(0, 1200, '⚙', 'e9c46a', '0b2545', n=70)
badge(620, 1160, '?', 'e9c46a', '0b2545', n=70)

# --- titre et légende dans le ciel -------------------------------------------------------------
d.text(P(-2300, -1250), "L'iceberg de mon", font=font(96), fill=rgb('0b2545'), anchor='ls')
d.text(P(-2300, -1130), 'identité numérique', font=font(96), fill=rgb('e76f51'), anchor='ls')
d.text(P(2300, -560), 'au-dessus : ce que je vois', font=font(38, 'SemiBold'), fill=rgb('0b2545'), anchor='rs')
d.text(P(2300, -440), 'en dessous : ce que je ne vois pas', font=font(38, 'SemiBold'), fill=rgb('ffffff'), anchor='rs')

im.save(f'{OUT}/iceberg.jpg', quality=84, optimize=True)
# couverture du livre : le même iceberg, recadré en 16:9 serré
cov = im.crop((int(P(-1500, 0)[0]), int(P(0, -1250)[1]), int(P(1500, 0)[0]), int(P(0, 1350)[1]))).resize((1600, 1387))
cov = cov.crop((0, 0, 1600, 1000)) if False else im.crop((int(P(-2160, 0)[0]), int(P(0, -1300)[1]), int(P(2160, 0)[0]), int(P(0, 1130)[1]))).resize((1600, 900))
cov.save(f'{OUT}/couverture.jpg', quality=84, optimize=True)
print('ok', im.size)
