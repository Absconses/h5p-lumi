# Vérifie chaque sous-contenu contre son semantics.json. Usage : python3 validate.py <dossier_gabarit_extrait> content.json ["H5P.ThreeImage 0.5"]
import json,sys,os
IB=sys.argv[1]; c=json.load(open(sys.argv[2]))
errs=[]
def sem(lib):
    n,v=lib.split(' '); return json.load(open(f'{IB}/{n}-{v}/semantics.json'))
def check(fields,obj,path):
    if not isinstance(obj,dict): errs.append(f'{path}: not object'); return
    for f in fields:
        k=f['name']; v=obj.get(k)
        if v is None:
            if not f.get('optional') and f['type'] not in ('group','boolean') and 'default' not in f:
                errs.append(f'{path}.{k} missing ({f["type"]})')
            continue
        t=f['type']
        if t=='group':
            if len(f['fields'])==1 and not isinstance(v,dict): continue
            check(f['fields'],v,f'{path}.{k}')
        elif t=='list':
            if not isinstance(v,list): errs.append(f'{path}.{k} not list'); continue
            for i,x in enumerate(v):
                ff=f['field']
                if ff['type']=='group' and len(ff['fields'])==1 and ff['fields'][0]['name'] not in (x or {}):
                    g=ff['fields'][0]
                    if g['type']=='library': lib(x,f'{path}.{k}[{i}]')
                    continue
                if ff['type']=='group': check(ff['fields'],x,f'{path}.{k}[{i}]')
                elif ff['type']=='library': lib(x,f'{path}.{k}[{i}]')
        elif t=='library':
            if 'options' in f and v.get('library') not in f['options']: errs.append(f'{path}.{k}: {v.get("library")} non autorisé ici')
            lib(v,f'{path}.{k}')
        elif t=='select' and 'options' in f and v not in [o['value'] for o in f['options']]:
            errs.append(f'{path}.{k}={v!r} not in options')
def lib(x,path):
    if not x: return
    L=x['library']; n,v=L.split(' ')
    if not os.path.isdir(f'{IB}/{n}-{v}'): errs.append(f'{path}: {L} absent du gabarit'); return
    check(sem(L),x['params'],f'{path}<{L}>')
check(sem(sys.argv[3] if len(sys.argv)>3 else 'H5P.ThreeImage 0.5'),c,'root')
print('\n'.join(errs) or 'VALIDE')
