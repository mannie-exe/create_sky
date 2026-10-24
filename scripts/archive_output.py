"""Deterministic generated archives with atomic, no-op-aware publication."""
import io
from pathlib import Path
import tempfile
import zipfile


def archive_bytes(entries, timestamp):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w') as archive:
        for name, data in sorted(entries.items()):
            entry = zipfile.ZipInfo(name, timestamp)
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o644 << 16
            archive.writestr(entry, data)
    return output.getvalue()


def publish(path, data, check=False):
    path = Path(path)
    if path.is_file() and path.read_bytes() == data:
        return False
    if check:
        raise ValueError(f'Generated archive is missing or stale: {path}')
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=path.name + '.', delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(data)
    try:
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)
    return True
