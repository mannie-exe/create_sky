# Pack authoring editor

Run `pnpm dev`, then open `/authoring` or select **Pack authoring** from the map.
The editor uses the `pack` path in `data/local.json`, with the example file as its
default. It requires the pack's `authoring/` sources and Python generator scripts.
Static builds do not provide filesystem editing or generation endpoints.

## Controls

**Journal** selects a locale and entry. Its form separates optional flavor,
left-hand requirements, description paragraphs and a disclaimer from the short
right-hand objective labels. The preview preserves that order. Character counts
help compare label lengths but do not predict Minecraft wrapping. Completion
rules are available beside the prose for checking quantities and item IDs.

**Save source** validates and saves the selected locale or JSON source file.
It does not generate native quests. **Generate Questlog files** acts on saved
source and lists which outputs differ. Installation into Minecraft and the
resource JAR build remain separate pack operations.

**Config audit** checks the pack's categorized register. Matching files can still
contain inherited settings that need review. Changed hashes need a Git diff and
an explanation before their baselines are accepted. The editor has no automatic
accept-all or restore action. Empty categories can document deferred review.

**Source JSON** edits existing mechanics, shared text, chapter properties and audit
records. New files and coordinated schema changes are currently filesystem work:
edit the related chapter and locale files together, validate, then reload. The
single-file save intentionally refuses an inconsistent set of locale/objective
IDs. It is not a complete multi-file staging editor.

Unsaved edits require confirmation before switching entries or views. Stale saves
fail without replacing either disk content or the form text. Reload discards the
local draft after confirmation; copy any needed text before reloading a conflict.
Save validation checks structure and references represented in the source, not
Minecraft registry validity or whether the prose matches the native condition.

## Implementation and ownership

`scripts/authoring.mjs` reads only an allowlisted set of existing files beneath
the configured pack's `authoring/` directory. It rejects source symlinks and path
traversal. A save stages the source set in a temporary directory, invokes the
pack validators, rechecks revisions and replaces the selected file. Temporary
validation data is removed afterward. Generation checks the source-set revision
and invokes the pack-owned generator. External editors are not locked; finish
their edits before generating, and use Git to review the complete result.

The middleware shares the existing loopback, host, same-origin, JSON-body and
serialized-write restrictions. No filesystem endpoint is included in a static
deployment. The editor does not use browser File System Access permissions,
maintain its own content database, or expose arbitrary filesystem paths.

The configured pack's `docs/development/authoring.md` owns the source schema,
generation commands and update reconciliation procedure.
`docs/development/journal-integrations.md` owns the EMI, JEI and Ponder research.
Atlas item textures, runtime extraction and recipe projections remain governed
by [the data pipeline](data.md); editing journal text does not refresh that snapshot.

## Remaining work

Only English content is authored. Locale files and generated translation keys
support additional languages, but language switching and panel layout still need
a game-client check. The editor supports existing files; locale creation,
multi-file draft staging and a diff/merge UI are future additions.

Most entries still need explanatory description paragraphs. Empty descriptions
are shown as unfinished content rather than padded with generic copy. Recipe and
Ponder actions require a client bridge and are not presented as working links.
