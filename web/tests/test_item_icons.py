import base64
import json
import struct
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from item_icons import layered_icon, model_textures, texture_path


class ItemIconTests(unittest.TestCase):
    def setUp(self):
        self.png = b'\x89PNG\r\n\x1a\n' + bytes(8) + struct.pack('>II', 16, 16)
        self.assets = {
            'assets/test/models/item/base.json': (json.dumps({
                'parent': 'minecraft:item/generated',
                'textures': {'layer0': 'test:item/fabric', 'layer1': '#frame',
                             'frame': 'test:item/frame'},
            }).encode(), 'test.jar'),
            'assets/test/textures/item/fabric.png': (self.png + b'fabric', 'test.jar'),
            'assets/test/textures/item/frame.png': (self.png + b'frame', 'test.jar'),
        }

    def test_composes_layers_in_order_with_source_provenance(self):
        textures, flat = model_textures(self.assets, 'test:item/base')
        svg, sources = layered_icon(self.assets, textures, flat)
        self.assertEqual(len(sources), 2)
        self.assertTrue(sources[1].endswith('/frame.png'))
        self.assertLess(svg.index(base64.b64encode(self.png + b'fabric')),
                        svg.index(base64.b64encode(self.png + b'frame')))

    def test_incomplete_animated_and_geometric_models_fall_back(self):
        textures, flat = model_textures(self.assets, 'test:item/base')
        self.assertIsNone(layered_icon(self.assets, textures, False))
        self.assets['assets/test/textures/item/frame.png.mcmeta'] = (b'{}', 'test.jar')
        self.assertIsNone(layered_icon(self.assets, textures, flat))
        del self.assets['assets/test/textures/item/frame.png.mcmeta']
        del self.assets['assets/test/textures/item/frame.png']
        self.assertIsNone(layered_icon(self.assets, textures, flat))
        self.assets['assets/test/models/item/child.json'] = (json.dumps({
            'parent': 'test:item/base', 'elements': [],
        }).encode(), 'test.jar')
        self.assertFalse(model_textures(self.assets, 'test:item/child')[1])

    def test_alias_and_parent_cycles_terminate(self):
        self.assertIsNone(texture_path({'a': '#b', 'b': '#a'}, '#a'))
        self.assets['assets/test/models/item/loop.json'] = (
            b'{"parent":"test:item/loop"}', 'test.jar')
        self.assertEqual(model_textures(self.assets, 'test:item/loop'), ({}, False))
