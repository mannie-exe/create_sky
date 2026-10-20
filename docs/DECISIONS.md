# Decisions and verification

Dated records describe the tested snapshot, evidence and limits. Current operating
instructions belong in [COMPATIBILITY.md](COMPATIBILITY.md) and
[AUTOMATION.md](AUTOMATION.md). Raw logs and imported config snapshots are local
backup evidence, not distributed pack content.

## 2026-10-18 — Import and first release

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

## 2026-10-18 — empack 0.7.1 and v0.1.1

**Decision:** adopt empack 0.7.1-beta scaffolds, verified binary installation,
explicit profiles, normalized filenames, checksums and draft-first publication.
Retain authored release notes, Java 21, and Prism's 512–8192 MiB memory range.
Add both authors to metadata and distributed `AUTHORS.txt`.

**Evidence:** empack source tag `v0.7.1-beta` at `4d1ef04`; Create Sky v0.1.1 at
`c67d577bec51ac5f4e01e204f530a3e19f8ef087`. Local helper tests (12 upstream cases),
actionlint, tag-mismatch rejection, all-profile builds, ZIP CRCs and checksum
verification passed. Hosted validation run `39169030279` and release run
`39169030419` succeeded. Published asset digests were verified. Dependency
selections were unchanged. These checks did not establish Windows runtime or
additional gameplay compatibility.

## 2026-10-18 — Remove SeedGen for Sky Archipelago

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
