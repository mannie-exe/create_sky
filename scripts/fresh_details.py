"""Bind reviewed Details geometry to Fresh Animations 1.11's shared rigs."""
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
    for name, base_name, stale_rig in (
        ('villager', 'villager', 'villager_animations.jpm'),
        ('villager2', 'villager', 'villager2_animations.jpm'),
        ('wandering_trader', 'wandering_trader', 'wandering_trader_animations.jpm'),
        ('elder_guardian', 'elder_guardian', 'elder_guardian_animations.jpm'),
    ):
        current = json.loads(base.read(prefix + base_name + '.jem'))
        model = json.loads(details.read(prefix + name + '.jem'))
        old_root = next(p for p in model['models'] if p['part'] == 'root')
        require(old_root['model'] == stale_rig, f'{name}: Details rig changed')
        root = next(p for p in current['models'] if p['part'] == 'root')
        require(prefix + root['model'] in base.namelist(), f'{name}: missing base rig')
        # Flags must run before the shared rig. Keep Details' meshes and extra
        # animation channels, but use the base model's current rig and species flags.
        flag_parts = []
        for part in current['models']:
            if not part.get('animations'):
                continue
            target = next(p for p in model['models'] if p['part'] == part['part'])
            target['animations'] = copy.deepcopy(part['animations']) + target.get('animations', [])
            flag_parts.append(target)
        model['models'] = flag_parts + [copy.deepcopy(root)] + [
            p for p in model['models'] if p['part'] != 'root' and p not in flag_parts]
        output[prefix + name + '.jem'] = model
    for name in ('donkey', 'mule'):
        current = json.loads(base.read(prefix + name + '.jem'))
        detail = json.loads(details.read(prefix + name + '.jem'))
        root = next(p for p in current['models'] if p['part'] == 'root')
        require(root['model'] == 'donkey_animations.jpm', f'{name}: shared rig changed')
        body = next(p for p in current['models'] if p['part'] == 'body')
        old_body = next(p for p in detail['models'] if p['part'] == 'body')
        straps = next(p for p in old_body['submodels'] if p['id'] == 'straps')
        require(not any(p['id'] == 'straps' for p in body['submodels']), f'{name}: base now has straps')
        # The new base rig moves the saddle and bridle into the body hierarchy.
        # Retain Details' chest straps on that rig instead of its obsolete skeleton.
        body['submodels'].append(copy.deepcopy(straps))
        head = next(p for p in current['models'] if p['part'] == 'head')
        head['animations'].append({'straps.visible': 'left_chest.visible'})
        output[prefix + name + '.jem'] = current
    return output
