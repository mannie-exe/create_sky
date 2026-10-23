# Server setup and maintenance

Use the server archive from the same Create Sky release as your clients.

## First launch

1. Extract `server-references.zip` into its own directory. Install
   [empack 0.8.2-beta](https://github.com/inherent-design/empack/releases/tag/v0.8.2-beta)
   on `PATH`. On macOS/Linux, also install Python 3 for the temporary terminal
   workaround. Keep `foreground-runtime.py` beside the launch scripts. The launch scripts prepare the exact pack before starting Java;
   first preparation needs network access.
2. Set `JAVA_HOME` to a Java 21 installation, or make Java 21 the `java` on your
   `PATH`. Run `start.sh` on macOS/Linux or `start.bat` on Windows and confirm the
   Java version in the startup output.
3. Review Minecraft's EULA and accept it in the generated EULA file if you agree.
4. Start the server and add players with `whitelist add <player>` in its console.

The pack enables and enforces the whitelist. The default port is 25565, normal
view distance is 12 chunks, and simulation distance is 10 chunks. Server files
live under `game/`; the default world is `game/world`.

## Garbage collection

Keep Java 21's default G1 collector as the server baseline. The client ZGC setting
does not apply to the dedicated server. Before changing collectors, measure GC
pauses alongside tick times during normal play and pre-generation. Test ZGC only
if collection pauses contribute to stalls, and compare tick times, CPU use and
memory use with the same workload. No server-specific GC tuning is shipped.

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

Version 0.1.6 fixes cluster spacing to 1494 and disables
a conflicting biome optimization. Existing installations retain their settings;
normal pack updates should preserve worlds and LODs. See the
[generation review](../development/worldgen.md) before deliberately creating a
replacement world. The published 0.1.5 defaults remain historical release settings.

## Fresh random-world pregen

After stopping the server and verifying a complete world/config backup, remove
the previous world from the configured `level-name` path. Leave `level-seed=`
blank to let Minecraft choose a random seed at next launch. Do not copy the old
`level.dat`, region files or DH databases into the new world. Keep installation
identity, whitelist and operator settings.

With this pack's DH `CHUNKS_ONLY` / `INTERNAL_SERVER` configuration, start the
server and enter these commands in its console (without a leading slash):

```text
dh pregen start minecraft:overworld 0 0 1024
dh pregen status
```

The radius is 1024 chunks (16,384 blocks), centered at block coordinates 0, 0.
`dh pregen stop` cancels the job. The installed DH 3.3.3 command implementation
accepts dimension, X/Z origin and chunk radius. This run generates real chunks
and LODs; allow sufficient disk space. The previous world occupied about 18 GiB,
which is a reference measurement, not a guarantee for a different seed.
