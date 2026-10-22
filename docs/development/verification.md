# Verification

This record distinguishes source inspection, isolated runtime checks and live
instance synchronization. No flight, delivery, raid or real-client journal UI
session was performed by these checks.

## Pack authoring, 2026-10-22

Tested source follows app `b716b009` and pack `b5465d2`. The app source digest is
`c178c5d80496b5d674f93108aedfdcc32e0b33736079a93481a915214d8ae60a`.
It covers sorted files under `src`, `scripts` and `tests` (excluding Python
bytecode), plus package/lock, Astro and Playwright configuration. SHA-256 input is
each relative path, NUL, file bytes, NUL. Pack build evidence belongs in its
`docs/development/decisions.md`.

- `pnpm verify`: formatting, 22 JavaScript tests, Astro diagnostics and two-page
  static build passed with no diagnostics.
- `pnpm test:python`: all six existing Python tests passed.
- `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser`: all seven tests passed. These
  cover existing map behavior, real config audit reads, same-origin/path rejection,
  separate full requirements and short labels, staged save/generation, conflict
  retention and mobile width. Browser write actions use intercepted endpoints;
  the backend tests write only temporary fixture directories.
- The local port-4321 authoring endpoint returned 18 source files. A desktop
  screenshot was inspected for field grouping, preview order and objective labels.
  The screenshot and failed-run output were removed after review.

The first browser invocation lacked Playwright's downloaded Chromium; installed
Chrome was used instead. Reusing a pre-existing dev server initially exercised
stale middleware. Tests now use port 4322 and `--ignore-lock`, which also prevents
Astro's agent-detected background mode from exiting the test server launcher.
Initial TypeScript global-name collisions were corrected before the passing build.

Only English is authored; a temporary German fixture verifies independent locale
output and deferred translation components. No actual Minecraft language switch,
new journal layout, EMI bridge or Ponder link was exercised. The generated pack
content was not synced into the playing instances. The Atlas runtime/world
snapshots were not refreshed and remain dated evidence from the prior capture.

## Acquisition and fixes, 2026-10-21

Baseline: pack commit `b70bfa866f2056b3ca6de7d10dd41639fb64bdb5` (0.1.5) plus local
unreleased additions and maintained resource fixes. Minecraft 1.21.1, NeoForge
21.1.264 and Java 21 remain unchanged. The app has not been committed or deployed.

The snapshot at `2026-10-21T21:35:44.938475Z` contained 10,119 items, 9,235 recipes,
9,534 blocks, 9,617 loot tables, 6,929 advancements, 188 entity types and 53 fluids.
Potential routes covered 9,690 items. The remainder comprised 326 source/adaptor
questions, 101 creative/internal/operator exclusions, one unified zinc variant,
and one disabled Ecologics integration. These are dated counts, not live claims.

Runtime adapters added 66 Rechiseled groups, 68 Big Cannons block recipes, 281
brewing transitions, 510 sampled trades and 31 global loot modifiers. Source
inspection resolved the Power Grid schematic interaction and backpack chest-loot
routes. Seven exact-input crafting collision groups remain for review; alternate
outputs and intentional conversions were not deleted automatically.

`pnpm data:refresh`, `node scripts/verify_snapshot.mjs`, `pnpm verify` and
`PLAYWRIGHT_CHANNEL=chrome pnpm test:browser` passed. The app checks included 18
unit tests and three browser tests. Repaired recipes and four native block-drop
rolls passed; no recipe parsing or exporter errors remained. A desktop visual
review corrected an empty initial grid band.

Historical source-tree SHA-256:
`87562a1ab4c83fd5bfcd8c4e99b4d2c4679ae0eace935cdb4fcd7e87141ea6ff`.
`data/generated/coverage-verification.json` and `data/generated/fixes-sync.json`
retain the corresponding receipts. That sync preserved 23,489 world/LOD files
(20,023,694,857 bytes) by SHA-256.

## Journal integration, 2026-10-21

