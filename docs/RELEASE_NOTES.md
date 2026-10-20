# Create Sky v0.1.3

By **mannie-exe** and **TimdoesLive**.

Adds [DH Polygon Fix 1.0.0](https://github.com/mannie-exe/dh-polygon-fix/releases/tag/v1.0.0)
to clients. This backports Distant Horizons !126, replacing an undersized native
`GL_POLYGON_MODE` query that can corrupt memory and cause a delayed JVM crash.
The issue was reproduced on Apple OpenGL and Linux/Mesa.

The original DH 3.3.3 JAR remains installed. Its interfaces used by Separate Sable
Render Distance are preserved. The fix is appropriate across client platforms;
the dedicated server does not need it. Remove the patch before upgrading DH.

For an existing 0.1.2 client, add only
`dh-polygon-fix-1.0.0-mc1.21.1-neoforge.jar` from the linked release to `mods`.
No server mod change, world conversion, cache reset, or configuration change is
required for this update. Earlier SeedGen migration instructions remain in
[compatibility notes](https://github.com/mannie-exe/create_sky/blob/main/docs/COMPATIBILITY.md).

Validation includes Linux/Windows/macOS builds, real Mixin transformation tests,
10,000 native query/restore cycles on Apple M4 Pro and Linux/Mesa, and an isolated
full-pack client/server smoke test with DH rendering and dimension transitions.
Prolonged sky-island, spyglass-zoom, and moving-ship playtesting remains necessary.
