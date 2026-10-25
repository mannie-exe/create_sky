# Data pipeline

The app builds a local snapshot from registered Minecraft content, JAR resources,
editable YAML and an optional survey of existing chunks. The browser reads static
JSON and images; it does not query the playing server.

```mermaid
flowchart TD
    Server[Installed server and pack overrides] --> Runtime[Isolated NeoForge exporter]
    Runtime --> Evidence[data/generated/runtime]
    Jars[Vanilla and mod JARs] --> Extract[Asset and resource extraction]
    Evidence --> Extract
    Extract --> Catalog[data/generated]
    World[Existing Overworld chunks] --> Survey[Read-only survey]
    Survey --> Catalog
    YAML[data/authored domains] --> Compile[Recipe adapters and route solver]
    Catalog --> Compile
    Evidence --> Compile
    Compile --> Public[public/generated JSON and textures]
    Public --> Browser[Astro page and browser grid]
```

## Registered content

[`scripts/runtime.py`](../../../web/scripts/runtime.py) compiles
[`AtlasExporter.java`](../../../web/tools/exporter/AtlasExporter.java) against the installed
server libraries, then boots a disposable NeoForge server under `.cache/audit-server`.
It uses installed server mods, selected pack additions and maintained resource JARs.
Config is copied from the server and common overrides; existing-world
`serverconfig` is copied as configuration only. Live chunks, player data and LODs
are never mounted. Java libraries and mod JARs are symlinked as read-only inputs
by convention; this is process isolation, not an operating-system sandbox.

The exporter captures registries, resolved RecipeManager recipes, tags, loot,
advancements, fluids and targeted Java interaction adapters. Runtime resource
provenance distinguishes active resources from competing raw JAR definitions.
`complete.json` marks a finished export; `snapshot.json` records loaded JAR hashes,
the pack-lock hash and input fingerprint. A failed capture must be investigated
before compiling its output.

The adapter is specific to this pack and Minecraft 1.21.1 / NeoForge. Adding a mod
can require new Java or graph adapters. User-world datapacks and gamerules are not
imported. The disposable world can persist between captures; its state is not
an observation of the playing world.

## Textures and names

[`scripts/extract.py`](../../../web/scripts/extract.py) reads the configured vanilla client
JAR, `pack/mods`, common override JARs and nested JARs. It indexes resource JSON and
English translations. For duplicate asset paths, later scanned files replace
earlier files; this scanner order does not reproduce every client resource-pack
priority rule. User-selected resource packs are not scanned.

For each registered item it follows the item model's parent chain, resolves
texture aliases, and selects an available PNG: `layer0`, `all`, `front`, `side`,
`top`, `particle`, then other texture entries. The bytes are copied unchanged to
`public/generated/icons/<content-hash>.png`; identical textures share a file.
Each icon retains its JAR and resource path. Names come from `en_us` translations,
with an identifier-based fallback. Matching Ponder translation text is indexed;
Ponder scenes are not executed.

These are texture previews, not Minecraft inventory renders. Model geometry,
tints, animation timing, layered textures and custom renderers are not reproduced.
Missing models/textures use the grid's placeholder. Old unused icon files can
remain after extraction; generated assets are rebuildable and excluded from Git.

## Ownership

