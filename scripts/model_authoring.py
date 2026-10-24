"""Pinned Minecraft model inputs, alpha extrusion, and explicit UV fitting.

The same functions serve the local editor and the resource-pack builder. Preview
never publishes files. Recipes contain resource IDs, never arbitrary output paths.
"""
import base64
import copy
import json
import math
import re
import struct
import zlib


def require(condition, message):
    if not condition:
        raise ValueError(message)


def resource(value, kind, suffix):
    require(isinstance(value, str) and re.fullmatch(r'[a-z0-9_.-]+:[a-z0-9_/.-]+', value),
            'Expected a namespaced resource ID')
    namespace, name = value.split(':')
    require(all(part not in ('', '.', '..') for part in name.split('/')), 'Invalid resource path')
    return f'assets/{namespace}/{kind}/{name}{suffix}'


def numbers(values, size, low, high, label):
    require(isinstance(values, list) and len(values) == size
            and all(type(n) in (int, float) and math.isfinite(n) and low <= n <= high for n in values),
            f'{label}: expected {size} finite values from {low} to {high}')


def rgba(data):
    """Decode bounded RGBA8 or indexed PNGs without adding a build dependency.

    Other PNG encodings deliberately require an adapter instead of silently
    interpreting their alpha as geometry. No source artwork is rewritten.
    """
    require(data[:8] == b'\x89PNG\r\n\x1a\n', 'Expected PNG texture')
    offset, chunks = 8, {}
    while offset < len(data):
        require(offset + 12 <= len(data), 'Truncated PNG')
        length, tag = struct.unpack('>I4s', data[offset:offset + 8])
        require(length <= 4 * 1024 * 1024 and offset + length + 12 <= len(data), 'Invalid PNG chunk')
        payload = data[offset + 8:offset + 8 + length]
        crc = struct.unpack('>I', data[offset + 8 + length:offset + 12 + length])[0]
        require(zlib.crc32(tag + payload) & 0xffffffff == crc, 'PNG checksum mismatch')
        chunks.setdefault(tag, []).append(payload)
        offset += length + 12
        if tag == b'IEND':
            break
    require(len(chunks.get(b'IHDR', [])) == 1, 'Missing PNG header')
    width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', chunks[b'IHDR'][0])
    require(0 < width <= 256 and 0 < height <= 4096, 'Texture exceeds model-authoring limits')
    require((compression, filtering, interlace) == (0, 0, 0)
            and ((depth, color) == (8, 6) or color == 3 and depth in (1, 2, 4, 8)),
            'Model authoring requires non-interlaced RGBA8 or indexed textures')
    bpp = 4 if color == 6 else 1
    stride = width * 4 if color == 6 else (width * depth + 7) // 8
    palette = b''.join(chunks.get(b'PLTE', []))
    transparency = b''.join(chunks.get(b'tRNS', []))
    require(color != 3 or 0 < len(palette) <= 768 and len(palette) % 3 == 0, 'Invalid indexed palette')
    size = height * (stride + 1)
    decoder = zlib.decompressobj()
    raw = decoder.decompress(b''.join(chunks.get(b'IDAT', [])), size + 1)
    require(len(raw) == size and decoder.eof, 'Invalid PNG pixel length')
    rows, previous = [], bytearray(stride)
    for y in range(height):
        start = y * (stride + 1)
        method, row = raw[start], bytearray(raw[start + 1:start + 1 + stride])
        require(method in range(5), 'Unknown PNG filter')
        for i in range(len(row)):
            a, b, c = (row[i - bpp] if i >= bpp else 0), previous[i], (previous[i - bpp] if i >= bpp else 0)
            p = a + b - c
            pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
            predictor = (0, a, b, (a + b) // 2, a if pa <= pb and pa <= pc else b if pb <= pc else c)[method]
            row[i] = (row[i] + predictor) & 255
        if color == 6:
            rows.append([tuple(row[x:x + 4]) for x in range(0, len(row), 4)])
        else:
            pixels = []
            for x in range(width):
                index = row[x * depth // 8] >> (8 - depth - x * depth % 8) & ((1 << depth) - 1)
                require(index * 3 + 3 <= len(palette), 'Palette index out of range')
                pixels.append((*palette[index * 3:index * 3 + 3], transparency[index] if index < len(transparency) else 255))
            rows.append(pixels)
        previous = row
    return width, height, rows


class Assets:
    def __init__(self, archives):
        self.archives = archives

    def read(self, source, path):
        require(source in self.archives, f'Unknown pinned source: {source}')
        archive = self.archives[source]
        require(path in archive.namelist(), f'Missing input: {source}/{path}')
        require(archive.getinfo(path).file_size <= 4 * 1024 * 1024, 'Input asset too large')
        return archive.read(path)

    def model(self, source, identifier):
        return json.loads(self.read(source, resource(identifier, 'models', '.json')))

    def texture(self, source, identifier):
        path = resource(identifier, 'textures', '.png')
        data = self.read(source, path)
        width, height, pixels = rgba(data)
        archive = self.archives[source]
        metadata = json.loads(archive.read(path + '.mcmeta')) if path + '.mcmeta' in archive.namelist() else {}
        animation = metadata.get('animation')
        frame_width = animation.get('width', width) if animation is not None else width
        frame_height = animation.get('height', frame_width) if animation is not None else height
        require(frame_width == width and frame_height > 0 and height % frame_height == 0,
                'Only vertically stacked texture frames are supported')
        if animation is not None:
            duration = animation.get('frametime', 1)
            require(type(duration) is int and duration > 0, 'Invalid animation frame duration')
            frames = animation.get('frames', list(range(height // frame_height)))
            require(isinstance(frames, list) and 0 < len(frames) <= 4096, 'Invalid animation frame sequence')
            for frame in frames:
                index = frame.get('index') if isinstance(frame, dict) else frame
                time = frame.get('time', duration) if isinstance(frame, dict) else duration
                require(type(index) is int and 0 <= index < height // frame_height
                        and type(time) is int and time > 0, 'Invalid animation frame')
        return {'width': width, 'height': height, 'frameHeight': frame_height,
                'pixels': pixels, 'animation': animation,
                'url': 'data:image/png;base64,' + base64.b64encode(data).decode()}


def rectangles(mask):
    """Greedy maximal rectangles; every occupied pixel belongs to exactly one."""
    pending = {tuple(p) for p in mask}
    result = []
    while pending:
        x, y = min(pending, key=lambda p: (p[1], p[0]))
        width = 1
        while (x + width, y) in pending:
            width += 1
        height = 1
        while all((x + dx, y + height) in pending for dx in range(width)):
            height += 1
        pending.difference_update((x + dx, y + dy) for dx in range(width) for dy in range(height))
        result.append((x, y, x + width, y + height))
    return result


def extrude(part, texture, threshold, depth):
    numbers(part['uv'], 4, 0, 16, 'UV crop')
    numbers(part['span'], 4, -16, 32, 'Plane bounds')
    require(part['axis'] in ('x', 'z'), 'Extrusion axis must be x or z')
    require(type(part['center']) in (int, float) and math.isfinite(part['center'])
            and -16 + depth / 2 <= part['center'] <= 32 - depth / 2, 'Invalid plane center')
    u0, v0, u1, v1 = part['uv']
    a0, y0, a1, y1 = part['span']
    require(u0 < u1 and v0 < v1 and a0 < a1 and y0 < y1, 'Crops and bounds must have positive area')
    width, height = texture['width'], texture['frameHeight']
    crop = [u0 * width / 16, v0 * height / 16, u1 * width / 16, v1 * height / 16]
    require(all(n == int(n) for n in crop), 'Crop must align to source pixels')
    left, top, right, bottom = map(int, crop)
    mask = {(x, y) for y in range(top, bottom) for x in range(left, right)
            if texture['pixels'][y][x][3] >= threshold}
    for frame in range(height, texture['height'], height):
        require(mask == {(x, y) for y in range(top, bottom) for x in range(left, right)
                         if texture['pixels'][frame + y][x][3] >= threshold},
                'Animated alpha masks must agree in every frame')
    require(mask, 'Crop contains no opaque pixels')
    require(len(mask) <= 4096, 'Extrusion exceeds 4096 source pixels')
    near, far = part['center'] - depth / 2, part['center'] + depth / 2
    def point(u, v, d):
        a = a0 + (u - left) / (right - left) * (a1 - a0)
        y = y1 - (v - top) / (bottom - top) * (y1 - y0)
        return [d, y, a] if part['axis'] == 'x' else [a, y, d]
    def box(x0, yy0, x1, yy1, faces):
        p, q = point(x0, yy1, near), point(x1, yy0, far)
        return {'from': p, 'to': q, 'faces': faces}
    def face(uv):
        return {'uv': uv, 'texture': '#surface'}
    def uv(x0, yy0, x1, yy1):
        return [x0 * 16 / width, yy0 * 16 / height, x1 * 16 / width, yy1 * 16 / height]
    elements = []
    front, back = ('west', 'east') if part['axis'] == 'x' else ('south', 'north')
    for x0, yy0, x1, yy1 in rectangles(mask):
        normal = uv(x0, yy0, x1, yy1)
        mirrored = [normal[2], normal[1], normal[0], normal[3]]
        elements.append(box(x0, yy0, x1, yy1, {front: face(normal), back: face(mirrored)}))
    # Emit only exposed perimeter. Merge contiguous runs, sampling the adjacent
    # opaque texel strip across the depth. Shared interior faces never enter JSON.
    sides = [('up', 0, -1), ('down', 0, 1),
             ('north' if part['axis'] == 'x' else 'west', -1, 0),
             ('south' if part['axis'] == 'x' else 'east', 1, 0)]
    for direction, dx, dy in sides:
        boundary = {(x, y) for x, y in mask if (x + dx, y + dy) not in mask}
        # Prevent rectangle merging across the normal direction: each boundary
        # row/column remains its own surface, including concave holes.
        groups = {}
        for x, y in boundary:
            groups.setdefault(y if dy else x, set()).add((x, y))
        for key in sorted(groups):
            group = groups[key]
            for x0, yy0, x1, yy1 in rectangles(group):
                element = box(x0, yy0, x1, yy1, {direction: face(uv(x0, yy0, x1, yy1))})
                if dy:
                    plane = point(x0, yy0 if dy < 0 else yy1, near)[1]
                    element['from'][1] = element['to'][1] = plane
                else:
                    axis = 2 if part['axis'] == 'x' else 0
                    plane = point(x0 if dx < 0 else x1, yy0, near)[axis]
                    element['from'][axis] = element['to'][axis] = plane
                elements.append(element)
    return elements


def validate_model(model):
    elements = model.get('elements')
    require(isinstance(elements, list) and 0 < len(elements) <= 2048, 'Expected 1 to 2048 model elements')
    for element in elements:
        numbers(element['from'], 3, -16, 32, 'Element start')
        numbers(element['to'], 3, -16, 32, 'Element end')
        require(all(a <= b for a, b in zip(element['from'], element['to'])), 'Reversed element bounds')
        for direction, face in element['faces'].items():
            require(direction in ('north', 'south', 'east', 'west', 'up', 'down'), 'Unknown face')
            numbers(face['uv'], 4, 0, 16, 'Face UV')
            require(face.get('rotation', 0) in (0, 90, 180, 270), 'Invalid UV rotation')
            require(face['texture'].startswith('#') and face['texture'][1:] in model['textures'], 'Unbound texture')


def generate(document, archives):
    require(document.get('schema') == 1, 'Unsupported model recipe schema')
    require(isinstance(document.get('recipes'), list) and len(document['recipes']) <= 64, 'Expected up to 64 recipes')
    assets, outputs, previews, ids = Assets(archives), {}, [], set()
    for recipe in document['recipes']:
        identifier = recipe['id']
        require(isinstance(identifier, str) and re.fullmatch(r'[a-z0-9_-]{1,80}', identifier)
                and identifier not in ids, 'Invalid or duplicate recipe ID')
        ids.add(identifier)
        require(type(recipe['enabled']) is bool and isinstance(recipe['label'], str)
                and 0 < len(recipe['label']) <= 120, 'Invalid recipe label or selection')
        texture = assets.texture(recipe['texture']['source'], recipe['texture']['id'])
        textures = {recipe['texture']['id']: texture}
        if recipe['kind'] == 'extrusion':
            require(type(recipe['threshold']) is int and 1 <= recipe['threshold'] <= 255, 'Alpha threshold must be 1 to 255')
            require(type(recipe['depth']) in (int, float) and math.isfinite(recipe['depth'])
                    and 0.125 <= recipe['depth'] <= 4, 'Depth must be 0.125 to 4')
            require(isinstance(recipe['parts'], list) and 0 < len(recipe['parts']) <= 8, 'Expected 1 to 8 planes')
            model = {'ambientocclusion': False, 'render_type': 'minecraft:cutout',
                     'textures': {'surface': recipe['texture']['id'], 'particle': recipe['texture']['id']},
                     'elements': []}
            for index, part in enumerate(recipe['parts']):
                binding = part.get('texture', recipe['texture'])
                current = assets.texture(binding['source'], binding['id']) if 'texture' in part else texture
                textures[binding['id']] = current
                key = f'plane{index}'
                model['textures'][key] = binding['id']
                for element in extrude(part, current, recipe['threshold'], recipe['depth']):
                    for face in element['faces'].values():
                        face['texture'] = '#' + key
                    model['elements'].append(element)
            if 'faces' in recipe:
                require(isinstance(recipe['faces'], list) and recipe['faces']
                        and set(recipe['faces']) <= {'north', 'south', 'east', 'west', 'up', 'down'},
                        'Invalid extrusion face selection')
                for element in model['elements']:
                    element['faces'] = {k: v for k, v in element['faces'].items() if k in recipe['faces']}
                model['elements'] = [e for e in model['elements'] if e['faces']]
        elif recipe['kind'] == 'fitting':
            model = assets.model(recipe['model']['source'], recipe['model']['id'])
            require('parent' not in model and 'elements' in model, 'Fitting requires an explicit template model')
            model['textures'] = {key: recipe['texture']['id'] for key in model['textures']}
            model['render_type'] = 'minecraft:cutout'
            require(isinstance(recipe['edits'], list) and len(recipe['edits']) <= 128, 'Too many element edits')
            seen = set()
            for edit in recipe['edits']:
                index = edit['element']
                require(type(index) is int and 0 <= index < len(model['elements']) and index not in seen,
                        'Invalid or duplicate element index')
                seen.add(index)
                element = model['elements'][index]
                # Pinned bytes plus name guards prevent silent fitting to a new element.
                require(edit['name'] == element.get('name', ''), 'Fitting element name changed')
                for key in ('from', 'to'):
                    if key in edit:
                        element[key] = copy.deepcopy(edit[key])
                for direction, face in edit.get('faces', {}).items():
                    require(direction in element['faces'] and set(face) <= {'uv', 'rotation'}, 'Unknown fitting face field')
                    element['faces'][direction].update(copy.deepcopy(face))
        else:
            raise ValueError('Unknown model recipe kind')
        validate_model(model)
        output = resource(recipe['output'], 'models', '.json')
        require(output not in outputs, 'Duplicate generated model')
        # Reserve disabled destinations too, so toggling recipes cannot change ownership.
        outputs[output] = model if recipe['enabled'] else None
        previews.append({'id': identifier, 'model': model,
                         'texture': {k: v for k, v in texture.items() if k != 'pixels'},
                         'textures': {key: {k: v for k, v in value.items() if k != 'pixels'}
                                      for key, value in textures.items()},
                         'elements': len(model['elements']),
                         'faces': sum(len(e['faces']) for e in model['elements'])})
    return {path: model for path, model in outputs.items() if model is not None}, previews
