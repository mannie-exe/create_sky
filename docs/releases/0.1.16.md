# Create Sky 0.1.16

Minecraft remains 1.21.1 and NeoForge remains 21.1.264. Update Create Sky Compat
from 0.4.0 to 0.5.0; other mod and resource-pack versions are unchanged.

## Islands and exploration

- Use 750-block cluster jitter with deterministic neighboring-island clearance,
  retaining 2400-block cells, varied elevation and the continuous underside taper.
- Add island-relative noise interiors, hollow chambers, large iron/copper veins,
  local basins and water outlets through the OVERLAP terrain pipeline.
- Preserve biome-specific materials and cave/ancient-city placement rules across
  the expanded terrain. Ocean-island prototypes are available but disabled.
- Enable the optional BlueMap 5.7 viewer adapter for the server's `world` map.
  Detailed views use actual height bounds and bounded loading; coarse views still
  have limitations for stacked terrain and undersides.

The Atlas world/ore view separates height profiles, exposure observations and
estimated resource quantities, and includes the current generation survey.
Scarcity, cave access, rare structures and long-term water behavior remain playtest topics.

## Distant terrain

Raise matching client/server DH limits to 2048 KB/s per player, 64 fresh-LOD
requests and 100 sync requests. Disable client cave culling for island undersides.
Keep the 256-chunk rendering radius, four workers and native CHUNKS_ONLY generation.
The progress overlay remains a player preference and is hidden by default.
This improves transfer allowances; it does not add island-priority scheduling.

## World compatibility

Released 0.1.15 worlds use the older generation identity and require a fresh world
for this terrain update. Keep those saves and their configs separately; do not
remove an identity marker to force conversion. The current local playtest world
already uses the qualified `islands_v1-prototype-10` generation and matching
settings, so it is preserved when moving to this release. Its seed and DH cache
identity remain unchanged. Other server owners should verify their own world marker.

## Verification

Compat's versioned JAR differs from the qualified candidate only in version
metadata. Its native generation, reopen, fluid, DH pregen and BlueMap evidence is
recorded in the mod's verification guide. Pack tests, journal/resource generation,
configuration audit and Atlas tests/build/snapshot checks pass. These checks do
not establish complete survival balance or certify every rare structure.
