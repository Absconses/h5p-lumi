# Port Python de Build-H5PPackage.ps1 : gabarit + content.json -> .h5p, deps déclarées (closure BFS)
import json,sys,os,re,zipfile,shutil
IB,CONTENT,OUT,TITLE,MEDIA=sys.argv[1:6]
c=json.load(open(CONTENT))
man=json.load(open(f'{IB}/h5p.json'))
man['title']=TITLE; man['language']='fr'
used=set()
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
    if os.path.exists(lj):
        for d in json.load(open(lj)).get('preloadedDependencies',[]): q.append(f"{d['machineName']} {d['majorVersion']}.{d['minorVersion']}")
    else: print('ABSENT (non déclarée)',cur); clos.discard(cur)
have={f"{d['machineName']} {d['majorVersion']}.{d['minorVersion']}" for d in man['preloadedDependencies'] if d.get('machineName')}
man['preloadedDependencies']=[d for d in man['preloadedDependencies'] if d.get('machineName')]
for x in sorted(clos-have):
    n,v=x.split(' '); a,b=v.split('.')
    man['preloadedDependencies'].append({'machineName':n,'majorVersion':int(a),'minorVersion':int(b)})
print('used',len(used),'closure',len(clos),'added',len(clos-have))
if os.path.exists(OUT): os.remove(OUT)
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('h5p.json',json.dumps(man,ensure_ascii=False))
    z.writestr('content/content.json',json.dumps(c,ensure_ascii=False))
    for f in sorted(os.listdir(MEDIA)): z.write(os.path.join(MEDIA,f),'content/images/'+f)
    for root,_,files in os.walk(IB):
        rel=os.path.relpath(root,IB)
        if rel=='.' or rel.split(os.sep)[0]=='content': continue
        for f in files: z.write(os.path.join(root,f),os.path.join(rel,f).replace(os.sep,'/'))
print(OUT, round(os.path.getsize(OUT)/1e6,1),'Mo')
