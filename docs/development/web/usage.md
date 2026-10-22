# Map guide

## Item grid

Search by item name or identifier, filter by namespace or route status, and scroll
in both directions. Hover for a summary; select an item for its acquisition paths,
recipes, uses, drops, tags, implementation hooks and source records.

Horizontal position follows minimum modeled acquisition depth. Rows sort by
ingredient-slot complexity and namespace, with a downward offset for each depth.
Each depth occupies six columns with a gap before the next. This is a dependency
layout, not elapsed playtime or a required quest order. Unresolved items occupy
the final band.

Coverage distinguishes mapped routes, blocked prerequisites, missing adapters,
internal/creative exclusions and unified variants. A mapped path shows potential
access under its listed assumptions. Quantities, success probabilities, working
machinery, travel and combat remain separate constraints.

## Evidence and world survey

Evidence lists recipes, loot, advancements, trades, configuration, overlaps and
coverage gaps. Search within a domain and expand source data for the captured
record. Source links and identifiers distinguish runtime evidence from authored
interpretation.

World & ores displays the dated read-only Overworld survey. Each square represents
a region, not an island boundary. Ore estimates include void chunks. The travel
calculator divides distance by a supplied speed; it does not find a route or
simulate a vehicle. Without a survey, the view states that measurements are absent.

## Editing

Edit data exposes the eight files in `data/authored`. Save & rebuild validates
the selected domain and recompiles the map. Reload from disk before saving if
another editor changed the same file. Direct YAML edits require `pnpm data:compile`.
The [data reference](data.md#ownership) lists each domain's responsibility.

Recipe edits are scenarios. Export recipe datapack packages complete replacement
recipes or disable conditions; it never installs them. Test and install a reviewed
patch separately. The changed resources must be included in the audit capture
before its results can verify that change; world-only datapacks are not imported.
Other domain edits affect interpretation and assumptions, not game configuration.

Refresh data captures an isolated runtime and rebuilds resources and routes.
It does not rescan the world. A stale indicator calls for review or refresh;
the app does not continuously follow the running game.

Editing and refresh controls work only through `pnpm dev`. Static preview and
future static deployments provide browsing only.
