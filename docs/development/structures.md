# Structures

## Placement and compatibility

The source includes [Sky Villages 1.0.6 for NeoForge](https://modrinth.com/mod/sky-villages/version/3InSHTOp)
with Minecraft 1.21.1, NeoForge 21.1.264 and Architectury 13.0.11. This is not
Create: Sky Village. Automated Logistics remains deferred to future Skyweave.
Sky Villages uses datapack resources rather than a generated TOML. Maintained
resources live in `pack-fixes/data/skyvillages`; the structures audit register
owns their hashes and purpose. Build with `python3 scripts/build-fixes.py`.

| Control | Current choice |
| --- | --- |
| Height | Uniform absolute start Y 160–224; no heightmap projection or terrain adaptation |
| Layout | Upstream jigsaw depth 7 and maximum distance 128 blocks |
| Distribution | Upstream spacing 70 and separation 65 chunks; salt 23734816 |
| Biomes | Ocean, river, jungle and forest tags, plus dark forest |
| Pools | Installed templates and explicit empty entries only |
| Village discovery | Include `skyvillages:skyvillage` in `#minecraft:village` |
| Jukeboxes | Keep blocks; clear generated record NBT and reset `has_record` |
| Foundation minerals | One ordered pass: 0.025% diamond ore, 0.15% emerald ore, 20% diorite overall |
| Crops and chest loot | Upstream defaults |

The height override avoids adding 150 blocks to already high island surfaces.
It does not guarantee clearance from terrain. Removing 63 absent optional
compatibility-template references prevents selections that cannot resolve.
Revisit those pools when adding related content. Clearing generated jukebox
records avoids the reproduced null-level failure during structure placement;
player-inserted records are unaffected. No third-party NBT templates are copied.

Sky Archipelago classifies `skyvillage` as `SKY` before its village-name rule.
Village-tag membership supports Delivery Quests lookup without changing that
classification. Ocean biomes are eligible even though terrain islands over ocean
biomes are disabled. Eligibility alone does not establish that a usable village
will appear in an ocean void; structure placement rules still apply.

## Resources, crops and loot

Foundation stone now uses one ordered rule processor: diamond first, emerald
second, diorite third. The probabilities for later rules account for earlier
matches: `0.00025`, `0.0015 / 0.99975`, and `0.2 / 0.99825`. These are nominal
aggregate shares, not guaranteed quotas per building or village.

The original separate processors reused position-seeded random rolls. The first
20% diorite pass masked every later 0.5% diamond candidate, while approximately
4% of foundation stone became emerald ore. Native positive-control sampling
confirmed the masked diamond rule. The combined pass fixes that defect while
reducing mineral quantities enough that a settlement is not primarily an ore bank.

The 2026-10-22 survey placed 24 complete villages across seeds 1, 42, 8675309 and
20261023 above flat terrain, excluding natural ore. Native piece selection,
processors and overlapping placement remained active. Villages had 30–83 pieces
and bounds within Y 153–278.

| Resource per village | Range | Median | Total across 24 |
| --- | --- | --- | --- |
| Foundation diamond ore | 0–5 | 2 | 51 |
| Foundation emerald ore | 5–33 | 17 | 397 |
| Chest diamonds | 0–3 | 0 | 17 |
| Chest emeralds | 0–7 | 1 | 28 |

The 361 chest rolls are one no-player sample, not guaranteed seeded yields or
multiplayer Lootr entitlements. Ore counts are blocks before Fortune or processing.
A median foundation yields roughly one light delivery's 15–20 emerald reward
before Fortune, with excavation and a finite supply. This is a balance judgment,
not a measured comparison of mining and transport time. Keep these rates for
playtesting; do not increase delivery payouts to compete with the old foundations.

All 24 villages retained wheat, carrots, potatoes and beetroot. The crop rules
remain unchanged: nominal aggregate replacement shares are 30% carrots, 14%
potatoes and 5.6% beetroot, leaving 50.4% wheat among processed wheat blocks.
Whole-village crops also depend on template contents and placement; those rule
shares are not predictions of the final harvest mix.

Eleven chest tables delegate to vanilla village loot; the twelfth is an optional
Supplementaries urn table whose registration does not establish accessibility.
Template names do not reliably predict chest contents: both libraries, the
alchemist and one farm use weaponsmith loot alongside the two weaponsmiths.
That table can supply diamonds, obsidian, iron equipment and other valuable loot.
Chest loot remains a separate diamond route from the scarce foundation deposits.
Lootr behavior and per-player loot multiplication still need a gameplay check.

Useful salvage is already broader than chest loot: one library contains 43
bookshelves, the alchemist has a Brewing Stand, a smithy has three lava blocks,
and the mason template includes a spruce sapling. That sapling can start renewable
resin production; it is not necessary to find a natural taiga first if this
building is present and reachable. None of these templates is guaranteed per village.

## Tuning candidates

These are proposals; chest loot, biomes and spacing remain unchanged.

- Give libraries and farms appropriate loot through per-template processor
  assignments. A global weaponsmith-table edit would also affect real smithies.
  Preserve useful salvage; review it as a supply route, not just decoration.
- Consider 70/35 spacing/separation instead of 70/65. The current random-spread
  layout chooses offsets in only five chunks per 70-chunk cell: a 64-block span
  around an approximately 1,120-block grid. The proposal widens the offset span
  to 544 blocks while retaining one candidate per cell. It changes clustering and
  nearest-neighbor distances, not the candidate count; biome rejection still matters.
- Consider adding the taiga biome tag, giving spruce/fuel exploration and villages
  a shared destination. Do not enable every biome merely to fill delivery boards.
- Test usable pickup/dropoff positions in naturally placed villages before widening
  delivery search ranges. A structure lookup does not prove a safe landing site.

## Verification scope

The pinned JAR SHA-256 is
`5ef7b63c6f1999a632085975afa14f00146369c142fd72980d760cbb617dd52f`.
The 2026-10-22 isolated checks loaded 20 templates, resolved all 21 remaining pool
references, registered 12 loot tables and confirmed village-tag membership.
The repeatable survey uses `pnpm data:structures` followed by `pnpm data:compile`
from `web/`. World & ores shows per-village resource counts, natural-start counts,
provenance and limitations. Disposable worlds and logs are removed automatically;
the compact generated dataset remains local Atlas data.

Natural testing used the same four public seeds, CONSISTENT 1,494-block cluster
distance and the unchanged 70/65-chunk village distribution. Across a five-by-five
candidate-cell grid around the origin for each seed, valid starts numbered
19, 19, 16 and 20: **74 of 100 candidates**. Two valid starts per seed were fully
generated; all eight contained village beds and completed without shielded
structure-placement failures. This establishes placement in the sampled worlds,
not safe landings, universal biome coverage or a completed cargo delivery. The
remaining 66 valid starts were inspected at structure-start stage only.

Controlled placements bypass biome eligibility and natural terrain. Natural
bounding-box resource counts include island terrain and must not be reported as
foundation yields. No survival playthrough or multiplayer Lootr test was performed.

These integration and resource changes ship in 0.1.8. Updating an installation
preserves its world unless the operator explicitly requests a reset.
Existing chunks are not retrofitted. Structures Arise and broader structure tuning
remain a separate pass. See [progression](progression.md) for the connected fuel,
processing, trade and travel decisions.
