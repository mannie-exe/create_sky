# Create Sky v0.1.11

Minecraft 1.21.1, NeoForge 21.1.264 and Java 21 remain pinned.
See [v0.1.10 notes](releases/0.1.10.md) for the previous release.

## Visual compatibility

Expand the generated model patch across Create/Create Deco bars and overlays,
Macaw lanterns and wall variants, Create Deco cage lamps and DnD frontlights.
Lantern artwork follows the fitted models; cage bends join through clipped corners,
and frontlight hoods use a shorter overlapping two-plate shell.
Fresh Details mooshrooms retain their geometry with adapted animation references.

Add Copycat Bar Extrusion 0.1.0 on clients. Standard Create Copycat Panels gain
texture-mask depth for supported iron, Create and Create Deco bar materials.
Other materials keep native rendering. This is not general custom-model support
for every Copycats+ shape. Existing Create/Deco/Rechiseled window connections and
intentional frame patterns remain in place.

## Atlas and authoring

Add vertical acquisition paths with item icons, bounded graph rendering and minimap
navigation. Item details, Evidence and graph selection share recipe displays with
slot layouts, quantities, ingredient alternatives and processing conditions.
Unsupported custom recipe layouts retain their source records.

Authoring uses named jobs with bounded output, cancellation and serialized writes.
Model recipes support retained attachments and small composed elements. Saving,
generating resources and installing a pack remain separate actions.

## Verification and limits

Native checks cover representative placed models, Copycat materials in six facings,
adjacent panels, resource reload and shaders off/on with Complementary/Euphoria.
Moving contraptions, multiplayer, other shaders and performance remain unverified.
Mapped paths describe potential acquisition, not resource budgets or elapsed time.

Modrinth, Prism and server exports retain referenced dependencies. No world reset,
seed change or local player-settings replacement is part of this release.
See [verification](development/web/verification.md) and
[patch maintenance](development/patches.md) for the tested scope.
