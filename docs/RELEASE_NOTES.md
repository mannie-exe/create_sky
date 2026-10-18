# Create Sky v0.1.0

Initial sky-island and airship pack built around Create 6.0.10, Create Aeronautics 1.3.2 and Sky Archipelago 1.3.6. Requires Minecraft 1.21.1, NeoForge 21.1.263 and Java 21.

- New worlds default to Sky Islands with the `eee` preset; dedicated-server terrain settings match.
- Includes Lootr, AppleSkin, Carry On, Spyglass Improvements, Exposure and Sound Physics Remastered.
- Complementary 5.9.3 and Euphoria 1.10.5 are aligned; obsolete shader output removed. Shaders and Distant Horizons rendering remain off by default.
- Carry On excludes Lootr containers and Aeronautics/Sable objects. Server whitelist enabled.
- Includes a bundled Prism instance, Modrinth pack and prepared server archive, plus SHA-256 checksums.

Import the Prism ZIP directly into Prism Launcher, or import the `.mrpack` into a compatible launcher. For servers, extract the server ZIP, review the EULA, use its generated launcher with Java 21 and whitelist your players.

This is an initial playtesting release. Archive builds and client title-screen startup were checked; new-world entry, moving ships, server gameplay and shader rendering are not yet verified. Sound Physics is an upstream alpha build. Known inherited issues include Analog Audio’s Create movement integration and empty Create Radars models; neither prevented startup. See `docs/UPDATE_REVIEW.md` for details and the earlier macOS native-crash observation.
