# Journal definitions

Questlog 3.4.1 for Minecraft 1.21.1 / NeoForge is pinned to Modrinth version
`6ZFtauOf`.

## Ownership

- `authoring/journal/chapters/` owns the eight chapters and 48 quest mechanics definitions.
- `authoring/journal/locales/` owns entry sections and short objective labels by locale.
- `overrides/common/config/questlog/` contains generated native quest and chapter JSON.
- `overrides/client/config/questlog-client.json` owns inventory access, colors and display defaults.
- `pack-fixes/assets/questlog/` owns original flat panel artwork and journal wording.
- `scripts/build-fixes.py` packages those assets with the maintained data fixes.

See [pack authoring](authoring.md) for editing, generation and locale rules.
Native JSON is generated and should not be edited directly. Quest IDs are
`questlog:<relative path without .json>`; the loader fixes the namespace to
`questlog`. Keep IDs and objective order stable after players begin tracking them.
Questlog serializes objective progress by list position, so changing an existing
objective's meaning needs an explicit migration or a new ID.

## Conditions and routing

All 48 English entries have explanatory descriptions, normally two paragraphs.
They describe the component's function, related production route and relevant
operating constraints. Full completion requirements and disclaimers remain
separate from those explanations and from short objective labels. Flavor is empty. All inventory objectives share the
inventory disclaimer, including entries with alternative items.

All entries have empty requirements. Chapters and sort order organize the routes;
they do not impose crafting order. This accepts existing equipment and avoids
losing interaction events while a prerequisite is locked. Crossings and flight
have separate chapters, and neither requires completing the other.

`item_obtain` samples current inventory every ten player ticks and records the
highest matching count. It is not a lifetime production counter. The text says
what quantity must be in the inventory simultaneously. Machine outputs use this
condition because automated Create processing is not a player crafting event.

`block_interact` matches an actual right-click event on the named block. The two
entries use the delivery table and circuit design table. They make no assertion
about GUI success, delivered cargo, circuit validity, or production throughput.

OR objectives accept any rotation-source option, either propeller style, or four
envelopes of any one color. These alternatives have separate native item checks.
No abstract flight, round-trip, docking, safety or delivery-completion objectives
are shipped. Such objectives need verified advancement criteria or dedicated
integration before they can describe those outcomes.

The journal grants no rewards, consumes no resources, changes no recipes and
keeps all unlock/completion toasts and forced popups disabled. Progress is per
player. Phantom membranes remain an early-game acquisition route; the recipe,
repair materials, insomnia and phantom spawning settings are unchanged.

## Definition index

Quantities below must be held simultaneously in inventory; placed blocks and
container contents do not count. The authored locale and chapter JSON remain
authoritative for text and mechanics.

