# Compatibility and configuration

Create Sky targets Minecraft 1.21.1, NeoForge 21.1.263 and Java 21. Exact mod
versions are listed in [MODLIST.md](MODLIST.md). These settings apply to new exports;
updating an existing installation requires removing obsolete mods and retaining
its worlds and world-generation configuration.

## Sky islands and Distant Horizons

Sky Archipelago uses its own island generator. Distant Horizons must generate
LODs from that generator's chunks. The pack selects `CHUNKS_ONLY` with
`INTERNAL_SERVER`, four worker threads and a runtime ratio of 1.0. To recalculate
the LOW_IMPACT thread count for another server, run:

```text
/dh config common.threadPreset LOW_IMPACT
```

The thread preset is persisted as numeric settings. Four threads match the
14-processor reference host. The pack omits `serverId` so DH can create an
installation-specific identifier. Distant Horizons rendering and Iris shaders
remain disabled by default; enable rendering locally when wanted. For floating
islands, disabling DH cave culling can help preserve low-altitude island geometry.

SeedGen is incompatible with this Sky Archipelago generator and is not included.
When upgrading from 0.1.1, remove its JAR and `config/seedgen.json` on both sides.
With the game and server stopped, back up and remove affected DH `.sqlite` caches
(and any adjacent `-wal`/`-shm` files) if incorrect far terrain persists. DH can
rebuild its LODs; do not delete world region, entity, POI or player files.
This release does not automatically clear caches in existing installations.

## World settings and interactions

Keep the `eee` preset and Sky Archipelago configuration with the world. Dedicated
servers use the common TOML; single-player uses the selected default preset.
Changing these settings may change newly generated chunks. The preset does not
convert vanilla worlds. RANDOM island sizing is active; saved SPECIFIC size bands
only take effect if that mode is selected.

Carry On excludes Lootr containers and Aeronautics/Sable objects. Its generated
Create/Copycats exclusions remain in place. Test carried entities and ship storage
before relying on them in survival. Lootr supplies personal loot; it adds no
structures. Spyglass Improvements and Sound Physics are client-only. AppleSkin is
available on both sides.

Complementary Unbound 5.9.3 matches Euphoria Patcher 1.10.5. Euphoria generates the
patched shader at launch. JEI remains alongside EMI for recipe integrations.
Connector and Forgified Fabric API support the Hoofprint/Surveyor/McQoy stack.
Nine URL-pinned dependencies require manual provider-version checks during updates.

## Known limitations

Analog Audio 0.1.5-hotfix.1 has logged `NoSuchMethodException` during Create movement
registration. Create Radars 0.4.9.4 has logged errors for empty model/blockstate
JSONs. These did not prevent the earlier title-screen and sky-world smoke test;
they remain unresolved. A separate clean-default run crashed in native Apple
Metal/IOGPU code without an identified mod cause.

Moving ships, survival progression, resource access, structure placement, shader
rendering, and acoustics inside moving ships need gameplay testing. Packaging
checks do not establish these behaviors. See [DECISIONS.md](DECISIONS.md) for dated
evidence and the limits of earlier tests.
