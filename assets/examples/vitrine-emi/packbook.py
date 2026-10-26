# pack.py étendu : images/ ET videos/ ; titre typographique.
# Usage : python3 packbook.py <gabarit.h5p> <content.json> <media_dir> <sortie.h5p> "<titre>" [--slim]
import json,sys,os,re,zipfile
TPL,CONTENT,MEDIA,OUT,TITLE=sys.argv[1:6]; SLIM='--slim' in sys.argv
zin=zipfile.ZipFile(TPL); names=zin.namelist()
c=json.load(open(CONTENT)); man=json.loads(zin.read('h5p.json'))
main=next(d for d in man['preloadedDependencies'] if d['machineName']==man['mainLibrary'])
man.update(title=TITLE,language='fr',embedTypes=['iframe'],license='U')
used={f"{main['machineName']} {main['majorVersion']}.{main['minorVersion']}"}
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
    lj=f'{n}-{v}/library.json'
    if lj not in names: sys.exit('ABSENT du gabarit : '+cur)
    for d in json.loads(zin.read(lj)).get('preloadedDependencies',[]): q.append(f"{d['machineName']} {d['majorVersion']}.{d['minorVersion']}")
man['preloadedDependencies']=[{'machineName':x.split(' ')[0],'majorVersion':x.split(' ')[1].split('.')[0],'minorVersion':x.split(' ')[1].split('.')[1]} for x in sorted(clos)]
libdirs={x.split('/')[0] for x in names if x.endswith('/library.json') and x.count('/')==1}
keep={x.replace(' ','-') for x in clos} if SLIM else libdirs
refs=set(re.findall(r'"path":\s*"((?:images|videos)/[^"]+)"',json.dumps(c)))
missing=[r for r in refs if not os.path.exists(os.path.join(MEDIA,os.path.basename(r)))]
if missing: sys.exit('Médias manquants : '+', '.join(missing))
if os.path.exists(OUT): os.remove(OUT)
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('h5p.json',json.dumps(man,ensure_ascii=False))
    z.writestr('content/content.json',json.dumps(c,ensure_ascii=False))
    for r in sorted(refs): z.write(os.path.join(MEDIA,os.path.basename(r)),'content/'+r,compress_type=zipfile.ZIP_STORED if r.startswith('videos/') else zipfile.ZIP_DEFLATED)
    for x in names:
        if x.split('/')[0] in keep and not x.endswith('/'): z.writestr(x,zin.read(x))
print('libs',len(keep),'médias',len(refs),OUT,round(os.path.getsize(OUT)/1e6,2),'Mo')
