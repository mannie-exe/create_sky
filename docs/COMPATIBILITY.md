# Compatibility and configuration

Create Sky targets Minecraft 1.21.1, NeoForge 21.1.263 and Java 21. Exact mod
versions are listed in [MODLIST.md](MODLIST.md). These settings apply to new exports;
updating an existing installation requires removing obsolete mods and retaining
its worlds and world-generation configuration.

## Sky islands and Distant Horizons

Clients include [DH Polygon Fix 1.0.1](https://github.com/mannie-exe/dh-polygon-fix/releases/tag/v1.0.1),
a standalone backport of upstream !126 for DH 3.3.3. It fixes an undersized native
polygon-mode query observed on Apple OpenGL and Linux/Mesa. The original DH JAR
and SSRD interfaces remain unchanged. Keep the fix on clients across platforms;
it is not needed on dedicated servers. Remove it when upgrading DH because its
client dependency deliberately requires exactly DH 3.3.3.

Sky Archipelago uses its own island generator. Distant Horizons must generate
LODs from that generator's chunks. The pack selects `CHUNKS_ONLY` with
`INTERNAL_SERVER`, four worker threads and a runtime ratio of 1.0. To recalculate
the LOW_IMPACT thread count for another server, run:

```text
/dh config common.threadPreset LOW_IMPACT
```

The thread preset is persisted as numeric settings. Four threads match the
14-processor reference host. The pack omits `serverId` so DH can create an
installation-specific identifier. Distant Horizons rendering and Iris shaders
remain disabled by default; enable rendering locally when wanted. For floating
islands, disabling DH cave culling can help preserve low-altitude island geometry.

SeedGen is incompatible with this Sky Archipelago generator and is not included.
When upgrading from 0.1.1, remove its JAR and `config/seedgen.json` on both sides.
With the game and server stopped, back up and remove affected DH `.sqlite` caches
(and any adjacent `-wal`/`-shm` files) if incorrect far terrain persists. DH can
rebuild its LODs; do not delete world region, entity, POI or player files.
This release does not automatically clear caches in existing installations.

## Shader presets

Client exports include Complementary Unbound r5.9.3, Euphoria Patches 1.10.5
(generated at launch), and BSL 10.1.8. The shader-specific `.txt` files under
`overrides/client/shaderpacks/` supply defaults when each pack is selected.
Shaders remain opt-in. These are common defaults across platforms; they do not
alter Iris or disable DH compatibility.

| Setting | Complementary / Euphoria | BSL |
| --- | --- | --- |
| Shadow distance | 128 blocks (was 192) | 128 blocks (was 256) |
| Shadow quality | Retain HIGH preset's quality/filtering | Retain 2048 map, filtered colored shadows |
| Block reflections | Low: sun/moon highlights | Retain stock reflections; advanced materials off |
| Light shafts | Low sample quality, still enabled | Retain enabled |
| Clouds, AO, bloom, water reflections | Retain stock HIGH behavior | Retain stock HIGH behavior |
| Expensive optional effects | Voxel colored lighting/world-space reflections off | Multicolored blocklight, DOF/motion blur off |

On the Apple M4 Pro reference client, Iris 1.8.14-beta.1 has 16 texture units but
reserves two for composite passes. Complementary's HIGH + DH `composite1` uses
15 active samplers and fails allocating `shadowcolor1`. `BLOCK_REFLECT_QUALITY=1`
removes three reflection-buffer samplers. Do not switch back to HIGH/ULTRA or
raise block reflections on this configuration without rechecking the limit.
Euphoria retains the pack's existing fog-distance and night-sky preferences.

Instrumented pipeline construction passed for the Overworld, Nether, and End
with all three presets on Apple M4 Pro / Iris 1.8.14-beta.1 / DH 3.3.3. The
highest measured composite/deferred sampler count was 12 for Complementary and
Euphoria, and 10 for BSL. This checks compilation and sampler allocation;
it does not validate terrain visuals, actual dimension travel, or frame rates.

The lower shadow distance limits distant moving shadows, without lowering the
shadow-map quality. Lower light-shaft sampling may show more noise in motion.
No FPS improvement is claimed without a fixed-scene benchmark. After changing
presets, check moving ships, reflective water/glass, sunrise/sunset shafts, DH
island edges, and travel through the Nether and End. Shader settings are tied
to exact pack filenames; review/migrate them whenever shader versions change.

## World settings and interactions

Keep the `eee` preset and Sky Archipelago configuration with the world. Dedicated
servers use the common TOML; single-player uses the selected default preset.
Changing these settings may change newly generated chunks. The preset does not
convert vanilla worlds. RANDOM island sizing is active; saved SPECIFIC size bands
only take effect if that mode is selected.

Carry On excludes Lootr containers and Aeronautics/Sable objects. Its generated
Create/Copycats exclusions remain in place. Test carried entities and ship storage
before relying on them in survival. Lootr supplies personal loot; it adds no
structures. Spyglass Improvements and Sound Physics are client-only. AppleSkin is
available on both sides.

Complementary Unbound 5.9.3 matches Euphoria Patcher 1.10.5. Euphoria generates the
patched shader at launch. JEI remains alongside EMI for recipe integrations.
Connector and Forgified Fabric API support the Hoofprint/Surveyor/McQoy stack.
Nine URL-pinned dependencies require manual provider-version checks during updates.

## Known limitations

Analog Audio 0.1.5-hotfix.1 has logged `NoSuchMethodException` during Create movement
registration. Create Radars 0.4.9.4 has logged errors for empty model/blockstate
JSONs. These did not prevent the earlier title-screen and sky-world smoke test;
they remain unresolved. A separate clean-default run crashed in native Apple
Metal/IOGPU code without an identified mod cause.

Moving ships, survival progression, resource access, structure placement, shader
rendering, and acoustics inside moving ships need gameplay testing. Packaging
checks do not establish these behaviors. See [DECISIONS.md](DECISIONS.md) for dated
evidence and the limits of earlier tests.
