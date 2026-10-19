# Build automation maintenance

The project uses empack **0.7.1-beta**, source tag `v0.7.1-beta` at
`4d1ef04`. Author schema 4 and bindings schema 1 are unchanged. Use the recorded lock and explicit distribution profiles for reproducible builds.

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

Published filenames use hyphens for spaces, for example
`Create-Sky-0.1.2-prism-bundled.zip`. Existing v0.1.0 GitHub assets retain their old
names. Rebuilding locally does not replace a release or an installed Prism instance.
Windows server exports must be rebuilt to receive the 0.7.1 console/exit-status
fixes. `EMPACK_NO_PAUSE=1` suppresses the final pause for unattended Windows tests.

## Release procedure

1. Update `pack.version` in `empack.yml` and `docs/RELEASE_NOTES.md`.
2. Run `empack sync --yes`, then build all three profiles. Check archive contents,
   side-specific mods, configs and checksums. Record results in `docs/DECISIONS.md`.
3. Commit and push the source, then push the matching `v<version>` tag.
4. Wait for validation and release workflows to pass. Verify the published assets
   and their checksums before announcing the release.

A successful build verifies packaging and recorded content. It does not establish
world-generation accuracy, shader rendering or moving-ship compatibility.
