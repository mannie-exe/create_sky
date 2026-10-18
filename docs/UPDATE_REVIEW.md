# Update and compatibility review

Checked 2026-10-18 for Minecraft 1.21.1 / NeoForge 21.1.263 with empack 0.7.0-beta. This supersedes the initial faithful-import configuration.

## Version decisions

All 96 original mod projects were checked against their published Minecraft 1.21.1/NeoForge versions on Modrinth, including the nine retained URL-snapshot exceptions. Those top-level mod selections were already current. This is a compatible-runtime update, not a move to another Minecraft release.

- NeoForge 21.1.262 → **21.1.263**. Official changelog adds enchanted loot events; no config migration was listed.
- Complementary Unbound 5.8.1 → **5.9.3**, matching installed Euphoria Patcher **1.10.5-r5.9.3**. Removed old generated 1.9.2 shader files and patcher cache. The three custom fog/night-sky options still exist in the generated new shader. Iris now selects its correct generated name; shaders remain disabled by default.
- MezzConfig **0.6.6 bundled → 0.6.8 standalone**, within JEI’s declared `[0.6.3,1.0.0)` range. JEI and Aeronautics Covers are provider-managed again. The old bundled library remains inside JEI’s immutable JAR; NeoForge selects the newer compatible copy.
- Added client-only **Default World Type 1.21-5.0.4** to select the Sky Islands generator automatically.
- Added **Lootr 1.21.1-1.11.38.127**, **AppleSkin 3.0.9**, **Carry On 2.2.6** (JAR build 2.2.6.13), **Spyglass Improvements 1.5.7**, **Exposure 1.9.19**, and **Sound Physics Remastered 1.21.1-1.5.1**. The latter is published as alpha; existing Iris and other experimental selections also retain their upstream prerelease status.

Exact downloadable versions are linked in [MODLIST.md](MODLIST.md). Primary release metadata came from the [Modrinth API](https://docs.modrinth.com/api/) and [NeoForge’s Maven changelog](https://maven.neoforged.net/releases/net/neoforged/neoforge/21.1.263/neoforge-21.1.263-changelog.txt). Raw query results and local command logs remain in the local audit store, outside public Git history.

## Default world generation

`config/defaultworldtype/client-config.toml` selects `sky_archipelago:sky_islands`. `config/sky_archipelago/default-preset.toml` selects `eee`. The original preset JSON remains intact. The runtime selects this named preset for the stock Sky Islands generator. The smoke test found stock settings still serialized in `level.dat`, while the runtime logged `source=DEFAULT_PRESET, fingerprint=ab19a00826883c9b`. Keep the preset/config files with worlds: changing the named default may affect newly generated chunks in worlds that still resolve stock embedded settings. This does not convert a vanilla generator into Sky Islands.

Dedicated servers prioritize the common TOML. All available `eee` terrain/structure fields were mapped to that TOML, including dynamic spacing 32–1500, radius 10–500, Y −32–300, thickness 300 and suppression of islands over ocean biomes. `oceanBlockType` is normalized to `minecraft:water`. The old JSON key `default_near_miss_fallback_enabled` is absent from the installed mod’s classes and common schema, so it is retained as historical preset data but not claimed to be active. No island-size mode is saved in `eee`; RANDOM is the codec/config default, so its saved size bands are inactive unless SPECIFIC is selected.

## New-feature interactions

- Carry On retains its generated Create/Copycats and relocation-tag exclusions. Added explicit `lootr:*`, `aeronautics:*` and `sable:*` block/entity exclusions to avoid manually carrying personal-loot containers or physics objects. Carry On’s latest release includes a physics-mod distance-check fix. Moving ships and carried vanilla entities still need playtesting.
- Lootr supplies per-player structure loot. Existing modded structures/containers require functional playtesting; it does not add structures itself.
- AppleSkin remains on both sides for accurate hunger/saturation information. Spyglass Improvements and Sound Physics are client-only in the exports. Existing Curios support is available to Spyglass Improvements.
- Exposure uses the existing recipe-viewer stack. Its 1.9.19 migration note concerns RenderScale, which is not installed; no inherited Exposure config needed migration.
- Sound Physics adds acoustics; Analog Audio adds devices and audio content. They do not duplicate the same feature, but moving-source acoustics and performance have not been tested.

## Checks and remaining limitations

`empack sync --materialize --yes` completed with 105 exact dependencies. `empack build --profile prism --profile modrinth --profile server --yes` built all three distributions, including the NeoForge server installer. Archive CRCs, runtime component version, server whitelist/world type, client-only exclusions, default preset files and removal of the last-server address were checked. The hand-authored sources pass `git diff --check`; imported generated configs retain their existing CRLF/comment whitespace. GitHub workflows pass actionlint and use verified empack release bytes with pinned Actions revisions.

A separate Prism instance using the built client reached the title screen on macOS ARM64 / Java 21, with all new mods present and no loader dependency failure. Euphoria logged successful installation of `ComplementaryUnbound_r5.9.3 + EuphoriaPatches_1.10.5`; the Default World Type config was accepted. After an initial desktop-control interruption, a repeat run created a new world without changing the world type or selecting a preset manually. It entered and rendered successfully. Its NBT confirms `sky_archipelago:sky_island`; the generator logged `source=DEFAULT_PRESET`, and the only configured default is `eee`. This confirms runtime preset selection, not embedding of those settings in the save. Shader rendering, dedicated-server gameplay, ship behavior, survival progression and individual new-feature interactions remain untested.

Inherited startup issues remain: Analog Audio 0.1.5-hotfix.1 logs `NoSuchMethodException` while registering Create movement behavior; Create Radars 0.4.9.4 ships empty model/blockstate JSONs and logs resource-loading errors. Neither prevented title-screen startup. The current published versions do not resolve these issues. They are retained and surfaced rather than silently dropping content or downgrading the Create/Aeronautics core.

An earlier clean-config import test crashed in native Apple Metal/IOGPU code. Its cause is unresolved; that result is documented in the historical config review and is not erased by the later title-screen pass.

## Publication

The repo contains authoring files/configs/templates and concise reviews. Provider JARs and shader ZIPs are acquired from verified references. Local raw logs/config diffs, machine paths and import inventories are excluded. Removed the imported last-server address. Original friend instance, layer_1 and layer_2 remain unchanged.

Both GitHub validation and release workflows completed successfully for `c2a92f9`. Release assets were checked against GitHub SHA-256 digests. GitHub normalized spaces in asset names to dots; the published checksum file was corrected to those exact filenames, and the workflow now normalizes filenames before hashing future releases.
