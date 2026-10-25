# Create Sky 0.1.14

## Islands

Update Create Sky Compat to 0.4.0. Cluster cells are now 2400 blocks apart, with
unchanged 90-block jitter and 0.85 activation. Nominal horizontal island sizes
and companion orbits remain unchanged. Complete terrain supports retain at least
354 blocks of clearance; sampled shore crossings ranged roughly 850 to 2600 blocks.

Main islands select total-height targets of 250 to 400 blocks. Each selected depth
sets its safe placement within the requested Y200 to 490 band. A continuous curved
underside replaces the density jump responsible for sliced-looking bottoms.
Geology follows each island's body; native ore counts and recipes are unchanged.
The fresh-world fallback checks actual generated support before setting spawn.

## Configuration and Atlas

Geometry remains in `config/create_sky_compat-generation.json`. Height-range and
taper fields replace the fixed cliff field. Install matching config on both sides.
The Atlas distinguishes target/realized height and support/shore gaps, with fresh
isolated resource samples. Imported 64-bit seeds retain exact values.

## World compatibility and verification

This modifies `create_sky_compat:islands_v1` in place and requires a fresh world.
Generation identity rejects incompatible chunks; it does not convert old saves.
Keep wanted saves with their original pack. Ordinary Sky Archipelago, Nether,
End, physics and rendering are unchanged by this pass.

Full/minimal generation and reopening, five-seed density checks, two-seed resource
samples, village endpoints and bounded DH pregen passed. Visual checks showed
curved crescent/bowl undersides. Sampled main-island heights were 247 to 395 blocks.
Survival mining access, travel budgets and complete deliveries remain playtest work.

## Verification record

Select Create Sky Compat 0.4.0, source `f7ac591`. Its Linux, Windows and macOS
checks and release passed. All downloaded assets matched both checksum manifests;
the binary is byte-identical to the native-tested artifact, SHA-256
`8b9d52d9eb07f05b0c2cb448bd927fd12152d9fafa8afd2aa00b47a4d1f8ec9f`.
The mod's verification guide owns five-seed density, six-anchor resource,
full/minimal reopening, village endpoint, spawn and visual/DH observations.
[World generation](development/worldgen.md) owns the selected geometry and gameplay limits.

The root 27 Python checks, journal generation check and 229-file configuration
audit passed. Both resource builders retained their prior outputs. Empack sync
resolved only Compat's release and destination changes, preserving Minecraft and
all other dependency pins. `manifest check` reports a current lock.

All three local reference exports passed archive integrity, version, geometry,
mod selection and visual-patch checks. Exactly one Compat 0.4.0 is present on
each side; Veil remains client-only and the obsolete neighbor mod is absent.
Server launch scripts retain the terminal helper and executable modes; the
server template supplies no seed. Atlas import/compile and application checks
passed; [web verification](development/web/verification.md) records their scope.

This release requires fresh terrain.
