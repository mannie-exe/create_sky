"""Adapt Fresh Objects rigs to Lootr's native EMF lookup and part mapping."""
import copy
import json
import re
from model_authoring import require


def remap_animation(value):
    if isinstance(value, dict):
        return {re.sub(r'\bbase\.', 'bottom.', key): remap_animation(item) for key, item in value.items()}
    if isinstance(value, list):
        return [remap_animation(item) for item in value]
    if isinstance(value, str):
        return re.sub(r'\bbase\.', 'bottom.', value)
    return value


def adapt_chest(original):
    result = copy.deepcopy(original)
    require('texture' not in result and result['textureSize'] == [64, 64],
            'Fresh chest texture contract changed')
    require([part['part'] for part in result['models']] == ['root', 'lid', 'base', 'knob'],
            'Fresh chest attachment contract changed')
    require(result['models'][0]['model'] == 'chest_animations.jpm', 'Fresh animation dependency changed')
    result['models'][0]['model'] = 'lootr_chest_animations.jpm'
    require(result['models'][1]['animations'] == [{'varb.unique': 'false'}],
            'Expected ordinary/trapped chest motion')
    for part in result['models']:
        part['part'] = {'base': 'bottom', 'knob': 'lock'}.get(part['part'], part['part'])
    return result


def build(archive):
    source = 'assets/minecraft/emf/cem/'
    # These are the names requested by the installed renderer at runtime.
    # Keep its JPM separate from Fresh's vanilla animation resource.
    destination = 'assets/minecraft/emf/cem/'
    result = {}
    for original, name in [('chest', 'lootr_chest'), ('trapped_chest', 'lootr_trapped_chest')]:
        result[destination + 'lootr_' + name + '.jem'] = adapt_chest(json.loads(archive.read(source + original + '.jem')))
    animation = json.loads(archive.read(source + 'chest_animations.jpm'))
    require('base.tx' in json.dumps(animation) and 'back_pivot.rx' in json.dumps(animation),
            'Fresh chest motion contract changed')
    result[destination + 'lootr_chest_animations.jpm'] = remap_animation(animation)
    return result
