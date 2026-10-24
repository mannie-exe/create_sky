"""Bind Details' mooshroom geometry to Fresh Animations 1.11's shared cow rig."""
import copy
import json
from model_authoring import require


def build(base, details):
    prefix = 'assets/minecraft/optifine/cem/'
    current = json.loads(base.read(prefix + 'mooshroom.jem'))
    root = next(p for p in current['models'] if p['part'] == 'root')
    flags = next(p for p in current['models'] if p['part'] == 'head')['animations']
    require(root['model'] == 'cow_animations.jpm', 'Fresh mooshroom rig changed')
    require(prefix + root['model'] in base.namelist(), 'Missing shared cow animation')
    output = {}
    for name in ('mooshroom', 'mooshroom_baby'):
        model = json.loads(details.read(prefix + name + '.jem'))
        old_root = next(p for p in model['models'] if p['part'] == 'root')
        require(old_root['model'] == 'mooshroom_animations.jpm', 'Details rig changed; review adapter')
        head = next(p for p in model['models'] if p['part'] == 'head')
        # Old novelty expressions reference variables removed in FA 1.11. Keep
        # ears/tail geometry, with small motions using stable CEM inputs instead.
        head['animations'] = copy.deepcopy(flags) + [{
            'right_ear.rx': 'pi/8', 'left_ear.rx': 'pi/8',
            'right_ear.ry': '-0.08 + sin(age/27)/30',
            'left_ear.ry': '0.08 - sin(age/31)/30',
            'right_ear.rz': '-0.15 + sin(limb_swing)*limb_speed/8',
            'left_ear.rz': '0.15 - sin(limb_swing)*limb_speed/8',
            'tail.rx': '-pi/2 + 0.15 + limb_speed/3',
            'tail.rz': '-body.rz + sin(age/19)/10 + sin(limb_swing)*limb_speed/8',
        }]
        model['models'] = [head, copy.deepcopy(root)] + [
            p for p in model['models'] if p['part'] not in ('head', 'root')]
        output[prefix + name + '.jem'] = model
    return output
