# Setup and maintenance

## Application tools

The workspace targets macOS/Linux and a Minecraft 1.21.1 NeoForge installation.
Use `.node-version` for Node and `package.json#packageManager` for pnpm. `mise.toml`
pins the local Node/Python environment; Python 3.11 or later is needed by the
scripts. Java 21 must include both `java` and `javac` for runtime capture.

```sh
pnpm install --frozen-lockfile
pnpm setup:python
```

`setup:python` creates `.cache/python` and installs the pinned NumPy requirement.
It is needed for world sampling and Python tests. With mise and pnpm already
available, `mise install` followed by `mise run setup` runs the equivalent setup.
Java and Minecraft instances are configured separately.

## Local paths

Defaults live in [`data/local.example.json`](../../data/local.example.json).
Create ignored `data/local.json` to override any subset. Paths support `~`;
relative paths resolve from the repository root.

| Key       | Expected input                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| `pack`    | Empack directory with `empack.lock`, materialized `pack/mods` and common overrides                         |
| `server`  | Installed server game directory with `mods`, `libraries`, accepted `eula.txt` and NeoForge `unix_args.txt` |
| `vanilla` | Minecraft 1.21.1 client JAR used for vanilla models and textures                                           |
| `java`    | Java 21 JDK `bin` directory                                                                                |

For example, a non-Prism installation can override just the client JAR:

```json
{
  "vanilla": "/path/to/minecraft-1.21.1-client.jar"
}
```

Keep installed server selections aligned with the pack before capturing additions
or removals. Build maintained pack resource JARs using the pack's own build guide.
The map does not install Minecraft, accept its EULA or synchronize play instances.

## First capture and refresh

```sh
pnpm data:refresh
pnpm data:check
pnpm dev
```

Open <http://127.0.0.1:4321>. `data:refresh` runs runtime capture, JAR extraction and
compilation in order. It requires Java 21 and the configured Minecraft inputs,
uses up to a 4 GiB Java heap, and allows ten minutes for the isolated server.
`data:check` exercises the current pack's recipe, loot, coverage and journal
assertions; it is intentionally specific to this pack.

The same refresh is available in Edit data. Do not run concurrent captures or
command-line compiles while the editor is saving. The plugin serializes its own
writes, but does not lock separate shell processes.

World sampling is optional and has its own timestamp:

```sh
pnpm data:world
pnpm data:compile
```

This reads existing Overworld chunks under the configured server's `world/`.
Without a survey, the map omits terrain-derived acquisition routes. Explicit
YAML gathering assumptions still apply. To inspect every stored chunk:

```sh
pnpm data:world --samples 0
pnpm data:compile
```

A full survey can take substantially longer. Changes detected while reading
regions are recorded; the result is not a consistent snapshot of a changing world.
No chunks are generated and no world or LOD files are written.

## Commands and checks

