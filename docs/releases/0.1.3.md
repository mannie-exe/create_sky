# Create Sky v0.1.3

By **mannie-exe** and **TimdoesLive**.

Includes [DH Polygon Fix 1.0.1](https://github.com/mannie-exe/dh-polygon-fix/releases/tag/v1.0.1)
on clients. This backports DH !126's two-integer polygon-mode query, preventing
an undersized native buffer write that can cause delayed JVM crashes. Version
1.0.1 uses the `design.inherent` namespace, adds injection-count regression
checks, and hardens CI credential handling. The runtime fix remains unchanged.
Keep the original DH 3.3.3 JAR; remove the patch when upgrading DH.

Adds **BSL 10.1.8** as a client-only shader alternative and balanced defaults for
BSL, Complementary Unbound **r5.9.3**, and Euphoria **1.10.5**:

- Complementary/Euphoria use Low block reflections to fit Iris's 14 available
  composite texture units on the tested macOS configuration.
- All three use 128-block shadow distance; Complementary variants also use
  Low light-shaft sampling. Clouds, water reflections, AO, bloom and
  anti-aliasing retain their stock HIGH behavior.
- Euphoria's existing fog and night-sky preferences remain. Patched shader
  files are generated at launch. Shaders and DH rendering remain opt-in.
- Shader ZIPs and presets are excluded from server exports.

For existing installations, replace any `dh-polygon-fix-1.0.0-*.jar` with the
1.0.1 binary; never install both. Copy the three shader settings files and BSL
ZIP from the client export to receive the new defaults, saving personal shader
settings first if needed. No server mod change, world conversion, or cache
reset is required. Preserve existing worlds and world-generation settings.

Verification: the fix passes Mixin transformation, missing/duplicate target,
server exclusion, and native OpenGL tests. All nine shader/dimension pipeline
constructions passed on the M4 Pro (Overworld, Nether, End). These checks do not
establish frame-rate gains or complete gameplay/visual compatibility; those
remain playtesting tasks. See the [compatibility notes](https://github.com/mannie-exe/create_sky/blob/main/docs/COMPATIBILITY.md).
