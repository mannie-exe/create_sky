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
