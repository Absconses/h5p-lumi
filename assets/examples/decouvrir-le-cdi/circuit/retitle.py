# Ajoute l'étape « documentaires » : retitre des fonds cinéma déjà cuits (titre/surtitre) et
# dessine le fond « romans » (couvertures inventées du module CDI, aucune photo nouvelle).
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, '.')
from bg import plan
FONTS = 'fonts'
def retitle(src, out, kicker, title=None, accent='27ae60'):
    im = Image.open(src).convert('RGB'); W, H = im.size
    box = (40, 50, 1100, 250 if title else 125)
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rectangle(box, fill=255); m = m.filter(ImageFilter.GaussianBlur(28))
    dark = im.filter(ImageFilter.GaussianBlur(30)).point(lambda v: v * 0.35)
    im = Image.composite(dark, im, m); d = ImageDraw.Draw(im)
    acc = tuple(int(accent[i:i + 2], 16) for i in (0, 2, 4)); x0 = 80
    d.rectangle([x0, 92, x0 + 70, 98], fill=acc)
    d.text((x0 + 88, 76), kicker.upper(), font=ImageFont.truetype(f'{FONTS}/Inter-ExtraBold.ttf', 30), fill=acc)
    if title: d.text((x0, 120), title, font=ImageFont.truetype(f'{FONTS}/BebasNeue.ttf', 118), fill=(255, 255, 255))
    im.save(out, quality=86, optimize=True, progressive=True)

M = 'media/'
retitle(M + 's10-rayon.jpg', M + 's10b-documentaires.jpg', 'Au CDI · Étape 11 · Rangé par sujet', 'LES DOCUMENTAIRES')
retitle(M + 's11-lecteurs.jpg', M + 's11-lecteurs.jpg', 'Au CDI · Étape 12 · Le prêt')
retitle(M + 's12-desherbage.jpg', M + 's12-desherbage.jpg', 'Au CDI · Étape 13 · Faire de la place')
retitle(M + 's13-boite.jpg', M + 's13-boite.jpg', 'Nouvelle vie · Étape 14', accent='e2b007')

# Fond « romans » : un mur de rayonnages, couvertures de face, pastille de genre sur chacune
COV = sys.argv[1]
W, H = 1600, 900
im = Image.new('RGB', (W, H), (58, 40, 28)); d = ImageDraw.Draw(im)
for y in range(0, H, 6): d.line([(0, y), (W, y)], fill=(62 + (y // 6) % 3 * 3, 43, 30))
genres = [('enquete', 'c0392b'), ('fantasy', '8e44ad'), ('fantastique', '2c3e50'), ('sf', '2980b9'), ('romance', 'e84393'),
          ('aventure', '27ae60'), ('animalier', 'd35400'), ('mythe', 'f1c40f'), ('reel', '16a085')]
cw, ch = 190, 285
for i, (g, col) in enumerate(genres):
    r, c = divmod(i, 3); x = 760 + c * 270; y = 20 + r * 295
    if r == 0: y += 10
    d.rectangle([700, y + ch + 2, 1600, y + ch + 22], fill=(120, 84, 52))           # tablette
    cv = Image.open(f'{COV}/couv-{g}.jpg').convert('RGB').resize((cw, ch))
    im.paste(cv, (x, y))
    rgb = tuple(int(col[k:k + 2], 16) for k in (0, 2, 4))
    d.ellipse([x + cw - 46, y + ch - 46, x + cw - 10, y + ch - 10], fill=rgb, outline=(255, 255, 255), width=4)
im.save('src-romans.jpg', quality=92)
plan('src-romans.jpg', M + 's10-romans.jpg', title='LES ROMANS', kicker='Au CDI · Étape 10 · Rangé par genre', accent='27ae60', side='left', fx=0.5, dark=0.9)
print('ok')
