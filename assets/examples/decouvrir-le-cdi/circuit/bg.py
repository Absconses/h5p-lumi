# Fabrique les fonds « cinéma » : photo recadrée en 16:9, assombrie en dégradé du côté
# du texte, teintée, avec le titre en grand (Bebas Neue) et un surtitre (Inter).
# Usage : python3 bg.py  (lit plans.json, écrit media/*.jpg)
import json, sys
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

W, H = 1600, 900
FONTS = 'fonts'

def cover(im, w, h, fx=0.5, fy=0.5):
    r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x = round((im.width - w) * fx); y = round((im.height - h) * fy)
    return im.crop((x, y, x + w, y + h))

def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def plan(src, out, title='', kicker='', accent='e67e22', side='left', fx=0.5, fy=0.5, dark=0.85, blur=0, gray=False):
    im = Image.open(src).convert('RGB')
    im = cover(im, W, H, fx, fy)
    if gray:
        im = ImageEnhance.Color(im).enhance(0.15)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    im = ImageEnhance.Contrast(im).enhance(1.08)
    # dégradé sombre : opaque côté texte, transparent de l'autre
    night = Image.new('RGB', (W, H), (8, 12, 30))
    mask = Image.new('L', (W, H))
    md = ImageDraw.Draw(mask)
    for x in range(W):
        t = x / W if side == 'right' else 1 - x / W
        if side == 'full':
            t = 1
        a = max(0.0, min(1.0, (t - 0.15) / 0.55)) * dark
        md.line([(x, 0), (x, H)], fill=round(255 * (0.25 + 0.75 * a) if side != 'none' else 0))
    im = Image.composite(night, im, mask)
    # vignette bas
    vg = Image.new('L', (W, H))
    vd = ImageDraw.Draw(vg)
    for y in range(H):
        vd.line([(0, y), (W, y)], fill=round(140 * max(0, (y - H * 0.6) / (H * 0.4))))
    im = Image.composite(night, im, vg)
    d = ImageDraw.Draw(im)
    acc = hexrgb(accent)
    x0 = 80 if side != 'right' else W // 2 + 40
    if kicker:
        f = ImageFont.truetype(f'{FONTS}/Inter-ExtraBold.ttf', 30)
        d.rectangle([x0, 92, x0 + 70, 98], fill=acc)
        d.text((x0 + 88, 76), kicker.upper(), font=f, fill=acc)
    if title:
        size = 118
        f = ImageFont.truetype(f'{FONTS}/BebasNeue.ttf', size)
        maxw = W // 2 - 120 if side in ('left', 'right') else W - 160
        while d.textlength(title.split('\n')[0], font=f) > maxw and size > 60:
            size -= 4; f = ImageFont.truetype(f'{FONTS}/BebasNeue.ttf', size)
        d.multiline_text((x0, 120), title, font=f, fill=(255, 255, 255), spacing=0)
    im.save(out, quality=86, optimize=True, progressive=True)

if __name__ == '__main__':
    for p in json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'plans.json')):
        plan(**p)
        print('ok', p['out'])
