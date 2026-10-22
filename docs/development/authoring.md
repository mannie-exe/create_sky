# Pack authoring

The pack owns journal source and the configuration register. The local Atlas app
edits those files; it does not own a second copy or install changes into Minecraft.

## Journal source

| Path | Content |
| --- | --- |
| `authoring/journal/chapters/*.json` | Native chapter properties and quest mechanics, split by chapter |
| `authoring/journal/defaults.json` | Shared native display properties |
| `authoring/journal/locales/<locale>.json` | Chapter names, entry text, shared disclaimers and short objective labels |
| `overrides/common/config/questlog/` | Generated native chapters and quests |
| `pack-fixes/assets/createsky/lang/` | Generated Minecraft language resources |

Each locale entry has `title`, optional `flavor`, full `requirements`, a
`description` paragraph array, a shared `disclaimer` key or null, and `labels`.
The description renders flavor, requirements, description paragraphs and
disclaimer in that order, separated by blank lines. Flavor is currently empty.
Descriptions normally contain one to five paragraphs of two or three sentences.
An empty array marks unfinished explanatory text and is allowed during authoring;
the editor counts those entries. Sentence counts are editorial guidance.

Each locale's `shared` object maps disclaimer keys to nonempty messages. Entries
reference those keys through `disclaimer`; they do not own copies of the text.
The existing `inventory` message serves 43 entries, while `delivery_interaction`
and `circuit_interaction` each serve one. Similar interaction messages stay
separate because they describe different completion checks.

The app's **Disclaimers** tab creates, edits and deletes these shared messages.
Keys use lowercase letters, numbers and underscores. The editor keeps existing
keys fixed and lists referring entries; reassign those entries before deletion.
The generator rejects invalid keys, blank messages and missing references, including
edits made through Source JSON or external tools. Messages and references belong
to the selected locale. Editing English does not rewrite another locale.

`requirements` here is prose in the **left-hand description**. It does not change
native Questlog's `requirements` array, which controls unlocking. `labels` owns
the short **right-hand objective labels**, indexed by stable objective positions
such as `0` and `0.1`. Full conditions and caveats belong in the left-hand text.
The preview shows section order, not Minecraft's exact font width or truncation.

Keep locale IDs aligned with Minecraft, for example `en_us` and `de_de`. English
is required. To add a locale, copy the English file, retain all chapter/entry IDs
and label positions, then translate its values. All authored locales must cover
the same IDs. The current content includes English only. The local editor edits
existing files; create new locales or chapter files in the filesystem, then reload.

Generated descriptions use JSON translation components to retain client-side
locale selection. Inline Markdown-like Questlog links are not parsed inside
these translated strings. Recipe/Ponder actions are not supported by the
generator. See [integration findings](journal-integrations.md) before adding them.

## Save, generate and build

The Atlas **Pack authoring** page edits source files on the configured local pack.
Save validates all journal source and register structure in a temporary directory
before replacing one source file. It refuses stale revisions and preserves the
editor's unsaved text on failure. Generation uses saved source only and checks
that its revision still matches. Neither action touches instances or worlds.

From the pack root:

```sh
python3 scripts/generate-journal.py --preview
python3 scripts/generate-journal.py
python3 scripts/generate-journal.py --check
python3 scripts/audit-changes.py
python3 -m unittest discover -s tests -v
python3 scripts/build-fixes.py
```

Generated JSON stays in Git for review. The resource JAR is rebuilt and ignored.
The build refuses stale journal output. Removed quest or locale outputs require
explicit deletion; generation never silently leaves an obsolete quest active.
Review quest IDs, objective order and existing progress before removing or
changing mechanics. The migration regression digest is tied to the pre-migration
revision; deliberate mechanics changes require a reviewed update to that fixture.

Install native quest JSON and the rebuilt resource JAR together during an explicit
instance update. Client translations require the JAR. A successful source build
does not verify language switching, game layout or quest progress in a client.

## Configuration register

`authoring/changes/*.json` separates client, shaders, worldgen, structures, recipes,
drops, journal and gameplay. Each record identifies an authored file, its accepted
SHA-256, review status, reason and owning reference. `baseline` records the initial
source revision. A matching hash establishes file equality, not gameplay validity
or equality with upstream defaults. `inherited` means individual settings still
need review; `reviewed` can cover a specific change within a larger inherited file.

The checker reports drift, missing files and files absent from the register.
It covers distributed client/common config, shader settings, client options,
resource recipes/tags/drops and the server properties template. Generated journal
files have their own semantic check. Dependency selection, live-instance settings,
worlds, LOD caches and private seeds are outside this register. Structure tuning
is deferred; the empty structures register states that explicitly.

The checker is read-only. It does not restore files, generate arbitrary mod
configuration, or accept new hashes automatically. Whole-file hashing is sensitive
to formatting; Git diffs and the owning document explain the actual setting change.

## Update reconciliation

1. Run the audit before an update and retain the Git revision being compared.
2. Compare changed mod defaults and schemas with the authored config. A matching
   pack hash cannot establish that an upgraded mod still recognizes a setting.
3. Edit the smallest relevant file. For a recipe, edit its maintained resource;
   for a quest, edit mechanics or locale source rather than generated JSON.
4. Update the owning rationale and register digest only after reviewing the diff.
   Keep unrelated inherited keys distinguishable from deliberate tuning.
5. Generate, run checks and inspect the resulting exports. Test affected behavior
   in an isolated instance when source checks cannot establish it.
6. Commit the source, generated journal files and rationale together. Schedule
   installation separately, preserving worlds and player progress.

This provides repeatable journal output and traceable config decisions. General
config generation, automatic upstream merges and an in-browser diff editor remain
outside the current implementation.
