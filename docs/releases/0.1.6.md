# Create Sky v0.1.6

By **mannie-exe** and **TimdoesLive**.

Minecraft remains **1.21.1**, with **NeoForge 21.1.264** and **Java 21**.

## Installation

All three distributions now use reference delivery, built with empack **0.8.2-beta**:

- Import `Create-Sky-0.1.6.mrpack` through a Modrinth-compatible launcher.
- Import `Create-Sky-0.1.6-prism-references.zip` through Prism Launcher. Install
  empack 0.8.2-beta on the launcher process's `PATH`; the launch hook prepares the
  exact released files before starting Minecraft.
- Extract `Create-Sky-0.1.6-server-references.zip` into a new server directory.
  Install empack 0.8.2-beta and Java 21, then run `start.sh` or `start.bat`.

The Prism and server archives download verified mod selections during preparation.
They retain authored configuration and resources; the server archive also includes
prepared runtime assets. First preparation requires network access. Preserve the
launcher hooks and extract each archive completely.
Client options are installed as defaults and remain editable between launches.

## Content and progression

This release includes the previously local additions: Reliable Gliders 2.0.0,
Create: Hostile Skies 0.2.6, Aeronautics Delivery Quests 1.1.1,
Create Propulsion: Simulated 1.1.5 and Questlog 3.4.1.

Questlog provides 48 journal entries with short objective labels, full conditions,
explanations and shared inventory/interaction disclaimers. Access it with the
journal hotkey or menu entry. No quest book is required.

Hostile Skies automatic raids and departure explosions are disabled. Capture
remains enabled. Delivery Quests uses village destinations with four offers,
500 to 2,000 block routes and 120-minute deadlines. Glider defaults remain intact.

The maintained resource mod fixes Create Deco placard ingredients, optional-content
recipe conditions, Interiors recoloring tags, the Bells & Whistles metro-window
ingredient, a Design n' Decor cogwheel tag and four Propulsion block loot tables.
Almost Unified prefers Create Deco zinc sheets while retaining existing sheets
and shared ingredient tags.

## World generation

New worlds use **CONSISTENT cluster spacing of 1494 blocks**, replacing DYNAMIC's
per-world spacing selection. Random island sizing remains enabled. Zfastnoise's
conflicting biome optimization is disabled; its noise optimization remains enabled.

Retain existing worlds, their generator configuration, player data and LODs during
an update. These defaults do not require regeneration. Review the generation guide
before applying changed settings to an existing world, since new chunks can differ.

## Maintenance and verification

The local progression map and journal editor now live under `web/` in this
repository, with Create Sky naming and shared documentation. They are not included
in game distributions.

The new `outdated --strict` assessment completed for provider-backed dependencies.
Newer JEI and Sound Physics candidates are betas; current stable selections remain.
Manual URL sources were reviewed separately; existing compatibility selections
remain, including DH 3.3.3 with DH Polygon Fix 1.0.1 and SSRD 1.8.7.

All three reference archives passed integrity checks. Fresh Prism and server
installations prepared their exact files successfully, and the isolated server
reached readiness and shut down cleanly in a disposable flat world. Journal
source checks and the configuration audit passed. This does not establish client
GPU compatibility, shader performance or complete survival progression.

See the [player guides](https://github.com/mannie-exe/create_sky/blob/v0.1.6/docs/README.md)
and [previous release notes](https://github.com/mannie-exe/create_sky/blob/v0.1.6/docs/releases/0.1.5.md).
