# Compatibility and verification

This reference describes constraints behind the current pack configuration.
Player instructions belong in [graphics](../players/graphics.md) and
[server maintenance](../players/server.md). Exact versions are in the
[content list](../MODLIST.md), with authoritative selections in `empack.yml` and
`empack.lock`.

## DH Polygon Fix

Clients include [DH Polygon Fix 1.0.1](https://github.com/mannie-exe/dh-polygon-fix/releases/tag/v1.0.1)
with the original DH 3.3.3 JAR. It backports upstream !126's two-integer
polygon-mode query. The earlier scalar query overwrote an adjacent canary on
Apple OpenGL and Linux/Mesa and could cause delayed native JVM crashes.

The patch requires exactly DH 3.3.3. Remove it when upgrading DH and verify the
replacement includes the upstream fix. Keep it client-only across supported
platforms; dedicated servers do not need it. SSRD interfaces are unchanged.

Version 1.0.1 uses `design.inherent`; the runtime query implementation is otherwise
unchanged from 1.0.0. Transformation, missing/duplicate target, server exclusion,
three-OS builds and Apple/Mesa native probes passed. See the
[release evidence](decisions.md#2026-10-19---release-dh-maintenance-update-in-create-sky-013)
for the tested scope.

## World generation

Sky Archipelago requires LODs from its actual island chunks. The pack uses
`CHUNKS_ONLY` and `INTERNAL_SERVER`, four workers and a runtime ratio of 1.0.
The worker count was chosen for a 14-processor host, not measured as optimal
for all machines.

Preserve both the saved **eee** preset and common Sky Archipelago TOML.
Single-player selects the preset; dedicated servers prioritize common config.
The current sizing mode is RANDOM. SPECIFIC size bands are dormant until that
mode is selected. Existing vanilla worlds are not converted.

SeedGen was removed after its reconstructed vanilla noise terrain failed to
match Sky Archipelago. For installations upgrading from 0.1.1, remove its JAR
and `config/seedgen.json` on both sides. Only consider rebuilding affected DH
caches after confirming they contain incorrect SeedGen terrain. Stop the relevant
process first and retain recovery copies; do not remove world region, entity,
POI, player or Sable data.

DH `serverId` is deliberately absent from authored overrides so installations
receive independent IDs. The local October 20 investigation found an unchanged
world key and a healthy 350,553-record server LOD database. The client renderer
was disabled and downloads reported incomplete payloads. Enabling rendering and
seeding the matching client cache with SQLite's backup API bypassed those issues;
this was a local remediation, not a network fix shipped by the modpack.

Current source enables the renderer but leaves cave culling enabled and the LOD
radius at 256 chunks. The local test instance's disabled cave culling and seeded
cache are not export defaults.

## Dependency constraints

- Complementary r5.9.3 is paired with Euphoria Patcher 1.10.5. Euphoria generates
  its patched shader at launch; its generated folder name determines the preset filename.
- JEI remains alongside EMI for recipe integrations.
- Connector and Forgified Fabric API support the Hoofprint/Surveyor/McQoy stack.
- Ten URL pins handle provider metadata conflicts involving old exact versions,
  Connector/Forgified Fabric API and client-only dependencies. Check runtime
  metadata before replacing them with provider roots or downgrading dependencies.
- The eleventh URL pin is the published DH Polygon Fix binary with content digests.
- Carry On excludes Lootr containers and Aeronautics/Sable objects and retains
  the generated Create/Copycats exclusions. These exclusions do not verify every
  carried entity or ship-storage interaction.

## Shader verification

The Apple M4 Pro reference client exposes 16 texture units; Iris
1.8.14-beta.1 reserves two for composite passes. Complementary HIGH with DH used
15 active samplers in `composite1`, failing on `shadowcolor1`. Low block
reflections (`BLOCK_REFLECT_QUALITY=1`) removed three reflection-buffer samplers.

| Preset | Overworld maximum | Nether maximum | End maximum |
| --- | --- | --- | --- |
| Complementary r5.9.3 | 12 | 7 | 12 |
| Euphoria 1.10.5 | 12 | 7 | 12 |
| BSL 10.1.8 | 10 | 10 | 10 |

These are measured composite/deferred sampler counts. Instrumented construction
of all nine shader/dimension pipelines passed with DH 3.3.3, SSRD and Polygon Fix
1.0.0 present. The test did not exercise actual dimension travel, terrain visuals
or frame rates. Version 1.0.1 preserves that patch's runtime query implementation.

The presets retain most HIGH effects, reduce shadow distance to 128 blocks and
lower Complementary/Euphoria light-shaft sampling. Reduced shadow coverage and
sampling suggest less work; no fixed-scene FPS improvement was measured. Lower
light-shaft sampling may show more noise in motion.

## Verification scope

Choose checks that exercise the change:

| Change | Relevant checks |
| --- | --- |
| Documentation | Local links and anchors, source paths, commands and claims against current files |
| Configuration | Parse files; compare the intended keys; inspect affected exports when packaging changes |
| Dependencies or placement | Sync, build all profiles, compare payload hashes and side exclusions |
| Shaders or rendering mods | Construct pipelines, then test island edges, water/glass, ships, lighting and dimension travel in-game |
| Generation or physics | Test a disposable world and representative ships; preserve production world data |
| Release | Verify CI, downloaded checksums and critical published archive contents |

Record the exact source revision, commands, environment and outcome. A passing
packaging check does not establish GPU compatibility. Keep earlier evidence in
[decision history](decisions.md), and label untested behavior explicitly.

Earlier logs recorded an Analog Audio movement-registration `NoSuchMethodException`
and Create Radars errors for empty model/blockstate JSONs. Those runs reached a
title screen and sky world; these findings have not been established as resolved.
The history also retains a separate, unattributed native Apple Metal/IOGPU crash.
Do not conflate that report with the confirmed DH polygon-buffer defect.

Survival resource access, structures, moving-ship interactions and acoustics still
need broader gameplay coverage. The owner's testing supports enabling DH by
default; it is not a cross-platform performance benchmark.

## Version 0.1.6 integration

Reliable Gliders 2.0.0, Hostile Skies 0.2.6, Aeronautics Delivery Quests 1.1.1,
Create Propulsion: Simulated 1.1.5 and Questlog 3.4.1 are included in
0.1.6. Minecraft 1.21.1, NeoForge 21.1.264 and Java 21 remain pinned.

Hostile Skies automatic raids and departure explosions are disabled; capture is
enabled. Delivery Quests uses village destinations, four offers, 500 to 2,000
block routes and 120-minute deadlines. These target structures, not a simulated
village economy. Glider defaults and membrane requirements are retained. Flywheel
storage and structure-generation tuning remain deferred.

### Resource fixes

Build `createskyfixes` 0.1.0 from `pack-fixes/` with `python3 scripts/build-fixes.py`.
It contains these maintained upstream resource overrides:

| Resource | Correction |
| --- | --- |
| Create Deco placard | White-dye ingredient uses `item`, not `id` |
| Three TFMG distillation recipes | Require the optional `tfmg` mod |
| Three Aero Cables recipes | Require their respective optional cable mods |
| 32 Interiors chair recoloring recipes | Use `c:dyes/<color>` |
| Bells & Whistles metro window | Use `c:glass_blocks` |
| Design n' Decor industrial cogwheel tag | Include the uncolored cogwheel |
| Propulsion wings and platinum casing | Four loot tables use the singular `loot_table` directory |

Almost Unified separately prefers Create Deco zinc sheets through
`overrides/common/config/almostunified/unification/materials.json`. Existing Power
Grid sheets remain registered and usable through shared ingredient tags.

An isolated server validated repaired recipe inputs and rolled the four corrected
block loot tables with a diamond pickaxe. Zero recipe parsing errors remain.
Optional-content loot-table errors, Analog Audio's movement hook and Sable's
missing `copycats:copycat_catwalk` physics-tag warnings remain separate issues.
See [upstream findings](upstream.md) for reports and inspection limits.

Questlog's 48 definitions and 66 objective branches passed native handler checks,
negative inputs, count thresholds and NBT restoration on 2026-10-21. Source and
condition semantics are in [journal definitions](journal.md). A real client UI,
flight, cargo-delivery and raid session has not been exercised by these checks.
The Atlas owns runtime snapshots, selective-sync receipts and its verification
record; these are local evidence, not distributed player files.

## World-generation compatibility in 0.1.6

Version 0.1.6 disables Zfastnoise's biome optimization to allow Sky
Archipelago's Deep Dark projection redirect to apply. The isolated capture no
longer logs that redirect conflict; chunk-level biome and structure validation
remains pending. Noise optimization stays enabled. The local instances now carry this configuration for a new random-world review;
the previous server world is archived.
See [world generation](worldgen.md) for exact settings and evidence.

## 2026-10-22 profile synchronization

Rebuilt all three profiles using empack 0.8.1-beta and the unchanged 0.1.5 version.
The local Prism/server mod sets match the archive contents; both use Minecraft
1.21.1 and NeoForge 21.1.264. Both received the common Sky Archipelago config,
`eee` preset and Zfastnoise biome workaround. The resource JAR rebuild retained
SHA-256 `4caf00251fecd6fc880fc1350c31670324344c4488e8415ddcdfb5a5adcb78e2`.

Preserved DH installation IDs, client graphics/shader choices, runtime-added
configuration entries and Prism Java/UI metadata. These deliberate local values
are not byte-identical to distribution defaults. All mod JARs and the generation
candidate files match. The stopped server's old world/config archive passed full
file verification and was rechecked before removing the redundant world copy.
The active world path is absent; `level-seed` remains blank. No replacement world
was launched. Pregen and gameplay verification remain the next step.
