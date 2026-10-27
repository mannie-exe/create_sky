# Create Sky 0.1.15

## Mod updates

Minecraft remains 1.21.1 and NeoForge remains 21.1.264.

| Mod | Previous | Updated |
| --- | --- | --- |
| Create: Radars | 0.4.9.4 | 5.0.1 |
| JEI | 19.64.0.455 | 19.70.0.460 |
| ModernFix | 5.27.26 | 5.27.27 |
| Questlog | 3.4.1 | 3.5.0 |
| Reliable EMI | 4.7.12 | 4.8.0 |
| Sodium Extra | 0.9.4 | 0.9.5 |
| Sound Physics Remastered | 1.5.1 | 1.5.2 |
| Traveler's Backpack | 10.1.39 | 10.1.40 |

These include Radars monitor fixes, recipe-viewer improvements, Questlog fixes
and corrected sound attenuation. Traveler's Backpack adds controls for dropped
backpack despawning, fire and explosion resistance. Existing radar ranges are retained in the updated config schema. Repair Radars’
new jammer and warning-receiver recipes so their outputs and ingredients resolve.
Journal requirements and other pack recipes are unchanged. See
[included content](MODLIST.md) for exact artifacts.

Fzzy Config remains 0.7.7: the advertised fix1 NeoForge artifact has an unresolved
version placeholder and fails native loading. It is excluded from this update.

## Server webmap

Add BlueMap 5.7 on servers only. Clients receive neither the mod nor its configs.
The Overworld map includes all saved terrain without horizontal limits, including
pregenerated chunks, across the full island-world height range. One render worker
limits contention with gameplay and DH. Detailed views preserve shaded undersides;
distant tiles still have BlueMap's height-field limitations.

Fresh server owners must accept BlueMap's Minecraft-resource download in its core
config before rendering starts. The web server uses TCP 8100; public routing is
operator-managed. Existing BlueMap configuration is preserved. Owners of the early
bounded local setup should remove its X/Z map bounds explicitly. See
[server webmap setup](players/server.md#webmap).

## World compatibility

No world reset, seed change or LOD removal is required. Terrain settings and
Create Sky Compat remain unchanged. Stop instances before updating, retain their
worlds and local settings, then restart any pregeneration job with its original
center and radius.

## Verification

Pack checks pass, including resource generation and configuration auditing. An
isolated Java 21.0.13 / NeoForge 21.1.264 server exported 9,253 recipes, including
both repaired Radars recipes, and passed all 66 objective probes across 48 journal
entries. A separate client loaded the Resource Review world, displayed journal
details and opened a crafting recipe through EMI with JEI and Reliable EMI loaded.
This was a loading/UI check, not a complete gameplay or radar-system playtest.
