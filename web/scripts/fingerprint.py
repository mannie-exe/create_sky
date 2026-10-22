"""Cheap change detector. Runtime exports separately hash every loaded JAR."""
import hashlib, json
from paths import paths

def fingerprint():
    p=paths();files={}
    for base in [p['server']/'mods',p['server']/'config',p['server']/'defaultconfigs',p['server']/'world/serverconfig',p['pack']/'overrides/common/config',p['pack']/'overrides/common/mods',p['server']/'world/datapacks']:
        if base.exists():
            for file in sorted(base.rglob('*')):
                if file.is_file() and file.suffix in ('.jar','.json','.toml','.properties'):
                    stat=file.stat();files[str(file)]={'size':stat.st_size,'mtimeNs':stat.st_mtime_ns}
    files['lockSha256']=hashlib.sha256((p['pack']/'empack.lock').read_bytes()).hexdigest()
    return hashlib.sha256(json.dumps(files,sort_keys=True).encode()).hexdigest()

if __name__=='__main__':print(fingerprint())
