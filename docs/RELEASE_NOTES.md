# Create Sky v0.1.10

Minecraft 1.21.1, NeoForge 21.1.264 and Java 21 remain pinned. See [v0.1.9 notes](releases/0.1.9.md) for the previous release.

## Flight

Remove Do a Barrel Roll and its client/server configuration after reported flight
jitter. Retain vanilla elytra steering and firework propulsion. No replacement
flight overhaul is added.

## Resource selection

Replace 3D Ladders with RAY's ladders. Add RAY's rails, Midnighttigger's Default
Connected Textures, Low Shield, Soft Weather, Cubic Sun & Moon, Fresh Flower Pots,
Create Touch-Ups, Low On Fire, Fresh Animations Details/Objects and Better Lanterns.
Icons is excluded. Keep the selected packs' materials close to vanilla and inspect
modded counterparts separately.

The generated client patch combines four 3D Crops mushrooms/fungi with Fresh pots,
restores Macaw's chain colors, fits bell/covered lantern artwork, extrudes Deco's
industrial bars and adds Fresh Objects motion to Lootr chests. Its inputs
are version/hash pinned. Dedicated cane and rails retain priority; the patch
loads last. The inspected Crops archive is explicitly accepted despite its format
metadata mismatch. Existing player selections are preserved unless explicitly synced.

## Authoring and maintenance

The Atlas includes resource-pack decisions, sourced galleries and catalog searches.
Page navigation and view controls are shared across the map, authoring and review
pages. Pack resource generators support read-only checks and preserve unchanged
archive bytes and timestamps. Dependency and patch update procedures are centralized
in the [maintenance guide](development/patches.md).

The [model workbench](development/web/models.md) edits extrusion planes, texture
regions, UV mappings and element bounds with a textured preview. Recipe saves,
resource generation and instance installation remain separate actions.

## Verification limits

Isolated checks cover potted plants, sampled lanterns/chains, bar connections,
Lootr motion/state and glass. The model pass includes Complementary/Euphoria
shader checks. Moving ships, Copycats, multiplayer and other shader combinations
remain untested. The combined patch remains a playtest selection.
See [verification](development/web/verification.md) for current checks and evidence.
