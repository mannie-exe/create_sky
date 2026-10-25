# Verification

## Atlas workbench and world evidence, 2026-10-25

The worktree based on `b0ca189` reorganizes item inspection, world evidence and
authoring output comparison. Desktop captures at 1440×1000 and narrow captures at
390×844 were reviewed for the three views. Item acquisition methods sit beside
the embedded route on wide screens and above it on narrow screens. The first
producing recipe is visible; desktop view navigation remains accessible.

Saved terrain displays its capture date and identity status separately from
isolated generation and village experiments. Ore profiles support negative and
high island heights, numeric values and missing-data states. The authoring
comparison is adjacent to save/generate controls and distinguishes saved outputs
from unsaved drafts. These changes retain the shared recipes, React Flow graphs,
Astro pages and named-job authoring boundaries.

Final checks:

- `pnpm verify`: formatting, 54 JavaScript tests, Astro diagnostics and static build pass.
- `pnpm test:python`: 12 tests pass, including exact large-seed serialization,
  generation identity provenance and exclusion of player records.
- `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser`: 33 cases pass across item/map,
  graph/recipe, authoring, model, navigation and resource-pack interactions.
- `pnpm data:check`: current runtime, recipe/acquisition and 48 journal-target checks pass.
- `git diff --check`: clean.

Earlier browser runs exposed covered view navigation and an out-of-order Evidence
response; the final pass includes their fixes. An intermittent ResizeObserver
notification remains when switching embedded/full graphs. Read-only instrumentation
captured React Flow renderer/node measurement callbacks after a zero-to-visible
size change, but this does not isolate the cause. The full run also emitted an
Astro dev-toolbar audit fetch diagnostic. Interaction checks passed; neither
diagnostic is presented as resolved or suppressed. The existing large-bundle
build warning remains.

The named capture/extract jobs refreshed implementation evidence at
`2026-10-25T07:28:01.151764Z`: 10,119 items, 9,249 recipes and 12,503 modeled routes.
The exporter used the installed 0.1.12 server set, including the published Compat
JAR `084153f7…`; inputs did not change during capture. The isolated audit server
never mounted the playing world. Its disposable outputs were removed after
extraction and checks. The local dev server was restarted while idle to pick up
the newly added island-survey public path; no named job was interrupted.

Pregeneration was accepted around spawn X 551, Z 414 with radius 1,024 chunks
(16,384 blocks), using the preserved seed and expanded preset. It runs independently;
progress was not polled after acceptance. Completion remains unconfirmed, so the
new-world Atlas import is pending. The retained saved-world survey is historical,
not evidence for the current generated terrain. New provenance and height-range
behavior was checked with fixtures; no claim of a completed new-world survey is made.

## Authoring and graph baseline, 2026-10-24

The worktree based on `7cf5797` passed `pnpm verify` (45 JavaScript tests),
25 browser tests and nine Python tests. Named-job checks covered fixed inputs,
serialization, time/output limits, cancellation and descendant termination.
Browser checks covered workbench drafts, navigation, item/grid virtualization,
source escaping, graph semantics and narrow layouts. The native snapshot contained
10,119 items and 12,503 modeled routes. These records predate the React Flow pass
below; current architecture and limits belong in [data](data.md).

## Release checks, 2026-10-24

Create Sky 0.1.10 preparation, based on `9bef645`, passed 26 root Python tests,
32 web Node tests, nine web Python tests and 19 browser tests. `pnpm verify`
passes formatting, Astro diagnostics and the four-page static build; the existing
large Three.js chunk warning remains. `scripts/audit-changes.py` reports 228 files
with no drift or unregistered files. Both resource builders pass `--check`.

After local instance synchronization, `pnpm data:runtime`, `pnpm data:extract`,
`pnpm data:compile` and `pnpm data:check` passed. The isolated capture completed at
`2026-10-24T08:40:14.203623Z` with 10,119 items and 9,249 recipes; 429 crafting
routes remain unresolved. This is coverage evidence, not proof of gameplay balance.

The release visual patch SHA-256 is
`859bafa24b2141808e23aad831908168531bd4b7c2baa6029125f5380b5f849d`.
Its rendered resources are byte-identical to the native-tested patch below;
`CREDITS.txt` is the only added content. No new graphical behavior is claimed.

