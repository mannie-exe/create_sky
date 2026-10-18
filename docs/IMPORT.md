# Import and verification

> Historical pre-update import report. See [UPDATE_REVIEW.md](UPDATE_REVIEW.md) for the released configuration; raw linked audit files are local-only.

## Source and decisions

Source: local Prism instance `Create- Sky World`, inspected 2026-10-18. Its `mrpack/modrinth.index.json` contains 97 exact downloads: **96 mods + Complementary shader ZIP**. All installed payloads matched the source SHA-512 values, with no missing or extra JARs.

Created `~/Minecraft/create_sky`; layer_1, layer_2 and the original friend instance were left unchanged. Preserved active configs/options, custom preset, resource/shader content and exact versions. Excluded worlds, server/account lists, logs, runtime/native caches, config backups, the Sodium machine fingerprint and generated Euphoria error shaders/logs. The stale active configs are retained and reviewed, not silently deleted.

The initial reconstructed mrpack was imported with `empack init --from`. Then `empack init --force` regenerated clean 0.7 scaffolding, templates, profiles and workflows. The source inventory was translated into compact author declarations and explicit bindings; `empack sync --materialize` generated the final lock and verified payloads. No lock was hand-edited.

86 roots use exact Modrinth selections. **11 use exact URL+hash snapshots** to preserve the supplied runtime across provider metadata problems. These are normal empack source types, but provider closure cannot validate their internal dependencies; runtime JAR metadata is recorded separately in `jar-metadata.json`.

## Provider exceptions

- Aeronautics Rechiseled compatibility, Throwable Rope Connector and Vibrant Vaults have exact provider dependency pins that disagree with the supplied newer versions. Their JAR ranges permit the supplied Sable/Aeronautics/Create versions inspected here.
- Hoofprint/Surveyor/McQoy have cross-loader/exact provider requirements that do not describe the supplied Connector + Forgified Fabric API runtime cleanly.
- Rechiseled/SSRD declare Fusion/Sodium dependencies with `side=CLIENT` inside their JARs; provider edges lack this side restriction. Rechiseled Create must use the same snapshot treatment because its provider edge otherwise reintroduces Rechiseled.
- JEI already bundles MezzConfig **0.6.6**. Provider resolution added standalone **0.6.8**, which would change the imported runtime. JEI and the incoming Covers dependency were retained as URL snapshots. The redundant standalone library was removed through `empack remove mezzconfig --acknowledge-unknown --yes` only after inspecting the nested JEI library and required edges.

Details and exact IDs: `provider-exceptions.json` (local evidence). These snapshots require deliberate version changes; `empack outdated` cannot give them the same update/closure assurance as normal provider roots. Source/API files and developer/source JAR companions are explicitly excluded through file selection.

## Authoring changes from the source

- New project name/version: Create Sky 0.1.0.
- Same Minecraft/NeoForge and mod/shader payload versions.
- Correctly tagged known client-only files when provider/runtime evidence supported that separation. Dedicated server compatibility still needs a launch test.
- Fresh server template: whitelist enabled; new-world type explicitly `sky_archipelago:sky_islands`.
- Fresh Prism template: explicit memory override (512 MiB initial / 8192 MiB maximum).
- Plain build defaults to bundled Prism; Modrinth and server profiles are separately selectable.
- Original active shader preference remains disabled; the shader mismatch is documented, not silently updated.

## Checks and limitations

Commands and archive verification are recorded in `verification.json` (local evidence). The clean-default Prism run generated configs and reached world entry, then crashed in native Apple Metal/IOGPU code. A second run with the source configs/options entered the disposable vanilla world and remained alive through a short observation, then was terminated. See [CONFIG_REVIEW.md](CONFIG_REVIEW.md) for the exact limits. Neither run establishes sky-world survival balance, moving-ship compatibility or dedicated server correctness.

No release was published, no remote was created, and no commit was made. Generated workflows are the local empack 0.7 templates; they have not run in GitHub CI.

## Empack upgrade

At initial import, `~/.local/bin/empack` reported **0.7.0-beta**. For the current toolchain, see [automation maintenance](AUTOMATION.md). macOS ARM64 release asset SHA-256:

`7fbeb78ffc1d8cdb9f5ab6fa75c930c2e14bf00388263498b39f6b74c38b2e90`

The value matched GitHub's release asset digest before installation. [Official release](https://github.com/inherent-design/empack/releases/tag/v0.7.0-beta). Version 0.7 rejects old author schemas; old layer_1/layer_2 manifests are deliberately untouched. The old executable is retained at `~/.local/share/empack/versions/0.6.0-beta/empack`.
