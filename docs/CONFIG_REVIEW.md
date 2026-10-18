# Configuration review

> Historical pre-update import report. See [UPDATE_REVIEW.md](UPDATE_REVIEW.md) for the released configuration; raw linked audit files are local-only.

Observed 2026-10-18 against the exact 96 JARs from `Create- Sky World`, Minecraft 1.21.1 / NeoForge 21.1.262 / Temurin 21.0.12.1, on this Apple M4 Pro host.

## Method and limits

A separate Prism instance (`create_sky-default-audit`) was created with copied JARs and runtime metadata, no configs, no options, no saves, and no launch hooks. It reached the title screen and started a new default world, generating client/common/server config files. World entry then ended in a native SIGSEGV in `objc_msgSend`, with IOGPU/Metal command-buffer completion in the stack. This is **not a passing world test**. The stack does not identify a specific mod. The generated defaults remain useful for comparison, but hardware choices and generated IDs are not evidence of deliberate pack design.

A second run used the friend’s config/options with the same JARs and the disposable world. It logged player entry and remained alive for over a minute afterward; thread inspection showed the client render loop and integrated server tick loop. It was then stopped with SIGTERM. This narrows the observed failure to a difference between the two runs, but does **not** isolate Distant Horizons or any individual setting. There was no ship-operation test.

Raw comparison: `config-audit/files.json` (local evidence), `config-audit/changes.csv` (local evidence), `config-audit/changes.json` (local evidence), and `config-audit/diffs/` (local evidence). Identical active options with rewritten comments are distinguished from changed values. Unsupported text formats are shown as diffs, not guessed. Missing baseline files are not automatically called custom settings; many belong to removed mods or older config layouts.

## Meaningful differences

| Area | Clean default | Friend's setting | Effect / qualification |
|---|---|---|---|
| Big Cannons recoil | 1× | 4× | Greater cannon recoil; relevant to ship balance |
| Autocannon round capacity | 64 | 16 | Smaller magazine |
| Machine-gun round capacity | 128 | 64 | Smaller magazine |
| SSRD physics render distance | 128 | 32 | Shorter extra rendering reach for Sable objects |
| Power Grid solver | JAVA | NATIVE | Native solver selected; retain and test platform behavior |
| Power Grid `syncWithDoubles` | true | false | Lower-precision synchronization path selected |
| Distant Horizons renderer | DEFAULT | DISABLED | LOD rendering intentionally disabled in the supplied settings |
| Iris shaders | true, no selected pack | false, old Euphoria pack selected | Shaders disabled; selected shader and patcher versions also mismatch |
| Accessories screen | NONE | EXPERIMENTAL_V1 | Experimental inventory screen selected |
| Sky minimum radius | 30 | 24 | Smaller possible islands in RANDOM sizing mode |
| Small structure local search | step 8, radius 10, 6 chunks | step 4, radius 14, 8 chunks | Finer/wider search for structure placement |
| Surface structure local search radius | 16 | 24 | Wider search for grounded placement |

Sky island size-band edits are also preserved (small 24–41, medium 42–58, large 59–75; weights .34/.33/.33). **The common config has `islandSizeMode="RANDOM"`, so these SPECIFIC-mode bands are not the active sizing scheme.** Density .4, spacing 96, and Y 20–170 are unchanged from the generated common defaults. `oceanBlockType="water"` differs from the generated namespaced `minecraft:water`; this should be checked when ocean mode is used.

The friend’s structure category overrides omit the default `minecraft:mansion=LARGE_GROUND` entry. Other mod structure names in lists do not prove those mods are installed; default compatibility lists themselves contain absent mods.

## The saved `eee` preset is separate

Preserved at `overrides/common/config/sky_archipelago/presets/eee.json`. It requests radius 10–500, Y −32–300, maximum thickness 300, dynamic cluster spacing 32–1500, ocean disabled, and no islands over ocean biomes. These settings differ substantially from the common TOML. The source has **no `default-preset.toml`**, so the existence of `eee.json` does not select it automatically.

The source's only local saved world, `New World`, records `minecraft:noise` + `minecraft:overworld` in its Overworld generator, not the Sky Archipelago generator. See `source-worldgen.json` (local evidence). Its presence cannot establish the settings on the friend's external multiplayer server. No server world/config was supplied.

For a new single-player sky world, select **Sky Islands** in World Type. Load `eee` in Customize/Presets only if you want those much wider size/spacing extremes. The server template explicitly selects `sky_archipelago:sky_islands` for **new** worlds and otherwise preserves the supplied common settings. It does not convert existing worlds.

## Leftovers and rendering issue

24 source config files were not generated by the baseline, including Bakery, Farm & Charm, Herbal Brews, Meadow, Vinery, Create Dynamic Lights, Immersive Lanterns, Sodium Dynamic Lights, Tracks, and older JEI/EMI layouts. The saved `eee` preset is expected to be source-only. Active files are retained for faithful translation; missing-baseline entries need individual confirmation before deletion.

Euphoria Patcher **1.10.5-r5.9.3** requires Complementary **5.9.3**, but the supplied archive contains **5.8.1** and an older patched **1.9.2** shader directory. Its existing error log explicitly reports this mismatch. Generated error shaders/logs were excluded from the rebuilt source; shader versions and the friend's disabled-shader preference remain unchanged. Fixing the shader pair should be a deliberate follow-up, not confused with faithful import.

No config difference is attributed to the friend personally: these are observed instance-vs-clean differences and may include inherited presets, mod migrations, or automatic runtime choices.