## Maintenance checks, 2026-10-23

Working tree based on `9bef645`, Minecraft 1.21.1, NeoForge 21.1.264 and Java 21.
The maintenance-check lock SHA-256 was
`c89790565d6bfd1be5bbfe488c1e5919b64d84f2a8228151d6e08e9f4478039a`.
The maintenance-check source digest was
`81b97540a02ac9eeb8a81705df386dc83fbdba5cb8f1563c3bdcaf6223559ce8`
(SHA-256 of sorted relative paths, NUL, bytes, NUL for root scripts/tests, immediate
web scripts/tests, `web/src/`, Astro configuration and the lock).
These checks cover source cleanup and the existing selected resources; they do
not publish a release or establish new gameplay compatibility.

| Check                    | Evidence                                                                                                                                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root unit tests          | 15 pass; journal/audit boundaries, server archive patching, resource input rejection and no-op/check-only archive publication                                                                                                                |
| Maintained archives      | Both builders' `--check` passes; the shared JAR and six-model client ZIP are unchanged by the refactor                                                                                                                                       |
| Atlas `pnpm verify`      | Formatting, 27 JavaScript tests, Astro diagnostics and all three static routes pass                                                                                                                                                          |
| Atlas Python suite       | Nine tests pass for paths, Anvil decoding/sampling and resource overlays                                                                                                                                                                     |
| Browser suite            | 16 pass, including journal/disclaimer CRUD, conflicts, local write restrictions, resource filtering/gallery behavior and consistent page navigation on mobile                                                                                |
| Isolated runtime refresh | Refreshed after Barrel Roll removal at `2026-10-23T20:47:17.178836Z`; no input changes during capture. Extracted 10,119 items, 31,689 resource paths and 10,053 texture previews; compiled 9,249 recipes with 429 unresolved crafting routes |

After Barrel Roll removal, `empack manifest check`, `scripts/audit-changes.py`
(228 files), both archive builders with `--check`, all three reference builds and
`pnpm data:refresh`/`pnpm data:check` pass. Flight feel has not been retested.

Runtime capture now takes its dependency set from the configured installed server
and overlays the checked maintained resource JAR. It no longer mixes selected
authoring JARs into an older server set. The server must be synchronized before a
capture following dependency changes. The isolated exporter cleans old classes
before compilation and never mounts the playing world.

`pnpm data:check` passes the current 48 journal targets and recipe/loot/acquisition
assertions. All three reference profiles build; their ZIP CRCs pass, and the Prism
and server release recipes match the installed snapshots below.
Rendered map, authoring and resource pages were inspected at 1440×1000, with the
authoring page also inspected at 390×844. Navigation and mobile overflow checks
run across all pages in the browser suite. Local documentation targets and Markdown
anchors resolve; archived 0.1.8/0.1.9 notes match their published tags.

Cleanup removed about 724 MiB of obsolete exports and duplicate build output.
Active Atlas data/textures, selected comparison captures, Resource Review, world/seed
backups and the empack findings report remain. Capture worlds, compiler output and
temporary validation logs are disposable after this record is updated.

## Retained game evidence

| Area                 | Tested scope and limits                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resource fixture     | 2026-10-23, shader off, fixed camera/time/weather; Minecraft 1.21.1, NeoForge 21.1.264, EMF 3.3.12, ETF 7.2.6 and Fusion 1.3.16. Pots, sampled lantern/chain models, chest/Lootr states and glass were inspected. Moving ships, Copycats, shader-on rendering and broad animation behavior remain untested.                                                               |
| Visual model patch   | Four plant/pot composites and two chain overrides passed individual prototype checks. The combined generated ZIP has SHA-256 `9f485b0244be4903203acece5d18361faa53df58af748b50ee7f207bc8e6a35a`; exact inputs and texture references pass static checks. The combined ZIP was subsequently loaded in the retained review world; broader motion coverage is still limited. |
| Local installations  | Barrel Roll removal rebuilt all three exports. Client snapshot `4bc70d4a4e5eac8303e293566c44584fa004c5a0dd0868e17a1a9889d30a6e04` and server snapshot `df13d495f94d2d668af5749d97ff20d71bd26b1aecfd9e3595486757e0ceb5a9` pass `instance prepare --dry-run` with zero changes. All 5,739 captured world/LOD/player-setting hashes are unchanged.                           |
| Resource Review save | Retained category fixture, revision 5, in the local client. Twelve sections, 311 manifest entries, eight ladder families, 27 stationary creatures and a conditional mosquito station. Source lives in the testing harness; native placement and reload checks are described below.                                                                                        |
| Questlog             | Native definitions, negative/positive count thresholds, any-of branches, block interactions and NBT restoration are checked by the exporter. Browser preview is not proof of Minecraft text wrapping, localization or UI integration.                                                                                                                                     |
| Generation           | Native spacing comparisons and controlled/natural village surveys are owned by [worldgen](../worldgen.md) and [structures](../structures.md). Existing terrain samples are historical; they are not a survey of every later playtest world.                                                                                                                               |
| Rendering            | Shader pipeline/sampler measurements and DH patch evidence are owned by [compatibility](../compatibility.md). No FPS or cross-platform performance guarantee follows from compilation.                                                                                                                                                                                    |

