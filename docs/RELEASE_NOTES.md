# Create Sky 0.1.20

Update Create Sky Compat to 0.6.1 and remove standalone Veil Iris Fix. Compat now
owns optional framebuffer restoration, balloon shadow-pass exclusion, construct
shader material IDs, and single-block model-data/pass adapters. The pass correction
restores glass and glass Copycat single-block constructs with Iris shaders. Minecraft, NeoForge,
and the integrated upstream mods retain their existing versions.

The common startup feature file explicitly selects the pack’s adaptations.
Compat itself can be installed with NeoForge alone; disabled adaptations do not
load target hooks or constrain target versions. The pack continues to enable its
existing island preset and gameplay adaptations. DH cache isolation stays off.
World generation identity, saves, block weights, and recipes are preserved.

Compat passed background build, dependency-boundary and dedicated-server checks.
Native macOS checks covered standalone/full client loading, Ponder, shader toggling
and reload, heated balloons, and static/assembled material controls. Missing
single-block glass was reproduced with the pass adaptation disabled and restored
when enabled. Flickering or gapped airship shadows remain unresolved; this release
does not claim a general shadow correction.

Atlas changes are excluded from release commits. No new recipe or mass projection
is introduced. See [patch maintenance](development/patches.md) for coupled updates
and [compatibility](development/compatibility.md) for evidence and limitations.

Previous releases: [0.1.19](releases/0.1.19.md), [0.1.18](releases/0.1.18.md).
