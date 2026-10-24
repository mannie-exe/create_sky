# Model authoring

Open `/model-authoring` from **Pack authoring** while running `pnpm dev`.
Select a recipe on the left, edit its fields, and inspect the texture and model
below. Drafts remain in memory when switching recipes. **Save recipes** validates
and writes the recipe document; **Generate resource pack** builds the saved,
enabled recipes into `Create Sky Resource Patches.zip`. Installation is separate.

**Recipe JSON** keeps unapplied text separately for each recipe, including invalid
or incomplete JSON. Apply it to validate and update the draft, or use **Discard
JSON edits** to restore the current form values. That recipe's form controls are
disabled while its JSON is being edited. Saving and generation wait until all
JSON drafts are applied or discarded. Reloading or leaving with unsaved work
requires confirmation.

## Sources and output

`authoring/model-recipes.json` owns model IDs, input bindings, extrusion settings,
fitting edits and inclusion switches. `authoring/resource-patches.json` owns exact
archive versions, hashes and acquisition URLs. Add new input sources there after
reviewing their selected empack versions and active resource overlays.

The editor reads materialized inputs only. Run the pack's normal materialization
procedure before opening recipes with missing archives. A changed input hash or
provider selection stops generation; it does not silently accept new geometry.
Recipes refer to explicit archive assets, not an inferred live resource-pack
order. A higher-priority texture replacement must be selected as the recipe's
input and reviewed before using its silhouette.

Disabled recipes remain editable and previewable, but emit no model override.
Each output resource ID has one owner, including disabled recipes. Output models
reuse the original texture IDs, so animation metadata and other models sharing
those textures remain untouched. Keep the generated patch above its input packs.

## Extrusion

Each plane selects a texture, UV crop, axis, center and rectangular bounds. The
recipe sets depth and an alpha threshold. UV coordinates run from 0 to 16 and
must align with source pixels; model coordinates use Minecraft's block units.
Individual planes may bind different textures, such as Deco's post and side.
X/Z planes use horizontal/vertical bounds; Y planes use X/Z bounds. The axis
selector and labels follow that distinction.

Recipe JSON exposes optional `key` and `rotation` fields on a plane, plus a `base`
with an explicit model, retained element indices and texture bindings. These keep
lamp bodies and child texture variables while replacing only cage or hood surfaces.
Fitting edits also accept element rotations. Inspect the pinned template before
changing indices or bindings; the ordinary form preserves these JSON fields.

Opaque pixels become a mask. The generator merges adjacent occupied regions into
rectangles for the front and back surfaces, then emits only the exposed perimeter.
Concave holes retain their boundaries; internal faces are omitted. Perimeter UVs
sample the adjacent opaque texel strip across the depth. This is a deliberate edge
rule, not an inferred material or bevel. The recipe can restrict emitted face
directions to keep post ends separate from vertical surfaces.

The generator accepts bounded, non-interlaced RGBA8 and indexed PNGs. Vertical
animation frames must have identical thresholded masks. Unsupported encodings,
empty crops, excessive geometry, non-finite numbers and invalid resource paths
fail validation. Translucent surfaces and animated changes of silhouette need
different geometry rules.

Keep post, post-end, side and alternate-side outputs separate. Review all native
connection rotations, isolated posts, corners, crossings and stacked blocks.
Static model validity does not establish contraption rendering or performance.

## Artwork fitting

Select a fitting recipe, then an element and face. Edit UV bounds numerically or
drag a region in the texture view; set UV rotation separately. The highlighted
element identifies the affected geometry. Element bounds can also be adjusted.
**Reset element** removes that element's authored edits and reloads its pinned
template values.

Fitting recipes reference explicit template geometry. Changes use element indices
with name guards; updating the pinned template requires reviewing those bindings.
Edits apply only to the selected output model. They do not repaint the source
texture or globally replace the vanilla lantern templates.

For Macaw lanterns, assign metal regions to feet, frames and caps, and illuminated
regions to recessed windows. Covered lanterns need opaque lower window regions.
Review standing and hanging variants independently. Preserve the source's three
animation frames, and check whether repeated UV regions produce the intended
material on every face. If the artwork cannot supply a required region, author a
separate texture rather than stretching an unrelated region to disguise it.

## Preview and editing boundaries

The preview uses Three.js with nearest-neighbor textures, explicit Minecraft face
winding, UV rotation and element rotation. Drag to orbit, scroll to zoom, or use
**Reset view**. Wireframe exposes the emitted geometry. The texture selector shows
the first frame; the model advances through the texture's animation frames.

This is a model preview, not Minecraft's renderer. It does not reproduce shaders,
ambient occlusion, light levels, CTM, emissive extensions, animation interpolation,
item display transforms or moving contraptions. Compare the saved output in
Resource Review before selecting a new patch for play.

The loopback middleware shares the existing host/origin, body-size and serialized
operation restrictions. Saves validate through the Python generator and check a
revision covering both recipes and input pins. Stale or invalid saves leave disk
content unchanged. Source and temporary symlinks are rejected. Static deployments
have no authoring endpoints. Generation captures the recipes, pins and empack
documents, then checks them again before replacing the ZIP. If they changed,
generation stops and preserves the previous output. External editors are not
locked; finish their edits before generating and review the resulting diff.

## Implementation

| Responsibility                                       | Owner                               |
| ---------------------------------------------------- | ----------------------------------- |
| Archive selection and hash verification              | `scripts/resource_inputs.py`        |
| PNG decoding, masks, geometry and fitting validation | `scripts/model_authoring.py`        |
| Read-only editor bridge                              | `scripts/model-workbench.py`        |
| Deterministic combined resource pack                 | `scripts/build-resource-patches.py` |
| Local file revisions, saves and generation requests  | `web/scripts/model-authoring.mjs`   |
| Recipe controls and draft state                      | `web/src/lib/model-authoring.ts`    |
| Model-to-preview conversion and renderer lifecycle   | `web/src/lib/model-preview.ts`      |

Use `python3 scripts/model-workbench.py --validate` to validate saved recipes
without publishing. `--stdin` validates or previews an unsaved JSON document.
Run `python3 scripts/build-resource-patches.py --check` to check existing output,
or omit `--check` to generate it. The owning [patch guide](../patches.md) covers
dependency updates and the separate Lootr/Fresh Objects renderer integration.
