# World generation

New worlds use **Create Sky Islands**, preset `create_sky_compat:islands_v1`, from
[Create Sky Compat](https://github.com/mannie-exe/create-sky-compat). The manifest
pins the installed mod version. Compat extends Sky Archipelago 1.3.6 and is
required on both client and server. Ordinary Sky Archipelago presets retain
upstream generation with the village-neighbor filter.

## Terrain

The authored profile is `overrides/common/config/create_sky_compat-generation.json`.

| Control | Pack setting | Meaning |
| --- | --- | --- |
| Build range | Y=-128 through 767 | Includes terrain and building space |
| Cluster grid | 2400 blocks, jitter 90 | Cell spacing and bounded center displacement |
| Activation | 0.85 | Cluster activation before biome rejection |
| Anchor center | Y=200 to 490 | Intersected with the safe band for the selected body |
| Anchor height target | 250 to 400 blocks | Realized height varies with relief and erosion |
| Anchor radius | 270 to 370 blocks | Descriptor radius, not an exact shoreline |
| Companion radius/orbit | 40 to 110 / 470 to 680 blocks | Relative to the host anchor |
| Companion vertical offset | -60 to +50 blocks | Adjusted to fit the dimension |
| Floor/building clearance | 32 / 200 blocks | Reserved inside the build range |
| Minimum cluster gap | 350 blocks | Complete terrain-density supports, not structures |

The default shape bound gives a mathematical support gap of 354 blocks. This is
not a guaranteed travel distance: shores, companions, biome exclusions and missing
clusters affect the actual crossing. The tallest target requires an anchor center
of at least Y=268. Curved undersides avoid the upstream density discontinuity.
The fresh-world fallback checks generated support and headroom before setting spawn;
it does not relocate existing worlds or create a platform.

### Geology and features

Ores, selected underground features, deepslate, classic carvers and cave biomes
use an anchor-relative geological frame. Reference Y=-64 maps to its geological
bottom and Y=64 to its surface datum. Higher reference positions retain their
vertical offset above that datum. Companions share the frame, so thin islands do
not receive a complete compressed ore column.

Native vein shapes, replacement rules, exposure checks and initial attempt counts
remain authoritative. Coverage includes vanilla Overworld ores, Create zinc and
striated deposits, and Propulsion platinum. Nether/End generation is unchanged.
This does not restore vanilla noise caves, aquifers or large noise veins.
Temperature queries use reference Y=64 so biome climate is independent of island
altitude. Cold biomes remain cold; altitude cooling above mountains is absent.

The mod's [terrain reference](https://github.com/mannie-exe/create-sky-compat/blob/main/docs/development/terrain.md)
owns feature coverage and implementation. Its
[configuration reference](https://github.com/mannie-exe/create-sky-compat/blob/main/docs/configuration.md)
owns geometry validation. Pack configuration above owns the selected values.

### Villages and atmosphere

Each anchor draws a village allowance of zero to three, weighted `96:24:8:3`.
Companions share it. Biome, layout and clearance rejection can reduce actual
counts. Villages float beside terrain, with their height relative to the host
surface datum. [Structures](structures.md) owns pack loot, crop and salvage policy.

Aeronautics Delivery Quests uses a 500-block horizontal route minimum, a
6000-block destination-search offset limit and a 120-minute time limit. The
locator can resolve farther away; the search offset is not a final route cap.
Compat retains endpoint chunk tickets until finalization and retries rejected
Sky Village landings within their bounds using ADQ's original safety predicate.

The Sable integration sets pressure to 1.0 at Y=508, 0.8 at 600, 0.5 at 680 and
zero at the exclusive ceiling of 768. Gravity and drag retain Sable defaults.
Pressure follows world altitude, not each island's local surface.

### Evidence and limits

Compat 0.4.0's recorded samples cover six anchors across seeds 42 and 8675309.
Each used one chunk per stratum in a 7-by-7 grid. All contained zinc, iron, copper,
coal, redstone, andesite, diamond and platinum. No emerald was observed; sparse
samples cannot establish absence. Observed blocks and area-weighted estimates
are separate, and neither proves mining access or survival scarcity.

Earlier creative flight checks demonstrated a glued cargo balloon, save/reopen
and an outward/return crossing of roughly 1.5 km each way. Those are historical
checks on the earlier terrain version, not current-grid fuel budgets or wing-borne
flight evidence. Delivery endpoint checks do not establish completed deliveries.
Exact versions, hashes, samples and limits belong in the mod's
[verification record](https://github.com/mannie-exe/create-sky-compat/blob/main/docs/development/verification.md).

The Atlas keeps saved-world surveys separate from imported isolated surveys.
[World data](web/data.md#island-generation-surveys) describes provenance and import.
Remaining play checks include cave access, mining time, flight budgets, survival
controls and delivery completion. No recipe changes compensate for thin terrain.

## Ordinary Sky Archipelago worlds

The retained TOML and `eee` preset use CONSISTENT spacing 1494. They preserve the
ordinary preset used before 0.1.12 and do not control Compat's expanded geometry.
Keep those settings with existing ordinary worlds.

Sky Archipelago 1.3.6 DYNAMIC selects one spacing for the whole world from its
layout seed. It does not vary spacing independently between clusters. The former
32 to 1500 range yielded 33 to 1465 across 64 inspected seeds. CONSISTENT 1494
retained the comparison seed's scale without that cross-seed density variation.
Shapes, biome eligibility and companions still vary; cell spacing is not edge gap.
The comparison matched 16 descriptors and 81 column profiles for that seed, not
ore inventories, structures or safe routes.

## Biome compatibility and updates

Keep `mixin.perf.biome=false` in `zfastnoise.mixin.properties`: Zfastnoise's biome
optimization conflicts with Sky Archipelago's Deep Dark projection redirect.
`mixin.perf.noise=true` remains enabled. The configured boots no longer reported
the collision; that does not establish ancient-city availability.

Compat records generation identity in each expanded-preset world and rejects
incompatible changes or unmarked existing terrain. Preserve the original mod,
configuration and marker with a save. Never delete the marker to force adoption
of incompatible chunks. New geometry requires a separate new world.

Distributed server templates leave the seed blank. Compare disposable worlds
with identical seeds, artifacts and resolved settings, then sample other seeds
before generalizing. [Patch maintenance](patches.md) covers dependency review;
[server maintenance](../players/server.md) covers backups and updates.

## Same-seed world replacement and LODs

DH 3.3.3 sends a seed-derived level key when `server.levelKeyPrefix` is blank.
Different terrain regenerated with the same seed can reuse a client's old LOD key.
For a deliberate world replacement, set a unique new `levelKeyPrefix` in that
server's local DH config before launch. Keep `sendLevelKeys=true`; do not distribute
one fixed prefix to unrelated servers. Clients then select separate caches while
retaining previous files. Ordinary updates preserving terrain should preserve the key.
