# Decisions and verification

Dated records describe the tested snapshot, evidence and limits. Current operating
instructions belong in [compatibility reference](compatibility.md) and
[build guide](build.md). Raw logs and imported config snapshots are local
backup evidence, not distributed pack content.

## 2026-10-23 - Controls and equipment release 0.1.9

Release the floating-village compatibility candidate together with the selected
camera, inventory, equipment and resource-pack additions. Minecraft 1.21.1,
NeoForge 21.1.264 and all 113 prior dependency selections remain unchanged;
24 selections bring the lock to 137. Configuration choices and isolated native
client/server checks are recorded in [compatibility](compatibility.md#controls-and-resource-packs-in-019-source).

The source builds on `25a5a209`. Journal generation, the 230-file configuration
audit and all 11 pack tests passed. All three reference exports built with empack
0.8.2-beta; archive checks verified dependency sides, config bytes, seed policies
and MRpack environments. The server export retains the Unix terminal workaround.
The owner authorized local profile synchronization, commit/push and publication.
This update does not reset worlds or LODs. Moving-ship controls and shader
performance remain gameplay checks, not established compatibility guarantees.

## 2026-10-23 - Floating village compatibility candidate 0.1.9

Add Sky Village Neighbors 0.1.0 from its GitHub prerelease and update the
client-only DH Polygon Fix to 1.0.2. Both three-platform release workflows passed;
downloaded binaries matched release manifests and the locally tested artifacts.
The mod source commits are `2c980c8` and `c6db1c1`, respectively. Modrinth publication
is deferred. [Structures](structures.md) owns the placement rule and tuning limits.

`empack sync --materialize --yes` recorded 113 selections without changing
Minecraft 1.21.1, NeoForge 21.1.264 or other mod versions. The new common config
uses gap 64, host distance 512 and host radius 96; exports treat it as an editable
seed file. All three reference profiles built, ZIP integrity and exact hashes
passed, and the server archive retained its terminal-handoff patch. Client exports
include both patches; server exports include only Sky Village Neighbors.

The isolated Atlas runtime loaded the released compatibility JAR and retained
10,119 items, 9,249 recipes and 48 journal entries. Extraction, map compilation and
snapshot checks passed. Configuration audit covered 209 files without drift;
11 pack tests, 25 Atlas JavaScript tests, six Python tests, formatting and the
Astro build passed. Native placement evidence is owned by the compatibility mod's
verification document; no additional survival or multiplayer playtest was run.

This prepares unreleased Create Sky 0.1.9 source and local exports. No pack release
tag, live-instance sync, world reset or LOD deletion is part of this update.

## 2026-10-22 - Settlement and journal release 0.1.8

Release the reviewed Sky Villages integration, scarce foundation minerals,
ore/processing repairs, authored delivery templates, journal clarifications,
Prism ZGC defaults and Atlas village survey. Minecraft 1.21.1 and NeoForge
21.1.264 remain pinned. [Structures](structures.md) owns the balance measurements;
[progression](progression.md) owns the connected resource and travel decisions.

The source candidate is based on `df12fe5`. `empack sync --materialize --yes`
recorded 112 selections; all three reference profiles built and the server archive
was patched. Config audit covers 208 files without drift. Pack tests passed 11
cases; Atlas tests passed 25 JavaScript and six Python cases, with clean formatting
and Astro/build checks. Native refresh/check retained 10,119 items, 9,249 recipes
and 48 journal entries. Browser checks covered the Atlas and authoring pages;
the structure-audit assertion was updated for the now-populated register.

The owner authorized commit, push, publication, local instance sync and deletion
of the current comparison world without another backup. The local server seed
is retained for the next launch, and the matching client Overworld LOD cache is
cleared. Existing world archives, installation settings and access lists remain.
Normal release updates do not reset anyone else's world. The server is left
stopped so its replacement world can be generated during the owner's next run.

No flight, cargo delivery, multiplayer Lootr session or survival playthrough was
performed for this release. Native generation and recipe/objective checks support
the documented limits rather than a claim of complete gameplay verification.

## 2026-10-18 - Import and first release

**Decision:** use the friend's Create/Aeronautics pack as Create Sky's foundation.
Retain Minecraft 1.21.1, Create 6.0.10, Aeronautics 1.3.2, Sable 2.0.6 and Sky
Archipelago 1.3.6. Keep layer_1 and layer_2 separate. Credit mannie-exe and
TimdoesLive. Select `eee` by default and mirror its terrain settings into the
server common config; enforce the server whitelist.

**Evidence:** the initial import contained 96 mod JARs. Comparing a disposable
clean-config instance with the supplied configs identified altered cannon recoil
and magazine sizes, Sable rendering distance, Power Grid native solving and
precision, structure-search parameters, and disabled shaders/DH rendering. The
source local world used vanilla noise generation; it did not establish the
friend's multiplayer settings. The saved `eee` preset was initially not selected.

The update aligned Complementary 5.9.3 with Euphoria 1.10.5, selected NeoForge
21.1.263 and standalone MezzConfig 0.6.8, and added Default World Type, Lootr,
AppleSkin, Carry On, Spyglass Improvements, Exposure and Sound Physics. Carry On
exclusions protect Lootr and Aeronautics/Sable objects. Nine provider metadata
exceptions remain exact URL pins. The resulting release had 104 top-level mods
and one base shader.

**Checks:** all three distributions built. A Prism smoke test reached the title
screen, installed the patched shader, and entered a new sky world. NBT identified
`sky_archipelago:sky_island`; runtime logged `source=DEFAULT_PRESET` with fingerprint
`ab19a00826883c9b`. Stock embedded settings still depended on the named preset.
A separate clean-default run crashed in native Apple Metal/IOGPU code; the cause
was not isolated. No ship-operation or survival progression test was completed.

**Deferred:** evaluate resource access and first-flight progression before adding
more systems. Earlier candidate reviews included Farmer's Delight, Structures
Arise, Bountiful, Supplementaries and Subtle Effects; those reviews were proposals,
not installation records. Retain JEI recipe integrations and the Connector mapping
stack until functional testing supports their removal.

## 2026-10-18 - empack 0.7.1 and v0.1.1

**Decision:** adopt empack 0.7.1-beta scaffolds, verified binary installation,
explicit profiles, normalized filenames, checksums and draft-first publication.
Retain authored release notes, Java 21, and Prism's 512 to 8192 MiB memory range.
Add both authors to metadata and distributed `AUTHORS.txt`.

**Evidence:** empack source tag `v0.7.1-beta` at `4d1ef04`; Create Sky v0.1.1 at
`c67d577bec51ac5f4e01e204f530a3e19f8ef087`. Local helper tests (12 upstream cases),
actionlint, tag-mismatch rejection, all-profile builds, ZIP CRCs and checksum
verification passed. Hosted validation run `39169030279` and release run
`39169030419` succeeded. Published asset digests were verified. Dependency
selections were unchanged. These checks did not establish Windows runtime or
additional gameplay compatibility.

## 2026-10-18 - Remove SeedGen for Sky Archipelago

**Decision:** remove SeedGen 0.9.1 (mod ID `seedrenderer`) from authoring intent,
lock, materialized content, client and server, including its configs. Keep DH
3.3.3 and Sky Archipelago 1.3.6. Generate DH terrain through `CHUNKS_ONLY` and
`INTERNAL_SERVER`. Use four threads at ratio 1.0 and omit the copied server ID.

**Evidence:** the server logged at 16:57:16.624 that SkyIslandChunkGenerator's noise
matched 0 of 12 test columns and disabled SeedGen for that dimension. Inspection
of the released bytecode showed seed sharing still accepted its NoiseBasedChunkGenerator
subclass and sent seed/noise identifiers without island settings. The client
activated SeedGen at 17:01:55.982 and generated shared-seed terrain at 17:01:57.198.
The reconstructed vanilla noise generator therefore did not reproduce islands.
No compatible published fix was found in the assessment; no custom patch was built.

**Local remediation:** while client and server were stopped, previous cleanup
backed up and removed four DH SQLite caches (8,863,744 bytes). All 86 non-DH server
world files remained byte-identical. Local client rendering was enabled with cave
culling off; this local preference is not a changed export default. Subsequent
SeedGen removal preserved worlds and did not repeat cache deletion.

**Removal checks:** no remaining JAR dependency metadata referenced `seedrenderer`.
`empack remove distant-horizons-seedgen --acknowledge-unknown --yes` removed the
selection; the acknowledgement applies to nine URL pins with incomplete provider
evidence. `empack status --json` reported valid author and lock. Active client,
server and pack paths contained no SeedGen files. DH remained installed. The
client had 103 top-level mod JARs after removal. No game was launched for this fix.

**Evidence storage:** local backups under `~/Minecraft/.backups/create_sky/`:
`dh-reset-20261018-172000`, `seedgen-sky-compat-20261018.json`,
`seedgen-removal-20261018-173150`, and `docs-before-v0.1.2/`. The latter preserves
superseded reviews, import inventories, raw config comparisons and prior release
notes. They are historical evidence, not current configuration instructions.

## v0.1.2 release verification

Tested author version 0.1.2, exact state
`e019bcfeffd3d092df0cef152456f24a7cd93539447b5bf8bff5435c705c42c7`.
`empack sync --yes` recorded 104 selections. With Java 21 and explicit
`modrinth`, `prism`, and `server` profiles, `python3 .github/scripts/empack-ci.py validate`
built and staged all three distributions successfully. ZIP CRC and SHA-256 checks
passed. Prism contains 103 top-level mod JARs; the server contains 88. All exports
omit SeedGen and its config, retain DH, contain the intended generation/thread
settings without a server ID, and preserve author credits and `eee`. Server
whitelist/world-type checks passed. `empack status --json`, actionlint 1.7.12,
local Markdown-link checks and `git diff --check` passed.

Commands, build log and archive verification script are in the local backup store
at `v0.1.2-verification/`. Hosted publication follows the matching tag through
[GitHub Actions](https://github.com/mannie-exe/create_sky/actions); its result is
separate from these pre-publication checks. No game was launched, and no gameplay
pass is implied by successful packaging.


## v0.1.3: DH native polygon query backport

**Decision (2026-10-19):** add the client-only
[DH Polygon Fix 1.0.0](https://github.com/mannie-exe/dh-polygon-fix/releases/tag/v1.0.0)
as a GitHub URL source with content-pinned SHA-1/SHA-512 digests. Keep official
DH 3.3.3, its server installation, and all other existing mod versions. The patch
is LGPL-3.0-only and must be removed when upgrading DH.

The patch release uses source commit `c46b418c6d91a416b6cf9d0828f3dae2e706cd3a`;
its binary SHA-256 is
`94bc0487fa20bfba36fd6338a9ecae5ad9fadc020526a361ebeb8511c212bad5`.
Published bytes matched the local native/full-pack-tested binary. Public download,
both checksum manifests, source archive contents, and release CI were verified.

**Evidence:** the original scalar `GL_POLYGON_MODE` query overwrote the allocated
adjacent canary with `GL_FILL` on both Apple M4 Pro OpenGL 4.1 and Linux/Mesa 4.5.
The runtime redirect implements upstream !126's two-int query. Real Mixin tests
changed one invocation and retained other methods' bytecode; one-value/two-value
returns and wrong-query rejection passed. The server-side transformer left DH
unchanged. `./gradlew --no-daemon check build` passed locally and on Linux,
Windows, and macOS. `./gradlew --no-daemon nativeProbe` completed 10,000 native
query/restore cycles on macOS and on Linux/Mesa under Xvfb.
[Release workflow](https://github.com/mannie-exe/dh-polygon-fix/actions/runs/39371869301)
passed and required identical artifacts from all three build platforms.

An isolated copy of the full pack joined a separate flat-world server, initialized
DH rendering, applied the patch and both SSRD projection/shader hooks, and travelled
Overworld/Nether/Overworld without a crash. A spyglass was supplied to the player's
main hand; actual zoom input was not exercised. The client was deliberately
terminated after being kicked, and the temporary server was stopped. An initial
instrumented launch hit an unrelated optional Sky Archipelago injection assertion
with global `mixin.debug.countInjections=true`; normal launch settings passed.
Physical Windows GPUs, prolonged survival, sky-island zoom, and moving ships remain
for playtesting.

**Pack checks:** `empack sync --materialize --yes` resolved 105 selections.
`empack build --profile modrinth --profile prism --profile server --yes` passed
with Java 21. Author/lock status is valid; exact state is
`0339f965e6db0e1a918492f615523816e005a21d21ef40d0c8dd00ade2ad8eda`.
Archive CRCs and hashes passed. Prism has 104 top-level mod JARs, with the patch
as its only addition; the server has 85 unchanged mod JARs. The prior v0.1.2 report's
88 server count also included three bootstrap library JARs under `cpw/mods`.
The mrpack references the exact GitHub asset with client-required/server-unsupported
metadata. All existing mod payloads match 0.1.2 exports.

**Local installation:** added the published patch JAR to the existing Prism
Create Sky instance. Existing client/server mods and configs remain byte-identical.
The dedicated server's 85 mod JARs already exactly match the new server export;
no server JAR change is required. Production worlds and LOD caches were not changed.
Rollback removes only the new client patch JAR.

Commands, logs, the transformed full-pack GLState class, before-install manifests,
and the archive verification script/results are saved locally under
`~/Minecraft/.backups/create_sky/dh-polygon-fix-1.0.0/`.

## 2026-10-19 - Balanced shader presets and BSL alternative

**Decision:** pin BSL 10.1.8 (`Y68yiql9`) through `empack add`, and author
client shader settings for BSL, Complementary r5.9.3, and Euphoria 1.10.5.
Retain the HIGH baseline's shadows/filtering, clouds, water reflections, AO,
bloom and anti-aliasing. Reduce shadow distance to 128 blocks; Complementary
variants also use Low block reflections and Low light-shaft sampling. Preserve
Euphoria's existing fog and night-sky choices. Both base shader ZIPs are
client-only; shaders and DH remain disabled in distributed default configs.

**Evidence:** the earlier Complementary HIGH baseline reproduced
`No more available texture units while activating sampler shadowcolor1` in
`composite1`: 15 active sampler uniforms versus 14 allocatable units. Iris
reserves units 1 and 2 despite the driver's 16-unit limit. A local Java agent
then logged native linked-program sampler uniforms and requested each
Overworld/Nether/End pipeline through Iris on the render thread. All nine
shader/dimension combinations constructed `IrisRenderingPipeline` successfully.
The maximum measured composite/deferred counts were 12/7/12 for each
Complementary variant and 10/10/10 for BSL. Full modpack, DH 3.3.3, SSRD and
DH Polygon Fix 1.0.0 remained present. The agent was used only in a temporary
client; production JARs were not modified.

**Commands/checks:** `empack add https://modrinth.com/shader/bsl-shaders --type
shader --platform modrinth --yes`, explicit client/exact pins in `empack.yml`,
`empack sync --materialize --yes`, and `empack build --profile prism --profile
modrinth --profile server --yes`. Archive inspection checks all three settings
in client exports, BSL's exact hash/reference, and no shader payloads/settings
in the server export. `git diff --check` verifies whitespace. Local evidence,
agent sources, sampler results and pre-change Prism settings are under
`~/Minecraft/.backups/create_sky/shader-presets-2026-10-19/`.

**Limits:** pipeline compilation/allocation only; no automated camera or world
benchmark, actual dimension travel, or other-platform runtime test. Reduced
sampling/draw coverage supports a lower workload, not a measured FPS claim.
All three presets and BSL were copied to the local Prism instance for gameplay
review. No server/world files were changed and no release was published.

## 2026-10-19 - Release DH maintenance update in Create Sky 0.1.3

Pin DH Polygon Fix 1.0.1 at its immutable GitHub release URL and SHA-1/SHA-512
content digests. Update the explicit empack placement filename as well as the
URL, so exports contain one correctly named 1.0.1 binary and no 1.0.0 binary.
The namespace migration is included; the runtime query implementation is
identical to 1.0.0 apart from its Java package.

The fix's source/release review added missing/duplicate target regression
probes and disabled persisted CI checkout credentials. Local `clean check build
nativeProbe` passed, including 10,000 native Apple GL query/restore cycles.
Tag CI passed on Linux, Windows and macOS, with Mesa native testing on Linux;
release publication also required byte-identical JARs across those runners.
Both published checksum manifests and local/released binary equality passed.
See [the tag workflow](https://github.com/mannie-exe/dh-polygon-fix/actions/runs/39382246888).

Create Sky's `empack sync --materialize --yes` and all three profile builds
verify the new pin and client-only placement. Archive checks cover the exact
published fix bytes, exclusion from the server, the BSL reference and all
three shader presets. This release combines the fix and the previously
recorded shader tuning; no further gameplay compatibility is claimed.

## 2026-10-20 - Enable DH rendering in future exports

**Decision:** enable the default client LOD renderer after the owner's gameplay
testing. The only configuration change is `rendererMode = "DEFAULT"`; shader
activation, cave culling and the 256-chunk LOD radius are unchanged. This change
was unreleased at this decision. Published v0.1.3 has DH rendering disabled by default.

**Checks:** TOML parsing and a comparison against HEAD confirmed that only
`rendererMode` changed. `git diff --check` passed. No additional benchmark or
cross-platform gameplay test was performed for this default change.

## 2026-10-20 - Prepare Create Sky 0.1.4

**Decision:** release the enabled DH renderer default and documentation refresh.
Separate player guides from development references, preserve old documentation
entry points, and archive the exact v0.1.3 release notes. No dependency, shader
preset, cave-culling, display-radius or world-generation change accompanies this
release. Non-destructive installation updates must retain local settings, worlds
and LOD caches.

**Tested snapshot:** based on `34bb75758eeab50eb4f4963ac823621f8a1364d4`, with
pack version 0.1.4 and empack author state
`8d1bc62442b5da06bf94acc43781f1e1f48a7ae68409319ab8ce6a89943b2a7b`.
`empack sync --materialize --yes` resolved 106 recorded selections. With Java 21,
`empack build --profile prism --profile modrinth --profile server --yes` passed.
`empack status --json` reported valid author and lock state. The dependency lock
changed only its intent revision; bindings remained byte-identical.

**Archive checks:** all ZIP CRCs passed. Compared with downloaded v0.1.3 assets,
the Prism archive changed only `config/DistantHorizons.toml`; the server also
changed its MOTD version; the mrpack also changed its version ID. Parsed DH
configuration differed only at `rendererMode`. All mod/shader payloads and
presets remained identical, including the client-only Polygon Fix 1.0.1 binary.
The Prism archive contains 104 top-level mod JARs. The server excludes the fix
and shader packs.

**Documentation checks:** 44 local links/anchors passed, source configuration
matched documented settings, archived release notes matched the v0.1.3 tag, and
`git diff --check` passed. Existing ignored build outputs are generated artifacts;
no test instrumentation or diagnostic logs were added to distributed content.

**Limits:** no new in-game session or FPS benchmark was run for this release.
The rendering default relies on the owner's prior testing and the earlier
recorded patch/shader tests. Packaging checks do not establish new gameplay
coverage or fix the separately observed DH download errors.


## 2026-10-20 - Prepare Create Sky 0.1.5

**Decision:** release the migrated empack 0.8.1-beta pack after the owner's initial
client playtest. Keep Minecraft 1.21.1, update NeoForge to 21.1.264 and Climbable
Ropes to 2.2.0, and retain all other exact mod/shader selections. Author schema 5,
lock schema 2 and explicit bindings replace the previous authoring format.
The owner reports that the regenerated client is running well so far.

**Tested snapshot:** based on `b5d0e2d56c6c0f092125ffbaae6cf25eec60e607`, with
pack version 0.1.5 and author state `e41358d29c86aed46c56a733c92d7897b91c0be54dd8764b26df03cdbdc707ff`.
`empack sync --yes` and, with Java 21,
`empack build --profile prism --profile modrinth --profile server --yes --optional-defaults`
passed. The runtime and every exact dependency record match the migrated snapshot
that previously reached dedicated-server readiness and exited cleanly. The release
preparation changed no installed client/server files or player worlds.

**Archive checks:** all three CRC checks passed. The Prism archive contains 104
mod JARs and 106 verified managed placements; the server contains 85 mod JARs and
85 verified placements. All payload digests match the lock. The Modrinth pack's
106 references match the bundled payload hashes, sizes and declared environments.
Minecraft/NeoForge metadata matches 1.21.1/21.1.264. The server excludes shaders
and DH Polygon Fix and retains Sky Islands and enforced-whitelist defaults.

**Release checks:** actionlint passed both workflows. The CI helper accepts the
schema-2 explanation and all three profiles and rejects a mismatched tag before
building or publishing. All 25 checked local documentation targets exist; the
archived v0.1.4 notes match the previous commit. `git diff --check` passed.
The release workflow remains responsible for building and publishing all three
formats with SHA-256 sums; published assets are checked after CI completes.

**Limits:** the client's positive report is initial playtesting, not a full
regression test or benchmark. No additional game session was launched during
release preparation; the owner's running instance was left untouched. Minecraft,
world-generation configuration, shader presets and DH patch compatibility remain
pinned. Stable JEI stays selected despite a newer compatible beta.

## 2026-10-21: fixed cluster scale for the next candidate

Select CONSISTENT 1494 for Sky Archipelago. The existing seed's DYNAMIC value is
1494; the old 32 to 1500 range chooses one distance per world and makes density
vary too widely between seeds. Native comparisons retain the sampled layout for
this seed. Stock spacing 96 would substantially alter it. Keep biome/structure
and survival validation separate from this layout check. Disable Zfastnoise's
conflicting biome optimization in the candidate only. See
[world generation](worldgen.md) for the owning configuration record.

## 2026-10-21: random-world review and source push

The owner superseded the proposed same-seed regeneration with a random-world
review. Preserve the verified compressed world/config backup, clear the active
world path and leave `level-seed` blank. Sync the local profiles with the current
pack while preserving installation identity and player-owned client data. Do not
launch the world or start pregen automatically. Commit and push source only;
keep the version at 0.1.5 and do not create a release tag.

## 2026-10-22 - Journal authoring and configuration register

Split journal mechanics by chapter and prose by locale. Generated descriptions
preserve optional flavor, full requirements, explanatory paragraphs and disclaimer
as separate source fields. Short objective labels remain independent. English is
the only authored locale; six entries have explanatory paragraphs and 42 remain
explicit drafts. No flavor text, new completion rules or integration mod was added.

Compared with `b5465d2aaf4b685baa46093fc805da0a51047bd9`, all 48 quest mechanics,
eight chapter mechanics and 69 objective/group labels are unchanged. The generated
files now use translation keys. The resource JAR SHA-256 is
`67dcf8383e637c186a768c6c0203ae0fbf0b7269eb04354cdaf4ef1e889604c8`.
The tested authoring/scripts/tests/resource-source digest is
`9e9c2c156199068cf9abc3b60de7c665a2c06f226b612638053ca503ee31f0e9`;
it hashes sorted relative paths, NUL, bytes, NUL, excluding Python bytecode.

`python3 -m unittest discover -s tests -v` passed six tests covering mechanics
preservation, section order, locale/label separation, invalid source and audit
drift/path rejection. `python3 scripts/generate-journal.py --check` passed for
57 outputs. `python3 scripts/audit-changes.py` matched all 196 registered files
with no missing or unregistered paths. Register matches are not upstream-default
or gameplay verification; inherited settings remain marked for review.

`python3 scripts/build-fixes.py` and `empack build --profile prism --profile
modrinth --profile server --yes --optional-defaults` passed with Java 21. All
three archives passed CRC checks and contained the exact resource JAR, English
translations and 48 native quest files. Authoring source was not included in
exports. `empack status --json` reported valid author and lock state. No dependency
versions changed, release was published, or generated journal content installed
into the running client/server. Client language switching and panel layout still
need playtesting; prior native handler checks are not a test of this translation
change. Maintained app and pack tests remain; disposable output was removed.

The random comparison world was independently archived and all 1,019 files
verified before moving its folder out of the active server path. Its compressed
archive SHA-256 is
`d7354f26a33e9e6ed5200298d5355c3665297e57242eb450d9f824424fe1ea7e`.
The original 1024-radius world's seed was recovered from the first verified
archive and set only in local server properties for another generation test.
The original and random worlds remain preserved. See [world generation](worldgen.md)
for current generation choices and [pack authoring](authoring.md) for editing.

## 2026-10-22 - Journal descriptions and workbench

All 48 English journal entries now have authored descriptions, comprising 97
paragraphs. Full requirements, disclaimers, titles and short objective labels are
unchanged from `9508255`. Quest and chapter mechanics are unchanged. The app now
provides a searchable chapter list, fields alongside it and a preview below.

Descriptions were checked against the local recipe snapshot and installed
Create 6.0.10, Simulated/Aeronautics 1.3.2, Propulsion 1.1.5 and Power Grid 0.6.2
language and Ponder resources. These explain component roles and assembly needs,
including the 21-crafter crushing-wheel arrangement, generator excitation and
thruster inputs. Propulsion's existing larger-thruster Ponder scenes are recorded
in [journal integrations](journal-integrations.md). This is source inspection,
not a playtest of those assemblies.

`python3 scripts/generate-journal.py --check` matched all 57 outputs.
`python3 -m unittest discover -s tests -v` passed six tests, including mechanics
preservation. `python3 scripts/audit-changes.py` matched all 196 registered files
with no missing or unregistered paths. A comparison with the previous locale
confirmed that only descriptions changed. The English locale SHA-256 is
`a9a77c003f7c982e5113d7a174eab74ffefdfb873f5417cfc076cf17ec728aae`.

`python3 scripts/build-fixes.py` rebuilt the resource JAR; its English translations
match the generated source byte for byte. JAR SHA-256:
`0b95b9888b972cff8d77af262ae12351ed51840bea04101e58d43059f0868d59`.
Profile exports and native game checks were not repeated for this prose change.
No dependencies, recipes, configurations or completion rules changed, and no
journal resources were installed into playing instances. Version 0.1.5 remains
unreleased; source publication does not authorize a release or site deployment.

## 2026-10-22 - Shared disclaimer editing

Keep the existing locale `shared` registry and entry disclaimer keys. The app now
exposes them through a dedicated workbench, with creation, message editing,
reference lists and deletion of unused keys. Inventory text serves 43 entries;
the two interaction disclaimers each serve one. Three entries have no disclaimer.
No message text or entry reference changed in this implementation.

The generator now validates disclaimer key syntax and nonempty string values,
including unused messages. Missing or malformed entry references are rejected.
`python3 -m unittest discover -s tests -v` passed eight tests, including shared
message propagation, new references, removal of unused messages and rejection of
invalid registries or dangling references. `python3 scripts/generate-journal.py
--check` matched all 57 outputs; `python3 scripts/audit-changes.py` matched all
196 registered files with none missing or unregistered.

Tested source follows `eea69e4`. SHA-256 for the sorted relative paths, NUL, bytes,
NUL of `scripts/generate-journal.py` and `tests/test_authoring.py` is
`41d34c5ae7938546e10f82dcace162a0c661192c32fd7d94eafd299c812b412d`.
The generated resources are unchanged, so no resource JAR rebuild, profile export
or live-instance installation was needed. No gameplay or runtime claim follows
from these authoring checks.

## 2026-10-22 - Prepare Create Sky 0.1.6 reference distributions

Tested working tree based on `23d271c`, including the pending Create Sky naming
changes. Author manifest SHA-256: `352f657eae81f2862b68c3aef63ae5587ea1b79bac37fd720e3857b46d2b1c04`.
Lock SHA-256: `067e0fce7dea6f7820cb0051b6429b276e779f4d44f911372cb5a6515c22f20b`.
Bindings SHA-256: `11ae95e5e1ccb9e176e6b088343630fa9be847fbefb2191a38446840330a40f2`.

Installed empack 0.8.2-beta from the official Apple ARM64 archive, verified against
GitHub's SHA-256 `8c50f141e60cac0528412261a470221254a6f7d7cf8c2b06c8c156017206d22f`.
The release tag resolves to `f29064dc`. Author schema 5 and lock schema 2 remain
supported; no document recreation was required. Explicit reference recipes replace
bundled delivery, and `build.default` selects Modrinth, Prism and server. CI pins
the new executable and uses those defaults. The custom Prism template retains
8 GiB memory and both preparation hooks, with a semicolon comment for Prism parsing.
Explicit seed policies preserve edited client options and shader presets after
initial installation. Before the policy fix, editing `options.txt` reproduced
`ModifiedManagedFile` and blocked preparation.

`empack --net-timeout 1200 outdated --strict --json` completed with 99 provider
roots and 11 manual sources. The two newer compatible provider candidates are
JEI 19.69.0.457 and Sound Physics 1.5.2, both betas. Stable selections remain.
The ten Modrinth URL sources and DH Polygon Fix release were checked separately;
SSRD 1.8.6 would downgrade the installed 1.8.7 beta and was retained. Official
NeoForge metadata still lists 21.1.264 for Minecraft 1.21.1. Neither game nor loader
changed. This assessment is catalog evidence, not proof of runtime compatibility.

Checks and scope:

- `python3 -m unittest discover -s tests -v`: eight tests passed.
- `python3 scripts/generate-journal.py --check`: 57 outputs, zero changes.
- `python3 scripts/audit-changes.py`: 196 files, no drift or missing/unregistered files.
- `python3 scripts/build-fixes.py` rebuilt the maintained resource mod.
- `empack sync --materialize --yes` and
  `empack build --yes --optional-defaults` completed for all three reference profiles.
- ZIP integrity, native asset SHA-256/size assertions, Modrinth references, runtime
  versions and client/server placement were inspected. Third-party mod content uses
  provider/URL sources; only the maintained resource mod is embedded as mod content.
  The native server archive still includes prepared runtime assets. No web assets,
  worlds or LOD databases are included.
- Extracted the reference Prism/server archives into new test directories and ran
  `empack instance prepare` with each release's digest, layout and side. Both
  preparations succeeded and installed file hashes matched their release records.
- Final policy-aware archives were installed into new directories again: 320 client
  files and 393 server files matched their release digests. Edited client options,
  all three shader presets and server properties survived repeated preparation.
  The launch guard also accepted these local changes with `/usr/bin/true`; that
  command checks instance policy, not Minecraft rendering.
- `empack instance launch --server` reached Minecraft's readiness marker and shut
  down cleanly after `stop` in 25.2 seconds using Java 21 and a disposable flat world.
- From `web/`, `pnpm verify` passed 25 tests, formatting, zero Astro diagnostics and
  the static build. `pnpm data:refresh` ran the renamed exporter in its isolated
  audit server, and `pnpm data:check` passed: 10,119 items, 9,235 recipes and 48
  journal entries. No terrain survey was repeated.
- `mise exec aqua:rhysd/actionlint@1.7.12 -- actionlint .github/workflows/*.yml`
  passed; updated documentation links and `git diff --check` also passed.

Playing instances, worlds and LODs were not updated by these checks. Client GPU
behavior, shader pipelines, ship interactions and complete survival progression
were not retested. Published artifact verification is performed after the release
workflow; the local build alone does not identify published bytes.