| Location                          | Authority and editing                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `data/authored/acquisition.yml`   | Environment gates, gathering, farming, special interactions and classifications              |
| `data/authored/items.yml`         | Item notes, overlap opportunities, unresolved decisions                                      |
| `data/authored/recipes.yml`       | Full recipe replacements or disable operations; scenario until tested                        |
| `data/authored/interactions.yml`  | Reviewed mechanics and explicitly assumed gathering routes                                   |
| `data/authored/mobs.yml`          | Mob behavior, Hostile Skies architecture and settings                                        |
| `data/authored/progression.yml`   | Gathering roots, machine requirements and graph assumptions                                  |
| `data/authored/worldgen.yml`      | Geography interpretation and generation decisions                                            |
| `data/authored/configuration.yml` | Design constraints, coverage limits and operational findings                                 |
| `data/authored/resourcepacks.yml` | Resource-pack judgments and next playtests; edited directly, outside the map scenario editor |
| `data/research/resourcepacks/`    | Dated catalog metadata, selected file inspections and source gallery links                   |
| `data/generated/runtime/`         | Exact registered game evidence; never hand-edit                                              |
| `data/generated/world.json`       | Read-only Anvil survey and sampling method                                                   |
| `data/generated/documents.json`   | All discovered JAR resource versions and provenance                                          |
| `public/generated/`               | Rebuildable browser projection and extracted game textures                                   |
| `tools/exporter/`                 | Java 21 NeoForge development exporter, never installed in play instances                     |

Generated data and game assets stay local and ignored by Git. Their licenses are
unchanged. CI builds the application shell without requiring Minecraft binaries,
worlds or private machine paths. A fresh checkout must capture a local snapshot
before its map contains real content; it never fabricates demonstration data.

## Recipes and acquisition routes

Edit domain YAML directly or through Edit data. Saves validate shape, reject
conflicting revisions, preserve generated evidence, and rebuild the projection.
The underlying recipe codec remains Minecraft's authority: YAML/schema validation
alone cannot prove an arbitrary mod recipe loads successfully.

`recipes.yml` accepts `changes: [{id: namespace:path, disabled: true}]` or an entry
with `json` containing a **complete** replacement recipe. Export creates a
Minecraft 1.21.1 datapack (format 48), using NeoForge false conditions for disabled
recipes. It never installs the datapack or changes the live instances. Test in a
disposable instance before applying it. To verify the installed change through this
exporter, include it in captured resources, such as the pack's maintained resource
JAR. A datapack installed only in the playing world is not imported by runtime
capture. Recompiling an empty change list restores the unmodified graph.

The grid includes every registered item. X advances through minimum modeled
acquisition depth. Each stage has six columns; rows sort by ingredient complexity
and namespace. AND prerequisites and OR alternatives determine reachability.
Item details show a selected path, the contributing sources and unresolved inputs.
Nothing becomes a free resource merely because it participates in a recipe cycle.

Adapters cover runtime recipes, Rechiseled groups, Create sequenced assembly,
NeoForge compound/difference/intersection/block-tag ingredients, fluids, distinct
potion states, brewing, sampled villager and wandering-trader offers, Big Cannons
casting/boring/heating, copper transformations, composting and global loot modifiers.
Gathering uses actual block loot and mining tags over observed world blocks.
Chest, fishing, mob, barter, archaeology and selected event sources retain their
conditions and functions. `acquisition.yml` holds explicit environmental and
interaction assumptions; those are editable, not discoveries made by the solver.

A mapped route is **potential access**. It does not solve quantities, probability,
XP, stress/RPM, safe combat, actual village/biome positions or travel time.
Trade offers are seeded samples, not every possible enchantment or NBT variant.
Most item components are evidence rather than independent nodes; potion contents
are specifically modeled. Arbitrary Java mechanics still need source adapters.
Coverage separates mapped items, blocked prerequisites, missing adapters,
explicit internal/creative exclusions and unified material variants. Exact-input
crafting collisions are review candidates, not automatic deletion instructions.

## World evidence

[`scripts/world.py`](../../../web/scripts/world.py) performs an exact region-header census
and deterministic random chunk sampling within each populated Overworld region.
Estimates weight each sample by that region's populated chunk count. It records
block counts, ore height distributions, land-column fractions, read errors and
files that changed during the survey. The seed and player records are not exported.

Bounds are nonempty region envelopes. Approximate confidence intervals can miss
rare clustered ore; sampled zero is not proof of absence. Builds and structures
can contribute to observed blocks. Island connectivity, precise flight routes and
new-generation probabilities cannot be inferred from these samples. Existing
chunks can reflect older generation settings. The survey remains a separate dated
snapshot and is not rerun by normal content refreshes.

