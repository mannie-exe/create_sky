# Installation and worlds

Create Sky runs on Minecraft 1.21.1, NeoForge 21.1.264 and Java 21.

## Client installation

1. Download a pack from [GitHub Releases](https://github.com/mannie-exe/create_sky/releases).
2. Import the `prism-references.zip` into Prism Launcher, or import the `.mrpack`
   into a launcher that supports Modrinth packs. For Prism, install
   [empack 0.8.2-beta](https://github.com/inherent-design/empack/releases/tag/v0.8.2-beta)
   on the launcher process's `PATH`. Its launch hook downloads and verifies the
   released files; keep the generated pre-launch and wrapper commands.
3. Select Java 21 in the instance settings and launch the game. The Prism profile
   sets a maximum heap of 8 GiB; adjust this to fit your machine.

Use [graphics settings](graphics.md) to enable shaders or configure distant terrain.
The server archive is for [hosting](server.md), not client installation.

## New worlds

New single-player worlds default to **Sky Islands** using the saved **eee**
preset. Dedicated servers use matching terrain settings. Existing vanilla worlds
are not converted. Large gaps between islands are intentional.

Keep the Sky Archipelago preset and configuration with the world. This version
can resolve stock saved generator settings through the current default preset;
changing it can affect newly generated terrain in an existing world.

Version 0.1.6 uses random island sizing with radius settings from 10 to 500,
island-center heights from Y -32 to 300, and CONSISTENT cluster spacing of 1494.
Version 0.1.5 used DYNAMIC spacing from 32 to 1500, selecting one spacing per world.
The ocean layer is off and islands are skipped over ocean biomes. Saved size bands
apply only when SPECIFIC sizing is selected; RANDOM is the current default.

Lootr provides personal loot in supported containers; it does not add structures.
Carry On excludes Lootr containers and Aeronautics/Sable objects. Ship storage,
resource access and survival progression still need gameplay testing.

## Existing installations

Read the target release's notes before updating. Stop the client or server before
replacing its files. Use a fresh instance for a clean client test, and retain any
single-player saves and personal settings you want to carry over.

Replace the mod set rather than adding new JARs alongside obsolete versions.
For v0.1.3 through v0.1.7, install only DH Polygon Fix 1.0.1 with the original DH 3.3.3 JAR.
Remove any 1.0.0 fix JAR. Shader presets are separate files, so a JAR-only update
will not apply the pack's graphics settings.

Server updates must retain the world and its generation configuration; see
[server maintenance](server.md#updates). A normal pack update does not require
regenerating terrain or deleting DH caches.

## Issue reports

Include the pack version, operating system, Java version, what you were doing,
and the relevant log or crash report. Mention any changed mods or shader settings.
For missing distant terrain, follow the [LOD checks](graphics.md#missing-distant-terrain)
first. For a native JVM crash, include the `hs_err_pid*.log` file as well as
Minecraft's log.

Version 0.1.6 fixes cluster spacing to 1494 and disables
a conflicting biome optimization. Existing installations retain their settings;
normal pack updates should preserve worlds and LODs. See the
[generation review](../development/worldgen.md) before deliberately creating a
replacement world. The published 0.1.5 defaults remain historical release settings.
