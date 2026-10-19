# Create Sky v0.1.2

By **mannie-exe** and **TimdoesLive**.

This patch removes Distant Horizons SeedGen, whose seed-based terrain reconstruction
does not reproduce Sky Archipelago's islands. Distant Horizons itself remains
installed and now uses `CHUNKS_ONLY` with `INTERNAL_SERVER` for generation.

- Set DH to four worker threads with runtime ratio 1.0, matching LOW_IMPACT on the
  reference host. Run `/dh config common.threadPreset LOW_IMPACT` to adapt it to
  another server.
- Remove the copied DH server ID from distributed configs.
- Remove SeedGen and its configuration from exports.
- Consolidate historical documentation into `docs/DECISIONS.md`, with separate
  current compatibility and build instructions.

Minecraft 1.21.1, NeoForge 21.1.263, the `eee` preset, whitelist enforcement and
remaining mod versions are unchanged. Shaders and DH rendering remain disabled
by default in fresh exports.

For existing installations, remove the SeedGen JAR and `config/seedgen.json`
from both client and server. Incorrect cached LODs may need a separate reset
while both are stopped; see [compatibility instructions](https://github.com/mannie-exe/create_sky/blob/v0.1.2/docs/COMPATIBILITY.md).
Keep your worlds and Sky Archipelago preset/configs when updating.

Validation covers dependency metadata and distribution contents. This patch has
not been launched for a gameplay test; sky-island LOD rendering and moving ships
still require in-game verification.
