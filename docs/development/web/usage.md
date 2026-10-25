# Map guide

## Item grid

Search by item name or identifier, filter by namespace or route status, and scroll
in both directions. Drag with the mouse to pan; touch and trackpad scrolling remain
available. Scrollbars are hidden. Click or drag the minimap to move across the grid;
arrow keys pan while the grid or minimap is focused, Home returns to the origin,
and End moves to the far corner. The minimap scales the two grid axes independently
to keep both directions usable across the tall layout. Hover for a summary; select an item for its acquisition paths,
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

## Item details

Acquisition embeds the minimum-depth route graph and the selected operation's
recipe. At readable zoom, recipe cards are interactive inside nodes. Select a
node or use Inspect step to center it; Fit and the minimap expose earlier
steps. Open full graph retains the larger browsing view. Uses lists consuming
recipes; Evidence holds drops, tags, hooks and provenance. Pack notes are expandable.
Back returns to the previous inspected item without leaving the map.

## Progression graph

Open **Progression graph** beside Item map. Its tabs answer separate questions:

- **Systems:** possible cross-mod inputs and outputs around a selected namespace.
  Arrow labels count contributing routes, including possible OR ingredients.
  They are not mandatory dependencies or quantities.
- **Processing:** input and output items for a selected machine. Each connection
  retains the routes that mention both. The inputs and outputs summarize separate
  recipes; they are not one combined recipe. Machine requirements come from the
  authored progression model, including machines used in multi-step routes.
- **Item routes:** vertical acquisition diagrams with item icons. **Single route**
  shows acquisition or use alternatives; **Minimum-depth path** expands one finite
  chain from the existing solver. The item inspector's **Open full graph** opens
  that path directly. Long paths open near the target at a readable scale; use Fit
  for the overview or the minimap to move through earlier steps. Dashed edges are OR choices; ALL input groups feeding an
  operation are required. Separate routes are alternatives, not sequential tasks.
  Single routes show up to four choices per group and twelve outputs. Paths show
  the chosen input per group and at most the last 80 steps; other choices remain
  in group details. Counts state omissions. Empty groups and scenarios stay explicit.
  An unresolved path can still have candidate routes in Single route mode.
- **Coverage:** counts and items by mapping status and namespace. A missing route
  is an atlas gap, not proof that the item is unobtainable in-game.

Systems and Coverage show the top 12 connections by default. Processing splits
that limit between inputs and outputs. Choose Top 24 or All to expand; counts state
how much is shown. The item list is searchable, with 100 entries initially and
Show more for the rest. Selecting an item opens its routes; Processing's list
instead selects the machine. Item details opens the shared inspector with paths,
quantities, conditions and provenance.

Drag the canvas to pan, use the wheel or +/− controls to zoom, and click or drag the
minimap below it to navigate. On the canvas or minimap, arrow keys pan, +/− zoom,
and Home fits the scene. Fit frames the current scene. Reset view clears the item
search and refits the current view. Graph-tab switches remember their camera and selection. `/` focuses
the active map's search. The selectors below the canvas provide keyboard access
to every displayed node and connection, including contributing route records.

Reload data preserves selections and camera while rereading compiled JSON. Direct
source edits require compilation first; saves through Edit data rebuild the projection
and refresh it on the next graph visit. Refresh the page to recheck the runtime
fingerprint after external changes.

The canvas mounts a bounded viewport projection. Large scenes simplify at low zoom;
the footer reports visible nodes and connections and any omitted edges. Connections
with off-screen endpoints are not drawn. Full source records remain available;
a summary or partial canvas does not establish a complete production chain.

## Recipe displays

Item details, Evidence recipes and graph route selections share slot displays.
Click an icon to inspect the item. A slot's numbered badge opens its alternatives
in the ingredient list, outside the fixed grid. Counts,
fluid amounts, probabilistic outputs and processing conditions come from recipe
JSON. Cooking/processing times are Minecraft ticks. Operating requirements list
machines and capabilities separately from consumed slots. Wide panels show inputs
→ output; narrow panels stack inputs ↓ output. Large mechanical patterns retain
their geometry with local horizontal scrolling. In the full graph, the selected
recipe appears beside the canvas on wide screens and below it on smaller screens.

Supported layouts include shaped/shapeless crafting, mechanical crafting, cooking,
stonecutting, smithing transforms/trims and common Create processing recipes.
Trimming shows the supplied armor as a modified base rather than treating the
runtime's sample iron chestplate as a fixed output. The trim pattern itself is not
rendered. Trims remain consuming uses and do not create item-acquisition edges. These are
browser reconstructions using extracted icons, not running game GUIs. Sequenced
assembly and other unsupported custom layouts retain an explicit source-record
fallback. Components, source packs and conditions remain available in every record.

## Evidence and world survey

Evidence lists recipes, loot, advancements, trades, configuration, overlaps and
coverage gaps. Search within a domain and expand source data for the captured
record. Source links and identifiers distinguish runtime evidence from authored
interpretation.

World & ores displays the dated read-only Overworld survey. Each square represents
a region, not an island boundary. Ore estimates include void chunks. The travel
calculator divides distance by a supplied speed; it does not find a route or
simulate a vehicle. Without a survey, the view states that measurements are absent.

The separate Village survey compares controlled foundation/chest yields with
natural candidate starts and fully generated samples. Expand Method and limits
for provenance and full block counts. A stale warning means the survey needs to
be repeated against the current runtime and processor inputs.

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

## Resource packs

Open **Resource packs** in the header for the dated review at `/resourcepacks`.
Search by pack, feature or mod, then narrow by decision or scope. Filters are
stored in the URL; Reset clears them. Each row pairs the review and source links
with an author's image gallery. Select a thumbnail or enlarge the image; arrow
keys move through the enlarged gallery and Escape closes it.

File evidence shows the exact selected version, hash, declared resource format,
matching installed asset paths and overlaps. These are inspection results, not
proof of correct rendering. Galleries can depict other versions, shaders and
optional mods; they are labelled as source images rather than Create Sky tests.
“Try first” identifies candidates for a controlled playtest, not packs to install
together. Selected stack entries describe the current selection. Inspection overlaps retain
the dated six-pack baseline recorded with the survey.

Catalog screening retains all 750 ranked listings and their first-pass screening
reasons. Its search is separate from the detailed review filters. Following a
review link reveals its target even if the current filters hide it. The page is
read-only and does not download, install or reorder resource packs.
