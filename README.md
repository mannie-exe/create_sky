# Create Skyweave Atlas

Internal item, recipe and progression map for the Create Sky modpack.

## Local development

Use the Node version in `.node-version` and pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:4321>. An existing local snapshot loads immediately; a fresh
checkout shows an empty shell until you [configure and capture game data](docs/development/setup.md).
The app binds loopback and is not deployed.

## Documentation

- [Documentation index](docs/README.md)
- [Map and editing guide](docs/usage.md)
- [Setup, refresh and checks](docs/development/setup.md)
- [Data pipeline, textures and recipe modeling](docs/development/data.md)
- [Verification and limits](docs/development/verification.md)

Astro serves a static page and browser code. A local development plugin provides
YAML editing and refresh commands. Minecraft runtime exports, JAR resources and
authored domains compile into ignored JSON and image files under `public/generated`.
Static builds support browsing; editing requires the local development server.

This is a private workspace. No distribution license is selected. Extracted game
assets retain their upstream licenses and are excluded from version control.
