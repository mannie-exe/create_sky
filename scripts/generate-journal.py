"""Compile journal mechanics and locale sections into native Questlog resources."""
import argparse
import copy
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(path):
    return json.loads(path.read_text())


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r'[a-z0-9_]+', value):
        raise ValueError(f'Invalid journal identifier: {value!r}')
    return value


def compile_journal(root=ROOT):
    source = root / 'authoring/journal'
    defaults = read(source / 'defaults.json')
    assert defaults['schema'] == 1
    locales = {identifier(p.stem): read(p) for p in sorted((source / 'locales').glob('*.json'))}
    if 'en_us' not in locales:
        raise ValueError('English fallback locale is required')
    chapters = {identifier(p.stem): read(p) for p in sorted((source / 'chapters').glob('*.json'))}
    entries = {}
    outputs = {}
    languages = {locale: {} for locale in locales}
    for chapter, data in chapters.items():
        assert data['schema'] == 1
        native = copy.deepcopy(data['chapter'])
        native.update(name=f'createsky.journal.chapter.{chapter}', translatable=True)
        outputs[f'overrides/common/config/questlog/chapters/{chapter}.json'] = native
        for entry in data['entries']:
            id = chapter + '/' + identifier(entry['id'])
            if id in entries:
                raise ValueError(f'Duplicate entry: {id}')
            entries[id] = entry
    for locale, text in locales.items():
        assert text['schema'] == 1
        if set(text['entries']) != set(entries) or set(text['chapters']) != set(chapters):
            raise ValueError(f'{locale}: locale IDs must match mechanics exactly')
        lang = languages[locale]
        for chapter in chapters:
            lang[f'createsky.journal.chapter.{chapter}'] = text['chapters'][chapter]
        for id, entry in entries.items():
            words = text['entries'][id]
            if set(words) != {'title', 'flavor', 'requirements', 'description', 'disclaimer', 'labels'}:
                raise ValueError(f'{locale}/{id}: unexpected or missing text sections')
            if not isinstance(words['description'], list) or len(words['description']) > 5:
                raise ValueError(f'{locale}/{id}: description must contain zero to five paragraphs')
            for key in ['title', 'flavor', 'requirements']:
                if not isinstance(words[key], str) or (key != 'flavor' and not words[key].strip()):
                    raise ValueError(f'{locale}/{id}: invalid {key}')
            if any(not isinstance(p, str) or not p.strip() for p in words['description']):
                raise ValueError(f'{locale}/{id}: empty description paragraph')
            disclaimer = words['disclaimer']
            if disclaimer is not None and disclaimer not in text['shared']:
                raise ValueError(f'{locale}/{id}: unknown disclaimer')
            key = 'createsky.journal.' + id.replace('/', '.')
            lang[key + '.title'] = words['title']
            sections = [words['flavor'], words['requirements'], *words['description']]
            if disclaimer is not None:
                sections.append(text['shared'][disclaimer])
            lang[key + '.description'] = '\n\n'.join(s for s in sections if s)
            native = {**copy.deepcopy(defaults['display']), **copy.deepcopy(entry['definition'])}
            if native.get('chapter') != 'questlog:' + id.split('/')[0]:
                raise ValueError(f'{id}: mismatched chapter')
            native.update(title=key + '.title', translatable=True)
            # Components defer translation to the client; avoid server-side string flattening.
            native['description'] = {'translate': key + '.description'}
            labels = set()

            def objectives(items, prefix=''):
                for i, objective in enumerate(items):
                    index = prefix + str(i)
                    labels.add(index)
                    label = words['labels'].get(index)
                    if not isinstance(label, str) or not label.strip():
                        raise ValueError(f'{locale}/{id}: missing label {index}')
                    label_key = key + '.objective.' + index
                    lang[label_key] = label
                    objective.update(name=label_key, translatable=True)
                    objectives(objective.get('objectives', []), index + '.')

            objectives(native['objectives'])
            if labels != set(words['labels']):
                raise ValueError(f'{locale}/{id}: labels do not match objective positions')
            outputs[f'overrides/common/config/questlog/quests/{id}.json'] = native
        if any(not isinstance(v, str) for v in lang.values()):
            raise ValueError(f'{locale}: translation values must be strings')
        outputs[f'pack-fixes/assets/createsky/lang/{locale}.json'] = lang
    return {path: json.dumps(value, ensure_ascii=False, indent=2) + '\n' for path, value in outputs.items()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if generated files differ; write nothing')
    parser.add_argument('--preview', action='store_true', help='Print affected paths; write nothing')
    args = parser.parse_args()
    outputs = compile_journal()
    changed = [p for p, text in outputs.items() if not (ROOT / p).is_file() or (ROOT / p).read_text() != text]
    # Stale quests/locales need explicit deletion; never leave removed definitions active silently.
    actual = set()
    for folder in ['overrides/common/config/questlog/quests', 'overrides/common/config/questlog/chapters', 'pack-fixes/assets/createsky/lang']:
        actual.update(str(p.relative_to(ROOT)) for p in (ROOT / folder).rglob('*.json'))
    stale = sorted(actual - set(outputs))
    if stale:
        raise ValueError('Remove obsolete generated files explicitly: ' + ', '.join(stale))
    if args.preview:
        print(json.dumps({'changed': changed, 'outputs': len(outputs)}))
        return
    if args.check:
        if changed:
            raise SystemExit('Journal output drift: ' + ', '.join(changed))
    else:
        for rel in changed:
            destination = ROOT / rel
            destination.parent.mkdir(parents=True, exist_ok=True)
            temporary = destination.with_suffix('.json.tmp')
            temporary.write_text(outputs[rel])
            temporary.replace(destination)
    print(f'Journal: {len(outputs)} outputs, {len(changed)} changed')


if __name__ == '__main__':
    main()