## Browser projection

[`scripts/compile.mjs`](../../../web/scripts/compile.mjs) joins the evidence and authored
domains, applies recipe scenarios, builds acquisition edges, and writes the browser
projection. [`src/lib/acquisition.mjs`](../../../web/src/lib/acquisition.mjs) owns route
adapters; [`src/lib/graph.mjs`](../../../web/src/lib/graph.mjs) owns reachability and layout.

`catalog.json` holds the grid and summary counts. Item details are split by mod
namespace into 16 hash buckets and fetched on demand. `domains.json`, `recipes.json`,
`routes.json`, `coverage.json`, `loot.json` and `world.json` support evidence views.
Without a survey, `world.json` is `null` and no survey-derived gathering edges are
added. A malformed survey still fails compilation instead of being treated as absent.

[`src/lib/atlas.ts`](../../../web/src/lib/atlas.ts) renders only cells near the viewport,
loads details as needed and handles search, filters, hover details and canvas world
plots. [`index.astro`](../../../web/src/pages/index.astro) composes the map views;
[`atlas.css`](../../../web/src/styles/atlas.css) owns map presentation. There is no database,
account system or production application server. React islands own graph workspaces
and shared recipe cards; Astro retains page/layout composition and the existing
TypeScript controllers own the item grid and authoring pages.

## Graph projection and rendering

`src/lib/graph-views.mjs` indexes compiled routes by input and output, then builds
four focused projections: namespace relationships, machine processing, one item
route, and coverage counts. Namespace edges count each route once per directed
mod pair. Possible OR ingredients contribute to these summaries; they do not become
mandatory dependencies. Processing uses the machine IDs in authored
`progression.yml`, not inferred machinery capabilities. Coverage uses catalog statuses.

Single-route projections preserve AND input groups and OR alternatives. They show
up to four alternatives per group and twelve outputs, retaining all omitted IDs in
the underlying records. The vertical path projection reads the existing detail
bucket's finite solver witness, looks up full route records, and displays at most
its last 80 steps. Only the chosen alternative is drawn per group; all alternatives
remain inspectable. Missing records and omitted steps are counted. Scenarios remain
labeled. These views do not run another
reachability solver, change acquisition semantics or lay out the entire dependency
graph. Catalog, routes and indexes remain in browser memory.

`components/graph/GraphWorkbench.tsx` owns full-graph controls and state;
`RoutePreview.tsx` embeds the same canvas in item details. `atlas-graph.ts` bridges
navigation from the retained page controller; `route-preview.tsx` mounts and
unmounts the embedded React root. `route-data.ts` caches compiled records with
explicit invalidation. Recipe interpretation and graph projections remain independent
of React; changing the renderer does not run a second progression solver.

`GraphCanvas.tsx` uses React Flow custom nodes with clickable item slots, recipe
cards and expandable evidence. The existing vertical layout is expanded for
380×440 recipe nodes and 190×86 item/source nodes. `graph-scene.mjs` indexes centers
in 512-unit bins and queries a viewport plus a 300-unit margin. At most 400 normal
nodes are mounted, plus an already focused node when needed to preserve focus.
Large scenes aggregate at zoom below 0.35; recipe details appear at zoom 0.55 or
when focused. Edges require both endpoints and remain capped at 3,000. Omitted
records stay available through selectors and source records. This is rendering
virtualization, not streaming storage or a complete production-planning graph.

Recipe disclosure state lives outside culled nodes. Full-graph tabs retain cameras
and selection; item-detail route state survives Back navigation while its detail
record remains cached. A new snapshot can replace these records. Nodes and edges
cannot be moved, connected or deleted as authored data through this view.

`minimap.ts` supplies cached point overviews and pointer/keyboard navigation.
Minimaps sit outside the canvases. The item grid retains native scrolling, visible
cell rendering and independent axis scaling; graph minimaps preserve proportions.

