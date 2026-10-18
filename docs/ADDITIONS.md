# Seed and additions review

> Follow-up: Lootr, AppleSkin, Carry On, Spyglass Improvements, Exposure and Sound Physics Remastered are now included in 0.1.0. Other candidates below remain suggestions.

Reviewed 2026-10-18. Suggestions only: **none of these candidates were added**. Version availability is not gameplay compatibility. Fresh Modrinth project/version responses are in [candidate-evidence.json](candidate-evidence.json); existing pack inventories are in [seed-inventories.json](seed-inventories.json).

## Starting point

Use the friend's pack as the seed, in `~/Minecraft/create_sky`. Preserve `layer_2` as a historical reference. The actual packwiz inventory has 44 entries, of which 13 project IDs already occur in the friend’s pack. Its informal modlist includes ideas that were not installed; the manifest inventory is the evidence used here.

The new identity should be **build ships, travel between islands, establish useful outposts, transport materials, and improve the ships and production network**. Cannon recoil and limited ammunition already reinforce ship design decisions. Sky Archipelago + Create + Aeronautics + Sable are the core; the existing decoration, machinery, ropes, radar, cable and cannon add-ons already provide considerable content.

layer_2’s Create, Copycats+, Interiors, Bells & Whistles, Escalated, Jade, Curios, Polymorph, FerriteCore, ModernFix, Fusion, Fzzy Config and Kotlin for Forge are already represented. Do not reinstall duplicates or copy their old 1.20.1 configs.

Do not carry over Tectonic/Terralith as terrain defaults: the new core deliberately uses Sky Archipelago's generator. Likewise, layer_1’s Larion/WWOO setup should remain separate. Via Romana's road-travel design is a poor starting match for islands and air transport. Alex's Caves, Cataclysm, broad biome packs, and layers of ground structures need resource/placement/progression justification, rather than inheriting them wholesale. The old Embeddium/Oculus pair is superseded here by the supplied Sodium/Iris setup.

## Candidate order

| Candidate | Priority | Why | Compatibility/design gate | Observed 1.21.1 NeoForge version |
|---|---|---|---|---|
| [AppleSkin](https://modrinth.com/project/EsAfCjCV) | First batch | Food/saturation feedback for provisioning trips | Low overlap; UI only | 3.0.9+mc1.21 (release) |
| [Farmer's Delight](https://modrinth.com/project/R2OftAxM) | First batch | Island farming and cooking; provisions for travel and automation | Use native NeoForge Farmer’s Delight, not layer_1’s Fabric Refabricated port; verify wild-crop/seed availability | 1.21.1-1.3.4 (release) |
| [Spyglass Improvements](https://modrinth.com/project/Z6ykjRlM) | First batch | Spot landing sites and distant vessels with an actual item | Avoid a competing free-zoom binding; check existing controls | 1.5.7+mc1.21+neoforge (release) |
| [Exposure](https://modrinth.com/project/hB899VmG) | First batch | Photography gives exploration and expedition journals a purpose | Test photos from moving ships; not an assumed Sable compatibility guarantee | 1.9.19 (release) |
| [Create: Structures Arise](https://modrinth.com/project/9enMEvoc) | Worldgen trial | Create-themed destinations, including an airship ID already named by Sky Archipelago’s compatibility whitelist | Whitelist is not proof of generated placements; inspect grounding, frequency, loot and salvaged machines | 176.49.49 (release) |
| [Bountiful](https://modrinth.com/project/BpwWFOVM) | Progression trial | Production and delivery objectives can give island factories a reason to exist | Requires Kambrik; test village/board access; tailor bounties to obtainable island resources and do not assume modded objectives are automatic | 8.0.0-beta.2 (beta) |
| [Lootr](https://modrinth.com/project/EltpO5cN) | Multiplayer trial | Separate player loot reduces competition over limited island structures | Check container behavior before moving loot chests onto Sable ships | 1.21.1-1.11.38.127 (release) |
| [Supplementaries](https://modrinth.com/project/fFEIiSDQ) | Later, selective | Useful small building/logistics devices and atmospheric utility | Already many decorative mods; Moonlight dependency and overlapping ropes/utility need review | 1.21.1-4.0.2 (release) |
| [Subtle Effects](https://modrinth.com/project/4q8UOK1d) | Later, visual | Selective ambient particles around factories and exploration | Measure particle/render cost with Sable and existing shaders; avoid copying the whole layer_1 effects stack | 1.15.1 (release) |
| [Sound Physics Remastered](https://modrinth.com/project/qyVF9oeo) | Later, audio | Spatial audio for enclosed cabins | Moving ship interiors may not occlude as static blocks do; test on ships, newest listed build is alpha | neoforge-1.21.1-1.5.1 (alpha) |
| [Inventory Profiles Next](https://modrinth.com/project/O7RBXm3n) | Optional QoL | Inventory management for building projects | Test custom Create/Accessories/backpack screens and overlapping hotkeys | neoforge-1.21.1-2.2.5 (release) |
| [Create: New Age](https://modrinth.com/project/FTeXqI9v) | Defer | Another power/electricity progression branch | Overlaps existing Power Grid and transmission addons; adds systems without fixing a demonstrated gap | 1.2.0+mc1.21.1 (release) |
| [Sophisticated Backpacks](https://modrinth.com/project/TyCTlI4b) | Defer | Alternative portable storage system | Traveler’s Backpack already installed; choose one rather than duplicate | 1.21.1-3.26.12.2208 (release) |
| [Carry On](https://modrinth.com/project/joEfVgkn) | Defer | Move blocks/entities by hand | Test moving Create machinery, inventories and Sable blocks; potential progression shortcuts | 2.2.6 (release) |
| [Waystones](https://modrinth.com/project/LOpKHB2A) | Defer | Teleportation network | Can bypass the reason to build airships and shipping routes | 21.1.46+neoforge-1.21.1 (release) |
| [Void Totem](https://modrinth.com/project/vVZphdR0) | Design decision | Potential recovery from falls | Choose failure/recovery rules after testing ship failures; query result project is not assumed identical to layer_1’s Void Totem | 3+mod (release) |

## Before adding more content

1. Pick a world preset deliberately. The imported common settings and saved `eee` preset are very different; the source local save is ordinary Overworld terrain. Confirm whether the friend’s external server uses `eee`, another preset, or dedicated TOML values.
2. Test survival access to iron, copper, zinc, redstone, fuel, water/lava, crops, animals and the first flight components. Sky islands can make otherwise normal recipes inaccessible. Do not add more progression before checking this route.
3. Confirm structures fit islands and that villages/strongholds and Nether/End access are viable. Check exploration loot for early machinery that bypasses production.
4. Test assembled ships with storage, ropes, native Power Grid solving, cannon recoil, collisions, chunk boundaries and save/reload. Mod metadata cannot establish these interactions.
5. Repair the imported Euphoria/Complementary mismatch and investigate the clean-default Mac native crash before adding more renderer mods. Distant Horizons rendering and shaders are disabled in the friend’s active configs.
6. Keep JEI alongside EMI until testing confirms it can be removed: EMI can consume recipe integrations supplied through JEI. Their coexistence is not automatically a duplicate UI mistake.
7. Connector + Forgified Fabric API are used by the supplied cross-loader mapping stack (Hoofprint/Surveyor/McQoy). Do not remove them just because the pack is NeoForge.

The first deliberately small addition batch I would choose is **Farmer’s Delight + AppleSkin + Spyglass Improvements + Exposure**. Then evaluate **Structures Arise + Bountiful** against real sky-world generation and resource access.
