# Decisions and verification

Dated records describe the tested snapshot, evidence and limits. Current operating
instructions belong in [compatibility reference](compatibility.md) and
[build guide](build.md). Raw logs and imported config snapshots are local
backup evidence, not distributed pack content.

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
