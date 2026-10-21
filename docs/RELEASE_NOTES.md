# Create Sky v0.1.5

By **mannie-exe** and **TimdoesLive**.

Minecraft stays pinned to **1.21.1**. NeoForge updates from **21.1.263** to
**21.1.264**, and Climbable Ropes updates from **2.1.4** to **2.2.0**.
Other mod and shader selections remain pinned, including stable JEI, Distant
Horizons 3.3.3 and the client-only DH Polygon Fix 1.0.1.

The source now uses empack **0.8.1-beta**, author schema 5 and lock schema 2.
Explicit file bindings preserve the selected client/server payloads. This release
includes bundled Prism and dedicated-server archives and a Modrinth reference pack.

Sky Islands generation, whitelist defaults, DH rendering defaults and shader
presets remain unchanged. Preserve existing worlds, local configuration, player
lists and LOD caches when updating. Import a fresh Prism instance before moving
saves; a distribution archive is not an in-place updater.

The migrated runtime passed a disposable dedicated-server startup and clean
shutdown. The owner reports the regenerated client is running well so far.
This is initial playtesting, not an extended gameplay or performance assessment.
All three release formats are checked for archive integrity, exact dependency
payloads or references, runtime versions and client/server placement.

See the [player guides](https://github.com/mannie-exe/create_sky/blob/v0.1.5/docs/README.md)
and [previous release notes](https://github.com/mannie-exe/create_sky/blob/v0.1.5/docs/releases/0.1.4.md).
