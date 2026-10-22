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
| `templates/` | Prism memory settings and server properties |
| `web/` | Internal map and journal editor; excluded from pack payloads |
| `docs/players/` | Player and server-owner instructions |
| `docs/development/` | Maintainer procedures and dated evidence |
| `docs/RELEASE_NOTES.md` | Notes consumed by release CI |

Generated JARs and archives are ignored by Git. Keep worlds, credentials, server
lists, raw logs and machine-specific paths out of distributed overrides.

The root `.gitignore` adapts Toptal templates for macOS, Windows, Linux, common
editors and Python tools. `web/.gitignore` adds Node, Astro and extracted game
data. Shared editor settings, dependency locks, `web/src/lib/` and Minecraft tag
files remain trackable; generated assets and local credentials stay ignored.

## Editable installation defaults

`empack.bindings.yml` marks `options.txt` and the authored shader preset TXT files as `seed`: initial installation writes
the default, while later preparation preserves player settings. Server properties
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
empack build --profile prism --profile modrinth --profile server --yes --optional-defaults
```

The defaults build reference Modrinth, Prism and server archives under `dist/`.
Prism and server recipients need empack 0.8.2-beta on `PATH`; the generated hooks
prepare and verify exact files before launch. Modrinth-compatible launchers handle
the `.mrpack` downloads. Authored files remain included, and empack includes prepared
server-runtime assets. Check content sources and installation as well as archive integrity.

Local edits can change an export without changing its filename. Use the published
release's checksums to identify released bytes; a local rebuild is not a substitute
for verifying downloaded release assets.

## Dependency updates

Read [compatibility constraints](compatibility.md) before changing pins.
Provider-backed selections use exact versions. Eleven content-pinned URL sources
need manual upstream checks: ten metadata/compatibility exceptions and DH Polygon
Fix. `empack outdated --strict --json` reports incomplete provider evidence and
continues independent checks after malformed records; it does not assess URL pins
or loader upgrades. Retain compatibility constraints when selecting updates.

When a URL asset changes, update its digests and explicit placement filename in
`empack.bindings.yml`, then synchronize. Changing only the URL can preserve an
obsolete destination filename. Confirm that exports contain one intended JAR,
with the expected hash and client/server placement.

Shader preset filenames must match their shader ZIP or generated folder.
Review all three presets whenever Complementary, Euphoria or BSL changes.

## Release procedure

1. Update `pack.version` in `empack.yml` and write `docs/RELEASE_NOTES.md` for that
   version. Keep unreleased behavior distinct from published behavior in guides.
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
such as `Create-Sky-0.1.6-prism-references.zip`.

Both pack workflows rebuild maintained resources before packaging. The separate
web workflows run from `web/`; [web setup](web/setup.md) describes their checks
and deployment dry run. Pack profiles assemble `pack/`, `overrides/` and
`templates/`, so the app and its local generated assets are outside their inputs.

Retain these choices when refreshing the scaffold:

- `EMPACK_RELEASE_NOTES` points to `docs/RELEASE_NOTES.md` and uses `--notes-file`.
- All three reference profiles are selected through `build.default`; CI uses that default.
- Prism overrides memory to 512 MiB minimum and 8192 MiB maximum.
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
