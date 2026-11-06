# Usage : python3 scripts/check-texte-simple.py <gabarit_extrait> <content.json> "<Bibliothèque principale X.Y>"
# Liste les champs « texte simple » (sans widget html) qui contiennent des balises : le lecteur hors ligne les échappe.
import json,sys,os,re
LIB=sys.argv[1]; c=json.load(open(sys.argv[2]))
def sem(lib):
    n,v=lib.split(' '); p=f'{LIB}/{n}-{v}/semantics.json'
    return json.load(open(p)) if os.path.exists(p) else None
def walk(val,fields,path):
    if not isinstance(val,dict): return
    for f in fields:
        k=f['name']; 
        if k not in val: continue
        check(val[k],f,path+'/'+k)
def check(v,f,path):
    t=f['type']
    if t=='text' and isinstance(v,str) and f.get('widget') not in ('html',) and re.search(r'<[a-z/]',v): print(path,'|',v[:90])
    elif t=='group': 
        if len(f['fields'])==1 and not (isinstance(v,dict) and f['fields'][0]['name'] in v): check(v,f['fields'][0],path)
        else: walk(v,f['fields'],path)
    elif t=='list' and isinstance(v,list):
        for i,x in enumerate(v): check(x,f['field'],f'{path}[{i}]')
    elif t=='library' and isinstance(v,dict) and 'library' in v:
        if s: walk(v.get('params',{}),s,path+'<'+v['library']+'>')
s=sem(sys.argv[3]); walk(c,s,'')
