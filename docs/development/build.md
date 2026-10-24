# Build and release maintenance

Use empack **0.8.2-beta** and Java **21** from the repository root. Builds use the
recorded lock and explicit distribution profiles. They do not update installed
clients or servers.

## Source layout

| Path | Owner of the setting |
| --- | --- |
| `empack.yml` | Pack version, runtime, dependency intent and distribution profiles |
| `empack.lock` | Resolved content and hashes |
| `empack.bindings.yml` | Selected files, names and placement |
| `overrides/common/` | Shared authored configuration |
| `authoring/` | Journal source and categorized configuration register |
| `overrides/client/` | Client-only content and shader presets |
| `templates/` | Prism memory and Java arguments, and server properties |
| `web/` | Internal map and journal editor; excluded from pack payloads |
| `docs/players/` | Player and server-owner instructions |
| `docs/development/` | Maintainer procedures and dated evidence |
| `docs/RELEASE_NOTES.md` | Notes consumed by release CI |

Generated JARs and archives are ignored by Git. Both resource builders accept
`--check` and preserve existing output timestamps when the bytes are unchanged. Keep worlds, credentials, server
lists, raw logs and machine-specific paths out of distributed overrides.

The root `.gitignore` adapts Toptal templates for macOS, Windows, Linux, common
editors and Python tools. `web/.gitignore` adds Node, Astro and extracted game
data. Shared editor settings, dependency locks, `web/src/lib/` and Minecraft tag
files remain trackable; generated assets and local credentials stay ignored.

## Editable installation defaults

`empack.bindings.yml` marks `icon.png`, `options.txt` and the authored shader preset
TXT files as `seed`: initial installation writes the default, while later preparation
preserves edits. Prism rewrites `icon.png` before its pre-launch hook. Server properties
come from the server template and remain installation-local.

## Local builds

After editing dependency intent, synchronize and materialize the selected files,
then rebuild maintained resources and build all supported exports:

```sh
python3 scripts/generate-journal.py --check
python3 scripts/audit-changes.py
python3 scripts/build-fixes.py
empack status
empack sync --materialize --yes
python3 scripts/build-resource-patches.py
empack build --profile prism --profile modrinth --profile server --yes --optional-defaults
python3 scripts/patch-server-archives.py
```

The defaults build reference Modrinth, Prism and server archives under `dist/`.
Prism and server recipients need empack 0.8.2-beta on `PATH`; the generated hooks
prepare and verify exact files before launch. Modrinth-compatible launchers handle
the `.mrpack` downloads. Authored files remain included, and empack includes prepared
server-runtime assets. Check content sources and installation as well as archive integrity.

Local edits can change an export without changing its filename. Use the published
release's checksums to identify released bytes; a local rebuild is not a substitute
for verifying downloaded release assets.

