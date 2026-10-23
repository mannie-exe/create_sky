# Create Sky v0.1.9

Unreleased pack update. Minecraft **1.21.1**, NeoForge **21.1.264** and Java **21**
remain pinned.

## Floating settlements

- Add Sky Village Neighbors 0.1.0 to filter Sky Villages beside island terrain
- Require a 64-block minimum terrain gap, a sampled host within 512 blocks and a
  native host radius of at least 96; expose these settings in the common config
- Retain village height, buildings, loot, candidate spacing and biome eligibility
- Update the Atlas's generation notes and configuration register

Existing villages are unchanged. The new rule applies to future structure starts
and reduces how many candidates survive; it does not guarantee a village count
per cluster. Restart the server/world after configuration changes.

## Client maintenance

Update DH Polygon Fix from 1.0.1 to 1.0.2. The native query fix is unchanged; this
release improves documentation and release checks. Distant Horizons stays pinned
to 3.3.3, and the patch remains client-only.

## Verification

The compatibility mod checked 48 native layouts across four seeds. Natural runs
examined 147 candidate chunks across three seeds and fully generated six villages.
Default-distance runs retained 14/49 and 8/49 starts. These samples do not establish
universal density, safe landing approaches or multiplayer progression balance.

The published mod binaries match the locally tested artifacts. Configuration,
journal, runtime snapshot and reference-export checks are recorded in the
maintainer documentation. Live instances and saves require a separate update.
