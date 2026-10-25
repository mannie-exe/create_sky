# Create Sky 0.1.13

## Islands and geology

Update Create Sky Compat to 0.3.0. Main-island centers vary across Y=242–490,
with companions above and below their hosts and at least 200 blocks of terrain
headroom. A 4100-block cell grid keeps complete cluster envelopes at least 1500
blocks apart. Sampled shore crossings are usually closer to 3 km.

Vanilla underground heights now map from the geological bottom to the island
surface at reference Y=64. Shallow canyon origins follow actual local surfaces.
Fossils, underground clay and jungle vines receive scoped placement adapters.
Native ore counts, biome restrictions and replacement rules remain unchanged.

Floating villages follow host altitude and retain the weighted zero-to-three
allowance. Climate follows biome rather than absolute elevation. The continuous
Sable pressure curve is unchanged. Delivery destination sampling reaches 6000
blocks to suit the wider grid; the native locator can resolve farther away.

## Configuration and Atlas

Geometry has one validated installation profile:
`config/create_sky_compat-generation.json`. Restart after changes and use a fresh
world. The Atlas shows center elevations, conservative cluster-envelope gaps,
sampled shore gaps, surface openings and updated resource observations separately.

## World compatibility

The existing `create_sky_compat:islands_v1` preset is modified in place. This update
requires a fresh Create Sky Islands world; saved generation identity rejects old
terrain rather than converting it. Preserve wanted saves and their original pack.
Ordinary Sky Archipelago, Nether and End generation remain outside these adapters.

## Verification and limits

Full/minimum native generation and reopening, four-seed layout checks, two-seed
resource samples, village placement, delivery endpoints, climate and pressure
checks passed. An isolated shader client showed surface openings and the selected
shader's persistent sky below the world floor; no void-rendering patch was added.
A fresh bounded DH pregen completed with the client closed. A preceding concurrent
client run expired requests before recovering; its cause remains unresolved.
Survival mining/travel budgets and delivery completion remain playtest work.
