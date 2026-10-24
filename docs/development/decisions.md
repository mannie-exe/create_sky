# Pack decisions

This index records accepted direction and its consequences. Owning guides contain
current settings and verification limits; Git history and archived release notes
retain superseded implementations and release details.

## Identity and progression

Create Sky centers on islands, Create production and Aeronautics transport.
Skyweave remains the separate civilization mod. Automated Logistics is deferred
because that future system should own route/service authority. Earlier technologies
need repeated uses and natural resource constraints, not compulsory recipe gates.
The [progression guide](progression.md) traces current routes and unresolved overlaps.

Questlog provides an optional, bookless journal with game-detectable conditions.
Mechanics are grouped by chapter; prose is grouped by locale, with shared disclaimer
keys and independent short objective labels. The [authoring guide](authoring.md)
owns the schema and generation procedure. No journal rewards impose a progression gate.

Elytra retain vanilla flight. Do a Barrel Roll was removed after reported movement
and rotation jitter; the cause remains unresolved, and ordinary banking/smoothing
does not explain the reported fault. Aileron is deferred: heat-assisted routes and
rechargeable boosts remain useful ideas, but adopting its implementation would
require compatibility and correctness work beyond the current scope. Reliable
Gliders retains its existing heat updrafts.

## Geography and settlements

The 2026-10-21 spacing review selected CONSISTENT 1494 over DYNAMIC's seed-wide
32 to 1500 range. The original seed's native layout matched at 1494; other seeds
retain location/shape variation without changing that spacing scale. This is a
pack policy, not a claim that DYNAMIC is defective. See [world generation](worldgen.md).

Sky Villages was selected over Create: Sky Village. Sky Village Neighbors places
floating settlements around sampled archipelago terrain, rather than directly on
islands or anywhere in the void. Foundation ore/crop rules reduce easily stripped
wealth while retaining useful settlement supplies. Placement and resource evidence,
including known sampling limits, live in [structures](structures.md).

## Rendering

SeedGen is excluded because its vanilla noise reconstruction disagrees with island
terrain. DH rendering is enabled after owner playtesting; shaders remain optional.
That default is not a cross-platform performance benchmark.

DH Polygon Fix retains the two-integer native polygon query required by DH 3.3.3.
The 1.0.1 validation included 10,000 Apple GL query/restore cycles and cross-platform
CI with Linux/Mesa testing; 1.0.2 retains that runtime implementation.
[Published patch checks](https://github.com/mannie-exe/dh-polygon-fix/actions/runs/39382246888)
and [compatibility](compatibility.md#dh-polygon-fix) bound the claim.

Shader presets reduce reflection sampler pressure and shadow distance. Measured
pipeline counts are in [shader verification](compatibility.md#shader-verification);
no fixed-scene FPS improvement or universal GPU compatibility is claimed.

Resource choices favor vanilla materials and narrow model changes over full reskins.
Icons was rejected for visual clutter. Reviewed overlaps use explicit pack priority
and small pinned model patches; [resource interactions](compatibility.md#resource-interactions)
and the Atlas retain evidence and outstanding comparisons.

## Distribution and preservation

Reference profiles are the default. Dependencies remain external references;
authored configuration and maintained patches are built from source. Publishing
requires separate authorization, a versioned tag and verified release assets.
Editable launcher/config defaults use seed policies so updates retain player data.
The [build guide](build.md) owns procedures and the Unix terminal workaround.

Published v0.1.9 is tag `30f2bbb`. Its [pack validation](https://github.com/mannie-exe/create_sky/actions/runs/39935326647),
[web validation](https://github.com/mannie-exe/create_sky/actions/runs/39935326686)
and [release checks](https://github.com/mannie-exe/create_sky/actions/runs/39935330480)
passed; downloaded assets matched checksums and tested exports. See [archived notes](../releases/0.1.9.md) for that release.

## Create Sky 0.1.10 verification

Published [v0.1.10](https://github.com/mannie-exe/create_sky/releases/tag/v0.1.10)
is tag `95e97e9`, with the exact Minecraft/NeoForge pins unchanged. Root tests (26), web Node tests (32), web Python
tests (9), browser checks (19), formatting, Astro diagnostics and the static build
pass. The configuration audit covers 228 files with no drift or unregistered files.
The isolated native capture completed on 2026-10-24 after client/server sync; the
playing world was never mounted. All three reference exports passed archive checks.

The final visual patch adds attribution to the previously tested models and
animations without changing their rendered resources. Placed-model and local
Lootr checks are documented in [web verification](web/verification.md); moving
contraptions, multiplayer and other shader combinations remain unverified.
The local update preserved player settings, access lists, saves and LODs.
See [release notes](../RELEASE_NOTES.md) and [build commands](build.md#local-builds).

[Pack validation](https://github.com/mannie-exe/create_sky/actions/runs/40079138434),
[web validation](https://github.com/mannie-exe/create_sky/actions/runs/40079138444)
and [release checks](https://github.com/mannie-exe/create_sky/actions/runs/40079139765)
passed. All three downloaded release assets match `SHA256SUMS`; published client
and server release recipes match the installed instances exactly. The published
Prism and Modrinth payloads contain the verified visual patch and attribution.
