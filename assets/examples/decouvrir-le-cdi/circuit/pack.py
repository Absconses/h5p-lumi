# Empaquette content.json + images dans un .h5p à partir du gabarit Impressive Presentation.
# Usage : python3 pack.py <gabarit_dir> <content.json> <media_dir> <sortie.h5p> "<titre>" [--slim]
#   (sans --slim) toutes les bibliothèques du gabarit, éditeurs compris -> modifiable dans Lumi
#   --slim        seulement la fermeture des dépendances d'exécution -> Digiquiz / La Digitale
import json,sys,os,re,zipfile
IB,CONTENT,MEDIA,OUT,TITLE=sys.argv[1:6]; SLIM='--slim' in sys.argv
c=json.load(open(CONTENT)); man=json.load(open(f'{IB}/h5p.json'))
man.update(title=TITLE,language='fr',embedTypes=['iframe'])
used={f"{man['mainLibrary']} 1.0"}
def walk(n):
    if isinstance(n,list): [walk(x) for x in n]
    elif isinstance(n,dict):
        for k,v in n.items():
            if k=='library' and isinstance(v,str) and re.match(r'^\S+\s+\d+\.\d+$',v): used.add(v)
            walk(v)
walk(c)
q=list(used); clos=set()
while q:
    cur=q.pop()
    if cur in clos: continue
    clos.add(cur); n,v=cur.split(' ')
    lj=f'{IB}/{n}-{v}/library.json'
    if not os.path.exists(lj): sys.exit('ABSENT '+cur)
    for d in json.load(open(lj)).get('preloadedDependencies',[]): q.append(f"{d['machineName']} {d['majorVersion']}.{d['minorVersion']}")
man['preloadedDependencies']=[{'machineName':x.split(' ')[0],'majorVersion':int(x.split(' ')[1].split('.')[0]),'minorVersion':int(x.split(' ')[1].split('.')[1])} for x in sorted(clos)]
dirs={x.replace(' ','-') for x in clos} if SLIM else {d for d in os.listdir(IB) if os.path.exists(f'{IB}/{d}/library.json')}
if os.path.exists(OUT): os.remove(OUT)
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('h5p.json',json.dumps(man,ensure_ascii=False))
    z.writestr('content/content.json',json.dumps(c,ensure_ascii=False))
    for f in sorted(os.listdir(MEDIA)): z.write(os.path.join(MEDIA,f),'content/images/'+f)
    for d in sorted(dirs):
        for root,_,files in os.walk(f'{IB}/{d}'):
            for f in files: z.write(os.path.join(root,f),os.path.relpath(os.path.join(root,f),IB).replace(os.sep,'/'))
print('libs',len(dirs),OUT,round(os.path.getsize(OUT)/1e6,2),'Mo')
