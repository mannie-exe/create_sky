import copy
import io
import json
from pathlib import Path
import sys
import unittest
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from lootr_models import adapt_chest, remap_animation, build


class LootrMapping(unittest.TestCase):
    def test_attachment_aliases_do_not_rename_rig_or_material(self):
        original = {'textureSize': [64, 64], 'models': [
            {'part': 'root', 'id': 'root', 'model': 'chest_animations.jpm'},
            {'part': 'lid', 'id': 'lid', 'animations': [{'varb.unique': 'false'}]},
            {'part': 'base', 'id': 'base', 'submodels': [{'id': 'back_pivot'}]},
            {'part': 'knob', 'id': 'knob'},
        ]}
        before = copy.deepcopy(original)
        result = adapt_chest(original)
        self.assertEqual([p['part'] for p in result['models']], ['root', 'lid', 'bottom', 'lock'])
        self.assertEqual([p['id'] for p in result['models']], ['root', 'lid', 'base', 'knob'])
        self.assertNotIn('texture', result)
        self.assertEqual(result['models'][0]['model'], 'lootr_chest_animations.jpm')
        self.assertEqual(original, before)
        with self.assertRaises(ValueError):
            adapt_chest({**original, 'texture': 'minecraft:normal'})
        with self.assertRaises(ValueError):
            adapt_chest({**original, 'textureSize': [128, 128]})

    def test_animation_remap_targets_native_body_without_touching_other_names(self):
        original = [{'base.tx': 'base.tx + 1', 'back_pivot.rx': 'lid.rx + database.tx', 'var.base_state': 'true'}]
        result = remap_animation(original)
        self.assertEqual(result, [{'bottom.tx': 'bottom.tx + 1', 'back_pivot.rx': 'lid.rx + database.tx', 'var.base_state': 'true'}])
        self.assertIn('base.tx', original[0])

    def test_native_lookup_paths_and_isolated_animation_dependency(self):
        chest = {'textureSize': [64, 64], 'models': [
            {'part': 'root', 'model': 'chest_animations.jpm'},
            {'part': 'lid', 'animations': [{'varb.unique': 'false'}]},
            {'part': 'base'}, {'part': 'knob'},
        ]}
        data = io.BytesIO()
        prefix = 'assets/minecraft/emf/cem/'
        with zipfile.ZipFile(data, 'w') as archive:
            for name in ('chest', 'trapped_chest'):
                archive.writestr(prefix + name + '.jem', json.dumps(chest))
            archive.writestr(prefix + 'chest_animations.jpm', json.dumps(
                {'animations': [{'base.tx': '0.01', 'back_pivot.rx': 'lid.rx'}]}))
        with zipfile.ZipFile(data) as archive:
            result = build(archive)
        self.assertEqual(set(result), {prefix + name for name in (
            'lootr_lootr_chest.jem', 'lootr_lootr_trapped_chest.jem', 'lootr_chest_animations.jpm')})
        for name, model in result.items():
            if name.endswith('.jem'):
                self.assertIn(prefix + model['models'][0]['model'], result)
        self.assertNotIn(prefix + 'chest_animations.jpm', result)


if __name__ == '__main__':
    unittest.main()
