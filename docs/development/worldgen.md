# World generation

New worlds use **Create Sky Islands**, preset `create_sky_compat:islands_v1`, from
[Create Sky Compat 0.2.0](https://github.com/mannie-exe/create-sky-compat).
It extends Sky Archipelago 1.3.6 and replaces Sky Village Neighbors. The mod is
required on client and server. Its optional village, physics and delivery hooks
activate only with their supported dependencies; the minimum installation needs
Minecraft, NeoForge and Sky Archipelago.

## Terrain

The preset uses Y=-128 through 767, a fixed 1600-block anchor grid with bounded
180-block jitter, and a restricted center band of Y=470 to 490. Anchors have deep
bodies; companion dimensions and orbits have independent controls. Across four
native layout seeds, mean nearest-anchor distance was 1505 to 1588 blocks. Mean
sampled anchor height was 303 to 343 blocks, interior thickness 230 to 266 blocks,
and the lowest sampled construction clearance was 233 blocks. These are density
predictions before decoration, not complete generated island inventories.

### Geology and features

The preset maps the vanilla reference range `[-64, 320)` into each anchor's
geological frame. Native height providers, vein geometry, replacement rules,
exposure rules and initial attempt counts remain authoritative. Companions inherit
their cluster's frame; thin terrain does not receive a compressed complete ore
column. Out-of-range samples are rejected instead of piled up at a boundary.
Stone/deepslate, classic cave carving, selected underground features and cave
biomes follow the same frame. This does not restore vanilla noise caves, aquifers
or large noise veins.

The adapters cover vanilla ores and geological patches, Create zinc and striated
Overworld deposits, and Propulsion platinum. Nether/End generation is unchanged.
Temperature uses a separate altitude datum so temperate islands do not become
snowy solely because they moved upward; cold biomes retain cold behavior. Portal
cold classification is scoped separately. The owning mod's development documents
list feature coverage and the exact dependency coupling.

Distributed generated samples across six anchors on seeds 42 and 8675309 found
zinc, iron, copper, coal, redstone, andesite and logs on every sampled anchor. Each anchor used one
chunk per spatial stratum in a 7×7 grid. These are sparse observed samples with
separate area-weighted estimates; an unobserved rare ore is not proven absent.
The prior dense interior checks found both diamonds and platinum. No recipe or
progression changes were made to compensate for the former thin terrain.

### Villages and atmosphere

Each anchor draws a village allowance of zero through three with weights
`96:24:8:3`. Zero is common and three is rare. Sites remain beside terrain with
full-footprint clearance; biome and layout rejection can reduce the count.
Companions have no separate allowance. This replaces the old neighbor dependency, never runs alongside it, and applies
to new starts only.

The optional ADQ integration handles ADQ 1.1.1 locate points beside void. After its native
surface check fails, a bounded retry inside that Sky Village can find nearby dry
ground without relaxing the original safety predicate. Both fully generated
sample villages passed with the patch and retained their results after reopening.
It also retains the structure route's chunk tickets through finalization and uses
horizontal distance so inconsistent locator heights cannot admit a one-block job.
A native offer between distinct settlements was generated and accepted with
ticket cleanup; its cargo spawned and was picked up before cancellation. Full
cargo transport and successful delivery remain unverified.

A scoped native Sable data record sets pressure to 1.0 at Y=508, 0.8 at 600,
0.5 at 680 and zero at the exclusive ceiling of 768. Gravity and drag settings
are unchanged. A connected, glued balloon with a loaded chest assembled through
the native lever, ascended, settled, survived saving/reopening, descended with a
lower gas allowance, and completed an outward/return cargo crossing of roughly
1.5 km each way using reversible propeller power. This is one
creative fixture, not a survival fuel/cargo balance test or wing-borne flight test.
The shader client received the correct height/pressure data and rendered rain.
Snow also rendered in a cold biome at Y=597 with shaders enabled and disabled.

### Authoring, evidence and updates

The mod owns generation parameters, deterministic geography, geological adapters,
climate, pressure data and village policy. Its `GenerationGuard` records the exact
generation identity and rejects changed or unmarked existing terrain. There is
no automatic conversion. Never delete the marker to force a mismatched world open.

The Atlas **World & ores** view keeps the saved-world survey separate from imported
isolated development surveys. Native descriptor/density predictions and generated-block
samples have independent artifact hashes, methods and limits. See
[web data](web/data.md#island-generation-surveys) for import and regeneration.

`create-sky-compat/docs/development/terrain.md` owns the implementation contract;
`verification.md` in that project owns exact commands, tested hashes and observations.
[Build maintenance](build.md#terrain-and-rendering-mods) owns publication and pack
placement. Normal updates preserve existing worlds and LODs. A deliberate world
replacement requires a complete stopped-world backup and a fresh generation path.

Remaining gameplay checks include wing-borne flight, survival power/control
arrangements, mining access and time, and village deliveries.
The measured results support the sampled resource paths and basic flight;
they do not prove every seed or aircraft design is playable.

## Ordinary Sky Archipelago worlds

The retained upstream TOML and `eee` preset use CONSISTENT spacing 1494. These
settings preserve the ordinary preset used before 0.1.12; they do not set the new
preset's embedded anchor geometry. Keep them with existing ordinary worlds.

Sky Archipelago 1.3.6 DYNAMIC chooses one spacing for the whole world from the
layout seed, not a new distance per cluster. The old 32 to 1500 range produced
33 to 1465 across 64 inspected seeds. Fixing 1494 retained the original comparison
seed's scale without that cross-seed density lottery. Shapes, biome eligibility
and companions still varied. A cell spacing never guarantees an edge gap.

The old native comparison matched 16 descriptors and 81 column profiles between
DYNAMIC and CONSISTENT on that comparison seed, without changing `level.dat`.
It was a layout comparison, not proof of equal ores, structures or safe travel.
The Atlas's previous-world survey remains a dated baseline until the replacement
world has a safe, complete survey.

## Biome compatibility and updates

Zfastnoise's biome optimization and Sky Archipelago's Deep Dark projection both
redirect biome filling. Keep `mixin.perf.biome=false` in
`zfastnoise.mixin.properties`; `mixin.perf.noise=true` remains enabled. Configured
boots no longer report that redirect collision. Compat's cave-biome and climate
checks are scoped to its preset and do not prove ancient-city availability.

Distributed server templates leave the seed blank. Compare disposable worlds
with the same seed, exact artifacts and resolved settings; sample other seeds
before claiming reliable spawn access. Keep generation identity, sampled blocks,
layout predictions and gameplay observations distinct. Never reuse old chunks
under the new preset or delete an identity marker to force a world open.
