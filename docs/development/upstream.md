# Upstream findings

Issue states below were inspected on 2026-10-21 unless a later date is given.
They are dated evidence, not a live tracker; recheck the linked artifact/issue
before removing a workaround during an update.

Read-only review of GitHub issues/PRs (open and closed), project metadata and
selected current source files. No issue, comment or PR was published. The entries below distinguish upstream reports from local pack policy.

## Existing reports
- Create Deco 2.1.3 placard ingredient: open issue #282.
  https://github.com/talrey/CreateDeco/issues/282
- Interiors 0.6.1 dye tags: open issue #61; fix PR #60 merged 2026-07-27.
  A source merge does not establish that our installed artifact contains the fix.
  https://github.com/aesefficio/CreateInteriorsMod/issues/61
  https://github.com/aesefficio/CreateInteriorsMod/pull/60
- Bells & Whistles 0.4.7 metro glass tag: open issue #46 and open PR #54.
  https://github.com/sudoLev/BellsAndWhistlesMod/issues/46
  https://github.com/sudoLev/BellsAndWhistlesMod/pull/54
- Design n' Decor 2.2b industrial cogwheel tag: open issue #133.
  https://github.com/DrMango14/Create-Design-n-Decor/issues/133
- Propulsion 1.1.5 platinum casing disappearing on mining/wrenching: issue #98
  closed 2026-10-20. Current main has singular loot_table/blocks/platinum_casing.json.
  https://github.com/Propulsion-Team/create-propulsion-simulated/issues/98

## New-report candidates
- Aero Cables 0.4.0: condition ae_cable, rs_cable and cc_cable recipes on ae2,
  refinedstorage and computercraft respectively. Installed runtime produced
  recipe errors without those optional mods. Our three conditions remove them.
  Current ae_cable JSON still lacks a condition at main revision
  a455e5639941745765657910ce3b73964fd0e2c6.
  https://github.com/tom5454/AeroCables/issues
- Create Addon Compatibility 1.0.0: condition three TFMG distillation overrides
  on tfmg. Current crude_oil JSON remains unconditional on 1.21.1 revision
  a26d68941319ec0fa143a6d24e7cccfb214ba55d. Older datapack startup reports concern
  other versions and are not established duplicates of this missing condition.
  https://github.com/Amronos/createaddoncompatibility/issues
- Propulsion 1.1.5 copycat_wing, copycat_wing_8 and copycat_wing_12 drops:
  installed loot tables only occupied obsolete loot_tables directory; our
  singular-directory copies pass native loot rolls. Current main revision
  161ea5a8d1ec27080e9fe0327b6ac774495a21b6 retains those plural-path files;
  no corresponding singular files appeared in the tree. Report separately
  from casing #98, after checking a current build's actual wing behavior.
  https://github.com/Propulsion-Team/create-propulsion-simulated/issues
- Hostile Skies 0.2.6 Modrinth version HaZ4GxKd still pins Sable version
  e11C0I1A (2.0.3), while the shipped loader constraint accepts 2.0.3+ and our
  Sable 2.0.6 runtime boots. Metadata prevents normal empack resolution.
  Ask for compatible dependency metadata; this is not a demonstrated game crash.
  https://github.com/TheBlueTaco/Hostile-Skies/issues
  https://api.modrinth.com/v2/version/HaZ4GxKd

## Remaining diagnostics
- Design n' Decor's 256 optional Dye Depot loot tables: open issue #139.
  PR #140 was CLOSED WITHOUT MERGE; do not describe it as an upstream fix.
  https://github.com/DrMango14/Create-Design-n-Decor/issues/139
  https://github.com/DrMango14/Create-Design-n-Decor/pull/140
- Analog Audio movement-behavior registration: issue #114 closed with author
  comment 'Fixed in upcoming release.' Our 0.1.5-hotfix.1 capture still logs
  'Failed to register Create movement behavior'. Prepare minimal reproduction
  before reporting recurrence; audio behavior in a moving craft is untested.
  https://github.com/palmmc/AnalogAudio/issues/114

## Ponder and Iris, 2026-10-24

