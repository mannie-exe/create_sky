"""Extract versioned source evidence and real textures, including nested mod JARs."""
import collections, hashlib, io, json, re, tomllib, zipfile
from pathlib import Path
from paths import ROOT, paths, write_json

p = paths(); runtime = ROOT/'data/generated/runtime'
items = json.loads((runtime/'items.json').read_text())
assets, translations, sources, documents, mods = {}, {}, {}, {}, []
def visit(blob, origin):
    digest=hashlib.sha256(blob).hexdigest()
    with zipfile.ZipFile(io.BytesIO(blob)) as jar:
        mod={'file':origin,'sha256':digest,'ids':[]}
        for metadata in ['META-INF/neoforge.mods.toml','META-INF/mods.toml','fabric.mod.json']:
            if metadata in jar.namelist():
                try:
                    info=json.loads(jar.read(metadata)) if metadata.endswith('.json') else tomllib.loads(jar.read(metadata).decode())
                    mod['ids']=[info['id']] if 'id' in info else [m['modId'] for m in info.get('mods',[])]
                    mod['metadata']=info
                    break
                except Exception: pass
        mods.append(mod)
        for name in jar.namelist():
            if name.endswith('.jar'): visit(jar.read(name),origin+'!/'+name)
            elif name.startswith('assets/') and name.endswith(('.json','.png')):
                assets[name]=(jar.read(name),origin)
                if name.endswith('/lang/en_us.json'):
                    try: translations.update(json.loads(jar.read(name)))
                    except Exception: pass
            elif name.startswith('data/') and name.endswith('.json'):
                try:
                    payload=json.loads(jar.read(name)); _,ns,*parts=name.split('/'); key=ns+':'+('/'.join(parts))
                    documents.setdefault(key,[]).append({'origin':origin,'path':name,'sha256':hashlib.sha256(jar.read(name)).hexdigest(),'json':payload})
                except Exception: pass

vanilla=p['vanilla']
if not vanilla.exists(): raise SystemExit('Minecraft client JAR is required for vanilla textures: '+str(vanilla))
visit(vanilla.read_bytes(),vanilla.name)
for base in [p['pack']/'pack/mods',p['pack']/'overrides/common/mods']:
    for jar in sorted(base.glob('*.jar')): visit(jar.read_bytes(),jar.name)

def model(identifier, seen=None):
    seen=seen or set()
    if identifier in seen:return {}
    seen.add(identifier); ns,path=identifier.split(':',1); key=f'assets/{ns}/models/{path}.json'
    if key not in assets:return {}
    data=json.loads(assets[key][0]); parent=data.get('parent',''); inherited={}
    if parent and not parent.startswith('builtin/'):
        inherited=model(parent if ':' in parent else 'minecraft:'+parent,seen)
    return {**inherited,**data.get('textures',{})}

icon_dir=ROOT/'public/generated/icons'; icon_dir.mkdir(parents=True,exist_ok=True)
catalog=[]
for item in items:
    identifier=item['id']; ns,path=identifier.split(':',1)
    textures=model(ns+':item/'+path)
    candidates=[textures.get(k) for k in ['layer0','all','front','side','top','particle']]+list(textures.values())
    icon=None
    for texture in candidates:
        seen=set()
        while texture and texture.startswith('#') and texture not in seen:
            seen.add(texture); texture=textures.get(texture[1:])
        if not texture or texture.startswith('#'):continue
        if ':' not in texture:texture='minecraft:'+texture
        tns,tpath=texture.split(':',1); key=f'assets/{tns}/textures/{tpath}.png'
        if key in assets:
            # Actual texture preview; a full 3D/custom renderer is not fabricated.
            name=hashlib.sha256(assets[key][0]).hexdigest()[:24]+'.png'
            if not (icon_dir/name).exists():(icon_dir/name).write_bytes(assets[key][0])
            icon={'url':'/generated/icons/'+name,'kind':'texture','source':assets[key][1]+'!/'+key};break
    textkey=item.get('translation',''); name=translations.get(textkey,path.replace('_',' ').title())
    ponder={k:v for k,v in translations.items() if '.ponder.' in k and ('.'+path+'.' in k)}
    catalog.append({**item,'name':name,'mod':ns,'icon':icon,'ponder':ponder})

configs=[]
for base,label in [(p['pack']/'overrides/common/config','authored'),(ROOT/'.cache/audit-server/config','runtime-defaults')]:
    for file in sorted(base.rglob('*')):
        if not file.is_file() or file.suffix not in ('.toml','.json') or file.stat().st_size>2_000_000:continue
        try:
            text=file.read_text(); parsed=tomllib.loads(text) if file.suffix=='.toml' else json.loads(text)
            configs.append({'path':str(file.relative_to(base)),'layer':label,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'values':parsed,'text':text})
        except Exception: pass
log=(ROOT/'.cache/runtime.log').read_text(errors='replace')
diagnostics=[line for line in log.splitlines() if ('/ERROR]' in line or 'ATLAS_EXPORT_COMPLETE' in line)]
write_json(ROOT/'data/generated/catalog.json',catalog)
write_json(ROOT/'data/generated/documents.json',documents)
write_json(ROOT/'data/generated/mods.json',mods)
write_json(ROOT/'data/generated/configs.json',configs)
write_json(ROOT/'data/generated/diagnostics.json',diagnostics)
write_json(ROOT/'data/generated/translations.json',translations)
print(f'Extracted {len(catalog)} items, {len(documents)} resource paths, {len(mods)} JARs; {sum(bool(i["icon"]) for i in catalog)} texture previews')
