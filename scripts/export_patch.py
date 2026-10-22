"""Package reviewed recipe scenarios, without applying to any instance."""
import json, zipfile
from paths import ROOT
data=json.loads((ROOT/'public/generated/authored.json').read_text())['recipes']['changes']
if not data: raise SystemExit('No recipe changes to export')
target=ROOT/'public/generated/create-sky-atlas-patch.zip'
with zipfile.ZipFile(target.with_suffix('.tmp'),'w',zipfile.ZIP_DEFLATED) as jar:
    jar.writestr('pack.mcmeta',json.dumps({'pack':{'pack_format':48,'description':'Create Sky atlas recipe scenario; review and test before applying'}}))
    for change in data:
        ns,name=change['id'].split(':',1)
        if '..' in name or name.startswith('/'):raise ValueError('Invalid recipe path')
        recipe={'neoforge:conditions':[{'type':'neoforge:false'}]} if change.get('disabled') else change['json']
        jar.writestr(f'data/{ns}/recipe/{name}.json',json.dumps(recipe,indent=2))
target.with_suffix('.tmp').replace(target)
print(target)