The user observed disappearing scene/UI content in Aeronautics' propeller Ponder;
other tested tutorials worked. Installed Aeronautics 1.3.2's
`propeller_bearing/thrust.nbt` contains an adjustable burner at `(6,4,9)`.
`PropellerScenes.propellerBearingThrust` powers it at signal 8 through
`RedstoneSignalInstruction`, invoking the burner's Veil flame shader.

Bytecode inspection with Java 21 `javap -c -p` confirms that Veil 4.3.2, bundled
inside Sable 2.0.6, has the faulty Iris `ShaderWrapperMixin`: `apply` binds Iris's
framebuffer, while `clear` attempts restoration using `@Share("drawn")` from a
different target method. That reference does not persist across the two calls.
The redirect also lacks a GUI/world-render guard. This explains a credible path
for subsequent scene/UI draws to go offscreen while animation continues.

[Aeronautics #1270](https://github.com/Creators-of-Aeronautics/Simulated-Project/issues/1270)
reports the same propeller section and shader-dependent behavior.
[Veil PR #213](https://github.com/FoundryMC/Veil/pull/213), open and unmerged when
checked, proposes restoring framebuffer bindings, restricting redirection to the
appropriate world pass, and choosing Iris's active color target. The installed
Veil JAR SHA-256 is
`774b83887d882dc47cd4d29d140cef0c8677747a6fe7799649f490926a4e0265`.

The isolated native client reproduced the propeller failure with
Complementary/Euphoria enabled; disabling shaders restored it. Adding only Veil
Iris Fix restored the affected scene with shaders, while the working mechanical
press, world burner, inventory and shader reload continued to render. The exact
A/B procedure and renderer limits live in that project's README.

`./gradlew check build` also passes actual-class transformation and controlled
framebuffer checks. The tested JAR is
`31c784adc24fa2e8d83b5bcebf0aed4e61d9f0be568d630ac1e28767ef34487f`.
The server-side mixin probe leaves the target byte-identical. Native checks used
Java 21.0.13/macOS arm64; other graphics drivers and shader packs remain unverified.
Veil Iris Fix 0.1.0 is a separate client-only release pin in the pack. Existing
Veil uniform-type warnings remain outside this fix. Its README owns upstream
update checks and the patch removal condition.

## Delivery endpoint integration, 2026-10-24

Installed ADQ 1.1.1's `QuestGenerator.lambda$generateNewQuestAsync$4` resolves the
structure locate position to a dry 3×3 surface. In two native Create Sky Compat
villages, locate returned a start-chunk corner beside void and that predicate
rejected the route despite valid ground two blocks away. The candidate's optional,
version-guarded adapter retries within eight blocks and the known village bounds,
retaining the original predicate. Both endpoints and negative scope controls passed
before and after save/reopen. The owning mod's verification guide records hashes
and coordinates. Cargo placement and completion are not established by this check.

Bytecode inspection of `lambda$generateNewQuestAsync$9` also shows that the
configured maximum distance bounds the sampled search offset, not the final
structure route. After `findNearestMapStructure`, only the minimum distance and
world border are checked. The current 2,000-block value is therefore not a hard
route cap in VILLAGE mode. No distance-policy patch was added. A future change
must consider sparse settlement availability rather than silently discarding
longer routes. Existing upstream issue coverage has not been checked for these
findings and no report was submitted.

The live isolated server then reproduced a separate loading failure: ADQ's paired
background FULL requests returned `Unloaded chunk`, but route finalization ignored
the failed `ChunkResult`s. A native control on the same two Sky Village chunks
failed without explicit tickets and succeeded with retained tickets. The candidate
now retains bounded endpoint neighborhoods through finalization and releases them
on success, rejection, failure or shutdown. This is reproduced with the installed
stack; it has not been isolated to vanilla or C2ME alone.

After loading worked, ADQ generated a one-block route from `(2240, 518, -3887)`
to `(2240, 518, -3888)`. Before surface resolution, one locator position had Y=0;
that artificial vertical difference satisfied the native 500-block minimum.
The candidate uses horizontal distance for structure-origin and route checks in
the new preset. The corrected native run produced a roughly 3,021-block route to
`(-775, 524, -4079)` and released all 18 temporary tickets. It generated an offer;
acceptance, cargo placement and completed delivery remain unverified.

## Pack decisions
- Zinc-sheet preference is pack unification policy.
- Disabled automatic raids and delivery tuning express pack design.
- Missing adapters, environment assumptions and graph false cycles were mapper
  limitations. They do not by themselves establish mod defects.

## Progression evidence
- Hostile Skies #4 reports ships spawning into Sky Archipelago terrain/trees,
  losing altitude and captured ships disappearing. External report, not locally
  reproduced. Keep automatic raids off while evaluating deliberate encounters.
  https://github.com/TheBlueTaco/Hostile-Skies/issues/4
- Propulsion #92 explicitly raises pre-Nether brass via solid/liquid burners;
  maintainer leaves that balance to pack/server authors. Evaluate it as an
  intentional alternative route before imposing any Nether gate.
  https://github.com/Propulsion-Team/create-propulsion-simulated/issues/92


See [patch maintenance](patches.md) for override ownership and update/removal checks.

## Generation compatibility, 2026-10-21

The installed Zfastnoise 1.0.13 biome redirect wins over Sky Archipelago 1.3.6's
Deep Dark biome projection redirect. This is reproduced in both the existing
server log and the isolated default-config capture. Disabling only
`mixin.perf.biome` removes the conflict in the candidate capture. Noise optimization
remains enabled. This is a report candidate; existing upstream issue coverage
has not been established and no report was submitted.

- [FastNoise repository and issue tracker](https://codeberg.org/ZenXArch/FastNoise)
- [Local configuration and verification limits](worldgen.md)

Sky Archipelago DYNAMIC spacing is explicitly seed-wide in the installed code
and config comment. Choosing CONSISTENT for this pack is a policy decision,
not a demonstrated upstream defect.

## Sky Villages placement, 2026-10-22

Sky Villages 1.0.6 with the current 1.21.1 pack reproduced a shielded natural
placement failure: `JukeboxBlockEntity#setTheItem:129` dereferences a null `level`
while loading a generated jukebox. Clearing generated record NBT through the
house processor removed the error in a fresh same-seed repeat. The loaded-area
structure command also succeeded. See [structures](structures.md) for the
artifact and workaround.

This is a report candidate, not an isolated attribution to Sky Villages, vanilla
Minecraft or another mod. Existing upstream coverage has not been checked and
no report was submitted. A minimal reproduction should include a record-bearing
template and compare vanilla/NeoForge, Sky Archipelago and the pack's optimizers.

Its ore processor also masks its own diamond rule: separate rule processors use
the same position seed, so the 20% diorite pass consumes every candidate for the
later 0.5% diamond pass. Native sampling and a positive ore-pass-only control
confirm this. The pack now uses a single ordered pass with scarce mineral rates;
see [structures](structures.md) for whole-village measurements. This has not been
reported upstream.

## Processing compatibility

Propulsion 1.1.5 uses `processingTime` in five Create recipes, while the installed
Create codec reads `processing_time`. Native exports omit those durations until
corrected. The pack repairs the spruce-log and copycat-wing keys; overlapping
platinum recipes instead defer to Create's existing family. Separately, broad
ore unification erased Create's stone/deepslate input distinctions. That is a
pack configuration problem, repaired by retaining geological ore identity.
See [progression](progression.md) for the resulting policy and validation.
Existing upstream coverage of the duration issue has not been checked and no
report was submitted.

## Client startup observation, 2026-10-23

One isolated resource-fixture launch stopped at texture stitching with Ponder
1.0.82, Create 6.0.10 and NeoForge 21.1.264:
`StitchedSprite.onTextureStitchPost(StitchedSprite.java:35)` attempted
`StitchedSprite.loadSprite(...)` on a null entry. An unchanged retry reached the
integrated world. No cause or pack-specific attribution is established.

[Ponder #92](https://github.com/Creators-of-Create/Ponder/issues/92) concerns a
null **sprite field** in a late-created entry; this capture had a null entry in
the stitch loop, so it is not an established duplicate. Preserve that distinction
if reproducing or reporting it. No upstream report or workaround was submitted.