The [resource interaction guide](../compatibility.md#resource-interactions) links
the retained local comparison captures. The fixture builder and instructions live
under `~/Minecraft/modpack-testing/projects/create-sky-resources/`. Candidate
archives and disposable launcher copies are not required to browse the evidence.

### Category fixture checks

The 2026-10-23 review uses the installed client snapshot
`4bc70d4a4e5eac8303e293566c44584fa004c5a0dd0868e17a1a9889d30a6e04`.
The optional lantern/Lootr prototype has SHA-256
`b608fddbdbcfabe2afe35bbc881296a7d757557ae6835dae1945d10590b14662`;
it is unselected and absent from the release inputs. Its lantern fallback rendered
correctly. Lootr animation equivalence remains unresolved; chest close clips are
linked from [resource interactions](../compatibility.md#category-review-world).

- `verify_world.py WORLD`, using the Atlas Python environment after stopping
  Minecraft: all 4,476 specified blocks, 32 equipment slots and 27 stationary
  specimen IDs matched the saved world. The checker also refused the world while
  Minecraft held its session lock. It checks IDs, not textures, connection states
  or animation. The conditional mosquito station was exercised in-game.
- Native fixture parsing and display creation completed without function/display
  errors. Save/reload preserved the scene without rebuilding it. Night/noon and
  category buttons worked. The selected stack was restored,
  including the player's enabled shader setting; prototype selection was removed.
- `python3 -m unittest discover -s projects/create-sky-resources -p 'test_*.py'`
  in the harness: four checks passed for the world marker guard, edit bounds,
  Unicode labels and torchflower stage regression.
- `pnpm check` in `web`: 27 files, no errors, warnings or hints.
- `node --test tests/resourcepacks.test.mjs`: both catalog/data checks passed.
  The served resource page contains the local comparison section and all ten
  linked evidence files exist. This is not a browser interaction test.

## Research coverage

The 2026-10-23 catalog review screened 250 download-ranked listings each from
Modrinth, CurseForge and Planet Minecraft: 750 site-local entries, including
cross-site duplicates. It contains 46 detailed reviews, 45 hash-verified inspected
archives and one source-only comparison. `projects.json` records exact inputs and
inspection limits; the Atlas distinguishes that baseline from current selections.
Its galleries show upstream artwork, not the local fixture screenshots.

The original source-gallery check returned image content for all 295 unique
thumbnail/full-image URLs. External availability can change. Browser tests stub
those remote images and separately verify failure fallbacks; they do not repeat
the remote artwork check. Broad 3D packs, Fresh Moves and shader-off sky candidates
remain inspected candidates, not runtime-tested selections.

## Evidence ownership

| File                                          | Authority                                                      |
| --------------------------------------------- | -------------------------------------------------------------- |
| `data/generated/runtime/snapshot.json`        | Loaded JAR hashes, lock hash and input fingerprint             |
| `data/generated/runtime/journal.json`         | Native quest definitions and handler checks                    |
| `data/generated/runtime/patch_checks.json`    | Actual corrected block-drop rolls                              |
| `data/generated/runtime/heat_checks.json`     | Native heat behavior                                           |
| `data/generated/runtime/worldgen_review.json` | Read-only native layout comparison, when captured              |
| `data/generated/diagnostics.json`             | Remaining runtime diagnostics                                  |
| `data/generated/world.json`                   | Dated stored-region census and block sample                    |
| `data/generated/structures.json`              | Controlled/natural village survey and provenance               |
| `data/research/resourcepacks/`                | Catalog, exact archive inspections and source-gallery metadata |
| `public/generated/resource-review/`           | Selected local screenshots; ignored by Git                     |

Keep compact evidence while a current claim depends on it. Completed migration,
bootstrap and selective-sync receipts do not define current configuration. Do not
copy their history into operating guides or treat old pass counts as current tests.

## Model workbench checks, 2026-10-24

The tested model-authoring source digest is
`43969a3043198c3bb99f71f82cf56c0d4fbc7b12aaeaf2ec6e4ace9b37bfbf1b`.
It hashes these paths in order, each followed by NUL, file bytes and NUL:
`authoring/model-recipes.json`, `authoring/resource-patches.json`,
`scripts/model_authoring.py`, `scripts/resource_inputs.py`,
`scripts/lootr_models.py`, `scripts/build-resource-patches.py`,
`web/src/lib/model-authoring.ts`, `web/src/lib/model-preview.ts`, and
`web/scripts/model-authoring.mjs`.

| Check                                                  | Result and scope                                                                                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root Python unit discovery                             | 26 pass; guarded publication, mask coverage and exposed surface area, input rejection, isolated fitting, Lootr attachments and native lookup paths |
| `pnpm verify`                                          | Formatting, 32 Node tests, Astro check and static build pass; Three.js produces a chunk-size warning                                               |
| `pnpm test:python`                                     | 9 pass using the project's Python environment                                                                                                      |
| `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser`          | 19 pass, including retained JSON drafts, extrusion/fitting edits, recipe switching, reload protection and narrow-screen layout                     |
| Actual model API read/save/generate/read               | Source roundtrip preserved recipe values; generation uses the saved source                                                                         |
| Browser inspection                                     | Textured lantern geometry, UV selection, element controls and scrollable workbench render                                                          |
| `python3 -B scripts/build-resource-patches.py --check` | Deterministic selected output matches; 14 block models and three Lootr model/animation resources                                                   |
| `python3 -B scripts/audit-changes.py`                  | 228 registered files, no drift or unregistered files                                                                                               |

### Native model checks, 2026-10-24

The final combined resource ZIP has SHA-256
`e44afbb31646a575f6e298f6acb29875cc1a4edea600b6fc9a41425211c43307`.
The disposable client used Minecraft 1.21.1, NeoForge 21.1.264, Temurin
21.0.13+9-LTS/aarch64, EMF 3.3.12, Lootr 1.11.38.127 and Fresh Objects 2.1.2.
Its source was client snapshot
`4bc70d4a4e5eac8303e293566c44584fa004c5a0dd0868e17a1a9889d30a6e04`,
with a cloned Resource Review revision 5 world. The generated model patch was
added above its inputs. The combined candidate passed cold launch/world reload;
the final ZIP differed only in its pack description and passed resource reload.
Playing instances and worlds were not changed by this check.

- Industrial bars: isolated post, three-high corner and crossing fixtures retained
  openings and continuous edges from both sides. Compare
  [baseline](../../../web/public/generated/resource-review/models/baseline-bars.png),
  [extrusion](../../../web/public/generated/resource-review/models/candidate-bars.png),
  and [shader view](../../../web/public/generated/resource-review/models/combined-shader-bars.png).
- Bell and covered lanterns: standing/hanging frames and caps use opaque metal;
  covered windows retain their opaque lower region. Original animated textures
  continue changing with no missing-texture surface. Compare
  [bell before](../../../web/public/generated/resource-review/models/baseline-bell.png),
  [bell fitted](../../../web/public/generated/resource-review/models/candidate-bell.png),
  [covered before](../../../web/public/generated/resource-review/models/baseline-covered.png),
  and [covered fitted](../../../web/public/generated/resource-review/models/candidate-covered.png).
  Shader checks include [bell](../../../web/public/generated/resource-review/models/combined-shader-bell.png),
  [covered](../../../web/public/generated/resource-review/models/combined-shader-covered.png),
  and standing flame clips for [bell](../../../web/public/generated/resource-review/models/final-bell-animation.mp4)
  and [covered](../../../web/public/generated/resource-review/models/final-covered-animation.mp4).
- Lootr: EMF selected both exact JEM paths, attached body/lid/latch branches and
  parsed their animation expressions. Opening/closing, generated inventory contents,
  gold unopened/muted opened materials, trapped chests and
  [neighbor independence](../../../web/public/generated/resource-review/models/neighbors-after.png)
  passed. The [vanilla control](../../../web/public/generated/resource-review/models/vanilla-close-range.mp4)
  and [Lootr recording](../../../web/public/generated/resource-review/models/lootr-close-range.mp4)
  both show the body shake: the left wood edge at image y=720 moves from x=572
  to x=578 and returns to x=572. This is a motion observation, not a timing or
  performance equivalence claim. The user independently observed the shake.
  [Trapped/shader](../../../web/public/generated/resource-review/models/combined-trapped-shader.mp4)
  and [final resource reload](../../../web/public/generated/resource-review/models/final-lootr-reload.mp4)
  clips retain working motion and materials.

Baseline/model comparisons used noon, clear weather, FOV 90 and fixed cameras.
Bars: `(245.5,181,29.5)`, yaw 180, pitch 7. Bell: `(54.5,181,95.8)`, yaw 180,
pitch -5; covered uses `(26.5,181,104.8)` with the same angles. Close-range chest
clips used FOV 50, GUI scale 1 and menu blur 0 so the inventory did not obscure
the body: normal `(70.5,181,76.65)`, Lootr `(70.5,181,89.65)`, yaw 180, pitch 49.
Shader checks used Complementary Unbound r5.9.3 with Euphoria Patches 1.10.5 and
FOV 50. Saved window clips are H.264 at 1708×1016; audio was not evaluated.

These checks cover placed models and one local player's chest interactions.
Moving Create/Sable contraptions, distant LOD appearance, multiplayer state,
other shaders and performance require separate tests. Existing upstream double-chest
animation warnings are not fixed by the single-chest Lootr adapter.

## Visual compatibility pass — 2026-10-24

Tested the worktree based on `7cf5797`, with 73 model recipes and the mooshroom
adapter enabled. The generated and installed client ZIP both have SHA-256
`25b066c28400062abcb69f761c5048ef4aafbcc272872e33f56874a411adaf81`.
The Prism reference snapshot installed through empack is
`e6fc49c6229c0befeeb9aad337279cd59cfa13ebcf79165a159da07f4a06e77c`;
only the visual ZIP changed among game files. Server content did not change.

Commands and outcomes:

- `python3 scripts/model-workbench.py --validate` and
  `python3 scripts/build-resource-patches.py --check`: valid/current.
- Root Python discovery: 26 passed. `pnpm test:python`: 9 passed.
- `pnpm data:compile`, `pnpm data:check` and `pnpm verify`: passed;
  44 JavaScript tests, zero Astro diagnostics. Existing bundle-size warning remains.
- `PLAYWRIGHT_CHANNEL=chrome pnpm exec playwright test tests/models.browser.mjs`:
  3 passed. Bundled Chromium was unavailable; installed Chrome was used.
  The existing browser check reads the recipe count instead of assuming eight;
  original recipe labels were retained. No geometry regression tests were added.
- Harness fixture discovery: 4 passed. After normal Minecraft shutdown,
  `verify_world.py` checked 4,586 blocks, 32 equipment slots and 27 original
  stationary specimens without mismatches. A separate read-only saved-NBT inspection
  confirmed chest halves, nine applied Copycat materials, both storage controllers
  and 16-item transfers, stair mounting, and grounded NoAI specimens.

Native captures remain in the harness's
`projects/create-sky-resources/images/2026-10-24-visual-pass/`, not a new Atlas gallery.
The retained world has the matching revision-6 builder. Views cover Create/Deco
bar families and overlays, standing/hanging lanterns, bridge/stair mounting,
cage lamps and representative lit/unlit, rotated and no-base frontlights.
Eight registered frontlight materials have identical alpha masks in the pinned
input; the shared hood retains their child texture bindings. Shader comparisons
used the existing Complementary/Euphoria configuration and its disabled state.

The mooshroom clip records idle movement; red/brown adults and babies render with
Details geometry. It does not establish every locomotion, rare variant or creature
rig. Other missing Details animation references remain documented in
[patch maintenance](../patches.md#fresh-details-and-mooshrooms).
Moving contraptions, multiplayer, other shaders and performance were not tested.

## Route diagrams and compatibility — 2026-10-24

Tested the uncommitted worktree based on `7cf5797`. The current model source has
87 recipes. This pass extends the earlier model review; native rendering evidence
and artifact hashes are owned by [compatibility](../compatibility.md#visual-compatibility-pass).

The shared recipe renderer, vertical scene builder and graph controller have these
SHA-256 values (in that order):

- `src/lib/recipe-view.mjs`: `970503d6fd3800dc40caeec7f4a1322706809145dcf9d35a7450e88be0c329b4`
- `src/lib/graph-views.mjs`: `571293ea5ebde7bedc5d369d2869a40bf823b8147a5f9289268b1ea3b32af79c`
- `src/lib/atlas-graph.ts`: `15b38e2710353c98986db0c07385ffddf9c8aa8f0c412a4006b1ff48a5243044`

Commands and outcomes:

- `pnpm verify`: formatting, 50 JavaScript tests, Astro diagnostics and production
  build passed. The existing large-chunk warning remains.
- `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser`: 27 passed. After the final path
  camera and capability-description adjustments, the six tests in
  `tests/graph.browser.mjs` passed again; `pnpm check` had no diagnostics.
- `pnpm data:compile` and `pnpm data:check`: passed with 10,119 items and 9,249
  active recipes. Coverage counts remain 9,690 mapped, 326 unmapped and one blocked.
- Browser inspection covered the Glider's repeated shaped slots, empty slot and
  item icons; brass mixing quantities/heat; unsupported sequenced assembly; item
  links; path access from the item map; minimap/navigation; and narrow-screen fit.
  Long paths open near their target at readable scale; Fit retains the overview.
  Native GUI execution, arbitrary custom recipe interfaces and quantitative
  production planning are outside this renderer.

The modpack check/build commands were `python3 scripts/model-workbench.py --validate`,
`python3 scripts/build-resource-patches.py --check`, root Python discovery (27 passed),
and the separate Copycat adapter's `./gradlew check build` (two transform tests).
Harness safety tests passed (four). Its saved-world verifier checked 4,828 blocks,
32 equipment slots and 27 stationary specimens without mismatches.

## Inspector and recipe baseline, 2026-10-24

The worktree based on `59aa21f` passed 52 JavaScript tests, 30 browser checks,
Astro validation, build and snapshot checks before the React Flow replacement.
Slots measured 48×48 with alternatives outside the grid and a responsive arrow.
All 18 vanilla smithing-trim recipes retained consuming uses without treating the
sample iron chestplate as a produced item. Coverage remained 9,690 mapped,
326 unmapped and one blocked. The adapter was checked against Minecraft 1.21.1
`SmithingTrimRecipe` source. [Data](data.md#recipe-presentation) owns the semantics.

## React Flow workspace, 2026-10-24

Uncommitted worktree based on `59aa21f`, preserving the earlier inspector and
smithing changes. Web source SHA-256 is `592ead6e7e034eb0d5dfea0c777fb83636c0f699db7e82dce03ddc7a49b3863f`
(sorted relative paths, NUL, bytes, NUL for source/scripts/tests excluding bytecode,
package/lock and Astro/Playwright/TypeScript configuration).

- `pnpm verify`: 52 JavaScript tests, formatting, zero Astro diagnostics and the
  four-page static build passed. The existing large Three.js chunk warning remains.
- `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser`: 31 checks passed, including
  journal/disclaimer/model authoring, named jobs, fixed recipe slots, trim output,
  graph navigation and the source fallback. The final 11 targeted graph/recipe
  checks passed after the completion audit: interactive node slots, disclosure
  state after actual culling and Back, narrow-screen initial fit and rejected
  markup in catalog icon paths.
- A clean source copy without generated Minecraft data passed `pnpm build`.
- `pnpm data:check`: 10,119 items, 9,249 recipes; coverage remains 9,690 mapped,
  326 unmapped and one blocked. No runtime/world export was needed for UI changes.
- Resource builders passed `--check`; journal had zero changes and the config
  audit reported 228 files, zero drift and zero unregistered files.

Headless Chrome at 1440×1000, local development mode, gave representative
page/grid, graph-open and inline-inspector times of 156/234/190 ms, compared with
172/232/134 ms before the renderer change. Warm repeated visits measured roughly
50/150/182 ms. These are local samples with different rendered content, not
statistically controlled performance equivalence. The richer inline inspector
costs more; indexes are cached across ingredient navigation.

On the 153-node Processing/All scene, final median/p95 frame intervals during
90 synthetic wheel frames were 16.7/16.7 ms, matching the earlier sample. Before
stabilizing node/edge objects and callbacks, the p95 reached 33.4 ms. The final
scene draws 153 nodes and 152 connections versus the old sample's 111/110, so
neither raw heap samples nor projection timing establish an apples-to-apples
memory/rendering advantage. Separate Node measurements were 35.2 ms to index
routes, 0.4 ms to project the 28-node Glider path and 7.6 ms for Processing/All.
The canvas's `data-render-ms` measures projection only, not total painting.

Desktop/narrow browser captures were reviewed. An early lost-navigation click,
repeated node remeasurement and disclosure state lost during culling were corrected.
The completion audit also reproduced an initial-fit mismatch on a 390-pixel
viewport (zoom 0.597 before manual Fit versus 0.287 afterward). Initial fitting
now waits for measured dimensions; the same test passes. Grid icons use the same
local-path validation as recipe cards; malformed attribute payloads are rejected.
The latest targeted run had no resize-loop warnings. Astro's development toolbar
occasionally logs a failed audit fetch during test navigation; it is not a data/API
failure and is absent from the static production interface.

The separate Veil Iris Fix's build and native rendering checks are owned by its
README and [upstream findings](../upstream.md). Web checks do not establish
Minecraft rendering behavior.

## Candidate generation survey integration

On 2026-10-24, `pnpm data:islands` imported artifact-stamped native density and
generated-resource reports from Create Sky Compat. `pnpm data:compile` retained
those reports separately from the archived saved-world survey. The World & ores
panel labels the development candidate, predicted density, observed blocks and
weighted estimates; source JSON retains depth bins, descriptors and hashes.
Desktop capture review confirmed the tables render, and the browser viewport
check found no document overflow at 390 pixels.

`pnpm verify` passed 52 JavaScript checks, Astro diagnostics and static build;
`pnpm test:python` passed 11 checks, including rejected incomplete/unstamped reports
and invalid count values. `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser` passed
32 checks, including the existing embedded routes, recipes, authoring and new
candidate panel. The initial default-channel attempt could not launch because
Playwright Chromium was not installed; the documented Chrome channel was used.
The static build retains the existing large-chunk warning.

The native mod's verification guide owns resource, spawn, geode and flight
observations. The Atlas import does not itself validate a world or certify gameplay.
The import reads reports; it does not mutate Minecraft worlds or instances.

## Expanded altitude and clearance evidence

On 2026-10-25, imported the updated four-seed native density reports and two
three-anchor generated resource surveys. The existing table now distinguishes
anchor center heights, conservative full-cluster envelope gaps, sampled shore
gaps and surface-opening columns. Geological reference Y=64 is explained beside
the source methods. These are isolated Compat development samples, not the live
server world. The saved-world survey remains historical.

`pnpm verify` passed formatting, JavaScript checks, Astro diagnostics and build.
`pnpm data:islands` and `pnpm data:compile` regenerated the local projection.
No new interaction or graph layout was introduced; browser interaction tests and
Python tests were not rerun for this label/type-only change.

## Limits

Mapped acquisition is potential access, not a budget for quantities, chance, XP,
stress/RPM, fuel, safe combat or travel. Trade samples are not exhaustive. Arbitrary
Java interactions and equipment drops still need targeted adapters. The archived
world survey counted 4,285,004 stored chunk entries and sampled 16,900 chunks;
structures/builds can contribute blocks, and sampled zero is not absence.

The audit server does not import playing-world datapacks or gamerules. Check those
separately when evaluating a world-specific change. Optional loot-table, Analog
Audio movement-hook and Sable missing-block warnings remain tracked in
[upstream findings](../upstream.md). Automatic Hostile Skies raids remain disabled;
its captain-order route is not enabled merely because the graph can describe it.
