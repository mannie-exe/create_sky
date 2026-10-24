import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

spec = importlib.util.spec_from_file_location('inspect_resourcepack', Path(__file__).parents[1] / 'scripts/inspect_resourcepack.py')
inspector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inspector)


class ResourcePackTests(unittest.TestCase):
    def test_only_matching_overlays_replace_base_resources(self):
        with tempfile.TemporaryDirectory() as temporary:
            archive = Path(temporary) / 'sample.zip'
            with ZipFile(archive, 'w') as target:
                target.writestr('pack.mcmeta', json.dumps({
                    'pack': {'pack_format': 34},
                    'overlays': {'entries': [
                        {'directory': 'current', 'formats': [32, 34]},
                        {'directory': 'future', 'formats': {'min_inclusive': 35, 'max_inclusive': 55}},
                    ]},
                }))
                target.writestr('assets/minecraft/models/block/glass.json', 'base')
                target.writestr('current/assets/minecraft/models/block/glass.json', 'current')
                target.writestr('future/assets/minecraft/models/block/glass.json', 'future')
            _, files = inspector.resources(archive)
            self.assertEqual(files, {'assets/minecraft/models/block/glass.json': b'current'})
            report = inspector.inspect(archive, {'same': files, 'different': {next(iter(files)): b'base'}})
            self.assertTrue(report['declaresTargetFormat'])
            self.assertNotIn('same', report['overlaps'])
            self.assertEqual(report['overlaps']['different']['count'], 1)

    def test_format_boundaries(self):
        self.assertTrue(inspector.supports(34, 34))
        self.assertTrue(inspector.supports([32, 34], 34))
        self.assertFalse(inspector.supports([35, 55], 34))
        self.assertFalse(inspector.supports(None, 34))

    def test_fusion_overrides_are_explicit(self):
        with tempfile.TemporaryDirectory() as temporary:
            archive = Path(temporary) / 'fusion.zip'
            with ZipFile(archive, 'w') as target:
                target.writestr('pack.mcmeta', json.dumps({'pack': {'pack_format': 34}, 'fusion': {'overrides_folder': 'fusion', 'min_version': '1.3.13'}}))
                target.writestr('fusion/assets/minecraft/models/block/glass.json', '{"loader":"fusion:model"}')
            self.assertEqual(inspector.inspect(archive)['effectiveAssetCount'], 0)
            report = inspector.inspect(archive, fusion=True)
            self.assertEqual(report['effectiveAssetCount'], 1)
            self.assertTrue(report['fusionOverridesIncluded'])
            self.assertEqual(report['fusionMinimum'], '1.3.13')
