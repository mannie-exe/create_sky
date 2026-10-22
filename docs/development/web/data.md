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

| Location                          | Authority and editing                                                           |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `data/authored/acquisition.yml`   | Environment gates, gathering, farming, special interactions and classifications |
| `data/authored/items.yml`         | Item notes, overlap opportunities, unresolved decisions                         |
| `data/authored/recipes.yml`       | Full recipe replacements or disable operations; scenario until tested           |
| `data/authored/interactions.yml`  | Reviewed mechanics and explicitly assumed gathering routes                      |
| `data/authored/mobs.yml`          | Mob behavior, Hostile Skies architecture and settings                           |
| `data/authored/progression.yml`   | Gathering roots, machine requirements and graph assumptions                     |
| `data/authored/worldgen.yml`      | Geography interpretation and generation decisions                               |
| `data/authored/configuration.yml` | Design constraints, coverage limits and operational findings                    |
| `data/generated/runtime/`         | Exact registered game evidence; never hand-edit                                 |
| `data/generated/world.json`       | Read-only Anvil survey and sampling method                                      |
| `data/generated/documents.json`   | All discovered JAR resource versions and provenance                             |
| `public/generated/`               | Rebuildable browser projection and extracted game textures                      |
| `tools/exporter/`                 | Java 21 NeoForge development exporter, never installed in play instances        |

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
[`atlas.css`](../../../web/src/styles/atlas.css) owns shared and map presentation. There is no database,
account system, React runtime or production application server.

## Page and component structure

The structure follows the sibling inherent.design site and cfgate.io examples:
Astro layouts own the document, pages compose feature components, and TypeScript
controllers own browser interactions. The existing Astro 7, TypeScript 6, pnpm,
CSS and local Node/Python tooling remain appropriate for this internal app.
The review did not introduce a UI framework, public-site metadata, or a deployment
service into the local editing path.

- `src/layouts/Base.astro` owns document metadata, the favicon and shared CSS.
- `src/components/AppHeader.astro` owns identity and navigation structure, with
  slots for each page's controls and snapshot status.
- `src/components/authoring/` owns the journal and disclaimer workbenches, config
  audit and JSON editor. Both workbenches share the list/editor layout in
  `Workbench.astro`. `src/components/map/ScenarioEditor.astro` owns the YAML
  scenario editor.
- `src/components/SourceText.astro` shares source-text input markup between both
  editors. Each editor retains its own save semantics and source authority.
- `src/lib/atlas.ts` and `src/lib/authoring.ts` own their page controllers.
  `src/lib/http.ts` shares JSON requests and error handling, including valid null
  snapshots and explicit JSON writes.
- `src/styles/authoring.css` owns styles scoped beneath `.authoring`. Header
  navigation rules are scoped to `.topbar` so entry-list navigation stays vertical.

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

The status endpoint compares file sizes/mtimes and the lock hash every 30 seconds
while the app is open. This detects selected input changes, not every asset or
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
