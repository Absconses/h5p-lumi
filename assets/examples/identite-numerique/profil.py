# Faux profil de réseau social d'« Inès » (personnage fictif) pour l'onglet « Avant de publier ».
# Chaque détail visible est un indice volontairement laissé : âge, collège, horaire, rue.
# usage : python3 profil.py <dossier_raw> <dossier_media>
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
RAW, OUT = sys.argv[1], sys.argv[2]
FD = '/usr/share/fonts/opentype/inter/'
f = lambda n, w='Regular': ImageFont.truetype(f'{FD}Inter-{w}.otf', n)
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
W, H = 1400, 700
im = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(im)
d.rounded_rectangle([4, 4, W - 5, H - 5], 36, outline=rgb('d0d7de'), width=4)
# colonne gauche : en-tête, avatar dessiné (pas de vraie personne), compteurs, bio
d.text((50, 50), 'ines.basket14', font=f(46, 'Bold'), fill=rgb('111111'))
d.rounded_rectangle([430, 48, 690, 104], 28, fill=rgb('e8f5e9'))
d.text((560, 76), 'Compte public', font=f(28, 'SemiBold'), fill=rgb('2e7d32'), anchor='mm')
d.ellipse([50, 140, 210, 300], fill=rgb('f4a261')); d.text((130, 222), 'I', font=f(90, 'Bold'), fill='white', anchor='mm')
for i, (n, t) in enumerate([('38', 'publications'), ('212', 'abonnés'), ('180', 'abonnements')]):
    x = 320 + i * 150
    d.text((x, 195), n, font=f(40, 'Bold'), fill=rgb('111111'), anchor='mm')
    d.text((x, 245), t, font=f(23), fill=rgb('555555'), anchor='mm')
d.text((50, 345), 'Inès M.', font=f(36, 'Bold'), fill=rgb('111111'))
bio = ['4e B au collège Jean-Moulin', 'Basket : entraînement le mardi à 18 h,', 'gymnase Pasteur', 'Anniversaire : 12 mars']
for i, t in enumerate(bio):
    d.text((50, 405 + i * 48), t, font=f(33), fill=rgb('222222'))
d.line([(730, 40), (730, H - 40)], fill=rgb('e1e4e8'), width=3)
# colonne droite : trois publications
caps = [('basket', 'Entraînement du mardi !'), ('chat', 'Mon chat Pixel'), ('neige', 'Devant chez moi, il neige !')]
for (k, c), (x, y, S) in zip(caps, [(770, 60, 290), (1080, 60, 290), (925, 395, 230)]):
    ph = ImageOps.fit(Image.open(f'{RAW}/{k}.jpg').convert('RGB'), (S, S))
    im.paste(ph, (int(x), y))
    d.text((x + S / 2, y + S + 24), c, font=f(25, 'SemiBold'), fill=rgb('333333'), anchor='mm')
im.save(f'{OUT}/profil-ines.jpg', quality=86)
print('ok')
