# Progression review

This review concerns the unreleased working tree after 0.1.5. The Atlas combines
registered recipes and loot with authored environmental assumptions. A mapped
route establishes potential acquisition, not starting-island availability,
affordable quantities, operating power or safe travel.

## Journal

All 48 entries retain their IDs, objective order and detectable conditions.
Short objective labels identify the item or action; the main description states
the full quantity and condition. Inventory objectives require the count at once,
not cumulative crafting or possession of placed machines. The two interaction
entries check a right-click, not a completed delivery or functioning circuit.

The 69 displayed objective labels fit the inspected default-font text budgets.
All 66 leaf branches pass native negative/positive checks and progress restoration.
No quest target is unresolved in the current map. This does not test the actual
client's GUI or prove every item can be reached from a particular spawn.

## Routes and remaining checks

| Route | Finding | Next useful check |
| --- | --- | --- |
| Gliding | Two phantom membranes remain a normal insomnia/combat route; no artificial Nether gate or replacement recipe is needed. | Test a return route as well as the first downhill crossing. |
| Ropes | Rope couplings are simple; throwable connectors also depend on processed iron and machinery. | Confirm that the early crossing plan uses equipment players can actually produce. |
| Heat and brass | The old map incorrectly required a Blaze Burner for all heated processing. The installed coal-fired solid burner below a basin reaches heated and superheated states, verified through native ticks and Create's predicate. | Test a fueled burner under a working basin/mixer before treating a graph route as production proof. |
| Flight | Adjustable burners and solid-fuel thrusters have distinct material routes; an inventory checklist does not verify a controllable aircraft. | Assemble, fuel, steer, land and return with an actual craft. |
| Liquid fuel | Pine resin comes from crushing spruce logs, then turpentine needs heated mixing with water. | Confirm spruce access, crushing-wheel production and sustained fuel output. |
| Platinum | Gold washing has a 5% nugget route; new platinum ore is an alternative. | Measure useful yield before changing scarcity. Regeneration is not required just to obtain platinum. |
| Deliveries | Village mode requires real villages. The configured 500 to 2000 delivery distance and 1000 minimum player search radius may leave sparse areas without offers. | Find two reachable villages and complete a delivery. An empty board is a risk, not yet a reproduced defect. |
| Hostile Skies | Automatic raids remain disabled. Captain orders therefore lack a normal enabled encounter route; no journal entry requires them. | Design deliberate encounters separately; do not enable random raids to improve a coverage number. |

The current spawn is high relative to several nearby island descriptors. This
makes loss of altitude and return travel more relevant than horizontal distance
alone. The preview does not establish actual landing surfaces or glider range.

In a restricted map scenario without exploration, villages, new terrain, Nether
or End access edges, gliding, brass and propeller bearings remain reachable through
survey-backed resource assumptions. Quartz still blocks the normal electron-tube,
mechanical-crafter and crushing-wheel bootstrap in that scenario. Consequently,
platinum washing and turpentine remain later processes even with early brass.
This is a graph finding; it does not assert every source interaction is modeled.
The three-crafter journal checkpoint records one crafting batch, not the complete
crafter arrangement needed to produce crushing wheels.

## Overlaps

Seven exact-input recipe collision groups were identified. Three yield identical
outputs. Four preserve selectable alternatives: copycat step/stair conversions,
vault conversion, and brass-sheet uses. Polymorph is installed. No recipes were
deleted merely because inputs overlap; verify selection in the actual crafting
UI and any intended automation before consolidating them.

Coal-fired superheat is a meaningful balance overlap: if confirmed in a working
mixer, it reduces the special role of blaze cakes as well as blaze capture. The
native heat predicate accepts it, but sustained production was not tested. Keep
this visible for play review rather than adding a new recipe gate. The existing
"Burners power heated mixers" switch covers burner participation; the separate
superheat switch in this config concerns steam engines, not a dedicated basin
superheat policy. Upstream also treats pre-Nether brass as a pack balance choice
([Propulsion #92](https://github.com/Propulsion-Team/create-propulsion-simulated/issues/92)).

The journal intentionally has no mandatory chapter gates, item rewards or
abstract flight/delivery-completion claims. A solid-burner introduction could be
useful now that the heat route is explicit. Adding one is a content decision,
not required to repair the current labels. Flywheel tuning and structure
generation remain separate work; neither was silently made a prerequisite.

## Release boundary

Automated checks support the candidate for a new random-seed generation review. They
do not establish a complete survival playthrough or general seed viability.
The remaining hands-on checks above should determine whether the candidate is
ready to publish. The old world is archived and the active world path is clear. No replacement
world was launched and no release was published.

See [world generation](worldgen.md), [journal definitions](journal.md), and the
Atlas `docs/development/verification.md` for configuration and check evidence.