Questlog 3.4.1 is pinned to Modrinth version `6ZFtauOf`; its required Cloth Config
selection was already installed. Native definitions, inventory thresholds, OR
branches, block interactions and NBT restoration passed in the isolated runtime
at `2026-10-22T02:52:29.707370Z`. All 48 entries and 66 objective branches passed.
Wrong items/blocks and insufficient counts were rejected. These tests invoke
shipped handlers with a synthetic player and suppress network sends. They do not
prove actual client input delivery, synchronization or visual layout.

The client/server sync wrote 117 selected files and preserved all 23,489 saved-game
and LOD files by SHA-256. Receipt: `data/generated/journal-sync.json`. The receipt
records each written path and hash. No world or generation configuration changed.
The final runtime capture completed at `2026-10-22T02:59:26.324773Z`. `pnpm data:refresh` and
`node scripts/verify_snapshot.mjs` passed with 48 journal definitions and unchanged
item/acquisition counts. `pnpm verify` passed formatting, type checks, 18 unit
tests and the production build. Three installed-Chrome browser tests passed.
The final client/server mod counts are 110/91. Documentation links and Git diff
whitespace checks passed.

The first three-profile empack export was rejected with `StaleSnapshot` because
resource metadata changed during preparation. It published no outputs. The fresh
export passed for Prism, Modrinth and server distributions. All three contained
the exact 48 quest and eight chapter definitions, verified Questlog artifacts
and the rebuilt resource JAR. Client settings were present only in client
overrides. No world or LOD data was packaged. Temporary archives were removed
after recording hashes in `data/generated/journal-verification.json`.

## Bootstrap and documentation, 2026-10-21

Tested the uncommitted app with Node 24.22.0, pnpm 12.14.0 and Python 3.15.0,
using the existing `2026-10-22T02:59:26.324773Z` game snapshot. No Minecraft capture,
world scan, live-instance write, publication or remote CI run was performed.

The initial isolated compilation without `data/generated/world.json` failed with
`ENOENT`. After the fix, compilation in a disposable directory retained all 10,119
items, produced `null` world data and no survey-derived acquisition edges. Potential
coverage fell to 8,179 items as expected when terrain evidence was absent. A malformed
survey still failed with `SyntaxError`. The normal survey-backed compile retained
9,690 mapped items and 429 unresolved entries.

A separate application build with no generated game data succeeded. Temporary
copies reused installed dependencies; this was not a clean network installation.
The default configured vanilla JAR exists locally. Path tests covered defaults,
partial overrides, repository-relative paths, home expansion and malformed JSON.
The extractor's asset selection algorithm was unchanged and was not rerun.

| Check                                                 | Result                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                      | Passed; existing dependency resolution reused                         |
| `pnpm setup:python`                                   | Passed; pinned NumPy already installed                                |
| `pnpm verify`                                         | Passed; formatting, 18 JavaScript tests, type checks and static build |
| `pnpm test:python`                                    | Passed; six path and Anvil tests                                      |
| `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser`         | Passed; four tests, including absent-survey UI                        |
| `node scripts/compile.mjs` in temporary copies        | Missing survey accepted; malformed survey rejected                    |
| `pnpm build` in temporary copy without generated data | Passed; application shell only                                        |
| `pnpm data:compile` and `pnpm data:check`             | Passed with the existing game/world snapshot                          |
| `pnpm deploy:preview`                                 | Wrangler dry run passed; nothing uploaded                             |
| Local Markdown links and `git diff --check`           | Passed                                                                |

Changed implementation/config/test manifest SHA-256:
`c882e13ea0910e504662650068cd30b89cd32193bae7fd3868bb56f93ff6132b`. This hashes sorted lines of
`relative path`, NUL, file SHA-256 and newline for these files:

```text
.github/workflows/ci.yml
data/local.example.json
mise.toml
package.json
scripts/compile.mjs
scripts/extract.py
scripts/paths.py
src/lib/atlas.ts
src/pages/index.astro
tests/atlas.browser.mjs
tests/test_paths.py
```

