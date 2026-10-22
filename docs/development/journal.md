# Journal definitions

Questlog 3.4.1 for Minecraft 1.21.1 / NeoForge is installed locally and pinned to
Modrinth version `6ZFtauOf`. This is unreleased pack content.

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

| ID suffix | Entry | Condition |
| --- | --- | --- |
| `components/crafters` | Mechanical crafters | Have at least 3 Mechanical crafters in your inventory at once. Placed blocks and items in containers do not count. |
| `components/deployer` | Deployer | Have at least 1 Deployer in your inventory at once. Placed blocks and items in containers do not count. |
| `components/platinum` | Platinum nugget | Have at least 1 Platinum nugget in your inventory at once. Placed blocks and items in containers do not count. |
| `components/precision` | Precision mechanism | Have at least 1 Precision mechanism in your inventory at once. Placed blocks and items in containers do not count. |
| `components/tube` | Electron tube | Have at least 1 Electron tube in your inventory at once. Placed blocks and items in containers do not count. |
| `components/wheels` | Crushing wheels | Have at least 2 Crushing wheels in your inventory at once. Placed blocks and items in containers do not count. |
| `electricity/battery` | Battery | Have at least 1 Battery in your inventory at once. Placed blocks and items in containers do not count. |
| `electricity/design` | Circuit design table | Have at least 1 Circuit design table in your inventory at once. Placed blocks and items in containers do not count. |
| `electricity/ion` | Ion thruster | Have at least 1 Ion thruster in your inventory at once. Placed blocks and items in containers do not count. |
| `electricity/motor` | Electric motor | Have at least 1 Electric motor in your inventory at once. Placed blocks and items in containers do not count. |
| `electricity/rotor` | Generator induction rotor | Have at least 1 Generator induction rotor in your inventory at once. Placed blocks and items in containers do not count. |
| `electricity/use_design` | Interact with circuit design table | Right-click circuit design table. Completion checks the block interaction, not a completed circuit. |
| `electricity/wire` | Wire connectors | Have at least 2 Wire connectors in your inventory at once. Placed blocks and items in containers do not count. |
| `flight/assembler` | Physics assembler | Have at least 1 Physics assembler in your inventory at once. Placed blocks and items in containers do not count. |
| `flight/bearing` | Propeller bearing | Have at least 1 Propeller bearing in your inventory at once. Placed blocks and items in containers do not count. |
| `flight/burner` | Adjustable burner | Have at least 1 Adjustable burner in your inventory at once. Placed blocks and items in containers do not count. |
| `flight/envelopes` | Envelopes | Have at least 4 envelopes of the same color in your inventory at once. Any color qualifies; mixed colors do not combine toward the count. |
| `flight/propeller` | Propeller | Have at least 1 Andesite Propeller or 1 Wooden Propeller in your inventory. Either item completes this condition. |
| `flight/steering` | Steering wheel | Have at least 1 Steering wheel in your inventory at once. Placed blocks and items in containers do not count. |
| `fuel/liquid` | Liquid thruster | Have at least 1 Liquid thruster in your inventory at once. Placed blocks and items in containers do not count. |
| `fuel/resin` | Pine resin | Have at least 4 Pine resin in your inventory at once. Placed blocks and items in containers do not count. |
| `fuel/solid` | Solid-fuel thruster | Have at least 1 Solid-fuel thruster in your inventory at once. Placed blocks and items in containers do not count. |
| `fuel/stirling` | Stirling engine | Have at least 1 Stirling engine in your inventory at once. Placed blocks and items in containers do not count. |
| `fuel/tank` | Fluid tank | Have at least 1 Fluid tank in your inventory at once. Placed blocks and items in containers do not count. |
| `fuel/turpentine` | Turpentine bucket | Have at least 1 Turpentine bucket in your inventory at once. Placed blocks and items in containers do not count. |
| `logistics/board` | Delivery table | Have at least 1 Delivery table in your inventory at once. Placed blocks and items in containers do not count. |
| `logistics/diagram` | Contraption diagram | Have at least 1 Contraption diagram in your inventory at once. Placed blocks and items in containers do not count. |
| `logistics/dock` | Docking connectors | Have at least 2 Docking connectors in your inventory at once. Placed blocks and items in containers do not count. |
| `logistics/filter` | Filter | Have at least 1 Filter in your inventory at once. Placed blocks and items in containers do not count. |
| `logistics/funnel` | Andesite funnel | Have at least 1 Andesite funnel in your inventory at once. Placed blocks and items in containers do not count. |
| `logistics/use_board` | Interact with delivery table | Right-click delivery table. Completion checks the block interaction, not a completed delivery. |
| `machines/fan` | Encased fan | Have at least 1 Encased fan in your inventory at once. Placed blocks and items in containers do not count. |
| `machines/millstone` | Millstone | Have at least 1 Millstone in your inventory at once. Placed blocks and items in containers do not count. |
| `machines/mixer` | Mechanical mixer | Have at least 1 Mechanical mixer in your inventory at once. Placed blocks and items in containers do not count. |
| `machines/press` | Mechanical press | Have at least 1 Mechanical press in your inventory at once. Placed blocks and items in containers do not count. |
| `machines/sheets` | Iron sheets | Have at least 4 Iron sheets in your inventory at once. Placed blocks and items in containers do not count. |
| `machines/wheel` | Rotation source | Have at least 1 Water Wheel, 1 Large Water Wheel, or 1 Windmill Bearing in your inventory. Any one item completes this condition; it does not need to be placed or powered. |
| `main/alloy` | Andesite alloy | Have at least 2 Andesite alloy in your inventory at once. Placed blocks and items in containers do not count. |
| `main/brass` | Brass ingots | Have at least 2 Brass ingots in your inventory at once. Placed blocks and items in containers do not count. |
| `main/iron` | Iron ingots | Have at least 3 Iron ingots in your inventory at once. Placed blocks and items in containers do not count. |
| `main/kelp` | Kelp | Have at least 1 Kelp in your inventory at once. Placed blocks and items in containers do not count. |
| `main/quartz` | Quartz | Have at least 1 Quartz in your inventory at once. Placed blocks and items in containers do not count. |
| `main/water` | Water bucket | Have at least 1 Water bucket in your inventory at once. Placed blocks and items in containers do not count. |
| `travel/connector` | Throwable rope connector | Have at least 1 Throwable rope connector in your inventory at once. Placed blocks and items in containers do not count. |
| `travel/coupling` | Rope coupling | Have at least 1 Rope coupling in your inventory at once. Placed blocks and items in containers do not count. |
| `travel/glider` | Glider | Have at least 1 Glider in your inventory at once. Placed blocks and items in containers do not count. |
| `travel/membranes` | Phantom membranes | Have at least 2 Phantom membranes in your inventory at once. Placed blocks and items in containers do not count. |
| `travel/winch` | Rope winch | Have at least 1 Rope winch in your inventory at once. Placed blocks and items in containers do not count. |

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

The wording pass retains IDs, objective order and all condition fields. Only
objective names and main descriptions changed. Exact quantities, item names,
OR choices and interaction limits remain in the wrapping main description.

Questlog 3.4.1 uses one-line objective labels with ellipsis and hover text.
The inspected panel leaves 119 pixels for a root label and 107 for a nested
alternative without an icon. All 69 labels fit the vanilla ASCII font metrics;
the longest is 102 pixels. Compact mode changes the left list, not this budget.
Custom fonts and actual client rendering were not tested. No panel resizing or
client display settings changed.
