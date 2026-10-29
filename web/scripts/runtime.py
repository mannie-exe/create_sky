"""Export actual registered content in a disposable server, never open the user's world."""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path
from paths import ROOT, paths, write_json
from fingerprint import fingerprint
from runtime_capture import run_capture

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--worldgen", action="store_true", help="Read the configured world seed/settings for a chunk-free spacing comparison")
args_cli = parser.parse_args()
p = paths()
subprocess.run([sys.executable, str(p['pack'] / 'scripts/build-fixes.py'), '--check'], check=True)
source_fingerprint = fingerprint()
audit = ROOT / '.cache/audit-server'
audit.mkdir(parents=True, exist_ok=True)
libraries = p['server'] / 'libraries'
if not (audit / 'libraries').exists():
    (audit / 'libraries').symlink_to(libraries, target_is_directory=True)
# The installed server owns dependency selection. Sync it before capture; do not
# silently mix selected authoring JARs into an older installed dependency set.
mods = audit / 'mods'
if mods.exists():
    shutil.rmtree(mods)
mods.mkdir()
for source in sorted((p['server'] / 'mods').glob('*.jar')):
    (mods / source.name).symlink_to(source)
# Overlay maintained local fixes without mounting any live save.
for source in (p['pack'] / 'overrides/common/mods').glob('*.jar'):
    target = mods / source.name
    target.unlink(missing_ok=True)
    target.symlink_to(source)
for folder in ['config', 'defaultconfigs']:
    target = audit / folder
    if target.exists(): shutil.rmtree(target)
    if (p['server'] / folder).exists(): shutil.copytree(p['server'] / folder, target)
    authored = p['pack'] / 'overrides/common' / folder
    if authored.exists(): shutil.copytree(authored, target, dirs_exist_ok=True)
# Registry capture does not need a web server or downloaded map assets.
bluemap = audit / 'config/bluemap'
if bluemap.is_dir():
    (bluemap / 'webserver.conf').write_text('enabled: false\n')
    (bluemap / 'core.conf').write_text('accept-download: false\nmetrics: false\n')
# Existing-world SERVER configs override defaultconfigs. Copy only configuration,
# never chunks, level.dat, players, saved data or LOD databases.
world_config=p['server']/'world/serverconfig'
if world_config.exists(): shutil.copytree(world_config,audit/'audit-world/serverconfig',dirs_exist_ok=True)
classes = ROOT / '.cache/exporter-classes'
if classes.exists():
    shutil.rmtree(classes)
classpath = ':'.join(str(f) for f in [*libraries.rglob('*.jar'), *mods.glob('*.jar')])
subprocess.run([str(p['java'] / 'javac'), '-proc:none', '-cp', classpath, '-d', str(classes), *[str(f) for f in sorted((ROOT / 'tools/exporter').glob('*.java'))]], check=True)
with zipfile.ZipFile(mods / 'create-sky-atlas-exporter.jar', 'w') as jar:
    for f in classes.rglob('*.class'): jar.write(f, f.relative_to(classes))
    jar.write(ROOT / 'tools/exporter/neoforge.mods.toml', 'META-INF/neoforge.mods.toml')
(audit / 'eula.txt').write_text((p['server'] / 'eula.txt').read_text())
(audit / 'server.properties').write_text('server-ip=127.0.0.1\nserver-port=0\nonline-mode=false\nlevel-name=audit-world\nlevel-type=minecraft:flat\ngenerate-structures=false\nview-distance=2\nsimulation-distance=10\nmax-tick-time=0\nspawn-protection=0\nsync-chunk-writes=false\n')
args = next(libraries.glob('net/neoforged/neoforge/*/unix_args.txt'))
out = ROOT / 'data/generated/runtime'
out.mkdir(parents=True, exist_ok=True)
print('Starting isolated audit server; live world is never mounted.', flush=True)
worldgen_args = ['-Datlas.worldgen.level='+str(p['server'] / 'world/level.dat')] if args_cli.worldgen else []
run_capture([str(p['java'] / 'java'), '-Xmx4G', *worldgen_args, '-Datlas.export.dir='+str(out), '@'+str(args), 'nogui'],
            cwd=audit, log=ROOT / '.cache/runtime.log', complete=out / 'complete.json')
inventory = {f.name: hashlib.sha256(f.read_bytes()).hexdigest() for f in mods.glob('*.jar')}
write_json(out / 'snapshot.json', {'mods': inventory, 'sourceFingerprint':source_fingerprint,'sourceChangedDuringExport':source_fingerprint!=fingerprint(),'lockSha256': hashlib.sha256((p['pack'] / 'empack.lock').read_bytes()).hexdigest()})
print('Runtime export complete:', json.loads((out / 'complete.json').read_text()))
