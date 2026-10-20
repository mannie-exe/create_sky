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
- Nine URL pins handle provider metadata conflicts involving old exact versions,
  Connector/Forgified Fabric API and client-only dependencies. Check runtime
  metadata before replacing them with provider roots or downgrading dependencies.
- The tenth URL pin is the published DH Polygon Fix binary with content digests.
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
