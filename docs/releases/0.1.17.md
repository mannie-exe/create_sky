# Create Sky 0.1.17

Minecraft stays at 1.21.1 and NeoForge at 21.1.264. Existing 0.1.16 worlds,
generation settings, seeds and DH caches are preserved; no regeneration is needed.

## Compatibility

- Repair Fresh Details animation bindings for villagers, wandering traders and
  elder guardians. Sleeping villagers retain their feet. Donkeys and mules use
  the current equipment hierarchy while retaining Details' chest straps.
- Add the client-only Carry On Animation Fix to stabilize carried entity state
  with Fresh Animations. Normal animation and existing container exclusions remain.
- Extend Sable's weight tags to partial building blocks and thin fixtures from
  Macaw's mods, Create Deco and Design n' Decor. Collisionless decorations retain
  Sable's native zero-mass behavior.
- Update Create Sky Compat to 0.5.1 for optional DH lifecycle fixes. Cache isolation
  remains opt-in; existing cache keys are unchanged by default.
- Exclude glow lichen from DH tint sampling to prevent luminous distant columns.
  Native lichen and fluid rendering remain enabled; cached terrain is not deleted.
- Select Ponder 1.0.87 to fix concurrent sprite registration during startup.

## Dependency updates

| Component | Previous | Selected |
| --- | --- | --- |
| C2ME NeoForge | 0.4.0-alpha.0.123 | 0.4.0-alpha.0.124 |
| Create: Radars | 5.0.1 | 5.0.2 |
| Fzzy Config | 0.7.7 | 0.7.7+fix1 |
| JEI | 19.70.0.460 | 19.70.0.464 |
| SuperMartijn642's Core Library | 1.1.25 | 1.1.26 |
| Ponder | 1.0.82 bundled with Create | 1.0.87 explicit dependency |
| Create Sky Compat | 0.5.0 | 0.5.1 |

Carry On Animation Fix 1.0.0 is new. DH Polygon Fix and Veil Iris Fix stay:
the selected compatible DH/Iris/Sable artifacts still need them. SeedGen remains
excluded. Authored configuration, patch maintenance and resourcepack Atlas entries
were updated alongside the generated resources.

## Verification limits

Isolated fixtures cover sleeping/standing entity models, mule equipment, cow and
villager pickup/carry/placement, seven actual Sable mass assemblies, recipe viewing,
and propeller Ponder with shaders off/on. DH conversion preserves the sampled
modded ores and stones. Minimum server generation, full-server DH shutdown and
ADQ chunk-ticket checks pass. These are bounded checks, not a full survival or
all-entity animation certification. See the maintained compatibility guides for
artifact versions, known upstream warnings and client harness limitations.
