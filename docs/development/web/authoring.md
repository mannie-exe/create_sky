# Pack authoring editor

Run `pnpm dev`, then open `/authoring` or select **Pack authoring** from the map.
The editor uses the `pack` path in `data/local.json`, with the example file as its
default. It requires the pack's `authoring/` sources and Python generator scripts.
Static builds do not provide filesystem editing or generation endpoints.

**Model authoring** opens the separate [model workbench](models.md) for texture
extrusion, lantern UV fitting and resource-pack generation.

## Controls

**Journal** selects a locale and presents a searchable entry list grouped by
chapter, using the pack's chapter and quest ordering. Select an entry on the left
to edit its fields on the right; the preview appears below the fields. On narrow
screens the list sits above the editor and scrolls independently. Search matches
titles, IDs and chapter names without changing the selected entry.

The form separates optional flavor,
left-hand requirements, description paragraphs and a disclaimer from the short
right-hand objective labels. The preview preserves that order. Character counts
help compare label lengths but do not predict Minecraft wrapping. Completion
rules are available beside the prose for checking quantities and item IDs.

**Disclaimers** manages the selected locale's shared messages. Search by key or
message, select a key on the left, and edit its message on the right. The preview
and referring entries appear below. Editing one message updates every entry that
references its key when Questlog files are regenerated.

Use **New disclaimer**, enter a unique key and message, then **Save source**.
Keys use lowercase letters, numbers and underscores. Existing keys are fixed;
to replace a key, create the replacement and reassign entries in **Journal**.
The journal's disclaimer selector shows both the key and message; **None** removes
the reference. **Delete disclaimer** stages deletion only when no entry in the
selected locale uses that key. Save to persist it. Other locales are independent.

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

Unsaved edits require confirmation before switching entries, disclaimers or views. Stale saves
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

[Pack authoring](../authoring.md) owns the source schema, generation commands
and update reconciliation procedure. [Journal integrations](../journal-integrations.md)
owns the EMI, JEI and Ponder research.
Atlas item textures, runtime extraction and recipe projections remain governed
by [the data pipeline](data.md); editing journal text does not refresh that snapshot.

## Limits

Only English content is authored. Locale files and generated translation keys
support additional languages, but language switching and panel layout still need
a game-client check. The editor supports existing files; locale creation,
multi-file draft staging and a diff/merge UI are future additions.

All 48 English entries have explanatory descriptions. Future entries with empty
descriptions are marked in the list and counted above it. Recipe and Ponder
actions require a client bridge and are not presented as working links.

## Output comparison

The pack-file comparison sits below the save/generate controls, before the entry
workbench. Expand it to inspect which outputs differ from saved source. Unsaved
drafts are explicitly excluded until saved. When nothing differs, the summary
states that pack files match saved source. Generation still uses the existing
revision check and named job; it does not build a release or sync instances.
