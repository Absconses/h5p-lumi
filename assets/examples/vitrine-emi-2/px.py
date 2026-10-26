# Recherche Pixabay -> planche contact numérotée.  usage : python3 px.py <dossier> "requête" [n]
import json,os,sys,subprocess,urllib.parse
from PIL import Image, ImageDraw
D,Q=sys.argv[1],sys.argv[2]; N=int(sys.argv[3]) if len(sys.argv)>3 else 12
os.makedirs(D,exist_ok=True); slug=Q.replace(' ','_')
u='https://pixabay.com/api/?'+urllib.parse.urlencode(dict(key=os.environ['PIXABAY'],q=Q,image_type='photo',per_page=max(N,3),safesearch='true'))
r=json.loads(subprocess.check_output(['curl','-s','-A','Mozilla/5.0',u]))
hits=r['hits'][:N]; json.dump(hits,open(f'{D}/{slug}.json','w'))
sheet=Image.new('RGB',(4*260,((len(hits)+3)//4)*200),'white'); dr=ImageDraw.Draw(sheet)
for i,h in enumerate(hits):
    p=f'{D}/{slug}-{i}.jpg'
    import time
    for k in range(4):
        subprocess.run(['curl','-s','-A','Mozilla/5.0','-o',p,h['webformatURL']])
        try: im=Image.open(p); break
        except Exception: time.sleep(3)
    else: continue
    im.thumbnail((250,175)); x,y=(i%4)*260,(i//4)*200
    sheet.paste(im,(x+5,y+20)); dr.text((x+5,y+3),f"{i} {h['user']} {h['imageWidth']}x{h['imageHeight']}",fill='black')
sheet.save(f'{D}/{slug}-sheet.jpg'); print(f'{D}/{slug}-sheet.jpg',len(hits))