Temporary test/build outputs were removed after checks. Maintained tests, local
Python dependencies, captured game evidence and the existing empack report remain.

## 2026-10-21: journal wording and release candidate review

Tested the uncommitted application and pack working tree after pack commit
`b70bfa866f2056b3ca6de7d10dd41639fb64bdb5`. The final isolated Minecraft 1.21.1 /
NeoForge 21.1.264 capture completed at `2026-10-22T04:18:46.354846Z` (UTC).
The implementation manifest in `data/generated/release-verification.json` hashes to
`89d9f05a2d86a86c57754072e535156948b1caa9bdc461ca7a5f7b6bea121cf7`.
The receipt names each source file and its hash; runtime snapshot metadata records
loaded JAR and lock hashes. The pack resource-fix JAR was unchanged in this pass.

| Check                                                                    | Result                                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vanilla ASCII glyph metrics and inspected Questlog layout                | All 69 labels fit: maximum 102 pixels against 119 root / 107 nested budgets.                                                                                                                               |
| Quest semantics comparison and native handlers                           | 48 definitions retained all fields except objective names and descriptions; 66 leaf branches passed negative/positive cases and NBT restoration.                                                           |
| `pnpm data:runtime --worldgen`                                           | Passed; candidate no longer reports the Zfastnoise/Sky Archipelago redirect conflict.                                                                                                                      |
| Native world layout                                                      | Existing seed spacing 1494; 64 alternate seeds fixed at 1494; 16 descriptors and 81 column profiles match the original DYNAMIC configuration for this seed. `level.dat` bytes unchanged.                   |
| Native solid-burner check                                                | Cold burner rejected heated processing. Basin above requested heat; eight coal accepted; heated at manual tick 128 and superheated at 380. No operating mixer or throughput test.                          |
| `pnpm data:extract`, `pnpm data:compile`, `pnpm data:check`              | Passed; 10,119 items, 9,235 recipes, 9,690 mapped; all journal targets mapped.                                                                                                                             |
| `pnpm verify`                                                            | Passed; formatting, 19 JavaScript tests, type checks and build.                                                                                                                                            |
| `pnpm test:python`                                                       | Passed; six tests.                                                                                                                                                                                         |
| `empack build --profile prism --profile modrinth --profile server --yes` | Passed all three profiles; archived quests and generation configs matched source. No world data included. Version remained 0.1.5; nothing published.                                                       |
| Selective instance sync                                                  | 48 quest JSON files per instance. Compared size/mtime manifests for 23,938 server and 1,034 client files; only selected quest paths changed. This is metadata comparison, not whole-world content hashing. |
| Documentation links and `git diff --check`                               | Passed in both projects.                                                                                                                                                                                   |

The initial heat harness did not compile because Create's bundled Ponder API was
not on the compile classpath; targeted reflection resolved that dependency. Its
first runtime attempt correctly remained cold with no consumer above it. The
corrected fixture places a real basin to exercise the documented thermostat
request. No heat or fuel state was injected. The initial archive guard also
matched JEI's configuration directory named `world`; the final guard checks world
roots and save-file extensions, while retaining the config files.

The corrected graph no longer forces blaze capture for heated processing. In a
restricted scenario removing exploration, villagers, new terrain, Nether and End
access edges, gliding, brass and propeller-bearing routes remain reachable through
survey-backed resource assumptions. Quartz/crafter/crushing bootstrap remains a
constraint; platinum washing and turpentine do not become early routes just
because brass does. This is not a spawn-island survival proof.

No browser tests were rerun because web interactions did not change. Actual
Minecraft GUI rendering, a working aircraft/mixer, village delivery completion,
new Sky Archipelago chunks and a survival playthrough were not tested. The pack's
`docs/development/progression.md` owns the remaining release checks; its
`worldgen.md` owns the CONSISTENT 1494 decision. Live generation configs remain
DYNAMIC and retain their original biome optimization until deliberate regeneration
review. Worlds, LODs and player progress were not replaced.