## Recipe presentation

`src/lib/recipe-view.mjs` owns pure layout adapters;
`components/recipes/RecipeCard.tsx` owns shared slots and interactive rendering.
`recipe-mount.tsx` gives retained HTML lists explicit ownership of React recipe
roots. Item details, Evidence and graph nodes/selection use the same component;
`src/styles/recipes.css` owns its styling. Layout uses `recipe.json.type`, since the registry
recipe type may describe a broader category. Shaped slots follow pattern symbols
and key insertion order; exported ingredient groups supply resolved tag choices.
Appended machine/capability groups are operating requirements, not consumed slots.
Quantities, fluid amounts, components, probabilities and conditions remain attached
to their source JSON. Source records are always available.

Adapters cover crafting, mechanical crafting, cooking, stonecutting, smithing
transforms/trims and common Create processing. Unsupported types, including sequenced
assembly's weighted outcomes, get a source fallback rather than guessed GUI logic.
Cards cap visual slots, outputs and expanded alternatives, with explicit omissions.
All labels/records are HTML-escaped and icons accept only generated local PNG paths.
No additional Java exporter or execution of mod UI code is involved.

Slots are fixed 48-pixel squares. Tag names, alternative lists and component data
live outside the grid; badges link to those records without changing slot geometry.
Container queries switch the entire input/arrow/output layout together. This is
presentation responsive to the panel width, not a change to recipe shape.

Minecraft 1.21.1's `SmithingTrimRecipe.assemble` copies the supplied base stack and
sets its trim component; `getResultItem` returns a sample iron chestplate. The
acquisition adapter excludes that sample from producing edges, retains all input
uses and avoids duplicating the smithing workstation. The visual adapter labels
the result as a modified base, without claiming to render its trim appearance.

## Inspector design

Organize around acquisition, uses and evidence rather than exposing every source
field at equal weight. Keep the current item, path and recipe in context; offer
Back for ingredient navigation and the larger graph for exploration. Use compact,
stable slots for spatial information and expandable records for text/alternatives.
Keyboard access and source evidence remain available alongside visual navigation.
These are project decisions, not a claim that the sibling sites define a formal
shared UX standard; their Astro composition and disclosure conventions are retained.

