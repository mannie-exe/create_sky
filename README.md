# Create Sky

By **mannie-exe** and **TimdoesLive**.

Sky islands, airships and engineering, built around **Create 6.0.10**, **Create Aeronautics 1.3.2**, **Sable 2.0.6** and **Sky Archipelago 1.3.6**. Seeded from a friend’s Create sky-world pack; survival progression and ship interactions are still being playtested.

Minecraft **1.21.1** · NeoForge **21.1.263** · Java **21** · empack **0.7.1-beta**

## Play

Download a [release](https://github.com/mannie-exe/create_sky/releases). Import the `prism-bundled.zip` into Prism Launcher, or import the `.mrpack` into a compatible launcher. Prism is configured for up to 8 GiB of RAM.

New single-player worlds default to **Sky Islands** with the saved **eee** preset. The world-type button remains available if you deliberately want another generator. New dedicated worlds use the same terrain settings. Existing vanilla worlds are not converted. Keep the `eee` preset/config files with your worlds: this mod version can resolve stock saved generator settings through the current default preset at runtime.

The preset allows island radii 10–500, island-center Y −32–300 and dynamic spacing 32–1500, with no ocean layer and no islands over ocean biomes. Large gaps are intentional; early-game travel and resource availability need playtesting. RANDOM sizing remains the preset’s effective default; the saved size bands apply only when SPECIFIC sizing is chosen.

Complementary **5.9.3** now matches Euphoria Patcher **1.10.5**. Patched shader files are generated at launch. Shaders and Distant Horizons rendering remain disabled by default, matching the source pack’s rendering preference.

The first release also adds Lootr, AppleSkin, Carry On, Spyglass Improvements, Exposure and Sound Physics Remastered. See [release notes](docs/RELEASE_NOTES.md) for versions and validation limits.

## Server

Extract the `server-bundled.zip` and use its generated launcher with Java 21. Review and accept Minecraft’s EULA yourself. The whitelist is enabled: use `whitelist add <player>` from the console. New worlds use `sky_archipelago:sky_islands`; the common Sky Archipelago config mirrors `eee` because dedicated servers prioritize that config over the saved preset.

## Build and update

```sh
empack status
empack sync --materialize --yes
empack build --profile prism --profile modrinth --profile server --yes
```

Exact selections live in `empack.yml` and `empack.lock`; selected file roles and destinations live in `empack.bindings.yml`. Edit configs under `overrides/` and launch templates under `templates/`. Generated JARs, archives and local audit evidence are ignored by Git.

The remaining nine URL-pinned dependencies work around provider metadata conflicts involving exact old pins, Connector/Forgified Fabric API and client-only dependencies. They need explicit provider-version checks when updating; `empack outdated` alone does not cover them. Do not replace them blindly with provider roots or downgrade their runtime dependencies to satisfy stale metadata.

CI builds all three distributions from the recorded lock. A `v*` tag must match the author version and triggers a GitHub release containing all three archives and SHA-256 checksums. CI uses the 0.7.1 helper, verified empack Linux binary and pinned GitHub Actions revisions. It stages only the selected outputs, hashes their normalized filenames, and publishes the draft only after uploads succeed. See [automation maintenance](docs/AUTOMATION.md).

## Development notes

- [Current update and compatibility review](docs/UPDATE_REVIEW.md)
- [Initial config comparison](docs/CONFIG_REVIEW.md) — historical import baseline
- [Potential future additions](docs/ADDITIONS.md)
- [Import history](docs/IMPORT.md)

Raw local audit JSON, config snapshots and logs are kept outside the published Git history. Mod and shader authors retain their respective licenses; this repository does not relicense their work. No user worlds, accounts or server lists are distributed.
