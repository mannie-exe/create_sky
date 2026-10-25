# Create Sky v0.1.12

Minecraft 1.21.1, NeoForge 21.1.264 and Java 21 remain pinned.
See [v0.1.11 notes](releases/0.1.11.md) for the previous release.

## Islands and integrations

Replace Sky Village Neighbors with Create Sky Compat 0.2.0. New worlds default to
Create Sky Islands: deep large islands with smaller companions, a build range
from Y=-128 through 767 and room above the terrain for construction and flight.
Selected Overworld geology follows each large island's height. Companions share
that geological frame; small islands do not receive every ore band.

Floating villages remain beside terrain, with zero to three allowed per cluster
and zero most common. The preset adapts climate and Sable air pressure to the
higher terrain. Optional ADQ integration repairs structure-route loading, distance
checks and village landing retries. Existing recipe, crop and loot policy remains.

The new preset requires a new world. Existing ordinary Sky Archipelago worlds
retain their generation settings; the update does not convert saves. Keep world
and generation-config backups before any deliberate replacement. Marked new
worlds reject incompatible generation changes.

## Rendering

Add client-only Veil Iris Fix 0.1.0. Aeronautics' propeller Ponder scene retains its
render target with Iris shaders enabled. The independent resource fixes, visual
patches, DH Polygon Fix and Copycat Bar Extrusion remain separate.

## Atlas and journal

Replace the progression canvas with React Flow. Item details embed routes with
interactive recipe nodes, icons, ingredient alternatives, a minimap and bounded
rendering. Shared recipe layouts keep slots aligned and support smithing trims.
Island surveys distinguish layout predictions, sampled blocks and estimates.
Journal descriptions clarify glider and balloon prerequisites without new gates.

## Verification and limits

Compat passed minimum/full dedicated generation and reopening checks, minimum
client/server joining, and full-stack client rendering. Terrain/resource samples,
village placement, climate, pressure and a controlled powered balloon crossing
are documented. Survival fuel budgets, full delivery completion and wing-borne
flight remain unverified. Vanilla noise caves, aquifers and large noise ore veins
are not restored.

The Veil correction passed transformed-method checks and native Ponder tests with
shaders on/off, burner rendering, inventory and shader reload on macOS arm64.
Other drivers/shader packs and an intermittent client shutdown stall remain outside
that rendering claim. Both independent mods passed Linux, Windows and macOS CI.

Modrinth, Prism and server exports retain referenced dependencies. The Atlas is
an internal app; potential routes do not prove affordable quantities or play time.
