# Server setup and maintenance

Use the server archive from the same Create Sky release as your clients.

## First launch

1. Extract `server-bundled.zip` into its own directory.
2. Set `JAVA_HOME` to a Java 21 installation, or make Java 21 the `java` on your
   `PATH`. Run `start.sh` on macOS/Linux or `start.bat` on Windows and confirm the
   Java version in the startup output.
3. Review Minecraft's EULA and accept it in the generated EULA file if you agree.
4. Start the server and add players with `whitelist add <player>` in its console.

The pack enables and enforces the whitelist. The default port is 25565, normal
view distance is 12 chunks, and simulation distance is 10 chunks. Server files
live under `game/`; the default world is `game/world`.

## Terrain and distant generation

New dedicated worlds use `sky_archipelago:sky_islands`. The common Sky Archipelago
configuration mirrors the **eee** preset because dedicated servers prioritize
that configuration. Preserve it when updating an existing world.

DH uses `CHUNKS_ONLY` with `INTERNAL_SERVER` to build LODs from the island
generator's actual chunks. The authored worker settings are four threads and
a runtime ratio of 1.0. To recalculate the LOW_IMPACT thread count for the host,
use this server command:

```text
/dh config common.threadPreset LOW_IMPACT
```

DH synchronization on load and real-time updates are enabled. The authored
per-player bandwidth limit is 500 KB/s, so a fresh client cache can take time
to fill. A large pregen does not override the client's LOD display radius.
See [missing distant terrain](graphics.md#missing-distant-terrain) for client checks.

## Updates

Stop the server cleanly before replacing files. Retain:

- The entire world directory, including dimension data, DH databases and Sable sublevels.
- The world's Sky Archipelago configuration and presets.
- Server-specific settings, whitelist, operators and ban lists.
- DH's installation-specific configuration, including its generated `serverId`.

Apply the new mod set and review configuration changes against those retained
files. Re-extracting an archive over an old installation can leave obsolete
JARs behind; replacing the whole directory without retaining local files can
reset access lists and configuration.

DH's Overworld database is `game/world/data/DistantHorizons.sqlite`. Dimension
folders have their own databases. Do not copy or move a live SQLite database
file by itself; committed data can still be in its WAL. Stop the server first,
or use SQLite's backup API for a consistent snapshot.

The client-only polygon fix and shader presets are excluded from server exports.
An update to those alone does not require changing the server's mod set.
