# Compatibility and verification

This reference describes constraints behind the current pack configuration.
Player instructions belong in [graphics](../players/graphics.md) and
[server maintenance](../players/server.md). Exact versions are in the
[content list](../MODLIST.md), with authoritative selections in `empack.yml` and
`empack.lock`.

## DH Polygon Fix

Clients include [DH Polygon Fix 1.0.2](https://github.com/mannie-exe/dh-polygon-fix/releases/tag/v1.0.2)
with the original DH 3.3.3 JAR. It backports upstream !126's two-integer
polygon-mode query. The earlier scalar query overwrote an adjacent canary on
Apple OpenGL and Linux/Mesa and could cause delayed native JVM crashes.

The patch requires exactly DH 3.3.3. Remove it when upgrading DH and verify the
replacement includes the upstream fix. Keep it client-only across supported
platforms; dedicated servers do not need it. SSRD interfaces are unchanged.

Version 1.0.2 retains the 1.0.1 runtime implementation and adds documentation and
release-tool checks. Version 1.0.1 moved the namespace to `design.inherent`. Transformation, missing/duplicate target, server exclusion,
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
- Two further URL pins select published DH Polygon Fix and Sky Village Neighbors
  binaries with content digests. Sky Village Neighbors requires exactly Sky
  Archipelago 1.3.6 and Sky Villages 1.0.6. Review both pins together before updates.
- Carry On excludes Lootr containers and Aeronautics/Sable objects and retains
  the generated Create/Copycats exclusions. These exclusions do not verify every
  carried entity or ship-storage interaction.

## Controls and resource packs in 0.1.9 source

Do a Barrel Roll, Better Climbing, Ping Wheel, Easy Anvils, Easy Magic and
Inventory Totem ship on both sides. Camera/UI/rendering mods and the six resource
packs are client-only. EMF/ETF support Fresh Animations; Puzzles Lib, Collective
and Searchables satisfy the other new dependencies. Existing dependency versions,
Minecraft and NeoForge are unchanged. Exact selections are in [MODLIST](../MODLIST.md).

| Domain | Authored choice |
| --- | --- |
| Flight camera | Barrel Roll uses vanilla activation with thrust disabled. The server disallows thrust for ordinary players and does not force the camera mode. Operators can bypass the mod's server policy. Better Third Person's independent elytra camera stays off. |
| Inventory movement | Preserve sneaking and prevent dismounting. Text focus disables movement. Unknown screens default off; books, advancements and all Ponder browsing views also disable movement. EMI/JEI compatibility modules remain enabled. |
| Communication | Ping Wheel keeps its range, channel and rate-limit defaults, with ten-second markers and 50% volume. Chat Heads retains its defaults. |
| Tooltips | Keep durability/enchantment information, omit extra blank-line spacing. Shulker Box Tooltip retains its native preview defaults. |
| Workstations | Keep generated Easy Anvils costs and maintenance settings. Easy Magic shows all enchantments while retaining paid rerolls. Do not disable old vanilla workstations. |
| Visual resources | Enable six packs in new-installation options. Keep base Fresh Animations without extensions; retain generated EMF/ETF defaults. Existing options remain seed-managed and are not overwritten. |

Better Climbing and Inventory Totem expose no generated tuning file in this
version. Their native behavior is retained. InvMoveCompats and Ping Wheel are
published as beta builds; InvMoveCompats' `1.21.8` filename covers 1.21.1 according
to both its version metadata and native loader range.

Disposable Java 21/NeoForge clients and servers were installed from the reference
exports on 2026-10-23, against the 0.1.9 working tree based on `25a5a209`.
The client joined the isolated server, loaded all six packs, rendered Fresh
Animations villagers/golems and showed a shulker preview containing three diamonds.
An inventory-only totem survived 100 generic damage, granted Postmortal and was
consumed with both hands empty. InvMove moved the player in an inventory; typing
in focused EMI search left the teleported position unchanged.

Native configuration loading accepted the authored new settings. A server runtime
export completed without exporter errors. Existing Create Radar model warnings,
Propulsion compass-model warnings and other inherited content warnings remain;
the matching Radar warnings also occur in the prior local client log. Successful
startup does not establish moving-ship camera compatibility, flight feel, every
modded inventory, all crop/Copycat geometry or shader performance. Those need
playtesting. Live profiles and the running server were not changed by this pass.

The final source passed these checks from the repository root:

```sh
python3 scripts/generate-journal.py --check
python3 scripts/audit-changes.py
python3 -m unittest discover -s tests -v
python3 scripts/build-fixes.py
empack --yes sync --materialize
empack --yes build --profile prism --profile server --profile modrinth --optional-defaults
python3 scripts/patch-server-archives.py
git diff --check
```

The audit covered 230 files without drift; all 11 tests passed. All three
reference exports built. Archive inspection checked dependency placement against
the lock, authored config bytes and seed policies, and MRpack environment parity.
The 113 previous dependency selections and digests were unchanged; 24 selections
were added, including supporting dependencies and resource packs.

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

## 2026-10-22: 0.1.6 reference-instance migration

Installed the published 0.1.6 recipes into the existing Prism Create Sky client
and local dedicated server using empack 0.8.2-beta. The existing mod sets already
matched the release. Explicit installation adopted the matching managed files;
seed policies retained local configuration, graphics choices and shader settings.

The running server received SIGINT and completed its player, world, Sable and DH
shutdown before installation. All 11,345 saved server-world files and three client
LOD files matched their pre-installation SHA-256 hashes afterward. Server properties,
seed, access lists, EULA, JVM settings and DH installation IDs were unchanged.
The server remains stopped and ready for the owner's next launch.

Prism now has release preparation and launch hooks, using the absolute local empack
path so a GUI launch does not depend on Bash's environment. Its Java and UI settings
remain unchanged. Server scripts use the reference lifecycle, retain Java 21 and
add the local executable directory to PATH.

`empack instance inspect` reports 0.1.6 for both instances. Repeated preparation
reported zero file changes; all 114 client and 192 server managed files matched
the release hashes. All 206 client and 201 server seeded files were preserved.
The launch guards passed with `/usr/bin/true`; this does not test Minecraft gameplay.
The server preparation script also passed with an initial `/usr/bin:/bin` PATH.

Bash already sources `.bash_env` from `.bash_profile`, and `.bash_env` adds
`~/.local/bin`. A fresh login shell resolved empack 0.8.2-beta without changes.

### Launch failures found after synchronization

The owner's first interactive launches exposed two cases absent from the earlier
noninteractive checks. Both have local fixes; the published 0.1.6 assets are unchanged.

**Prism icon:** Prism 11.1.1 writes `icon.png` in `createLaunchTask`, before the
pre-launch hook ([source](https://github.com/PrismLauncher/PrismLauncher/blob/11.1.1/launcher/minecraft/MinecraftInstance.cpp#L1041)).
The managed icon caused `ModifiedManagedFile`. Added `icon.png: seed` to bindings
and synchronized the lock without changing dependency selections. A temporary
build/installation preserved the launcher-written icon through preparation and
the launch guard. Installed that policy-only local release into the playing client:
`133dabd23980db91c9bda13f2d1816af316502c3bdd945270c7fec2397b43aaa`.
Only the icon policy differs from the published Prism recipe. Its descriptor lives
next to the original as `.minecraft/.empack-consumer/release-icon-seed.json`, sharing
the same immutable assets. The original launch hook still verifies its published
recipe and correctly retains the newer installed recipe; repeated preparation and
`instance launch -- /usr/bin/true` pass. A full graphical launch remains owner-tested.

**Server terminal:** empack 0.8.2-beta's `execute_inherited` calls
`command.process_group(0)` without transferring terminal foreground control
(`crates/empack-lib/src/application/process_runtime.rs:210`). The Java and `stty`
processes were stopped (`T`), with PGID 80416 and terminal foreground group 79414
(the empack parent). This explains the apparent stall after `Generating keypair`.
SIGTERM followed by SIGCONT allowed that launch to shut down.

The local server's `foreground-runtime.py` temporarily ignores SIGTTOU while
calling `tcsetpgrp`, restores the signal disposition, then execs the selected Java
process. Both local Unix start scripts select this helper through empack and set
`CREATE_SKY_JAVA`; the instance lease and runtime guard remain active. The official
empack binary and repository are unchanged. This workaround needs Python 3 and
is local to this installation pending an upstream terminal-handling fix.

A real PTY test confirmed foreground ownership and input. The actual server then
reached readiness in 13.499 seconds, answered `list` with zero players, accepted
`stop`, saved all dimensions and DH databases, and exited successfully. It was
left stopped for the owner's terminal. No world replacement or regeneration was
performed; normal startup/shutdown can update saved data.

## 0.1.7 packaging verification, 2026-10-22

All three reference distributions built with empack 0.8.2-beta. The post-build
step patched the Unix server launchers before checksums; Windows scripts,
preparation and immutable release content remain unchanged. Source lock SHA-256:
`9845e94b1ceadb19f09e5c8fe4c1c40c818657dab31007a7f1316cc7aed11529`.

Fresh Prism/server installations verified 320 and
393 selected file hashes. A launcher-written icon
survived repeated preparation and the client launch guard. The server reached
readiness in 19.49 seconds with a real PTY, answered `list`,
accepted `stop`, saved every dimension, and exited successfully. Tests used a
disposable flat world; no live instance or world was modified in this release task.

Packaging unit tests cover idempotence, preserved payloads and rejection of
unrecognized scripts/helpers. Workflow syntax checks passed. The shared helper
also passed actual empack PTY Ctrl-C, direct SIGINT and non-TTY checks. These tests
do not establish graphical client, shader or survival-progression coverage.

Both published packs retain reference delivery. Unix server recipients need
Python 3 for the included helper until the empack terminal fix is adopted.
