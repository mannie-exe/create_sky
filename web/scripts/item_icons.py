"""Texture evidence for item models; this does not simulate Minecraft rendering."""
import base64
import json
import struct


def model_textures(assets, identifier, seen=None):
    seen = set() if seen is None else seen
    if identifier in seen:
        return {}, False
    seen.add(identifier)
    namespace, path = identifier.split(':', 1)
    asset = assets.get(f'assets/{namespace}/models/{path}.json')
    if not asset:
        return {}, identifier == 'minecraft:item/generated'
    data = json.loads(asset[0])
    parent = data.get('parent', '')
    textures, flat = {}, identifier == 'minecraft:item/generated'
    if parent and not parent.startswith('builtin/'):
        textures, flat = model_textures(
            assets, parent if ':' in parent else 'minecraft:' + parent, seen)
    return {**textures, **data.get('textures', {})}, flat and not (
        'elements' in data or 'loader' in data)


def texture_path(textures, texture):
    seen = set()
    while texture and texture.startswith('#') and texture not in seen:
        seen.add(texture)
        texture = textures.get(texture[1:])
    if not texture or texture.startswith('#'):
        return None
    namespace, path = (texture if ':' in texture else 'minecraft:' + texture).split(':', 1)
    return f'assets/{namespace}/textures/{path}.png'


def layered_icon(assets, textures, flat):
    """Compose complete, static generated layers; otherwise retain the PNG fallback."""
    keys = sorted(key for key in textures if key.startswith('layer'))
    if not flat or not 2 <= len(keys) <= 5 or keys != [f'layer{i}' for i in range(len(keys))]:
        return None
    sources, images, size = [], [], None
    for key in keys:
        path = texture_path(textures, textures[key])
        if path not in assets or path + '.mcmeta' in assets:
            return None
        blob, origin = assets[path]
        if len(blob) < 24 or blob[:8] != b'\x89PNG\r\n\x1a\n':
            return None
        width, height = struct.unpack('>II', blob[16:24])
        if not width or width != height or (size is not None and size != width):
            return None
        size = width
        sources.append(origin + '!/' + path)
        encoded = base64.b64encode(blob).decode('ascii')
        images.append(f'<image width="{size}" height="{size}" href="data:image/png;base64,{encoded}"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
           f'image-rendering="pixelated">{"".join(images)}</svg>').encode()
    return svg, sources
