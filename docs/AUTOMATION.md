# Build automation maintenance

The project uses empack **0.7.1-beta**, source tag `v0.7.1-beta` at
`4d1ef04`. Author schema 4 and bindings schema 1 are unchanged. This tooling
upgrade preserves the pack version, Minecraft/NeoForge versions, dependencies,
bindings, lock, and gameplay configuration.

## Upstream scaffold and deliberate overrides

`.github/scripts/empack-ci.py` and both workflows come from empack's 0.7.1-beta
`crates/empack-lib/src/engine/initialize/` scaffold. The old composite installer
is superseded by the helper's release download and GitHub asset-digest verification.
The helper stages only the exact outputs from `build --explain --json`, applies
optional defaults, rejects stale locks and tag/version mismatches, normalizes asset
names before hashing, and uploads a draft before making a release public.

Keep these project choices when refreshing from a newer scaffold:

- Both workflows explicitly select `modrinth`, `prism`, and `server`. Ordinary
  local builds still default to Prism through `distribution.defaults`.
- Java is Temurin 21. The existing setup-java v6.1.0 commit pin is retained.
- The helper adds `EMPACK_RELEASE_NOTES`: when set, publication uses
  `--notes-file` instead of generated notes. The release workflow points to
  `docs/RELEASE_NOTES.md`; update those notes before the next release.
- The Prism template deliberately retains `OverrideMemory=true`, 512 MiB minimum
  and 8192 MiB maximum. Upstream now inherits launcher memory by default.
  The obsolete PermGen entry has been removed.
- Server whitelist enforcement and `sky_archipelago:sky_islands` remain authored
  settings. The `eee` configuration is unchanged.

Future published filenames use hyphens for spaces, for example
`Create-Sky-0.1.0-prism-bundled.zip`. Existing v0.1.0 GitHub assets retain their old
names. Rebuilding locally does not replace a release or an installed Prism instance.
Windows server exports must be rebuilt to receive the 0.7.1 console/exit-status
fixes. `EMPACK_NO_PAUSE=1` suppresses the final pause for unattended Windows tests.

## Local verification, 2026-10-18

Migration base: Create Sky `31a45efe25c7c3da2a7b1dd50e9eace49d788fed`.
The installed macOS ARM64 archive was verified against GitHub's asset SHA-256:
`cb444cac7d14f2496d0a6ad8b22249e3416706135e295fa33740468fc786139c`.
The previous CLI is retained under `~/.local/share/empack/versions/0.7.0-beta/`.

Checks completed:

- `empack --version`: 0.7.1-beta; `empack status --json`: valid author and lock.
- `empack build --explain --json --optional-defaults --profile modrinth --profile prism --profile server`:
  current lock and all three expected outputs.
- actionlint 1.7.12: passed on both migrated workflows.
- The 12 upstream `test_project_automation.py` cases were run against the copied
  helper and local workflow files: passed, including stale locks, unsafe paths,
  digest failures, filename collisions and failed publication behavior.
- A real CLI selection with tag `v999.0.0` was rejected before building or publishing.
- Authored release-note arguments and draft-before-publication ordering passed
  a mocked publication check; no GitHub release was created.
- `EMPACK_PROFILES` set to `modrinth`, `prism`, `server` (one per line), with Java 21
  on PATH and a fresh `RUNNER_TEMP`; `python3 .github/scripts/empack-ci.py validate`:
  all three verified distributions built and staged successfully.
- Every staged archive passed ZIP CRC validation and matched its `SHA256SUMS`
  entry. Only the three selected archives plus checksums were staged.
- Prism output: 104 mod JARs, Minecraft 1.21.1, NeoForge 21.1.263, explicit
  512–8192 MiB memory, `eee` preset, and no bundled saves verified.
- Server output: whitelist enforcement, sky-island world type, Windows pause/exit
  handling, and bundled-install explanation verified. EULA was not accepted.
- Manifest, bindings and lock match their pre-migration bytes. Local `dist/SHA256SUMS`
  was refreshed for the original local filenames; CI checksums use normalized names.
- `git diff --check`: passed.

Generated outputs are in `dist/`. The new workflow/helper is locally verified;
existing GitHub workflows and release assets have not been replaced.
Hosted GitHub execution, Windows runtime execution, and gameplay are not tested
by these local automation checks. Those checks preceded the v0.1.1 release preparation; the release additionally
updates author credits and pack version without changing dependency selections.


## v0.1.1 release verification

The version and author metadata were updated through the author document and
`empack sync --yes`. Only the lock's intent revision changed; all 105 dependency
selections and the bindings remained identical. The helper's `validate` command
rebuilt all three v0.1.1 profiles. ZIP CRCs and staged checksums passed, every
archive contains the shared author credits, and Prism's `ExportAuthor` includes
both mannie-exe and TimdoesLive. These checks did not launch Minecraft.
