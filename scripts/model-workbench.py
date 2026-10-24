"""Validate or preview model recipes for the loopback-only Atlas editor."""
import argparse
import json
from pathlib import Path
import sys
from model_authoring import generate
from resource_inputs import inputs

ROOT = Path(__file__).resolve().parent.parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stdin', action='store_true', help='Preview an unsaved recipe document')
    parser.add_argument('--validate', action='store_true', help='Omit preview models and textures')
    args = parser.parse_args()
    document = json.load(sys.stdin) if args.stdin else json.loads((ROOT / 'authoring/model-recipes.json').read_text())
    archives = inputs(ROOT, download=False)
    try:
        outputs, previews = generate(document, archives)
        print(json.dumps({'outputs': list(outputs), 'previews': [] if args.validate else previews}, separators=(',', ':')))
    finally:
        for archive in archives.values():
            archive.close()


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError) as error:
        print(f'Invalid model recipe: {error}', file=sys.stderr)
        sys.exit(2)
