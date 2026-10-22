# Build and release maintenance

Use empack **0.8.1-beta** and Java **21** from the repository root. Builds use the
recorded lock and explicit distribution profiles. They do not update installed
clients or servers.

## Source layout

| Path | Owner of the setting |
| --- | --- |
| `empack.yml` | Pack version, runtime, dependency intent and distribution profiles |
| `empack.lock` | Resolved content and hashes |
| `empack.bindings.yml` | Selected files, names and placement |
| `overrides/common/` | Shared authored configuration |
| `overrides/client/` | Client-only content and shader presets |
| `templates/` | Prism memory settings and server properties |
| `docs/players/` | Player and server-owner instructions |
| `docs/development/` | Maintainer procedures and dated evidence |
| `docs/RELEASE_NOTES.md` | Notes consumed by release CI |

Generated JARs and archives are ignored by Git. Keep worlds, credentials, server
lists, raw logs and machine-specific paths out of distributed overrides.

## Local builds

After editing dependency intent, synchronize and materialize the selected files,
then rebuild maintained resources and build all supported exports:

```sh
python3 scripts/build-fixes.py
empack status
empack sync --materialize --yes
empack build --profile prism --profile modrinth --profile server --yes --optional-defaults
```

The outputs are a bundled Prism client, a reference-based Modrinth pack and a
bundled server under `dist/`. Without explicit profiles, the local defaults are
Prism and server. Check placement and archive contents as well as command success.

Local edits can change an export without changing its filename. Use the published
release's checksums to identify released bytes; a local rebuild is not a substitute
for verifying downloaded release assets.

## Dependency updates

Read [compatibility constraints](compatibility.md) before changing pins.
Provider-backed selections use exact versions. Ten content-pinned URL sources
need manual upstream checks: nine provider-metadata exceptions and DH Polygon
Fix. `empack outdated` alone does not cover them.

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

Both workflows select `modrinth`, `prism` and `server`, use Temurin 21, and pin
GitHub Actions to commits. `.github/scripts/empack-ci.py` comes from the empack
0.7.1-beta scaffold, source tag `v0.7.1-beta` at `4d1ef04`, with a project-specific
release-notes option. Its build-explanation check now expects schema 2 for empack 0.8.1.

The helper verifies the downloaded empack binary against GitHub's asset digest,
rejects stale locks and tag/version mismatches, and stages only the outputs named
by `build --explain --json`. It normalizes filenames before hashing and publishes
a draft only after uploads succeed. Published names use hyphens for spaces,
such as `Create-Sky-0.1.5-prism-bundled.zip`.

Both workflows rebuild maintained resources before packaging.

Retain these choices when refreshing the scaffold:

- `EMPACK_RELEASE_NOTES` points to `docs/RELEASE_NOTES.md` and uses `--notes-file`.
- All three export profiles are selected explicitly in CI.
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
