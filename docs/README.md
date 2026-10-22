# Create Sky documentation

Player guides explain installation and operation. Development documents describe
pack authoring, compatibility constraints and verification. Historical decisions
record what was tested at the time; they do not define current defaults.

## Players and server owners

| Guide | Contents |
| --- | --- |
| [Getting started](players/getting-started.md) | Installation, world creation and updates |
| [Journal](players/journal.md) | Local quest conditions and controls |
| [Graphics](players/graphics.md) | DH rendering, shader choices and missing LODs |
| [Servers](players/server.md) | Hosting, world preservation and DH generation |
| [Included content](MODLIST.md) | Exact mods and shaders in v0.1.7 |
| [Release notes](RELEASE_NOTES.md) | v0.1.7 changes; [v0.1.6 archive](releases/0.1.6.md) |

## Development and maintenance

| Guide | Contents |
| --- | --- |
| [Build and release](development/build.md) | Source layout, empack commands and CI |
| [Compatibility and verification](development/compatibility.md) | Dependency constraints, shader evidence and test scope |
| [Journal definitions](development/journal.md) | Conditions, authoring and implementation evidence |
| [Pack authoring](development/authoring.md) | Journal generation, locale editing and categorized configuration audit |
| [Web map and authoring](development/web/README.md) | App setup, editor controls, data pipeline and verification |
| [Journal integrations](development/journal-integrations.md) | EMI/JEI, translation and Ponder findings |
| [World generation](development/worldgen.md) | Candidate spacing and biome compatibility |
| [Progression review](development/progression.md) | Routes, overlaps and remaining play checks |
| [Upstream findings](development/upstream.md) | Known reports and candidates for submission |
| [Decision history](development/decisions.md) | Dated decisions, commands and earlier findings |

## Source and release defaults

Version 0.1.4 and later enable DH rendering by default. Version 0.1.3 disables it.
Shaders remain opt-in in both. Building source does not update a downloaded
release or an installed instance. Current defaults live in `overrides/` and
`templates/`; release notes describe their named release only.
