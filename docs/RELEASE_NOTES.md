# Create Sky v0.1.1

By **mannie-exe** and **TimdoesLive**.

A tooling and packaging update for the Create/Aeronautics sky-island pack.
Minecraft **1.21.1**, NeoForge **21.1.263**, Java **21**, and the mod selections
remain unchanged from v0.1.0.

- Build and release automation now uses **empack 0.7.1-beta**, including verified
  binary installation, exact profile selection, release-tag validation, and
  draft-first publication with checksums for normalized download filenames.
- Windows server scripts now retain console output and exit status. The bundled
  installer explains that files are already present; unattended runs can set
  `EMPACK_NO_PAUSE=1`.
- TimdoesLive is credited alongside mannie-exe in the project metadata, README,
  Prism export metadata, and an `AUTHORS.txt` included in every distribution.
- Prism retains its explicit 512–8192 MiB memory settings. The `eee` sky-island
  preset, server whitelist, and gameplay configuration are preserved.

Import the Prism ZIP into Prism Launcher, or import the `.mrpack` into a compatible
launcher. For servers, extract the server ZIP, review the EULA, use the generated
launcher with Java 21, and whitelist your players. Back up existing worlds before
replacing an installation; retain the Sky Archipelago preset/config files.

The distributions include SHA-256 checksums. Published filenames now use hyphens
instead of spaces. This patch does not resolve the previously documented mod issues
or expand gameplay validation: moving ships, dedicated-server gameplay, and shader
rendering remain unverified. See `docs/UPDATE_REVIEW.md` for those limits.
