"""Build the maintained resource-only mod; does not touch instances or worlds."""
from pathlib import Path
import zipfile
import subprocess
import sys
root = Path(__file__).resolve().parent.parent
subprocess.run([sys.executable, str(root / 'scripts/generate-journal.py'), '--check'], check=True)
output = root / 'overrides/common/mods/create-sky-fixes-0.1.0.jar'
output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as jar:
    for source in sorted((root / 'pack-fixes').rglob('*')):
        if not source.is_file(): continue
        entry = zipfile.ZipInfo(source.relative_to(root / 'pack-fixes').as_posix(), (2026, 10, 21, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_DEFLATED
        entry.external_attr = 0o644 << 16
        jar.writestr(entry, source.read_bytes())
print(output)