Disposable audit worlds, classes, logs, archives and build outputs were removed
after verification. Maintained exporter/tests and generated evidence receipts
remain. The prior empack findings report remains byte-identical.

## 2026-10-22: random-world preparation and source publication

The owner selected a new random world instead of the proposed same-seed review.
The existing server world and original configs remain in a verified 3.66 GiB
archive. All 23,491 current world files still matched its manifest before the
redundant uncompressed world was removed. The archive includes 23,709 files in
total. The server remains stopped with no active world directory and a blank
`level-seed`; no seed was written and no new world was generated.

Local client/server mod JAR sets match the rebuilt profile archives. Both now
have CONSISTENT 1494 and the biome redirect workaround. Installation IDs,
personal graphics settings, client saves and cached LODs were retained. The
new world will receive a random seed at launch. The existing map survey and
optional worldgen comparison remain historical evidence for the archived world;
refresh the world survey after pregen before treating it as the new geography.

`pnpm data:runtime`, extraction, compilation and snapshot checks passed after
synchronization. The capture completed at `2026-10-22T07:01:28.391769Z`, with all
48 journal entries and 66 native branches passing. It ran only the disposable
audit server; no live world was launched. `pnpm verify` passed 19 JavaScript tests,
type checks, formatting and build; `pnpm test:python` passed six tests. Local
Markdown links and Git whitespace checks passed.
`PLAYWRIGHT_CHANNEL=chrome pnpm test:browser` passed all four browser tests.
All three empack profile builds passed. The version remains 0.1.5; source pushes do not authorize a release tag
or a site deployment.

## Evidence ownership

| File                                       | Evidence                                                |
| ------------------------------------------ | ------------------------------------------------------- |
| `data/generated/runtime/snapshot.json`     | Loaded JAR hashes, lock hash and input fingerprint      |
| `data/generated/runtime/journal.json`      | Parsed quest definitions and native handler checks      |
| `data/generated/runtime/patch_checks.json` | Actual corrected block-drop rolls                       |
| `data/generated/diagnostics.json`          | Remaining runtime diagnostics                           |
| `data/generated/world.json`                | Dated region census and reproducible block sample       |
| `data/generated/journal-sync.json`         | Selective writes and saved-data preservation            |
| `data/generated/journal-verification.json` | Runtime checks, application checks and archive receipts |

The current review's `data/generated/release-verification.json` retains the label
metrics, native heat/layout results, source manifest, selective-sync evidence and
archive hashes. `runtime/heat_checks.json` and `runtime/worldgen_review.json` retain
the corresponding native outputs. These receipts are local generated evidence.

## Limits and next evidence

Potential access does not establish quantities, chance-roll budgets, safe combat,
XP, machine stress/RPM, fuel supply, village accessibility or travel time. The
starting-world and exploration assumptions need scenario-specific review. The
world survey counted 4,285,004 stored chunk entries and sampled 16,900 chunks;
structures/builds can contribute to observed blocks. Sampled zero is not absence.

Trade samples do not enumerate every enchantment or biome variant. Arbitrary Java
interactions and equipment drops still need targeted adapters. World datapacks
and gamerules are not imported into the audit server; the playing world's
inspected datapack directory was empty. Recheck that assumption if it changes.

Known optional loot-table, Analog Audio movement-hook and Sable missing-block
physics warnings remain. The pack's compatibility/upstream documents own their
status. Automatic Hostile Skies raids stay disabled; captain-order acquisition
therefore has no normal enabled encounter route. Flywheel tuning and structure
generation are separate, unresolved work.

The preserved empack report at
`/Users/zer0cell/Minecraft/.backups/empack-2026-10-20/report.txt` remains unchanged:
`c98227aa7f2d0cd02ac1596ea950b27a4f60e78aa32df51752be3a2f59ce92b9`.