| ID suffix | Entry | Condition |
| --- | --- | --- |
| `components/crafters` | Mechanical crafters | Inventory: 3 Mechanical crafters |
| `components/deployer` | Deployer | Inventory: 1 Deployer |
| `components/platinum` | Platinum nugget | Inventory: 1 Platinum nugget |
| `components/precision` | Precision mechanism | Inventory: 1 Precision mechanism |
| `components/tube` | Electron tube | Inventory: 1 Electron tube |
| `components/wheels` | Crushing wheels | Inventory: 2 Crushing wheels |
| `electricity/battery` | Battery | Inventory: 1 Battery |
| `electricity/design` | Circuit design table | Inventory: 1 Circuit design table |
| `electricity/ion` | Ion thruster | Inventory: 1 Ion thruster |
| `electricity/motor` | Electric motor | Inventory: 1 Electric motor |
| `electricity/rotor` | Generator induction rotor | Inventory: 1 Generator induction rotor |
| `electricity/use_design` | Interact with circuit design table | Right-click circuit design table. Completion checks the block interaction, not a completed circuit. |
| `electricity/wire` | Wire connectors | Inventory: 2 Wire connectors |
| `flight/assembler` | Physics assembler | Inventory: 1 Physics assembler |
| `flight/bearing` | Propeller bearing | Inventory: 1 Propeller bearing |
| `flight/burner` | Adjustable burner | Inventory: 1 Adjustable burner |
| `flight/envelopes` | Envelopes | Have at least 4 envelopes of the same color in your inventory at once. Any color qualifies; mixed colors do not combine toward the count. |
| `flight/propeller` | Propeller | Have at least 1 Andesite Propeller or 1 Wooden Propeller in your inventory. Either item completes this condition. |
| `flight/steering` | Steering wheel | Inventory: 1 Steering wheel |
| `fuel/liquid` | Liquid thruster | Inventory: 1 Liquid thruster |
| `fuel/resin` | Pine resin | Inventory: 4 Pine resin |
| `fuel/solid` | Solid-fuel thruster | Inventory: 1 Solid-fuel thruster |
| `fuel/stirling` | Stirling engine | Inventory: 1 Stirling engine |
| `fuel/tank` | Fluid tank | Inventory: 1 Fluid tank |
| `fuel/turpentine` | Turpentine bucket | Inventory: 1 Turpentine bucket |
| `logistics/board` | Delivery table | Inventory: 1 Delivery table |
| `logistics/diagram` | Contraption diagram | Inventory: 1 Contraption diagram |
| `logistics/dock` | Docking connectors | Inventory: 2 Docking connectors |
| `logistics/filter` | Filter | Inventory: 1 Filter |
| `logistics/funnel` | Andesite funnel | Inventory: 1 Andesite funnel |
| `logistics/use_board` | Interact with delivery table | Right-click delivery table. Completion checks the block interaction, not a completed delivery. |
| `machines/fan` | Encased fan | Inventory: 1 Encased fan |
| `machines/millstone` | Millstone | Inventory: 1 Millstone |
| `machines/mixer` | Mechanical mixer | Inventory: 1 Mechanical mixer |
| `machines/press` | Mechanical press | Inventory: 1 Mechanical press |
| `machines/sheets` | Iron sheets | Inventory: 4 Iron sheets |
| `machines/wheel` | Rotation source | Have at least 1 Water Wheel, 1 Large Water Wheel, or 1 Windmill Bearing in your inventory. Any one item completes this condition; it does not need to be placed or powered. |
| `main/alloy` | Andesite alloy | Inventory: 2 Andesite alloy |
| `main/brass` | Brass ingots | Inventory: 2 Brass ingots |
| `main/iron` | Iron ingots | Inventory: 3 Iron ingots |
| `main/kelp` | Kelp | Inventory: 1 Kelp |
| `main/quartz` | Quartz | Inventory: 1 Quartz |
| `main/water` | Water bucket | Inventory: 1 Water bucket |
| `travel/connector` | Throwable rope connector | Inventory: 1 Throwable rope connector |
| `travel/coupling` | Rope coupling | Inventory: 1 Rope coupling |
| `travel/glider` | Glider | Inventory: 1 Glider |
| `travel/membranes` | Phantom membranes | Inventory: 2 Phantom membranes |
| `travel/winch` | Rope winch | Inventory: 1 Rope winch |

## Implementation evidence

Reviewed upstream source revision
`9d5bcda0c36c2d9901cd3c5974d53044e09a4d14` and exercised the shipped 3.4.1 JAR.
Relevant classes are `core/DefinitionUtil`, `core/quests/Quest`,
`objectives/item/ItemObtainObjective`, `objectives/block/BlockInteractObjective`,
`objectives/logic/OrObjective`, `config/QuestlogConfig`, and `client/gui/QuestlogGuiSet`.

The Atlas disposable-server exporter calls the native definition constructors and
objective handlers. It rejects unknown items/blocks and missing chapters, checks
wrong inputs and insufficient inventory counts, then matching inputs and NBT
restoration. Network sends are suppressed only on its synthetic test manager.
This verifies condition logic, not a real client's input events or GUI rendering.
Evidence is retained in the Atlas `data/generated/runtime/journal.json` and its
snapshot hashes. Player saves are never mounted in that server.

- [Questlog source](https://github.com/infernalstudios/Questlog/tree/9d5bcda0c36c2d9901cd3c5974d53044e09a4d14)
- [Quest definitions](https://moddedmc.wiki/en/project/questlog/latest/docs/questlog/quest_definition)
- [Objective types](https://moddedmc.wiki/en/project/questlog/latest/docs/questlog/objective_types)
- [Player access](../players/journal.md)
- [Compatibility and verification](compatibility.md)

## Label fit

Keep short objective labels separate from the wrapping main description. Put
exact quantities, item names, OR choices and interaction limits in that description.

Questlog 3.4.1 uses one-line objective labels with ellipsis and hover text.
The inspected panel leaves 119 pixels for a root label and 107 for a nested
alternative without an icon. All 69 labels fit the vanilla ASCII font metrics;
the longest is 102 pixels. Compact mode changes the left list, not this budget.
Custom fonts and actual client rendering were not tested by the font-metric check.
