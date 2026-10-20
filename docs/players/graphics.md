# Distant terrain and shaders

Distant Horizons (DH) draws simplified terrain beyond Minecraft's normal render
distance. Shader packs change lighting and appearance; they can be enabled separately.

## Distant Horizons defaults

Version 0.1.4 enables DH rendering. **Version 0.1.3 ships with it disabled**:
enable rendering in DH's settings, or, with the client stopped, set
`rendererMode = "DEFAULT"` under `[client.advanced.debugging]` in
`config/DistantHorizons.toml`.

The pack's LOD radius is **256 chunks**. A server pregenerated to 1024 chunks does
not automatically make the client draw that full radius. Raising the display
radius increases the amount of terrain the client needs to load and render.

Cave culling remains enabled in pack defaults. If low islands disappear, try
turning it off in DH's settings (`enableCaveCulling = false`).

Keep DH Polygon Fix 1.0.1 installed with DH 3.3.3 on clients, including macOS.
The fix is version-specific; remove it when upgrading DH.

## Shader selection

Shaders are off by default. Select a pack through Iris's shader settings:

| Pack | Included version | Notes |
| --- | --- | --- |
| Complementary Unbound | r5.9.3 | Balanced preset with Low block reflections |
| Complementary + Euphoria | 1.10.5 patches for r5.9.3 | Generated at launch; retains the pack's fog and night-sky settings |
| BSL | 10.1.8 | Alternative preset with advanced materials disabled |

All three use 128-block shadow distance. Complementary and Euphoria also use
Low light-shaft sampling. Their clouds, water reflections, ambient occlusion,
bloom and anti-aliasing retain the stock HIGH behavior. BSL disables depth of
field, motion blur and multicolored blocklight.

These settings reduce selected rendering costs while retaining most effects;
there is no measured FPS guarantee. Check moving ships, water and glass, island
edges, and sunrise/sunset after changing settings.

## Texture-unit errors

If Iris reports `No more available texture units while activating sampler shadowcolor1`,
restore the supplied Complementary/Euphoria settings, especially **Low block
reflections** (`BLOCK_REFLECT_QUALITY=1`). Selecting HIGH or ULTRA can overwrite
that choice and exceed the tested macOS texture-unit budget.

Shader settings files live beside their shader packs in `shaderpacks/`. Their
names must match the exact shader ZIP or generated folder. Use the settings from
the same Create Sky release as the shader. BSL is included as an alternative.
The [maintainer reference](../development/compatibility.md#shader-verification)
records the sampler measurements and their limits.

## Missing distant terrain

1. Confirm DH rendering is enabled and check the LOD radius. Test with shaders
   off to separate a DH problem from a shader problem.
2. Check cave culling if low-altitude islands are missing.
3. On multiplayer, allow time for LOD transfer. Look for DH's level key and cache
   path in `logs/latest.log`, followed by download or synchronization errors.
4. Ask the server owner to confirm that the world still has its DH database.
   Pregenerated Minecraft chunks and a completed DH database are different things.

A changed server bookmark name can select another client cache directory because
this pack uses `serverFolderNameMode = "NAME_ONLY"`. The DH level key identifies
the world within that directory. Do not change `serverId` merely because the
client and server config values differ; they are installation-specific.

Avoid clearing caches as a first step. It removes usable LODs and forces another
transfer or rebuild. If terrain is wrong rather than missing, first check the
world generator and [SeedGen compatibility](../development/compatibility.md#world-generation).
