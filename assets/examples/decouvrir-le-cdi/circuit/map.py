# Décor de la carte : la VILLE DU LIVRE vue de dessus, dessinée dans le repère du monde 3D
# (geom.json écrit par build.mjs). Chaque lieu est posé sous la photo de son étape.
# Usage : node build.mjs && python3 map.py && node build.mjs
import json, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

G = json.load(open('geom.json'))
FX, FY, FW, FH = G['frame']; CX, CY = G['center']; KP = G['kPhoto']
PW, PH = G['photo'][0] * KP, G['photo'][1] * KP          # taille apparente d'une photo
IW = 4000; IH = round(IW * FH / FW); s = IW / FW
X = lambda x: (x - FX) * s
Y = lambda y: (y - FY) * s
def A(x, y):                                              # point ancré sur une photo (D) -> carte (ZB)
    return CX + (x - CX) * KP, CY + (y - CY) * KP
S = {k: A(v['x'], v['y']) for k, v in G['S'].items()}
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
F = 'fonts/'
bebas = lambda n: ImageFont.truetype(F + 'BebasNeue.ttf', round(n * s))
inter = lambda n, w='Regular': ImageFont.truetype(F + f'Inter-{w}.ttf', round(n * s))
random.seed(3)

im = Image.new('RGB', (IW, IH), rgb('ece6d4'))
d = ImageDraw.Draw(im)
# grain de papier
noise = Image.effect_noise((IW, IH), 18).filter(ImageFilter.GaussianBlur(2))
im = Image.composite(Image.new('RGB', (IW, IH), rgb('ddd5bf')), im, noise.point(lambda v: max(0, v - 120)))
d = ImageDraw.Draw(im)

def R(x0, y0, x1, y1, fill, r=60, outline=None, w=0):
    d.rounded_rectangle([X(x0), Y(y0), X(x1), Y(y1)], radius=r * s, fill=rgb(fill) if fill else None,
                        outline=rgb(outline) if outline else None, width=round(w * s))
def box(k, mx=110, top=260, bot=110):                     # emprise d'un lieu autour d'une photo
    x, y = S[k]; return x - PW / 2 - mx, y - PH / 2 - top, x + PW / 2 + mx, y + PH / 2 + bot
def label(x, y, t, n=200, col='2b2a33', anchor='mm'):
    d.text((X(x), Y(y)), t, font=bebas(n), fill=rgb(col), anchor=anchor)
def sub(x, y, t, n=78, col='4a4650', anchor='mm', w='SemiBold'):
    d.text((X(x), Y(y)), t, font=inter(n, w), fill=rgb(col), anchor=anchor)
def tree(x, y, r=110):
    d.ellipse([X(x - r), Y(y - r * .2) , X(x + r), Y(y + r * 1.8 - r * .2)], fill=(0, 0, 0, 0)) if False else None
    d.ellipse([X(x - r + 25), Y(y - r + 35), X(x + r + 25), Y(y + r + 35)], fill=rgb('c9c1a8'))
    d.ellipse([X(x - r), Y(y - r), X(x + r), Y(y + r)], fill=rgb(random.choice(['7fae6e', '6d9f5e', '8dbb7a'])))
    d.ellipse([X(x - r * .45), Y(y - r * .55), X(x + r * .1), Y(y - r * .05)], fill=rgb('a5cf91'))

