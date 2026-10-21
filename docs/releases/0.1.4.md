# Create Sky v0.1.4

By **mannie-exe** and **TimdoesLive**.

Distant Horizons rendering is now enabled by default in new client installations.
The LOD radius remains 256 chunks. Shaders remain opt-in, and cave culling retains
its previous default. No mods, shader versions, or world-generation settings changed.
DH 3.3.3 and the client-only DH Polygon Fix 1.0.1 remain included.

Documentation now separates player setup, graphics and hosting guides from
maintainer build instructions, compatibility constraints and historical evidence.
The graphics guide covers missing LODs and the Complementary/Euphoria texture-unit
error. Existing documentation entry points still lead to the reorganized guides.

For an existing client, enable DH rendering in its settings or, with the client
stopped, set `rendererMode = "DEFAULT"` under `[client.advanced.debugging]` in
`config/DistantHorizons.toml`. Preserve personal settings and LOD caches. No server
mod update, world conversion, or cache reset is required.

This release packages the previously tested rendering default and documentation
refresh. Validation covers configuration, links, all three exports and unchanged
mod/shader payloads. It adds no new gameplay or performance claims.

See the [player guides](https://github.com/mannie-exe/create_sky/blob/v0.1.4/docs/README.md)
and [previous release notes](https://github.com/mannie-exe/create_sky/blob/v0.1.4/docs/releases/0.1.3.md).
