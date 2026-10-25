#!/usr/bin/env python3
"""Shrink the images of an extracted .h5p folder in place.
usage: python3 -I slim_images.py <extracted_dir> [max_px=1600]
PNG/JPEG above 250 Ko: resized to max_px; opaque PNGs become JPEG q82.
content.json paths and mime types are updated."""
import sys, os, json, re
from PIL import Image
d = sys.argv[1]; MAX = int(sys.argv[2]) if len(sys.argv) > 2 else 1600
cj = os.path.join(d, 'content', 'content.json'); s = open(cj, encoding='utf-8').read()
before = after = 0
for sub in ('images',):
    folder = os.path.join(d, 'content', sub)
    if not os.path.isdir(folder): continue
    for f in sorted(os.listdir(folder)):
        p = os.path.join(folder, f); size = os.path.getsize(p); before += size
        if size < 250_000 or not f.lower().endswith(('.png', '.jpg', '.jpeg')):
            after += size; continue
        im = Image.open(p); im.load()
        if max(im.size) > MAX: im.thumbnail((MAX, MAX), Image.LANCZOS)
        has_alpha = im.mode in ('RGBA', 'LA', 'P') and im.convert('RGBA').getextrema()[3][0] < 250
        if has_alpha:
            im.save(p, optimize=True); new = f
        else:
            new = re.sub(r'\.(png|jpe?g)$', '.jpg', f, flags=re.I)
            im.convert('RGB').save(os.path.join(folder, new), quality=82, optimize=True, progressive=True)
            if new != f:
                os.remove(p)
                s = re.sub(r'"path":\s*"%s/%s"(\s*,\s*"mime":\s*")image/png"' % (sub, re.escape(f)),
                           lambda m: '"path": "%s/%s"%simage/jpeg"' % (sub, new, m.group(1)), s)
                s = s.replace(f'{sub}/{f}', f'{sub}/{new}')
        after += os.path.getsize(os.path.join(folder, new))
open(cj, 'w', encoding='utf-8').write(s)
print(f'{d}: images {before//1024} Ko -> {after//1024} Ko')
