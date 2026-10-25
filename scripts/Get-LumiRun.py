#!/usr/bin/env python3
"""Rebuild a standalone .h5p from a Lumi Cloud/Nuage "run" link.
usage: python3 -I lumi_run_to_h5p.py <run id or URL> <out.h5p>
Reads the public render page, takes the params from H5PIntegration, downloads the
libraries (library.json, semantics, preloaded JS/CSS + url() assets, language/fr.json)
and the content files, then zips a valid .h5p."""
import json, re, sys, os, zipfile, urllib.request, urllib.parse, io, time

API = 'https://app.lumi.education/api/v1'
UA = {'User-Agent': 'Mozilla/5.0 h5p-lumi'}

def get(url, binary=False):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                d = r.read(); return d if binary else d.decode('utf-8')
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            time.sleep(2 ** i)
        except Exception:
            time.sleep(2 ** i)
    return None

def main(run, out):
    rid = run.rstrip('/').split('/')[-1]
    if re.fullmatch(r'[0-9a-f]{24}', rid):
        cid = rid
    else:
        q = json.dumps({'query': 'query{getRun(runId:"%s"){contentId collectData}}' % rid}).encode()
        req = urllib.request.Request('https://app.lumi.education/graphql', data=q,
                                     headers={**UA, 'Content-Type': 'application/json'})
        run_info = json.load(urllib.request.urlopen(req, timeout=60))['data']['getRun']
        if not run_info: sys.exit(f'run {rid} not found')
        cid = run_info['contentId']
        print(f'  run {rid}: content {cid}, collectData={run_info["collectData"]}')
    html = get(f'{API}/h5p/{cid}/render?contextId={rid}_x&readOnlyState=true&type=run')
    I = json.loads(re.search(r'H5PIntegration\s*=\s*(\{.*?\});\s*\n', html, re.S).group(1))
    c = next(iter(I['contents'].values()))
    params = json.loads(c['jsonContent'])
    main_lib = c['library']  # "H5P.X 1.2"
    meta = c.get('metadata') or {}
    files = {'content/content.json': json.dumps(params, ensure_ascii=False).encode()}
    # content files
    for p in sorted(set(re.findall(r'"path":\s*"((?:images|videos|audios|files)/[^"#]+)"', c['jsonContent']))):
        d = get(f'{API}/h5p/content/{cid}/{urllib.parse.quote(p)}', True)
        if d is None: print('  ! missing content file', p)
        else: files['content/' + p] = d
    # libraries: closure through library.json
    seen, todo, libjson = set(), [main_lib.replace(' ', '-')], {}
    while todo:
        L = todo.pop()
        if L in seen: continue
        seen.add(L)
        base = f'{API}/h5p/libraries/{L}/'
        lj = get(base + 'library.json')
        if lj is None: print('  ! library not found', L); continue
        j = json.loads(lj); libjson[L] = j
        files[f'{L}/library.json'] = lj.encode()
        for extra in ['semantics.json', 'language/fr.json', 'icon.svg']:
            d = get(base + extra, True)
            if d is not None: files[f'{L}/{extra}'] = d
        for kind in ('preloadedJs', 'preloadedCss'):
            for f in j.get(kind, []):
                d = get(base + f['path'], True)
                if d is None: print('  ! missing', L, f['path']); continue
                files[f'{L}/{f["path"]}'] = d
                if kind == 'preloadedCss':
                    folder = os.path.dirname(f['path'])
                    for u in re.findall(r'url\(\s*[\'"]?([^\'")]+)', d.decode('utf-8', 'ignore')):
                        if u.startswith(('data:', 'http', '#')): continue
                        rel = os.path.normpath(os.path.join(folder, u.split('?')[0].split('#')[0]))
                        if f'{L}/{rel}' in files: continue
                        a = get(base + rel, True)
                        if a is not None: files[f'{L}/{rel}'] = a
        for dep in j.get('preloadedDependencies', []):
            todo.append(f"{dep['machineName']}-{dep['majorVersion']}.{dep['minorVersion']}")
    mn, ver = main_lib.split(' ')
    deps = [{'machineName': j['machineName'], 'majorVersion': j['majorVersion'], 'minorVersion': j['minorVersion']} for j in libjson.values()]
    h5p = {'title': meta.get('title') or c.get('title') or mn, 'language': 'fr', 'mainLibrary': mn,
           'embedTypes': ['iframe'], 'license': 'U', 'preloadedDependencies': deps}
    files['h5p.json'] = json.dumps(h5p, ensure_ascii=False).encode()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in files.items(): z.writestr(k, v)
    print(f'{rid} -> {out}: {main_lib}, {len(libjson)} libs, {len(files)} files, {os.path.getsize(out)//1024} Ko')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