`authoring/resource-patches.json` pins the archive inputs for the client model patch.
`build-resource-patches.py` checks their selected empack versions and archive
SHA-512 hashes, then writes `Create Sky Resource Patches.zip` in client overrides.
It combines four Crops plants with Fresh Flower Pots, restores Macaw's chain
texture bindings, and includes enabled model-authoring recipes and compatibility
adapters. The models reference existing textures. [Model authoring](web/models.md)
owns extrusion and artwork-fitting controls.
Keep this generated pack above its inputs. Unknown versions or model structures
stop generation for review; follow the [update procedure](patches.md#update-sequence). CI runs
the same generator, downloading exact inputs when they are not materialized.

### Copycat renderer

[Copycat Bar Extrusion](https://github.com/mannie-exe/copycat-bar-extrusion) is a
client-only URL dependency pinned by release and SHA-1/SHA-512 in `empack.yml`.
Empack materializes it like the other referenced mods; clean CI needs no local
source checkout or hand-copied override. Do not keep another copy in client overrides.

Its source repository owns the Java 21 Gradle build, exact Create artifact check,
transform tests and native rendering evidence. Review that hook before upgrading
Create. The [compatibility guide](compatibility.md#visual-compatibility-pass) identifies
the tested JAR and limits; no server installation or saved-data migration is needed.

## Dependency updates

Use [dependency and patch maintenance](patches.md) for coupled versions, URL pins,
resource overrides and required update checks. `empack outdated` reports provider
candidates; it does not validate gameplay or replace exact-artifact review.

## Release procedure

1. Review the unreleased notes and required checks in [patch maintenance](patches.md).
   Update `pack.version` in `empack.yml` and write `docs/RELEASE_NOTES.md` for that
   version; archive the previous published notes under `docs/releases/`. Keep unreleased behavior distinct from published behavior in guides.
2. Synchronize and build all three profiles. Inspect client/server mod placement,
   shader presets, configuration and archive integrity. Run the relevant runtime
   checks from [verification](compatibility.md#verification-scope).
3. Record commands, results, source revision and limitations in
   [decision history](decisions.md). Commit and push the reviewed source.
4. Push the matching `v<version>` tag to trigger publication.
5. Wait for validation and release jobs. Download the published assets, verify
   `SHA256SUMS`, and check the critical payloads before announcing the release.

Publishing is a separate action from editing or building. Tag only when the
release is prepared and publication is authorized.

## CI maintenance

The pack validation and release workflows select `modrinth`, `prism` and `server`,
use Temurin 21, and pin GitHub Actions to commits. `.github/scripts/empack-ci.py` comes from the empack
scaffold, reviewed against `v0.8.2-beta` at `f29064dc`, with a project-specific
release-notes option. Its build-explanation check expects schema 2.

The helper verifies the downloaded empack binary against GitHub's asset digest,
rejects stale locks and tag/version mismatches, and stages only the outputs named
by `build --explain --json`. It normalizes filenames before hashing and publishes
a draft only after uploads succeed. Published names use hyphens for spaces,
such as `Create-Sky-0.1.7-prism-references.zip`.

Both pack workflows rebuild maintained resources before packaging. The separate
web workflows run from `web/`; [web setup](web/setup.md) describes their checks
and deployment dry run. Pack profiles assemble `pack/`, `overrides/` and
`templates/`, so the app and its local generated assets are outside their inputs.

Retain these choices when refreshing the scaffold:

- `EMPACK_RELEASE_NOTES` points to `docs/RELEASE_NOTES.md` and uses `--notes-file`.
- All three reference profiles are selected through `build.default`; CI uses that default.
- Prism overrides memory to 512 MiB minimum and 8192 MiB maximum.
- Prism defaults to Java 21 Generational ZGC through `OverrideJavaArgs=true` and
  `JvmArgs=-XX:+UseZGC -XX:+ZGenerational`; retain player overrides in existing installs.
- Servers enforce the whitelist and create Sky Islands worlds.
- Checkout credentials are not persisted.

Windows server launchers support `EMPACK_NO_PAUSE=1` for unattended tests.
A successful build verifies packaging; it does not establish gameplay or GPU
compatibility.

## Maintained resources

`pack-fixes/` contains the resource-only fixes mod and journal client assets.
Rebuild it before exporting. The generated JAR is an ignored build artifact;
its source files are maintained. Quest definitions ship from common config and
client presentation settings ship from client config. See [journal authoring](journal.md).

## Unix terminal wrapper

Empack 0.8.2-beta starts runtimes in a separate process group without transferring
foreground terminal control. An interactive Java server can consequently stop
while initializing its console. The pack retains empack preparation and runtime
supervision and adds a small terminal-handoff helper until the upstream fix lands.

After every local build, run:

```sh
python3 scripts/patch-server-archives.py
```

This selects the current default server reference ZIP from `empack build --explain`.
Explicit archive paths are also accepted. It checks the exact generated scripts,
adds `foreground-runtime.py`, and replaces only the Unix runtime command. Unknown
scripts or helpers fail without modifying the archive; rerunning is a no-op.
The immutable release recipe, game content, Windows launchers and preparation
script remain byte-identical. CI runs the same step before staging and checksums.

Unix server recipients need Python 3 in addition to Java and empack. The helper
hands the terminal to its process group before replacing itself with Java; the
runtime lease and process-tree supervision remain active. It skips terminal work
when stdin is not a TTY and does not take the terminal from an unrelated foreground
job. Windows and Modrinth installations do not use this helper.

Remove this packaging step only after an empack upgrade passes real terminal
input, Ctrl-C and shutdown checks. The patcher deliberately rejects unfamiliar
launcher templates rather than silently accommodating an upstream change.
