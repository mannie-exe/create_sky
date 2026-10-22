import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
def paths():
    values = json.loads((ROOT / 'data/local.example.json').read_text())
    source = ROOT / 'data/local.json'
    if source.exists():
        values.update(json.loads(source.read_text()))
    resolved = {}
    for key, value in values.items():
        location = Path(value).expanduser()
        resolved[key] = (location if location.is_absolute() else ROOT / location).resolve()
    return resolved

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, separators=(',', ':'), ensure_ascii=False))
    temporary.replace(path)
