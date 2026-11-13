# Images du module : écrans « LIVE » (peinture du domaine public + bandeau télé) et conducteur du reportage.
# Usage : python3 draw.py <dossier raw (salem.jpg, fire.jpg)> <dossier media>
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
RAW, OUT = sys.argv[1:3]
F = '/usr/share/fonts/truetype/dejavu/'
def font(n, s): return ImageFont.truetype(F + n, s)
RED, NAVY, WHITE = (200, 30, 40), (18, 32, 64), (255, 255, 255)

def live(src, out, place, headline, ticker):
    im = Image.open(f'{RAW}/{src}').convert('RGB')
    W = 1200; im = im.resize((W, int(im.height * W / im.width)), Image.LANCZOS)
    H = im.height
    d = ImageDraw.Draw(im, 'RGBA')
    # pastille LIVE + lieu/date
    d.rectangle([30, 28, 140, 74], fill=RED)
    d.text((48, 33), 'LIVE', font=font('DejaVuSans-Bold.ttf', 32), fill=WHITE)
    d.rectangle([140, 28, 150 + d.textlength(place, font=font('DejaVuSans.ttf', 26)) + 20, 74], fill=(0, 0, 0, 170))
    d.text((158, 37), place, font=font('DejaVuSans.ttf', 26), fill=WHITE)
    # bandeau inférieur (lower third)
    y = H - 150
    bw = int(d.textlength('BREAKING NEWS', font=font('DejaVuSans-Bold.ttf', 28))) + 40
    d.rectangle([0, y, bw, y + 62], fill=RED)
    d.text((18, y + 12), 'BREAKING NEWS', font=font('DejaVuSans-Bold.ttf', 28), fill=WHITE)
    d.rectangle([bw, y, W, y + 62], fill=(255, 255, 255, 235))
    d.text((bw + 22, y + 9), headline, font=font('DejaVuSans-Bold.ttf', 36), fill=NAVY)
    d.rectangle([0, y + 62, W, y + 110], fill=NAVY + (240,))
    d.text((18, y + 72), ticker, font=font('DejaVuSans.ttf', 24), fill=(230, 235, 245))
    im.save(f'{OUT}/{out}', quality=86)

live('jacobs.jpg', 'cover-salem.jpg', 'SALEM, MASSACHUSETTS · 1692',
     'WITCH TRIALS: A TOWN IN FEAR', 'Your report  ·  Reporter  ·  Witness  ·  Historian  ·  Coming up soon on your class channel')
live('fire.jpg', 'model-fire.jpg', 'LONDON · SUNDAY 2 SEPTEMBER 1666',
     'LONDON IS ON FIRE!', 'Fire started in Pudding Lane  ·  Strong wind from the east  ·  People escape to the river')

# Conducteur (rundown) : 5 blocs, couleur = qui parle
REP, WIT, HIS = (47, 111, 186), (224, 122, 32), (46, 139, 87)
blocks = [
    ('1', 'OPENING', 'Hello! Who? Where?\nWhen? The big news', [REP]),
    ('2', 'THE SCENE', 'What is\nhappening?\nDramatic words', [REP]),
    ('3', 'THE WITNESS', 'Questions and\nanswers: I saw,\nI heard, I felt', [REP, WIT]),
    ('4', 'THE HISTORIAN', 'Context and facts.\nThe big picture:\nwhy?', [REP, HIS]),
    ('5', 'CLOSING', 'Sum up and\nsign off', [REP]),
]
W, H = 1640, 600
im = Image.new('RGB', (W, H), (247, 248, 250)); d = ImageDraw.Draw(im)
d.text((40, 26), 'The running order of a news report', font=font('DejaVuSans-Bold.ttf', 38), fill=NAVY)
bw, gap, x0, y0 = 292, 26, 40, 110
for i, (n, t, s, who) in enumerate(blocks):
    x = x0 + i * (bw + gap)
    d.rounded_rectangle([x, y0, x + bw, y0 + 340], 16, fill=WHITE, outline=(200, 205, 215), width=2)
    d.rounded_rectangle([x, y0, x + bw, y0 + 70], 16, fill=NAVY); d.rectangle([x, y0 + 50, x + bw, y0 + 70], fill=NAVY)
    d.text((x + 16, y0 + 14), f'{n}  {t}', font=font('DejaVuSans-Bold.ttf', 24), fill=WHITE)
    d.multiline_text((x + 16, y0 + 92), s, font=font('DejaVuSans.ttf', 23), fill=(40, 40, 40), spacing=8)
    for j, c in enumerate(who):
        lab = {REP: 'Reporter', WIT: 'Witness', HIS: 'Historian'}[c]
        yy = y0 + 236 + j * 46
        d.rounded_rectangle([x + 16, yy, x + bw - 16, yy + 38], 19, fill=c)
        d.text((x + 34, yy + 5), lab, font=font('DejaVuSans-Bold.ttf', 22), fill=WHITE)
    if i < 4:
        ax = x + bw + 3; d.polygon([(ax, y0 + 135), (ax + 16, y0 + 150), (ax, y0 + 165)], fill=(150, 155, 165))
d.text((40, 480), 'Time ►', font=font('DejaVuSans-Bold.ttf', 24), fill=(110, 110, 120))
d.line([(140, 496), (W - 60, 496)], fill=(150, 155, 165), width=4)
d.polygon([(W - 60, 486), (W - 40, 496), (W - 60, 506)], fill=(150, 155, 165))
d.text((40, 532), 'The reporter speaks first and last. The colour shows who speaks in each part.', font=font('DejaVuSans.ttf', 24), fill=(80, 80, 90))
im.save(f'{OUT}/rundown.jpg', quality=90)
print('ok')