The [Minecraft Wiki slot documentation](https://minecraft.wiki/w/Template:Inventory_slot)
separates icons, counts, tooltips and alternative frames; its
[smithing template](https://minecraft.wiki/w/Template:Smithing_Table) defines three
input roles. The [FTB grid guide](https://ftb.fandom.com/wiki/Feed_The_Beast_Wiki:Crafting_grid_guide)
uses machine-specific templates and shared item/ore-dictionary cells. These support
small family adapters built from shared slots, rather than one guessed custom GUI.
[EMI](https://modrinth.com/mod/emi) also treats tag identity as useful information.
The Atlas uses explicit alternatives instead of automatically cycling icons.

The interactive graph uses [React Flow custom nodes](https://reactflow.dev/learn/customization/custom-nodes)
inside [Astro framework islands](https://docs.astro.build/en/guides/framework-components/).
Follow [React Flow performance guidance](https://reactflow.dev/learn/advanced-use/performance)
when changing node subscriptions or memoization. Keep viewport updates separate
from data indexing and preserve the named-job execution boundary.

## Page and component structure

The structure follows the sibling inherent.design site and cfgate.io examples:
Astro layouts own the document, pages compose feature components, and TypeScript
controllers own browser interactions. The existing Astro 7, TypeScript 6, pnpm,
CSS and local Node/Python tooling remain appropriate for this internal app.
The local editor uses no UI framework, database or deployment service.

- `src/layouts/Base.astro` owns document metadata, the favicon and shared CSS.
- `src/components/AppHeader.astro` owns identity and navigation structure, with
  one ordered page-link list and a snapshot-status slot. `JobStatus.astro` shares
  bounded process feedback and cancellation across local pages.
  `ViewTabs.astro` supplies separate, labeled local view controls.
- `src/components/authoring/` owns the journal and disclaimer workbenches, config
  audit and JSON editor. Both workbenches share the list/editor layout in
  `Workbench.astro`. `src/components/map/ScenarioEditor.astro` owns the YAML
  scenario editor.
- `src/components/SourceText.astro` shares source-text input markup between both
  editors. Each editor retains its own save semantics and source authority.
- `src/lib/atlas.ts` and `src/lib/authoring.ts` own their page controllers.
  `src/lib/http.ts` shares JSON requests and error handling, including valid null
  snapshots and explicit JSON writes.
- `src/styles/base.css` owns shared tokens, document controls, navigation and tables.
  Map, authoring and resource-review CSS is imported only by its owning page.
  Shared `--page-width`, radius and color tokens keep those surfaces consistent.

Keep page markup and rendering components separate from filesystem operations in
`scripts/workspace.mjs` and `scripts/authoring.mjs`. Dependencies and formatter
settings retain the app's existing conventions; framework changes are not required
to share layouts and components.

## Filesystem boundary

[`scripts/workspace.mjs`](../../../web/scripts/workspace.mjs) adds `/__atlas/` endpoints
only to the development server. Requests require loopback addresses and hosts;
writes require a matching Origin and JSON content type. Domain names are allowlisted.
Saves validate YAML shape and compare revision hashes before replacing a file.
A failed compile restores the previous authored file and attempts to rebuild it.
Compilation publishes individual files, not one atomic snapshot transaction.
`jobs.mjs` centralizes fixed Python processes; the workspace serializes entire
operations, including temporary validation and subsequent source publication.
Status/cancellation endpoints remain available while the operation lock is held.
[Setup](setup.md#named-authoring-jobs) owns job registration and execution limits.

The status endpoint compares file sizes/mtimes and the lock hash when the map
loads and after an explicit implementation refresh. This detects selected input changes, not every asset or
configuration change; it is not a live game connection. Loaded JAR content hashes
are captured separately. Refresh explicitly runs runtime capture, extraction and
compilation. World sampling is a separate operation.

Static builds retain browsing but have no filesystem editing endpoints. Exported
recipe scenarios never install themselves into a Minecraft instance.

## Journal and pack ownership

The exporter writes native quest definitions and handler checks to
`data/generated/runtime/journal.json`. This is retained verification evidence;
the UI currently indexes authored journal notes rather than a dedicated quest graph.
The pack's `authoring/journal/` owns mechanics and locale text; native Questlog JSON
is generated. The separate [pack authoring editor](authoring.md) edits that source
and inspects categorized configuration drift. Player quest progress is not read
or edited by the app.

[Journal definitions](../journal.md) owns quest conditions and authoring;
`compatibility.md` owns installed fixes; `upstream.md` owns issue research. Those
files live under the configured pack path. Keep gameplay fixes there and map
implementation details here. See [setup](setup.md) for capture commands and
[verification](verification.md) for dated results and remaining coverage gaps.

## Heat and generation evidence

`scripts/structures.py` builds `tools/structures/StructureSurvey.java` as a
temporary server mod. Controlled samples use native jigsaw generation and
placement above flat terrain, then count surviving blocks and roll native chest
loot. Natural samples use Sky Archipelago's generator and normal biome checks:
candidate starts are counted separately from fully generated bounding boxes.
Natural block counts include terrain; they must not be called foundation yields.
The runner records shielded placement failures and removes disposable servers.

`data/generated/structures.json` retains seeds, bounds, piece counts, resource
counts and input provenance. Compilation compares its fingerprint with the
runtime snapshot and its processor hash with the current source. Differences
mark it stale; the general workspace status still owns changes since runtime
capture. `StructureSurvey.astro` and `src/lib/structures.ts` render this separate
dataset even when no saved-world survey exists. Chest rolls do not verify Lootr
multiplayer entitlements, safe landings, deliveries or survival progression.

Heated processing uses `atlas:heated` and `atlas:superheated` capability nodes.
Authored routes supply them through fueled Blaze Burners or the installed
Propulsion solid burner. The latter requires coal and a basin to request heat
through its thermostat. The native exporter tests unfueled rejection and the
heated/superheated predicates after actual burner ticks. This verifies state
compatibility, not mixer operation or sustained heat delivery. Liquid-burner
fuel variants remain unverified. These routes must be reviewed if the Propulsion
heated-mixers configuration changes.

The opt-in `WorldgenProbe.java` writes `runtime/worldgen_review.json` from native
Sky Archipelago layout calls using a read-only seed/settings input. Its descriptors
are not measured island edges or crossing distances. The pack's world-generation
document owns the candidate choice and live-instance boundary. Input fingerprints
include `.properties` files so mixin configuration changes mark captures stale.

## Island generation surveys

`pnpm data:islands --terrain /path/to/terrain.json --resources /path/to/islands-42.json /path/to/islands-8675309.json`
imports the maintained Create Sky Compat native probes. Run `pnpm data:compile`
after import. This CLI reads reports, not worlds, and does not run Java or alter
the installed pack. `tools/probe.py --terrain --samples 4` and `--islands --seed N --heap 6G`
in that mod project own generation and native descriptor export.

`data/generated/islands.json` retains each input's SHA-256, mod/probe artifact
hashes, seed, descriptors and method. Density predictions before features remain
separate from observed decorated blocks and weighted estimates. The resource
probe samples one deterministic random chunk per cell in a 7×7 spatial grid
within twice the anchor descriptor radius. Each observed block is weighted by
the number of chunks in its stratum; only columns dominated by that anchor count.
Companion descriptors retain native cell membership but do not contribute to anchor estimates. Geological frames and sampled center-line void gaps are exported separately; neither descriptor radii nor those straight lines establish safe travel.
Rare features can be missed, and sampled headroom is not a global minimum.

`IslandSurvey.astro` and `islands.ts` add sampled terrain/resource tables to World & ores, using
the same table component as structure surveys. This dataset remains visible if
the saved-world survey is absent. Full block counts, reference-depth ore bins,
sampled surface biomes and timing remain available in the linked source JSON.
Timings include chunk generation and scanning on the recorded host; heap readings
are end-of-run values, not peaks or controlled performance benchmarks.

Development surveys do not automatically replace saved-world acquisition evidence.
Import new reports after changing the owning mod; artifact hashes identify the
measured versions but the Atlas does not monitor sibling source checkouts.

## Resource-pack research

The review page is independent of runtime map compilation. Authored
`data/authored/resourcepacks.yml` supplies decisions and concise review text.
`data/research/resourcepacks/catalog.json` records per-site download rankings and
listing-level screening; `projects.json` records exact selected file metadata,
SHA-512 hashes, inspected resource paths and author-gallery URLs. Rankings are
not comparable between sites and cross-site listings are not unique projects.
Neither a version tag nor a matching asset namespace establishes full support.

`src/lib/resourcepack-data.ts` joins these inputs and compares the captured lock
hash with `empack.lock`. A changed lock marks the review stale. Changes outside
the lock, such as resource order or shader settings, still need manual review.
The page uses `Base.astro`, `AppHeader.astro` and shared style tokens.
`components/resourcepacks/Candidate.astro` and `Gallery.astro` own row and image
markup; `src/lib/resourcepacks.ts` owns filters and the image dialog. External
source images load lazily; missing images retain a link to the source gallery.
No downloaded third-party artwork or archives are committed.

The archive inspector applies overlays matching resource format 34 and can
include Fusion override folders explicitly. It compares different bytes at the
same effective resource path. Models and textures can replace each other;
language keys and font providers can merge. These counts do not reproduce every
renderer, validate model references, measure frame times or certify mod coverage.
The selected file's exact version and the gallery's capture date remain separate.
