"""Geometry coverage, source isolation and failure boundaries for the model editor."""
import copy
import io
import json
from pathlib import Path
import struct
import sys
import unittest
import zipfile
import zlib

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from model_authoring import extrude, generate, rectangles, resource, rgba


def png(rows):
    def chunk(kind, body):
        return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', len(rows[0]), len(rows), 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(b''.join(b'\x00' + bytes(c for p in row for c in p) for row in rows)))
            + chunk(b'IEND', b''))


class Extrusion(unittest.TestCase):
    def texture(self, mask):
        return {'width': 4, 'height': 4, 'frameHeight': 4,
                'pixels': [[(120, 130, 140, 255 if (x, y) in mask else 0) for x in range(4)] for y in range(4)]}

    def test_silhouette_holes_and_exposed_surface_area(self):
        # Ring with one missing corner: concave and convex borders, plus a hole.
        mask = {(x, y) for x in range(4) for y in range(4)} - {(1, 1), (1, 2), (2, 1), (2, 2), (0, 0)}
        part = {'axis': 'z', 'center': 8, 'uv': [0, 0, 16, 16], 'span': [0, 0, 16, 16]}
        elements = extrude(part, self.texture(mask), 128, 2)
        projected, face_area = set(), 0
        for e in elements:
            for direction in e['faces']:
                a, b = e['from'], e['to']
                axes = {'north': (0, 1), 'south': (0, 1), 'up': (0, 2), 'down': (0, 2), 'west': (1, 2), 'east': (1, 2)}[direction]
                face_area += (b[axes[0]] - a[axes[0]]) * (b[axes[1]] - a[axes[1]])
                if direction == 'south':
                    pixels = {(x, y) for x in range(int(a[0] / 4), int(b[0] / 4))
                              for y in range(4 - int(b[1] / 4), 4 - int(a[1] / 4))}
                    self.assertFalse(projected & pixels)
                    projected |= pixels
        self.assertEqual(projected, mask)
        perimeter = sum((x + dx, y + dy) not in mask for x, y in mask for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)])
        self.assertEqual(face_area, len(mask) * 16 * 2 + perimeter * 4 * 2)

    def test_pixel_alignment_empty_crop_and_animated_silhouette(self):
        part = {'axis': 'x', 'center': 8, 'uv': [0, 0, 16, 16], 'span': [0, 0, 16, 16]}
        texture = self.texture({(0, 0)})
        with self.assertRaisesRegex(ValueError, 'align'):
            extrude({**part, 'uv': [0.5, 0, 16, 16]}, texture, 128, 2)
        with self.assertRaisesRegex(ValueError, 'no opaque'):
            extrude(part, self.texture(set()), 128, 2)
        texture['height'] = 8
        texture['pixels'] += self.texture({(1, 0)})['pixels']
        with self.assertRaisesRegex(ValueError, 'every frame'):
            extrude(part, texture, 128, 2)

    def test_rectangles_merge_but_never_cover_transparent_pixels(self):
        self.assertEqual(rectangles({(x, y) for x in range(8) for y in range(8)}), [(0, 0, 8, 8)])
        self.assertEqual(rectangles(set()), [])


class SourcesAndFitting(unittest.TestCase):
    def test_png_crc_and_roundtrip(self):
        pixels = [[(100, 200, 30, 255), (0, 1, 2, 0)]]
        encoded = png(pixels)
        self.assertEqual(rgba(encoded), (2, 1, pixels))
        changed = bytearray(encoded)
        changed[20] ^= 1
        with self.assertRaisesRegex(ValueError, 'checksum'):
            rgba(bytes(changed))

    def test_grayscale_png_retains_opacity_and_transparent_sample(self):
        def chunk(kind, body):
            return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body) & 0xffffffff)
        header = chunk(b'IHDR', struct.pack('>IIBBBBB', 2, 1, 8, 0, 0, 0, 0))
        pixels = chunk(b'IDAT', zlib.compress(bytes([0, 24, 128])))
        data = b'\x89PNG\r\n\x1a\n' + header + chunk(b'tRNS', bytes([0, 24])) + pixels + chunk(b'IEND', b'')
        self.assertEqual(rgba(data), (2, 1, [[(24, 24, 24, 0), (128, 128, 128, 255)]]))

    def test_resource_path_boundaries(self):
        for identifier in ['../../etc/passwd', 'a:../bad', 'a:/bad', 'a:foo//bar', 'a:foo/./bar']:
            with self.assertRaises(ValueError):
                resource(identifier, 'models', '.json')

    def test_fitting_changes_only_requested_faces_and_bounds(self):
        model = {'textures': {'lantern': 'test:block/light'}, 'elements': [{'name': 'Window', 'from': [1, 1, 1],
                 'to': [3, 3, 3], 'faces': {'north': {'uv': [0, 0, 2, 2], 'texture': '#lantern'},
                                          'south': {'uv': [0, 0, 2, 2], 'texture': '#lantern'}}}]}
        data = io.BytesIO()
        with zipfile.ZipFile(data, 'w') as z:
            z.writestr('assets/test/models/block/template.json', json.dumps(model))
            z.writestr('assets/test/textures/block/light.png', png([[(1, 2, 3, 255)]]))
        recipe = {'id': 'fitting', 'label': 'Window', 'kind': 'fitting', 'enabled': True,
                  'output': 'test:block/fitted', 'texture': {'source': 'test', 'id': 'test:block/light'},
                  'model': {'source': 'test', 'id': 'test:block/template'},
                  'edits': [{'element': 0, 'name': 'Window', 'faces': {'north': {'uv': [4, 5, 6, 7]}}}]}
        doc = {'schema': 1, 'recipes': [recipe]}
        original = copy.deepcopy(doc)
        with zipfile.ZipFile(data) as archive:
            output, previews = generate(doc, {'test': archive})
            result = next(iter(output.values()))
            self.assertEqual(result['elements'][0]['faces']['north']['uv'], [4, 5, 6, 7])
            self.assertEqual(result['elements'][0]['faces']['south'], model['elements'][0]['faces']['south'])
            self.assertEqual(doc, original)
            self.assertEqual(generate(doc, {'test': archive}), (output, previews))
            recipe['attachments'] = [{'model': recipe['model'], 'elements': [0],
                                      'textures': {'lantern': recipe['texture']}}]
            combined, _ = generate(doc, {'test': archive})
            self.assertEqual(len(next(iter(combined.values()))['elements']), 2)
            recipe['attachments'][0]['elements'] = [9]
            with self.assertRaisesRegex(ValueError, 'attachment elements'):
                generate(doc, {'test': archive})
            del recipe['attachments']
            doc['recipes'][0]['enabled'] = False
            self.assertEqual(generate(doc, {'test': archive})[0], {})
            doc['recipes'][0]['edits'][0]['name'] = 'Changed template'
            with self.assertRaisesRegex(ValueError, 'name changed'):
                generate(doc, {'test': archive})


if __name__ == '__main__':
    unittest.main()
