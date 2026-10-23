# Create Sky v0.1.7

Minecraft **1.21.1**, NeoForge **21.1.264**, Java **21** and all mod selections
remain unchanged from 0.1.6. This release fixes reference-installation launch failures.

## Fixes

- Prism can rewrite its instance icon without causing empack's pre-launch
  `ModifiedManagedFile` error. The icon is now an editable installation default.
- Unix server launchers transfer terminal control to Java, preventing the console
  from suspending at `Generating keypair`. Preparation and empack's runtime guard
  remain enabled. This is a packaging workaround for empack 0.8.2-beta.

## Installation

- Import `Create-Sky-0.1.7.mrpack` in a Modrinth-compatible launcher, or
  `Create-Sky-0.1.7-prism-references.zip` in Prism.
- Extract `Create-Sky-0.1.7-server-references.zip` for a dedicated server.
- Prism and server reference installs require **empack 0.8.2-beta** on `PATH`.
  Unix server launchers additionally require **Python 3** while the workaround
  is present. Windows launch scripts are unchanged and do not need Python.

Retain the complete archive, including `foreground-runtime.py`. On macOS/Linux,
run `start.sh` as before. Select Java 21 through `JAVA_HOME` or `PATH`.

Stop existing instances before updating. Preserve worlds, LODs, player data,
server properties, access lists and local configuration. No regeneration is needed.
For installations with local startup-script edits, retain the matching runtime
helper and launch integration rather than keeping the affected 0.1.6 script.

## Verification

Packaging checks reject unexpected launcher contents and preserve the release
recipe, assets, Windows scripts and all game files. The workaround is applied
before release checksums are generated. Fresh installations and interactive
terminal startup/input/shutdown checks are recorded in the compatibility guide.
This does not establish graphical client or survival-progression coverage.

See [player guides](https://github.com/mannie-exe/create_sky/blob/v0.1.7/docs/README.md)
and [0.1.6 content changes](https://github.com/mannie-exe/create_sky/blob/v0.1.7/docs/releases/0.1.6.md).