# --- rues -------------------------------------------------------------------------
ROAD, LINE = 'c8c1b0', 'f7f3e8'
def street(x0, y0, x1, y1, w=230):
    if y0 == y1: d.rectangle([X(x0), Y(y0 - w / 2), X(x1), Y(y0 + w / 2)], fill=rgb(ROAD))
    else: d.rectangle([X(x0 - w / 2), Y(y0), X(x0 + w / 2), Y(y1)], fill=rgb(ROAD))
    L = math.hypot(x1 - x0, y1 - y0); n = int(L // 170)
    for i in range(n):
        t0, t1 = i * 170 / L, (i * 170 + 90) / L
        d.line([(X(x0 + (x1 - x0) * t0), Y(y0 + (y1 - y0) * t0)), (X(x0 + (x1 - x0) * t1), Y(y0 + (y1 - y0) * t1))], fill=rgb(LINE), width=round(16 * s))
yA = (S['auteur'][1] + S['libr'][1]) / 2 + 20          # avenue entre les deux rangées du haut
yB = (S['libr'][1] + S['equip'][1]) / 2 - 60           # avenue au-dessus du collège
street(FX, yA, FX + FW, yA); street(FX, yB, FX + FW, yB)
for x in [(S['auteur'][0] + S['editeur'][0]) / 2, (S['couv'][0] + S['impr'][0]) / 2 - 40]:
    street(x, FY, x, yB)
xC = (S['equip'][0] + S['boite'][0]) / 2 - 650           # rue entre le collège et la cour
street(xC + 1150, yB, xC + 1150, FY + FH)

# --- lieux -------------------------------------------------------------------------
# Maison de l'autrice : toit de tuiles + jardin
x0, y0, x1, y1 = box('auteur', top=300)
R(x0 - 60, y0 - 40, x1 + 60, y1 + 60, 'cfe0b4', 90)                     # jardin
R(x0, y0, x1, y1, 'd98c6a', 40)
for yy in range(int(y0 + 40), int(y1), 70): d.line([(X(x0 + 20), Y(yy)), (X(x1 - 20), Y(yy))], fill=rgb('c77b5b'), width=round(10 * s))
label((x0 + x1) / 2, y0 + 130, "CHEZ L'AUTRICE", 190, 'ffffff')
tree(x1 + 10, y1 + 10, 90)
# Titre : cartouche du plan + rose des vents
tx, ty = S['titre']
label(tx, ty - PH / 2 - 150, 'PLAN DE LA VILLE DU LIVRE', 170, '2b2a33')
def compass(x, y, r=230):
    d.ellipse([X(x - r), Y(y - r), X(x + r), Y(y + r)], outline=rgb('6b6470'), width=round(14 * s))
    for a, c in [(0, 'c0392b'), (90, '6b6470'), (180, '6b6470'), (270, '6b6470')]:
        ra = math.radians(a); p = (x + r * 1.1 * math.sin(ra), y - r * 1.1 * math.cos(ra))
        l = (x + 60 * math.cos(ra), y + 60 * math.sin(ra)); rr = (x - 60 * math.cos(ra), y - 60 * math.sin(ra))
        d.polygon([(X(p[0]), Y(p[1])), (X(l[0]), Y(l[1])), (X(rr[0]), Y(rr[1]))], fill=rgb(c))
    d.text((X(x), Y(y - r * 1.25)), 'N', font=bebas(130), fill=rgb('c0392b'), anchor='mb')
# Maison d'édition
x0, y0 = box('editeur')[:2]; x1, y1 = box('couv')[2:]
R(x0, y0, x1, y1, 'b9a6d6', 50)
for i in range(int((x1 - x0) // 230)):
    xx = x0 + 120 + i * 230; d.rectangle([X(xx), Y(y0 + 30), X(xx + 120), Y(y0 + 70)], fill=rgb('d8cdea'))
label((x0 + x1) / 2, y0 + 140, "ÉDITIONS IMAGINAIRES", 190, '3d2a5c')
sub((x0 + x1) / 2, y1 - 52, "bureau de l'éditrice  ·  atelier de l'illustrateur", 80, '3d2a5c')
# Imprimerie (toit en dents de scie) + BnF
x0, y0 = box('impr')[:2]; x1, y1 = box('ident')[2:]
R(x0, y0, x1, y1, 'e9ae78', 40)
for xx in range(int(x0 + 40), int(x1 - 120), 190):
    d.polygon([(X(xx), Y(y0 + 230)), (X(xx + 150), Y(y0 + 130)), (X(xx + 150), Y(y0 + 230))], fill=rgb('d38f57'))
label((x0 + x1) / 2, y0 + 110, 'IMPRIMERIE', 190, '5a2e0c')
d.rectangle([X(x1 - 160), Y(y0 - 220), X(x1 - 60), Y(y0 + 10)], fill=rgb('8a5a3a'))       # cheminée
for k in range(3): d.ellipse([X(x1 - 200 + k * 70), Y(y0 - 330 - k * 90), X(x1 - 60 + k * 90), Y(y0 - 220 - k * 90)], fill=rgb('d9d3c6'))
bx, by = x1 + 1150, S['impr'][1] + 350                                                     # BnF : 4 tours en livre ouvert
R(bx - 900, by - 900, bx + 900, by + 700, 'd9d2c0', 50)
d.rectangle([X(bx - 520), Y(by - 520), X(bx + 520), Y(by + 320)], fill=rgb('9fbf8a'))     # jardin central
for sx, sy in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    cxx, cyy = bx + sx * 620, by - 100 + sy * 420
    # tour en L (un livre ouvert, vu de dessus), angle vers l'extérieur
    d.rectangle(sorted_box := [X(min(cxx, cxx - sx * 360)), Y(min(cyy, cyy - sy * 90)), X(max(cxx, cxx - sx * 360)), Y(max(cyy, cyy - sy * 90))], fill=rgb('7d8fa8'))
    d.rectangle([X(min(cxx, cxx - sx * 90)), Y(min(cyy, cyy - sy * 300)), X(max(cxx, cxx - sx * 90)), Y(max(cyy, cyy - sy * 300))], fill=rgb('7d8fa8'))
d.text((X(bx), Y(by - 100)), 'BnF', font=inter(190, 'Bold'), fill=rgb('2b2a33'), anchor='mm')
sub(bx, by + 520, 'Bibliothèque nationale de France', 74)
# flèche pointillée : dépôt légal
ix, iy = S['ident'][0] + PW / 2, S['ident'][1]
pts = [(ix + 20, iy), (bx - 200, iy), (bx - 200, by + 700)]
for (ax, ay), (cx2, cy2) in zip(pts, pts[1:]):
    L = math.hypot(cx2 - ax, cy2 - ay)
    for i in range(int(L // 110)):
        t0, t1 = i * 110 / L, (i * 110 + 60) / L
        d.line([(X(ax + (cx2 - ax) * t0), Y(ay + (cy2 - ay) * t0)), (X(ax + (cx2 - ax) * t1), Y(ay + (cy2 - ay) * t1))], fill=rgb('e67e22'), width=round(26 * s))
d.polygon([(X(bx - 290), Y(by + 760)), (X(bx - 110), Y(by + 760)), (X(bx - 200), Y(by + 640))], fill=rgb('e67e22'))
sub(bx + 300, iy - 60, '1 exemplaire :', 72, 'a8561a', 'lm'); sub(bx + 300, iy + 40, 'le dépôt légal', 72, 'a8561a', 'lm')
# Entrepôt
x0, y0, x1, y1 = box('entrepot')
R(x0, y0, x1, y1, 'a9c3d4', 30)
for xx in range(int(x0 + 60), int(x1 - 60), 120): d.line([(X(xx), Y(y0 + 230)), (X(xx), Y(y1 - 20))], fill=rgb('98b4c7'), width=round(10 * s))
label((x0 + x1) / 2, y0 + 120, 'ENTREPÔT DU DISTRIBUTEUR', 165, '1d3b52')
# Librairie avec store rayé
x0, y0, x1, y1 = box('libr')
R(x0, y0, x1, y1, 'f2d9a8', 30)
for i, xx in enumerate(range(int(x0), int(x1), 110)):
    d.rectangle([X(xx), Y(y0), X(min(x1, xx + 110)), Y(y0 + 60)], fill=rgb('1f8fbf' if i % 2 else 'ffffff'))
label((x0 + x1) / 2, y0 + 150, 'LIBRAIRIE', 190, '1d3b52')
# Parc + légende (à gauche, entre les deux avenues)
px0, py0, px1, py1 = FX + 80, yA + 170, S['libr'][0] - PW / 2 - 220, yB - 170
R(px0, py0, px1, py1, 'cfe0b4', 90)
for _ in range(9): tree(random.uniform(px0 + 150, px1 - 150), random.uniform(py0 + 150, py1 - 150), random.uniform(80, 120))
lx0, ly0 = px0 + 260, py0 + 120
R(lx0, ly0, lx0 + 1950, ly0 + 1000, 'fbf7ec', 40, '6b6470', 10)
d.text((X(lx0 + 90), Y(ly0 + 70)), 'LE VOYAGE DU LIVRE', font=bebas(150), fill=rgb('2b2a33'))
C = [('Créer', 'b26bd6'), ('Fabriquer', 'ff7a18'), ('Vendre', '1f9bd1'), ('Au CDI', '27ae60'), ('Nouvelle vie', 'e2b007')]
for i, (t, c) in enumerate(C):
    xx = lx0 + 90 + (i % 2) * 940; yy = ly0 + 330 + (i // 2) * 210
    d.line([(X(xx), Y(yy)), (X(xx + 220), Y(yy))], fill=rgb(c), width=round(60 * s))
    d.text((X(xx + 270), Y(yy)), t, font=inter(95, 'Bold'), fill=rgb('2b2a33'), anchor='lm')
# Collège : plan du CDI
cx0 = S['rayon'][0] - PW / 2 - 330; cy0 = S['equip'][1] - PH / 2 - 330
cx1 = xC + 1150 - 180; cy1 = FY + FH - 60
R(cx0 - 60, cy0 - 270, cx1 + 60, cy1, 'b8b2a6', 30)                                       # bâtiment
label((cx0 + cx1) / 2, cy0 - 140, 'LE COLLÈGE  ·  LE CDI', 200, '2b2a33')
R(cx0, cy0, cx1, cy1 - 60, 'f4e4c4', 10)                                                     # parquet
for xx in range(int(cx0), int(cx1), 140): d.line([(X(xx), Y(cy0)), (X(xx), Y(cy1 - 60))], fill=rgb('ead6af'), width=round(6 * s))
d.rectangle([X(cx0), Y(cy0), X(cx1), Y(cy1 - 60)], outline=rgb('4a4038'), width=round(44 * s))
dy0, dy1 = S['desherb'][1] - 230, S['desherb'][1] + 230                                    # porte vers la cour
d.rectangle([X(cx1 - 30), Y(dy0), X(cx1 + 30), Y(dy1)], fill=rgb('f4e4c4'))
d.arc([X(cx1 - 460), Y(dy0), X(cx1 + 0), Y(dy0 + 460)], 270, 360, fill=rgb('4a4038'), width=round(10 * s))
def shelf(x0, y0, x1, y1):                                                                 # étagère vue de dessus
    d.rectangle([X(x0), Y(y0), X(x1), Y(y1)], fill=rgb('8b6a4a'))
    horiz = (x1 - x0) > (y1 - y0); L = (x1 - x0) if horiz else (y1 - y0); n = int(L // 45)
    for i in range(n):
        c = random.choice(['c0392b', '2980b9', '27ae60', 'f39c12', '8e44ad', 'ecf0f1', '16a085'])
        if horiz: d.rectangle([X(x0 + i * 45 + 5), Y(y0 + 18), X(x0 + i * 45 + 38), Y(y1 - 18)], fill=rgb(c))
        else: d.rectangle([X(x0 + 18), Y(y0 + i * 45 + 5), X(x1 - 18), Y(y0 + i * 45 + 38)], fill=rgb(c))
shelf(cx0 + 40, cy0 + 120, cx0 + 170, cy1 - 260)                                            # rayons, mur de gauche
shelf(cx0 + 300, cy0 + 40, S['nouv'][0] - PW / 2 - 60, cy0 + 150)                           # rayons, mur du haut
zones = [('equip', 'Bureau du professeur documentaliste'), ('nouv', 'Présentoir des nouveautés'),
         ('rayon', 'Rayons des romans'), ('lecteurs', 'Banque de prêt · coin lecture'), ('desherb', 'Réserve · désherbage')]
for k, t in zones:
    x, y = S[k]
    R(x - PW / 2 - 50, y - PH / 2 - 50, x + PW / 2 + 50, y + PH / 2 + 150, 'ead2a4', 30)
for tx_, ty_ in [((S['nouv'][0] + S['equip'][0]) / 2, (S['equip'][1] + S['desherb'][1]) / 2 + 30),
                 ((S['rayon'][0] + S['nouv'][0]) / 2, (S['equip'][1] + S['desherb'][1]) / 2 + 30)]:
    d.ellipse([X(tx_ - 150), Y(ty_ - 150), X(tx_ + 150), Y(ty_ + 150)], fill=rgb('c9a77c'))     # tables rondes
    for a in range(0, 360, 72):
        ra = math.radians(a); d.ellipse([X(tx_ + 220 * math.cos(ra) - 50), Y(ty_ + 220 * math.sin(ra) - 50), X(tx_ + 220 * math.cos(ra) + 50), Y(ty_ + 220 * math.sin(ra) + 50)], fill=rgb('6f8fa8'))
# Cour de l'école
ux0, uy0, ux1, uy1 = cx1 + 300, yB + 200, FX + FW - 80, FY + FH - 60
R(ux0, uy0, ux1, uy1, 'd6dcc8', 60)
label((ux0 + ux1) / 2, uy0 + 150, "LA COUR DE L'ÉCOLE", 200, '2b2a33')
bxx, byy = S['boite']
gx0, gx1 = bxx + PW / 2 + 250, ux1 - 200                                                   # terrain de jeu
d.rectangle([X(gx0), Y(uy0 + 380), X(gx1), Y(uy1 - 200)], outline=rgb('ffffff'), width=round(18 * s))
gm = (gx0 + gx1) / 2; d.line([(X(gm), Y(uy0 + 380)), (X(gm), Y(uy1 - 200))], fill=rgb('ffffff'), width=round(18 * s))
d.ellipse([X(gm - 220), Y((uy0 + uy1) / 2 + 90 - 220), X(gm + 220), Y((uy0 + uy1) / 2 + 90 + 220)], outline=rgb('ffffff'), width=round(18 * s))
for i in range(5): tree(ux0 + 220 + i * 330, uy0 + 450, 120)
R(bxx - PW / 2 - 50, byy - PH / 2 - 50, bxx + PW / 2 + 50, byy + PH / 2 + 150, 'c4cdb1', 30)
sub(bxx, byy + PH / 2 + 85, 'La boîte à livres', 80, '3d4a2a', w='Bold')

# --- le chemin du livre (sous les photos) -------------------------------------------
order = [('titre', 'b26bd6'), ('auteur', 'b26bd6'), ('editeur', 'b26bd6'), ('couv', 'ff7a18'), ('impr', 'ff7a18'),
         ('ident', '1f9bd1'), ('entrepot', '1f9bd1'), ('libr', '27ae60'), ('equip', '27ae60'), ('nouv', '27ae60'),
         ('rayon', '27ae60'), ('lecteurs', '27ae60'), ('desherb', 'e2b007'), ('porte', 'e2b007'), ('boite', None)]
S['porte'] = (cx1 + 150, S['desherb'][1])
for (a, c), (b, _) in zip(order, order[1:]):
    (ax, ay), (bx2, by2) = S[a], S[b]
    d.line([(X(ax), Y(ay)), (X(bx2), Y(by2))], fill=rgb('ffffff'), width=round(95 * s))
    d.line([(X(ax), Y(ay)), (X(bx2), Y(by2))], fill=rgb(c), width=round(60 * s))
# camions de livraison
def truck(x, y, flip=False):
    sgn = -1 if flip else 1
    d.rounded_rectangle([X(x - 170), Y(y - 85), X(x + 110), Y(y + 85)], radius=20 * s, fill=rgb('ffffff'), outline=rgb('2b2a33'), width=round(10 * s))
    d.rounded_rectangle([X(x + 120), Y(y - 70), X(x + 220), Y(y + 70)], radius=20 * s, fill=rgb('1f9bd1'), outline=rgb('2b2a33'), width=round(10 * s))
    d.text((X(x - 30), Y(y)), 'LIVRES', font=bebas(80), fill=rgb('1f9bd1'), anchor='mm')
for x, y in [((S['ident'][0] + S['entrepot'][0]) / 2, yA), ((S['entrepot'][0] + S['libr'][0]) / 2, yB)]: truck(x, y)
# noms des espaces du CDI, par-dessus le chemin
for k, t in zones:
    x, y = S[k]; f = inter(78, 'Bold'); tw = d.textlength(t, font=f) / s
    R(x - tw / 2 - 40, y + PH / 2 + 35, x + tw / 2 + 40, y + PH / 2 + 135, 'ead2a4', 30)
    sub(x, y + PH / 2 + 85, t, 78, '5a4630', w='Bold')
im.save('media/carte-ville.jpg', quality=85, optimize=True); print('ok', im.size)
