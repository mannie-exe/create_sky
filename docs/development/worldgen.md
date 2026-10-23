# World generation

Create Sky 0.1.6 uses Sky Archipelago 1.3.6 with `CONSISTENT` cluster
spacing of **1494**. Both the common TOML and `eee` preset carry this value;
minimum and maximum spacing are also 1494 to avoid an accidental mode change
restoring the old range. Other island settings are unchanged.

## Why fixed spacing

In the installed implementation, `DYNAMIC` chooses one spacing for the entire
world from the layout seed. It does not choose a new distance for each cluster.
`IslandField.effectiveClusterSpacing` computes:

```text
min + floorMod(layoutSeed XOR -7046029254386353131, max - min + 1)
```

The former range was 32 to 1500. Native calls for seeds 0 through 63 produced
values from 33 to 1465. This makes world-scale density vary substantially between
seeds, beyond the intended variation in island locations and shapes. The config
comment describes this behavior correctly; this is a pack-policy mismatch, not
a demonstrated random-number bug.

The playing world's seed resolves to **1494**. Fixing that value preserves its
spacing scale while removing the cross-seed spacing lottery. Returning to the
stock value of 96 would be a major density change, not a conservative default.
Island occupancy, biome exclusions, jitter, companion islands, height and shape
still vary. A 1494 cell scale is not a guaranteed edge-to-edge flight distance.

## Native comparison

The Atlas `pnpm data:runtime --worldgen` probe reads `level.dat` without mounting
the world, decodes its generator and calls the installed native layout methods.
The saved generator embeds stock settings, which select current `COMMON` config
at runtime. Reading the embedded value of 96 alone would give the wrong answer.

For the current seed, original DYNAMIC and candidate CONSISTENT produced identical
16 island descriptors within the 2048-block preview query and identical 81 sampled
column profiles. All 64 comparison seeds used 1494 in CONSISTENT mode. The probe
verified that `level.dat` bytes did not change. Its receipt is
`web/data/generated/runtime/worldgen_review.json`.

These are layout comparisons, not a regenerated chunk survey. Preview radii and
horizontal bounds are generator descriptors, not measured traversable terrain.
The comparison does not establish equal structures, ore yields or safe crossings.

## Biome compatibility

Zfastnoise's biome optimization and Sky Archipelago's Deep Dark projection both
redirect `NoiseBasedChunkGenerator` biome filling. With both enabled, the loader
skips Sky Archipelago's redirect. The candidate sets `mixin.perf.biome=false` in
`zfastnoise.mixin.properties`, retaining `mixin.perf.noise=true`. The isolated
candidate boot no longer reports that redirect conflict. Actual regenerated
Deep Dark terrain and structure placement remain untested.

## Regeneration review

The original server world was archived and removed from the active `game/world`
path on 2026-10-21. Client and server use the candidate generation settings.
A random-seed world was then generated for review. On 2026-10-22 that world was
also archived and moved out, after verifying all 1,019 archived files. The owner
requested a comparison using the original 1024-radius world's seed. It was
recovered from the verified first archive and set only in the local server's
properties; the next launch was prepared to generate a fresh comparison world.
The distributed template remains seed-free. Neither archive was discarded.
The previous seed comparison above remains historical evidence for choosing the
1494 spacing scale, not a prediction of the next world's terrain.

For the 0.1.8 playtest, the owner requested deletion of the current comparison
world without another backup. Its matching client Overworld LOD cache was also
cleared. The existing archives and original seed are retained; the local server
is stopped with no `game/world`, ready to generate at its next launch.

For gameplay validation, check spawn resources and a feasible outward and return
crossing, brass production with a solid burner, village delivery availability,
and ore/structure distribution across both high and low islands. Check several
seeds for spawn viability before claiming general seed robustness. Keep structure
retuning separate from this spacing decision. The old Atlas world survey remains
an archived baseline until a new read-only survey is captured after pregen.

Source artifact: Sky Archipelago 1.3.6 SHA-256
`6bc4deeb1bc2be716d29e76837b179104009a73e9a32d6d097a415b08ac174e1`.
See [progression review](progression.md) for the gameplay checks.

The 0.1.8 Sky Villages addition uses bounded absolute structure height;
see [structures](structures.md) for placement overrides and remaining checks.
It does not change the Sky Archipelago spacing decision above.
