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


def translated(base, patch, location='locale'):
    """Sparse locale overrides; omitted values inherit English, empty values do not."""
    if isinstance(base, dict):
        if not isinstance(patch, dict) or set(patch) - set(base):
            raise ValueError(f'{location}: unknown localization keys')
        return {k: translated(v, patch[k], location + '/' + k) if k in patch else copy.deepcopy(v)
                for k, v in base.items()}
    return copy.deepcopy(patch)


def validate_definition(native, id, entries):
    if not isinstance(native.get('objectives'), list) or not native['objectives']:
        raise ValueError(f'{id}: at least one objective is required')
    if not isinstance(native.get('rewards', []), list):
        raise ValueError(f'{id}: rewards must be a list')
    def objectives(items):
        for item in items:
            if not isinstance(item, dict) or not isinstance(item.get('type'), str):
                raise ValueError(f'{id}: objectives need a native type')
            objectives(item.get('objectives', []))
    objectives(native['objectives'])
    # Native requirements can contain AND/OR arrays of quest IDs. Check local IDs
    # while leaving other namespaces to their owning mods.
    def references(value):
        if isinstance(value, list):
            for child in value: references(child)
        elif isinstance(value, str) and value.startswith('questlog:'):
            if value.removeprefix('questlog:') not in entries:
                raise ValueError(f'{id}: unknown required quest {value}')
    references(native.get('requirements', []))
    def rewards(items):
        if not isinstance(items, list):
            raise ValueError(f'{id}: nested rewards must be a list')
        for reward in items:
            if not isinstance(reward, dict) or not isinstance(reward.get('type'), str):
                raise ValueError(f'{id}: rewards need a native type')
            kind = reward['type']
            required = {'questlog:item': 'item', 'questlog:experience': 'experience',
                        'questlog:command': 'command', 'questlog:loot_table': 'loot_table'}
            if kind in required and required[kind] not in reward:
                raise ValueError(f'{id}: {kind} requires {required[kind]}')
            if kind == 'questlog:item':
                item = reward['item']
                if not isinstance(item, (str, dict)) or not item:
                    raise ValueError(f'{id}: item reward requires an item ID or stack object')
                count = reward.get('count', item.get('count', 1) if isinstance(item, dict) else 1)
                if type(count) is not int or count < 1:
                    raise ValueError(f'{id}: item reward count must be a positive integer')
            if kind == 'questlog:experience' and type(reward['experience']) is not int:
                raise ValueError(f'{id}: experience must be an integer')
            if kind == 'questlog:command' and (not isinstance(reward['command'], str) or not reward['command'].startswith('/')):
                raise ValueError(f'{id}: reward command must start with /')
            if kind == 'questlog:loot_table' and (not isinstance(reward['loot_table'], str) or not reward['loot_table']):
                raise ValueError(f'{id}: reward loot table must be an ID')
            if kind == 'questlog:choice':
                if not reward.get('choices'): raise ValueError(f'{id}: choice reward needs choices')
                rewards(reward['choices'])
            if kind == 'questlog:random':
                if not reward.get('entries'): raise ValueError(f'{id}: random reward needs entries')
                rewards([entry['reward'] for entry in reward['entries']])
    rewards(native.get('rewards', []))


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
    for id, entry in entries.items():
        validate_definition(entry['definition'], id, entries)
    for locale, text in locales.items():
        assert text['schema'] == 1
        if locale != 'en_us':
            text = translated(locales['en_us'], text, locale)
        shared = text.get('shared')
        if not isinstance(shared, dict):
            raise ValueError(f'{locale}: shared disclaimers must be keyed messages')
        for key, message in shared.items():
            identifier(key)
            if not isinstance(message, str) or not message.strip():
                raise ValueError(f'{locale}/{key}: disclaimer message must be nonempty text')
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
            if disclaimer is not None and (not isinstance(disclaimer, str) or disclaimer not in shared):
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


def output_changes(root, outputs):
    changed = [p for p, text in outputs.items() if not (root / p).is_file() or (root / p).read_text() != text]
    stale = []
    for folder, marker in [('overrides/common/config/questlog/quests', 'title'),
                           ('overrides/common/config/questlog/chapters', 'name'),
                           ('pack-fixes/assets/createsky/lang', None)]:
        for p in (root / folder).rglob('*.json'):
            rel = str(p.relative_to(root))
            if rel in outputs: continue
            data = read(p)
            owned = (isinstance(data.get(marker), str) and data[marker].startswith('createsky.journal.')) if marker else bool(data) and all(k.startswith('createsky.journal.') for k in data)
            if owned: stale.append(rel)
    return changed, sorted(stale)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if generated files differ; write nothing')
    parser.add_argument('--preview', action='store_true', help='Print affected paths; write nothing')
    args = parser.parse_args()
    outputs = compile_journal()
    changed, stale = output_changes(ROOT, outputs)
    if args.preview:
        print(json.dumps({'changed': changed, 'removed': stale, 'outputs': len(outputs)}))
        return
    if args.check:
        if changed or stale:
            raise SystemExit('Journal output drift: ' + ', '.join(changed + stale))
    else:
        for rel in changed:
            destination = ROOT / rel
            destination.parent.mkdir(parents=True, exist_ok=True)
            temporary = destination.with_suffix('.json.tmp')
            temporary.write_text(outputs[rel])
            temporary.replace(destination)
        for rel in stale:
            (ROOT / rel).unlink()
    print(f'Journal: {len(outputs)} outputs, {len(changed)} changed, {len(stale)} removed')


if __name__ == '__main__':
    main()
