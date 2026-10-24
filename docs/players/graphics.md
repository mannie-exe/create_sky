# Distant terrain and shaders

Distant Horizons (DH) draws simplified terrain beyond Minecraft's normal render
distance. Shader packs change lighting and appearance; they can be enabled separately.

## Distant Horizons defaults

DH rendering is enabled by default. To restore it in an existing client, use DH's
settings or, with the client stopped, set `rendererMode = "DEFAULT"` under
`[client.advanced.debugging]` in `config/DistantHorizons.toml`.

The pack's LOD radius is **256 chunks**. A server pregenerated to 1024 chunks does
not automatically make the client draw that full radius. Raising the display
radius increases the amount of terrain the client needs to load and render.

Cave culling remains enabled in pack defaults. If low islands disappear, try
turning it off in DH's settings (`enableCaveCulling = false`).

Keep the release's DH Polygon Fix installed with DH 3.3.3 on clients, including macOS.
The fix is version-specific; remove it when upgrading DH.

## Resource packs

Create Sky 0.1.10 adds RAY's ladders and rails, Midnighttigger's Fusion
connected textures, Low Shield, Soft Weather, Cubic Sun & Moon, Fresh Flower Pots,
Create Touch-Ups, Low On Fire, Fresh Animations Details/Objects and Better Lanterns. RAY's
ladders replace the previous 3D Ladders. The original crops, cane, iron bars,
Redstone Tweaks and base Fresh Animations remain selected.

Dedicated Sugar Cane and RAY's Rails sit above 3D Crops and
Redstone Tweaks respectively. Keep 3D Crops above Fresh Flower Pots for the
four shared potted mushrooms and fungi as a fallback. **Create Sky Resource Patches**
sits above both and combines the 3D plants with Fresh pots. It also keeps Macaw's
copper and golden chains correctly colored with Better Lanterns. Keep the patch
at highest priority. Objects owns trapped-chest textures, reducing the front-face distinction
from normal chests. Lootr retains its own opened/unopened appearance.

The pinned 3D Crops archive declares a newer format despite its 1.21.1 download
tag. Default options explicitly accept this inspected archive so Minecraft does
not silently deselect it. This acceptance is specific to the pinned file; review
it again on updates. Icons is excluded because its symbols add visual clutter.

Fresh installations receive this selection. Existing installations retain player
options unless explicitly synchronized. Reordering packs changes which overlapping
models win. These packs do not restyle every modded counterpart; moving ships,
Copycats, large farms and shader interactions still need visual testing.

## Local review world

The maintainer's client has **Resource Review** in Singleplayer: a creative
superflat scene with labeled crops, pots, storage, glass, lights, rails, bars,
ladders, Create blocks and mob specimens. Hub buttons change time, weather and
game mode or teleport between sections. The equipment chest supplies gliders,
elytra, rockets, armor and held items. The equipment area has a movement pen and
a boating pool.
Use `/function resource_lab:hub` to return to the controls.

The world uses your current resource packs and shaders. It is a local testing
save, not part of the distributed pack. Create blocks are static samples, not
working production lines; the stationary mobs have no AI. Spawn eggs are
available for movement checks. Use the mosquito station's **Night / spawn**
button: those swarms disappear during daytime even with AI disabled.

The Atlas resource-pack page has **Local comparisons** with screenshots and chest
recordings. The optional **Resource Review Prototype** pack is unselected. It
tests original Macaw lantern shapes and a Lootr animation mapping whose result
is still inconclusive; it is not a released compatibility fix.

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