| Command             | Purpose and requirements                                                               |
| ------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`          | Loopback development server with local editing endpoints                               |
| `pnpm data:runtime` | Isolated game export; Java and installed server required                               |
| `pnpm data:extract` | Asset/resource extraction; completed runtime capture and its audit config/log required |
| `pnpm data:compile` | Rebuild browser projection from existing evidence and authored YAML                    |
| `pnpm data:check`   | Check the current generated pack snapshot                                              |
| `pnpm verify`       | Formatting, JavaScript tests, Astro/TypeScript checks and static build                 |
| `pnpm test:python`  | Path resolution and Anvil reader tests; Python setup required                          |
| `pnpm test:browser` | Browser integration tests; populated snapshot and Playwright browser required          |
| `pnpm preview`      | Serve an existing static `dist/` build without editing endpoints                       |

`pnpm build` runs type checks before building; `verify` invokes it once. CI runs
`verify` and the Python suite without Minecraft binaries or generated data.
A successful CI shell build does not verify a game snapshot.

Browser tests can use installed Chrome:

```sh
PLAYWRIGHT_CHANNEL=chrome pnpm test:browser
```

Alternatively, install Chromium with `pnpm exec playwright install chromium`,
then run `pnpm test:browser`. `mise run verify` combines app and Python checks;
browser and game-dependent checks remain explicit.

Browser tests start their own foreground dev server on port 4322 with
`--ignore-lock`. Keep that port free. The normal editor runs on port 4321;
tests do not reuse its potentially stale middleware. Restart a running normal
dev server after changing workspace middleware.

The [pack authoring editor](authoring.md) uses the configured pack's generator
and audit scripts. It requires no runtime export to edit journal source. After
changing `data/local.json`, reload source in the editor.

## Output and cleanup

| Location                                                               | Lifecycle                                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `data/authored/`, `tools/`, `scripts/`, `tests/`                       | Maintained source; retain                                                   |
| `data/generated/`                                                      | Ignored evidence and survey snapshots; retain while their claims are needed |
| `public/generated/`                                                    | Ignored browser JSON, textures and optional recipe export; rebuildable      |
| `.cache/audit-server`, `.cache/exporter-classes`, `.cache/runtime.log` | Disposable capture outputs; retain until extraction and diagnosis finish    |
| `.cache/python`                                                        | Local Python environment; recreate with `setup:python`                      |
| `dist`, `.astro`, `.wrangler`, `test-results`, `playwright-report`     | Build/tool/run outputs; disposable when not in use                          |

Do not hand-edit generated snapshots. Removing `public/generated` also removes
textures; `data:compile` alone cannot recreate those. Use a full refresh after
cleaning capture dependencies. Historical evidence receipts do not need another
copy in a root-level review report.

## Deployment preparation

The application is not deployed. `.github/workflows/deploy.yml` is manual and only
builds the empty application shell and runs Wrangler's dry run. `wrangler.toml`
configures static assets with no route, account or domain, and disables public
Workers and preview URLs. There are no editing endpoints in the static output.

A local build includes whatever is currently in `public/generated`, including
source records and extracted assets. Before any future publication, select the
snapshot and access policy and review asset rights and exposed source/config data.
`pnpm deploy` is an actual publication command; it is not part of setup or CI.

## Diagnosis

| Failure                                    | Check                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Empty map on fresh checkout                | Configure inputs and run `data:refresh`                                                |
| Vanilla client JAR missing                 | Set `vanilla` in `data/local.json`                                                     |
| Java compile or server startup failure     | JDK 21, installed NeoForge libraries, pack/server alignment and `.cache/runtime.log`   |
| Missing `complete.json`                    | Capture failed; resolve the log error and repeat refresh                               |
| Missing audit config/log during extraction | Run `data:refresh` to recreate its inputs                                              |
| World view has no survey                   | Run `data:world`, then `data:compile`                                                  |
| YAML revision conflict                     | Reload from disk and reapply the intended edit                                         |
| Recipe scenario rejected in game           | Inspect the target mod's codec; YAML validation cannot validate arbitrary game recipes |

[Data pipeline](data.md) owns implementation behavior and source limitations.
[Verification](verification.md) owns actual check results.

## Optional generation comparison

`pnpm data:runtime --worldgen` adds the maintained Sky Archipelago probe. It reads
only the configured server world's `level.dat`, decodes the seed and generator,
and compares native spacing, island descriptors and column profiles without
opening that world. The normal disposable flat audit server still runs. The
receipt stores a seed hash, not the playing seed. It compares the original
DYNAMIC 32 to 1500 configuration with its seed-equivalent CONSISTENT value.

This probe targets the installed Sky Archipelago 1.3.6 API, including a reflected
private method. Revalidate it after upgrades. It does not generate Sky Archipelago
chunks, validate structures, or replace a world survey. A normal capture without
`--worldgen` does not refresh this optional receipt; check its associated review
record before using it as current evidence.
