# Design tokens

Status: foundation partially implemented; visual candidates remain under review.
This document owns token meaning and composition rules. The shared stylesheet
owns active values. The tables describe the intended system, not a claim that
every proposed role has been adopted throughout the app.

The foundation extracts existing values into
[`tokens.css`](../../../web/src/styles/tokens.css), with direct semantic names used by all current pages. It preserves the current palette, 24px section spacing,
pixel-based layout dimensions and font stack. Body typography uses a shared role;
six additional text roles are adopted in item details, its recipe cards and survey
group headings through
[`typography.css`](../../../web/src/styles/typography.css). Page-title and reading
roles and new status colors remain proposals. Controls retain the selected quiet
treatment: light outlines, an embedded search field and no extra tint for an
active filter. Focus remains visibly distinct. `--line-control` and `--line-subtle`
share a reference value but remain separate roles.

Recipe material values live in `recipes.css`; minimap colors live in `minimap.css`.
The [renderer bridge](../../../web/src/lib/style-tokens.ts) resolves CSS colors to
sRGB for Canvas and Three.js. It reads batches on redraw/scene setup, not per point
or animation frame. Renderer setup still requires remounting for changes to an
existing Three.js scene; there is no live theme switcher. World map labels read the code text role from computed CSS. The survey canvas
is transparent; unknown-region and origin colors are scoped to that canvas. The
ore profile owns its data mark independently of action color. The continuous
heat-scale formula remains a domain calculation rather than an interaction token.

## Intent

Atlas combines a dense catalog, recipes, progression graphs, world surveys,
resource comparisons and editing tools. Its interface must distinguish game
content, evidence, interpretation and actions without making each distinction
another box. Shared tokens should make those relationships consistent while
leaving room for character in artwork, composition and occasional captions.

Tokens cannot decide which information deserves attention. Layout review still
determines the primary task, reading order, grouping and emphasis. A mathematically
consistent spacing scale can produce a poor composition.

## Reference decisions

Apple's [color](https://developer.apple.com/design/human-interface-guidelines/color)
guidance supports stable meanings and alternatives to color-only communication.
Its [typography](https://developer.apple.com/design/human-interface-guidelines/typography)
guidance emphasizes legibility and adapting layouts to text size. Its
[layout](https://developer.apple.com/design/human-interface-guidelines/layout)
guidance supports alignment, grouping and separating controls from content.
Atlas adopts those principles, not Apple platform dimensions or Liquid Glass.

Material's [token model](https://m3.material.io/foundations/design-tokens/overview)
separates reference values, system roles and component assignments. Its
[color roles](https://m3.material.io/styles/color/roles) pair foregrounds with
backgrounds and distinguish important outlines from decorative separators.
Its [typography model](https://material-web.dev/theming/typography/) describes
styles through family, size, weight and leading. Atlas uses a smaller set of
roles tailored to its content, not Material components or its full type scale.

Local references inspected on 2026-10-28:

| Reference                                                                             | Useful direction                                                                                         | What Atlas should avoid copying                                                                                                              |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `cfgate/cfgate.io/src/styles/tokens.css`, revision `954a1ed`                          | Paired ink/surface roles, small spacing base, control sizing and motion                                  | Dark marketing-page proportions; fixed light card colors without a complete surface context                                                  |
| `inherent.design/inherent.design/apps/site/src/styles/tokens.css`, revision `c9ef39a` | Derived tint, outlines and shadows; named text and container roles; separately owned illustration values | Hero-scale spacing and typography; coupling all shape changes to spacing; illustration-specific constants in the application-wide vocabulary |

These are directional references. Their global styles still contain individual
colors and measurements, so neither is a complete conformance template. Atlas
does not need their brand package as a runtime dependency.

## Layers and ownership

| Layer     | Purpose                                                 | Example                                                 | Owner                         |
| --------- | ------------------------------------------------------- | ------------------------------------------------------- | ----------------------------- |
| Reference | Literal design inputs with no UI meaning                | `--ref-color-blue: #285de0`                             | Shared token stylesheet       |
| Semantic  | A stable purpose, mapped to references or other roles   | `--color-action: var(--ref-color-blue)`                 | Shared token stylesheet       |
| Component | A reusable component's explicit interpretation of roles | `--recipe-surface: var(--surface-inset)`                | Recipe stylesheet             |
| Instance  | Content or layout facts, not a theme                    | Recipe column count, graph position, image aspect ratio | Data/component implementation |

Use ordinary CSS custom properties. A token compiler, theme service or duplicate
JSON registry is unnecessary for the current Astro/React application. Active
ownership is `web/src/styles/tokens.css`, imported once by `base.css`.
Component styles remain in their existing domain files.

Reference names begin `--ref-`. Semantic names describe the property and role:
`--surface-inset`, `--ink-muted`, `--space-section`, `--radius-panel`.
Component names include their owner: `--recipe-slot-size`, `--graph-edge-required`.
Avoid value names such as `--blue-button`, screen names such as `--glider-padding`,
and synonyms for the same role.

Components ordinarily consume semantic tokens. A component may own literal
geometry or game-material values when those are genuinely local. Do not create
three aliases merely to conceal a one-off number. Different meanings may share
one value; equal values alone are not a reason to merge their tokens.

For each maintained role, record its purpose, default/reference, valid contexts
and exceptions here. Add a new role when meaning or independent adjustment
requires it, not whenever a new selector appears.

## Reference inputs

These values preserve the broad light palette while making currently implicit
choices explicit. They are deliberately a small palette, not a complete tonal
color generator. Status colors are new candidates.

| Reference token         | Candidate value                                  | Purpose as an input                              |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `--ref-color-white`     | `#ffffff`                                        | Light neutral endpoint                           |
| `--ref-color-mist`      | `#f7f9fd`                                        | Light background                                 |
| `--ref-color-navy`      | `#17233b`                                        | Dark neutral endpoint                            |
| `--ref-color-slate`     | `#64718a`                                        | Secondary text and visible outlines              |
| `--ref-color-rule`      | `#dce3ef`                                        | Quiet separators                                 |
| `--ref-color-blue`      | `#285de0`                                        | Action and focus seed                            |
| `--ref-color-blue-deep` | `#1f4ec1`                                        | Hovered action seed                              |
| `--ref-color-blue-pale` | `#edf2fc`                                        | Selected-content seed                            |
| `--ref-color-green`     | `#246541`                                        | Successful-operation seed                        |
| `--ref-color-amber`     | `#805300`                                        | Caution seed                                     |
| `--ref-color-red`       | `#b3261e`                                        | Error/destructive-operation seed                 |
| `--ref-space-unit`      | `0.25rem`                                        | Spacing rhythm, 4px at the default root size     |
| `--ref-type-unit`       | `1rem`                                           | User-relative text scale, independent of spacing |
| `--ref-radius-unit`     | `0.0625rem`                                      | Shape tuning, independent of density             |
| `--ref-font-sans`       | `'Inter', system-ui, sans-serif`                 | Candidate interface family                       |
| `--ref-font-mono`       | `ui-monospace, SFMono-Regular, Menlo, monospace` | Identifiers and source text                      |

Inter currently resolves from this machine's installed fonts. If retained, supply
licensed, locally served font assets with the required weights and a swap/fallback
policy before treating appearance as reproducible. Otherwise choose `system-ui`
explicitly and accept platform variation. Font delivery is a pending implementation
choice; this proposal adds no asset or network dependency.

Base units are independent on purpose. Increasing text size must not inadvertently
make every corner rounder. Choosing compact controls must not shrink reading text.

## Color and surface roles

References to other tokens in tables mean `var(--token-name)`. `mix(A, p%, B)` means
`color-mix(in oklab, A p%, B)`. Derived colors must be measured on their actual
background; a formula does not guarantee accessible contrast.

### Content and containers

| Semantic token        | Candidate mapping                            | Use and boundary                                                        |
| --------------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| `--surface-page`      | `--ref-color-mist`                           | Page behind content                                                     |
| `--surface-panel`     | `--ref-color-white`                          | Inspector, editor and independently grouped content                     |
| `--surface-inset`     | `--surface-page`                             | Recipe backdrop, source block or nested data area                       |
| `--surface-floating`  | `--surface-panel`                            | Menu, popover, dialog or tooltip material; elevation is separate        |
| `--surface-canvas`    | `--surface-page`                             | Graph/map workspace, independent of the surrounding panel               |
| `--surface-inverse`   | `--ref-color-navy`                           | Sparingly used inverse notices and overlays                             |
| `--ink`               | `--ref-color-navy`                           | Primary text/icons on light surfaces                                    |
| `--ink-muted`         | `--ref-color-slate`                          | Secondary readable text, never an excuse for faint required information |
| `--ink-inverse`       | `--ref-color-white`                          | Text/icons on inverse surfaces                                          |
| `--ink-inverse-muted` | `mix(--ink-inverse, 75%, --surface-inverse)` | Secondary inverse text                                                  |
| `--line-subtle`       | `--ref-color-rule`                           | Decorative separators and grouping boundaries                           |
| `--line-control`      | `--ref-color-rule`                           | Quiet neutral control outlines; focus uses `--color-focus`              |
| `--surface-scrim`     | `mix(--ref-color-navy, 55%, transparent)`    | Modal background obstruction, never a text surface                      |

Page and inset surfaces initially share a value but have different jobs. Nesting
does not require another shade automatically. Inverse containers explicitly set
their text and interactive colors; ordinary muted text must not leak into them.
An inset is not automatically an interactive control and should not inherit one's
hover border or cursor.

Quiet outlines are not sufficient on their own to identify controls by contrast.
Retain visible labels, native affordances and focus indicators. Review any control
that relies on its boundary alone separately; the selected appearance does not
establish application-wide accessibility compliance.

### Interaction and state

| Semantic token           | Candidate mapping                            | Use                                                      |
| ------------------------ | -------------------------------------------- | -------------------------------------------------------- |
| `--color-action`         | `--ref-color-blue`                           | Links and primary action fill                            |
| `--color-action-hover`   | `--ref-color-blue-deep`                      | Hovered link/fill                                        |
| `--color-action-pressed` | `mix(--color-action, 85%, --ref-color-navy)` | Pressed primary fill                                     |
| `--ink-on-action`        | `--ref-color-white`                          | Text/icons on all three primary fills                    |
| `--color-action-inverse` | `--ref-color-blue-pale`                      | Underlined links on inverse surfaces                     |
| `--surface-hover`        | `mix(--ink, 4%, --surface-panel)`            | Hover on neutral controls/rows                           |
| `--surface-pressed`      | `mix(--ink, 8%, --surface-panel)`            | Pressed neutral controls/rows                            |
| `--surface-selected`     | `--ref-color-blue-pale`                      | Persistent selected row, tab or node                     |
| `--ink-selected`         | `--color-action-hover`                       | Selected label                                           |
| `--line-selected`        | `--color-action`                             | Selection boundary                                       |
| `--color-focus`          | `--color-action`                             | Keyboard focus, distinct from selection                  |
| `--focus-halo`           | `--surface-panel`                            | Contrasting ring underlay over complex content           |
| `--surface-disabled`     | `--surface-inset`                            | Unavailable control surface                              |
| `--ink-disabled`         | `--ink-muted`                                | Unavailable control label, paired with disabled behavior |
| `--line-disabled`        | `--line-subtle`                              | Unavailable control outline                              |

Selected secondary text uses `ink-selected-muted` (currently `ink`) rather than
inheriting `ink-muted` on the tinted surface. This applies to workbench/method rows,
resource-index metadata and item-grid namespace labels.

State order: disabled suppresses hover/pressed behavior; pressed takes precedence
over hover; selection persists after the pointer leaves; focus remains visible on
top of either selection or invalid state. Busy is an operation state, not just
opacity. Preserve its label and provide progress or activity semantics.

Selected content uses `--ink-selected` or `--ink` for its descendants, including
metadata. The candidate `--ink-muted` on `--surface-selected` is only about
4.38:1; do not inherit that pair for small text. Filled actions similarly set all
label/icon colors to `--ink-on-action`. Shared values are not interchangeable pairs.

Field placeholders use readable secondary text but never replace persistent
labels. Read-only content is still readable/selectable and is not styled as
disabled. Links in prose retain a non-color affordance such as an underline;
tooltips supplement visible labels rather than owning essential instructions.

Avoid a universal opacity multiplier on disabled containers: it also fades their
children, evidence and focus cues. Invalid fields use the error family with a
message and programmatic invalid state, not action blue. Destructive actions use
the error color family, retain readable labels and never replace confirmation or
undo behavior with a color alone.

### Operation status versus evidence

Each operation status `s` in `info`, `success`, `warning`, `error` has three roles:

| Token pattern        | Mapping                                                  | Use                                                   |
| -------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| `--status-s-ink`     | Respectively `--ink-muted`, green, amber, red references | Text/icons and emphasized boundary                    |
| `--status-s-surface` | `mix(--status-s-ink, 6%, --surface-panel)`               | Status notice background                              |
| `--status-s-line`    | `--status-s-ink`                                         | Essential status marker, not every edge of the notice |

Here `s` is documentation shorthand; actual names include `--status-error-ink`.
All notice text must remain readable; use labels/icons as well as color.

Evidence is a different domain. A modeled route is not a successful operation,
and a missing acquisition record is not proof that the item cannot be acquired.

| Domain token          | Initial mapping        | Meaning                                                                  |
| --------------------- | ---------------------- | ------------------------------------------------------------------------ |
| `--evidence-observed` | `--ink`                | Captured or directly observed data; not a claim of universal correctness |
| `--evidence-modeled`  | `--ink-muted`          | Derived route or interpretation                                          |
| `--evidence-unknown`  | `--ink-muted`          | Missing coverage, with explicit unknown label/dashed mark                |
| `--evidence-stale`    | `--status-warning-ink` | Snapshot age/identity warrants caution                                   |
| `--evidence-conflict` | `--status-error-ink`   | Contradictory inputs or a demonstrated conflict                          |

Keep authored notes, selection, evidence and operation status independently
representable. Do not overload a single colored dot with all four meanings.

The item map shares coverage roles across counts, grid markers, the legend and
Canvas minimap. `coverage.css` owns `--coverage-mapped` (blue),
`--coverage-blocked` (amber), `--coverage-unmapped` (muted gray) and
`--coverage-neutral` (subtle rule color). Missing adapters have a dashed mark in
the DOM; the minimap's two-pixel points retain the color but cannot show dashes.
Internal/creative and unified items use the neutral color.

`coverage.mjs` owns status labels and token assignments. Rendering reads coverage
status, not whether a depth happens to exist. Review notes use an independent
`--review-note-mark` corner dot and accessible label; they never override coverage
colors. The notes filter remains available. These marks describe modeled coverage,
not selection, successful execution or verified playability.

## Typography roles

Expose each row as `--type-ROLE-family`, `-size`, `-weight`, `-leading` and
`-tracking`. Leading is unitless. Active families resolve through
`--type-body-family` and `--type-code-family`; heading roles currently derive from
the body family. Reference fonts own the actual stacks. Let native script and
fallback glyph metrics breathe rather than imposing fixed text-box heights.

Sizes below are multiples of `--ref-type-unit`, not of the spacing unit.

| Role            | Family  | Size     | Weight | Leading | Tracking   | Use                                              |
| --------------- | ------- | -------- | ------ | ------- | ---------- | ------------------------------------------------ |
| `page-title`    | heading | `2`      | 600    | 1.15    | `-0.015em` | Top-level view title when needed                 |
| `item-title`    | heading | `1.75`   | 600    | 1.2     | `-0.01em`  | Selected item/entity or journal entry            |
| `section-title` | heading | `1.25`   | 600    | 1.35    | `0`        | Route, recipes or editor sections                |
| `group-title`   | body    | `0.875`  | 600    | 1.4     | `0`        | Nested groups and table section labels           |
| `body`          | body    | `0.875`  | 400    | 1.5     | `0`        | Dense interface prose and normal table cells     |
| `reading`       | body    | `1`      | 400    | 1.6     | `0`        | Extended descriptions, journal text and guidance |
| `label`         | body    | `0.8125` | 500    | 1.4     | `0`        | Controls, fields, tabs and node labels           |
| `caption`       | body    | `0.75`   | 400    | 1.5     | `0`        | Supporting metadata and figure captions          |
| `code`          | code    | `0.75`   | 400    | 1.6     | `0`        | Registry IDs, paths, JSON and source excerpts    |

Apply the whole role, not just its size. Use `--weight-emphasis: 600` for inline
emphasis and selected labels where needed. Numbers in aligned tables/counts use
`tabular-nums`; do not apply monospaced fonts to all metadata simply because it is
technical. Heading level conveys document structure independently of visual role.

Keep text color separate from type role: a caption can be primary text when it is
the only explanation of an image. Do not automatically uppercase labels or apply
letter spacing to identifiers. Existing 8–11px metadata needs readability review,
not a new tiny-text role that legitimizes it.

No display/hero role is required yet. An expressive item treatment can be a
reviewed variant of `item-title`; a new type family or decorative role needs a real
use and fallback, not an empty slot for hypothetical future branding.

## Space, density and measures

Let `u = var(--ref-space-unit)`. Component recipes should use these named roles
instead of independently multiplying `u` everywhere.

| Token                    | Candidate value                | Relationship expressed                                        |
| ------------------------ | ------------------------------ | ------------------------------------------------------------- |
| `--space-tight`          | `u`                            | Icon/count or closely related annotation                      |
| `--space-inline`         | `2u`                           | Icon/label, sibling controls                                  |
| `--space-control`        | `3u`                           | Control inline padding                                        |
| `--space-content`        | `4u`                           | Related fields, content within a group                        |
| `--space-panel`          | `6u`                           | Comfortable panel padding                                     |
| `--space-section`        | `8u`                           | Separate sections within one task                             |
| `--space-layout`         | `12u`                          | Independent major regions, when space permits                 |
| `--gutter-page`          | `clamp(1rem, 2.1vw, 1.875rem)` | Outer page clearance                                          |
| `--size-control`         | `2.25rem`                      | Default minimum block size, grows for wrapped labels          |
| `--size-control-compact` | `2rem`                         | Explicit dense workbench variant                              |
| `--size-target-coarse`   | `2.75rem`                      | Preferred minimum touch target size                           |
| `--size-icon`            | `1.25em`                       | UI icon aligned with its text role                            |
| `--measure-reading`      | `65ch`                         | Extended prose line length                                    |
| `--measure-page`         | `100rem`                       | Existing broad Atlas workspace limit                          |
| `--measure-inspector`    | `65rem`                        | Preferred wide inspector, bounded by available width          |
| `--measure-sidebar`      | `17.5rem`                      | Entry browser/sidebar preference, not an absolute requirement |
| `--measure-field`        | `40rem`                        | Comfortable prose field width; code can use available width   |

Control dimensions are minimums, not fixed heights. Density changes control
padding and related gaps, not the global font or all page spacing. Start with
default and explicit compact treatment only; do not invent a preference UI yet.
Coarse-pointer support must also work on devices with both mouse and touch.

Use logical properties (`padding-inline`, `margin-block`, `min-inline-size`) and
`minmax(0, 1fr)` for flexible content. Choose collapse points when content stops
fitting, preferably through container queries for embedded recipe/editor views.
CSS custom properties cannot be used directly as media/container query thresholds;
keep those thresholds in the owning stylesheet with their content-fit rationale.
Do not add a build system solely to turn breakpoints into variables.

## Shape, boundaries, depth and layers

| Token               | Candidate value                                     | Use                                                     |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| `--radius-control`  | `5 * --ref-radius-unit`                             | Fields, buttons, small interactive rows                 |
| `--radius-panel`    | `7 * --ref-radius-unit`                             | Cards, recipe backdrops and diagram regions             |
| `--radius-floating` | `--radius-panel`                                    | Floating surfaces; depth does not require more rounding |
| `--radius-pill`     | `999px`                                             | Intentionally pill-shaped badges only                   |
| `--stroke-hairline` | `1px`                                               | Decorative dividers and default outlines                |
| `--stroke-emphasis` | `2px`                                               | Selection/focus and essential emphasized boundaries     |
| `--border-subtle`   | hairline solid `--line-subtle`                      | Quiet grouping                                          |
| `--border-control`  | hairline solid `--line-control`                     | Identifiable control boundary                           |
| `--focus-ring`      | emphasis solid `--color-focus`                      | Focus outline                                           |
| `--focus-offset`    | `2px`                                               | Space between element and outline                       |
| `--shadow-color`    | `--ref-color-navy`                                  | Shadow pigment independent of foreground text           |
| `--shadow-floating` | `0 4px 16px mix(--shadow-color, 12%, transparent)`  | Menu/popover depth                                      |
| `--shadow-overlay`  | `0 12px 40px mix(--shadow-color, 16%, transparent)` | Inspector/dialog separation                             |

Zero radius, no border and transparent background are legitimate CSS choices;
they do not need aliases. A figure on a page need not become a card. A full-width
table can have square outer edges while adjacent standalone panels share the
panel radius. Match shape by role, not by requiring all rectangles to be rounded.

Use spacing first to group content, then a separator or background if needed.
Adding border, tinted fill and shadow together requires a specific hierarchy
reason. Keep shadows off ordinary nested cards. Optical centering is allowed
locally for irregular artwork and must not crop the asset or warp its proportions.

Use named application layers: `--layer-content: 0`, `--layer-sticky: 10`,
`--layer-inspector: 20`, `--layer-popover: 30`, `--layer-notice: 40`.
These order elements within comparable stacking contexts; they do not override
an ancestor's stacking context. Dialogs/popovers using the browser top layer
require separate focus/dismissal handling, not an ever-larger z-index.
Library-internal graph layers remain library-owned.

## Motion

| Token               | Candidate value                  | Use                                             |
| ------------------- | -------------------------------- | ----------------------------------------------- |
| `--motion-feedback` | `140ms`                          | Small control state transitions                 |
| `--motion-reveal`   | `220ms`                          | Inspector/disclosure entry when useful          |
| `--ease-out`        | `cubic-bezier(0.2, 0.7, 0.2, 1)` | Movement settling into place                    |
| `--ease-linear`     | `linear`                         | Constant progress, where animation is necessary |

Follow Apple's [motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion):
animation should explain change and be optional. Under reduced motion, remove
spatial transitions, smooth scrolling and automatic graph-camera flights; retain
static state/progress information. Do not depend on an animation end event for
correctness. Do not animate every node, run ambient loops or transition `all`.

## Domain assignments

These roles keep the application coherent without recoloring Minecraft content.
They belong to domain styles/components, not an expanding universal theme.

### Recipes and game artwork

| Component token           | Candidate mapping   | Meaning                                  |
| ------------------------- | ------------------- | ---------------------------------------- |
| `--recipe-surface`        | `--surface-inset`   | Backdrop around the complete recipe      |
| `--recipe-radius`         | `--radius-panel`    | Backdrop shape                           |
| `--recipe-gap`            | `--space-tight`     | Gap between inventory slots              |
| `--recipe-slot-size`      | `3rem`              | Square slot, independent of label length |
| `--recipe-icon-size`      | `2rem`              | Contained item art                       |
| `--recipe-slot-surface`   | `#d9dde0`           | Game-like inventory material             |
| `--recipe-slot-line`      | `#8a9096`           | Material edge                            |
| `--recipe-slot-shadow`    | `#a4a9ad`           | Inset upper/left edge                    |
| `--recipe-slot-highlight` | `#f5f5f5`           | Inset lower/right edge                   |
| `--recipe-slot-ink`       | `#202830`           | Counts/marks on the material             |
| `--recipe-count-surface`  | `--ref-color-white` | Readable count backing                   |
| `--recipe-count-ink`      | `--recipe-slot-ink` | Count foreground                         |
| `--recipe-tag-line`       | `--line-control`    | Tag/alternative marker                   |
| `--recipe-focus`          | `--color-focus`     | Focus on actionable ingredient/output    |

Slot materials are deliberate component reference exceptions. Keep the palette
together; do not equate its gray with page gray. Counts must remain legible over
all artwork. Labels and alternatives live outside slots. Recipe content can flow
input-to-output horizontally or vertically without resizing individual slots to
fit text. At extreme widths, give the diagram a contained scroll region.

Use unmodified asset colors, `object-fit: contain` and pixel rendering for pixel
textures. Do not tint observed item sprites to match a theme. Cropping, missing
layers or incorrect models are asset-pipeline defects, not token problems.
Frame dimensions may be component-local; use integer pixel scaling where feasible.
Controls around art remain accessible even when artwork is intrinsically small.

### Graphs, maps and surveys

| Component token               | Candidate mapping      | Meaning                                         |
| ----------------------------- | ---------------------- | ----------------------------------------------- |
| `--graph-surface`             | `--surface-canvas`     | Diagram workspace                               |
| `--graph-grid`                | `--line-subtle`        | Decorative coordinate/grid texture              |
| `--graph-node-surface`        | `--surface-panel`      | Ordinary node                                   |
| `--graph-node-line`           | `--line-control`       | Recognizable node boundary                      |
| `--graph-node-radius`         | `--radius-control`     | Interactive node shape                          |
| `--graph-edge-required`       | `--ink-muted`          | Required relationship, solid line               |
| `--graph-edge-alternative`    | `--ink-muted`          | Alternative relationship, dashed line and label |
| `--graph-edge-selected`       | `--color-action`       | Selected relationship, also emphasized by width |
| `--graph-edge-width`          | `1.5px`                | Default edge stroke in renderer units           |
| `--graph-edge-width-selected` | `2.5px`                | Selected edge stroke                            |
| `--map-viewport-line`         | `--color-focus`        | Minimap's current viewport                      |
| `--map-unknown-surface`       | `--surface-inset`      | Unsampled region, with hatch/unknown label      |
| `--map-location-mark`         | `--ink`                | Named position marker with contrasting halo     |
| `--map-heat-low`              | `--surface-selected`   | Low measured amount, not missing data           |
| `--map-heat-high`             | `--color-action-hover` | High measured amount                            |

Map measurements retain units, legends, sampling coverage and missing values.
A category palette for biome/ore series belongs to the visualization domain and
must be separately reviewed with labels/patterns; do not manufacture a dozen
global status colors. Biome/texture colors taken from game data are content.
Selection must remain distinguishable from a heat-scale value.

Read resolved token values for Canvas/Three.js through a small shared browser
adapter when implementing this system. Resolve color expressions and rem lengths
into renderer-compatible values; do not pass `var(...)` to a numeric/hex-only API.
Refresh on actual theme/density/font changes or remount, not every animation frame.
CSS/SVG and minimaps must share the same domain assignments. Graph zoom and
minimap scaling are renderer transforms, not global type-scale changes; provide
readable detail outside tiny graph labels.

### Editors, resource comparisons and jobs

The resource reading index uses the shared label/caption typography, code markers,
selection surface and action-colored current-location rule. Its 17rem column and
bounded scroll height are local composition values, not global token roles.

Editors use panel/field/control roles, reading typography for authored prose and
code typography for source. Selection, unsaved changes, validation errors and job
results stay distinct. A successful file save does not mean generated content
was applied to Minecraft. Use status labels matching the actual named operation.

Resource reviews use content panels, reading text, captions and explicit evidence
states. Images retain their colors and aspect ratios. Model transparency previews
use a local checkerboard pair derived from panel/inset surfaces with sufficient
visible difference, independently of selection tint. Do not recolor world/render
evidence to harmonize with surrounding UI.

## Contexts and accessibility

Light appearance is the only proposed palette here. Dark appearance is a future
semantic mapping, not an inversion filter or an unverified promise. Change paired
foreground/background roles together, including inverse, status, controls, graph
and game-material contexts. Remapping a whole theme requires new contrast checks.

Aim for 4.5:1 text contrast throughout this dense interface. Required non-text
boundaries and state indicators need 3:1 against their adjacent colors; quiet
decorative rules are different. Target sizing follows WCAG's 24 CSS-pixel minimum
with its stated exceptions; prefer 44px targets for touch. Token values alone do
not establish conformance. See [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and
[non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast).

Check keyboard focus, zoom/reflow, long names, localized text and user text
spacing. Coarse-pointer layouts may add clearance, but cannot remove keyboard
access. Under forced colors, use system color roles and real outlines rather than
depending on shadows or background images. Use `prefers-contrast` to strengthen
roles where supported; do not assume it covers every accessibility setting.
Never use `forced-color-adjust: none` on whole application regions to preserve a
palette. Game artwork may remain content while surrounding controls adapt.

## Composition contracts

- Choose one main task per view and give its region the strongest composition.
  Tokens do not mandate a global ratio such as 60/40 or equal-height columns.
- Place labels near their content; separate unrelated sections more than related
  siblings. Share alignment tracks rather than adding boxes to force grouping.
- Match containers by purpose. Recipe and route backdrops should share treatment
  unless a reviewed difference explains their roles. Item art can sit unboxed.
- Preserve reading order when a two-column view stacks. Resize/reflow content,
  not essential text down to illegible sizes.
- Use component classes with low, predictable specificity. Avoid ID selectors
  controlling heading typography and avoid broad global `h3` overrides of roles.
- Keep flavor in content and illustration. Humor cannot replace task labels,
  errors, quantities or provenance. A decorative motif needs a defined owner
  before it gains reusable tokens.

## Implementation and evolution

Continue adoption in reviewed slices:

1. Establish the shared token file and text-role application. Start with one
   approved item-details composition, using the current snapshot for comparison.
2. Move reusable component assignments into their owning styles. Resolve cascade
   conflicts rather than adding more specific overrides or `!important`.
3. Apply the same roles to authoring, resources, graphs and Canvas-rendered views
   in separate reviewable passes. Inventory actual consumers before deleting a
   legacy name; search CSS, inline styles, React and Canvas code.
4. Remove superseded aliases and unused variants after each completed pass.
   Update this reference to describe the resulting system, not a migration diary.

All current page styles and renderer consumers use the descriptive names directly;
the old shorthand aliases are removed. This naming cleanup preserves their values.
Semantic adoption remains more than renaming: control outlines use `--line-control`,
focus uses `--color-focus`, and data marks need domain ownership rather than an
implicit relationship to clickable controls.

The cross-page review still leaves work for subsequent visual slices:

- Atlas chrome, graph labels, resource cards and authoring headings retain local
  typography and spacing values. Adopt reviewed text roles by purpose; do not map
  every equal number to the same role.
- Authoring error text still shares action color. Operation-status roles and
  selected-row secondary text need a joint color/contrast review.
- Model texture checkerboards and resource-gallery backdrops still share the
  selection surface value. Review their material role independently of selection.
- Recipe slot geometry/materials, heatmap scaling and Three.js model dimensions
  remain domain-owned. Their numbers are not application spacing or status colors.

The existing section gap remains 24px. Assess any deliberate spacing or palette
change in preview; do not disguise redesign as a token-only refactor.

Derived custom properties resolve where they are declared. Overriding an input
inside a subtree does not reliably recompute an inherited, already-resolved alias.
Declare scoped derived roles alongside their input overrides, or set the semantic
roles directly. Keep dependencies one-way and acyclic. Do not assume that changing
a base token on a child will propagate through every root-level derived token.

Add a component token for independent reusable behavior; add a global semantic
role only when it crosses component boundaries or expresses a shared contract.
Derive values where the relationship should persist, not merely because a formula
can reproduce today's number. Retire roles when their consumers and purpose are
gone. Theme variants, density variants and local exceptions need an actual use.

### Review checks

For implementation, use the existing checks and a small representative preview:
item details with a recipe and route, an invalid field, a selected entry, a source
block, job status, a resource image and a world/minimap legend. Check narrow/wide
widths, keyboard use and larger text. Temporarily vary one token family to confirm
that intended consumers respond and unrelated domains do not.

Measure computed styles as well as source declarations. Check text/surface pairs,
non-text indicators, overridden headings, SVG/Canvas colors and font fallback.
Use `pnpm verify` for application changes and focused browser checks for the
affected interactions. Avoid snapshotting every token or adding a design-system
test platform. User preview review establishes visual preference; automated
checks establish only the behavior and constraints they exercise.

## Open visual choices

The role boundaries can be discussed independently of these candidate values:

- Retain and self-host Inter, or explicitly choose platform typography.
- Confirm the proposed title hierarchy and larger metadata floor with real long
  names, recipes and dense evidence tables.
- Confirm the distinction between quiet content panels and stronger field
  outlines. Keep the recipe's game-like slot material separately reviewable.

The internal UI components below implement these roles. No external UI framework,
new theme, font or preference screen is required. Extend the system when a concrete
feature needs another role.

## Content composition

`composition.css` owns the vertical rhythm of semantic content groups. Use
`content-stack` for a sequence of headings, paragraphs, tables, controls and
sections. Its default gap derives from `space-content`; `data-space="control"`
and `data-space="section"` use those existing roles. Direct-child margins reset
so the parent owns the rhythm. Hidden children do not leave a gap.

Choose rows by their content:

- `action-row` centers peer actions and inline status text.
- `control-row` aligns labeled fields at their controls, not the center of the
  combined label and field. `control-note` centers adjacent text within that row.
- `section-heading` centers headings with their actions. Use it on adjacent panel
  headings even when one panel has no actions, so both reserve the same row height.

`control-min-block-size` derives from the body line box, `space-inline` padding
and twice `control-border-width`. Inputs and buttons share those insets. It is a minimum:
wrapping text can enlarge controls. Component label defaults use low specificity
so composition rules can remove outer margins without page-specific corrections.

Keep native `details` responsible for disclosure state. Its summary is followed
by a real `content-stack` body inside `details.disclosure`; never put flex layout
on the `details` itself. This separates inline code and explanatory text as well
as paragraphs. React uses `ui/Disclosure`; DOM renderers use `createDisclosure`.
Astro and generated HTML emit the same structure. Keyboard behavior stays native.
Nest stacks for subgroups rather than adding per-button or per-table margins.

An open survey panel uses `data-surface="open"` to retain its siblings' panel
inset and border geometry without a visible frame or filled background.

Journal workbenches, survey sections, generated island/village disclosures and
Evidence records use this contract. Dynamic renderers must emit the same classes
as Astro/React content. Survey data importers still own the measured values; layout
changes do not fork their schema or regenerate the world. Component CSS may own
columns and geometry, but must not reintroduce margins between stack children.
The convention prevents the observed collisions within adopted groups; arbitrary
future markup still needs to use it. It does not claim to enforce every layout.

## Shared UI components

Activity presentation lives in `components/activity/`. The host owns transient
notification display; the panel renders the same operation history in a disclosure
or the authoring side panel. Editor validation and drafts remain
domain-owned. Both surfaces reuse Button, Disclosure, Feedback and composition
classes. `--layer-notification` orders the toast overlay; `--shadow-overlay` derives
its separation from the existing ink color. These roles replace the map's separate
hard-coded notice positioning and shadow. Neither role specifies task semantics.

`web/src/components/ui/` is the internal component library. React and Astro
adapters share `styles/ui.css`, token values and types in `lib/ui.ts`. Astro
consumers stay static; adopting a shared button does not add a React island.
Do not introduce a separate package or a universal view schema for these controls.

| Component                             | Current uses                                                                       | Responsibility                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Button.tsx` / `Button.astro`         | Authoring, graph, map and resource actions/navigation                              | Native button with `default`, `primary` or `destructive` intent; defaults to `type="button"` |
| `Feedback.tsx` / `setFeedback`        | Journal validation and operations, graph loading, model/editor results, named jobs | Explicit error versus neutral feedback; reset tone when the operation recovers               |
| `Workbench.tsx` / `Workbench.astro`   | Entries, disclaimers, localization, models                                         | Responsive browser/editor columns, sticky browser and bounded selection list                 |
| `Disclosure.tsx` / `createDisclosure` | Journal source details, surveys                                                    | Native disclosure with a stacked body; caller owns summary and content                       |

Intent describes consequences, independently of selected navigation state. Delete,
remove, discard and removing a translation override use destructive intent. Reload
is destructive when it would discard authoring drafts. Camera/filter resets and
ordinary cancellation remain neutral. Saving or completing a creation form uses
primary intent; generation is a separate operation, not an interchangeable Save.
Confirmation, reference guards, disabled state and persistence remain caller-owned.

`color-destructive` and `status-error-ink` have distinct meanings and currently
share `ref-color-red`. The destructive button has red text and border; its hover
surface derives from that color and `surface-panel`. Primary buttons use
`ink-on-action`; disabled controls use the disabled surface/ink/line roles rather
than fading their entire content. Native keyboard focus remains visible. Visible
verb labels and error messages carry the meaning without relying on color alone.

The workbench exposes only geometry variables: `workbench-sidebar`,
`workbench-sticky-top` and `workbench-list-limit`. Journal and models share the
composition while retaining their own selection and editing logic. Graph/map
workbenches have different camera and viewport behavior and do not use this shell.

### Field and source-editor contracts

`Field.tsx` renders a label, optional help/error text, and a caller-owned native
control. Its render function receives the control ID, `aria-describedby` and
`aria-invalid`. IDs are stable across rerenders. `Field.astro` uses an explicit ID;
when supplying help/errors, spread `fieldControl(id, { hint, error })` onto the
slotted control. `createField` gives generated model inputs the same label structure.
The caller owns validation and must distinguish input errors from network/job errors.
Checkboxes, range controls and icon search composites retain their native layouts;
they are not forced into the stacked text-field model. Inline fields use the same
component with `layout="inline"`.

`SourceEditor` in React/Astro composes the field with a monospaced textarea and an
optional action slot. External description IDs are combined with field help/errors.
It preserves native read-only/disabled attributes and does not parse, save, retain
or apply drafts. Journal `JsonEditor` owns context-backed drafts and parsing; model
JSON uses the preview service; scenario YAML uses its workspace endpoint.

### Active shared roles and retained exceptions

The component inventory also includes:

| Component                                | Consumers                                                                                            | Boundary                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `Field` / `fieldControl` / `createField` | Journal forms, acquisition filters, graph controls, model inputs, resource filters, travel estimates | Labels and descriptions; validation remains local               |
| `SourceEditor`                           | Journal JSON, model JSON, scenario YAML                                                              | Source presentation and actions; no shared persistence workflow |
| `ViewTabs`                               | Atlas, graph questions, journal/model authoring                                                      | Labeled native navigation; callers own routing and selection    |

Metadata uses `type-meta-size`, captions use `type-caption-size`, and the existing
22px survey/resource headings use `type-view-title-size/weight`. Component-specific
brand lettering, dense map/node labels, recipe counts, and large resource prose
retain their own dimensions; applying body sizing to those would change the approved
composition. Families use explicit type roles rather than a second set of font aliases.

Recurring 4/8/12/16/24px spacing uses the existing tight/inline/control/content/section
roles. Other values remain local where they preserve panel composition, viewport
geometry or content-specific density. Do not create a global token for every number.
Graph coordinates, icon/slot sizes, chart bounds, model canvases and dialog/media
limits are layout facts rather than universal spacing.

Neutral, primary and destructive controls have hover/pressed states, with disabled
states suppressing interaction styling. Selection persists independently; focus uses
`focus-width`, `focus-offset` and `color-focus`. Native controls share disabled colors;
read-only text remains selectable. `control-min-block-size` derives from the body
line, insets and `control-border-width`.

Pack notes use `note-line`/`note-surface`; errors use `status-error-ink`. Recipe materials,
coverage marks, world heatmaps and renderer colors remain domain-owned. Canvas and
Three.js already resolve CSS colors through `readColorTokens`; do not replace those
bridges with hard-coded copies. Map/recipe item buttons retain their specialized
geometry and interaction semantics rather than adopting ordinary action fills.

Keep these boundaries when extending the library:

- Collection rows use shared selection colors and buttons, but journal selection,
  acquisition filtering, graph search and resource scroll-position tracking retain
  separate behavior. The resource reading rail and graph workbench are not alternate
  modes of the editor shell.
- Survey tables already share `surveyTable` and the `table-scroll` wrapper. Catalog
  sticky headers and editable localization tables retain their own cell/column needs;
  no universal table schema is required.
- View-local action groups use shared rows, buttons and feedback. Save, generate,
  snapshot rebuild and job cancellation remain distinct operations with different
  availability rules. Do not infer workflow state by parsing status strings.
- Recipe disclosures retain their controlled state across graph culling. Native
  resource details retain their compact article layout. Neither needs a new generic
  disclosure controller merely to match markup elsewhere.

The selector audit retains dynamically emitted `recipe-ingredients`,
`recipe-requirements`, `flow-item` and `flow-route`. Truly unused depth/panel/detail
heading rules, the unused recipe-unknown rule and the obsolete review-stale rule
were removed. No unused active token remains known; verify CSS, generated strings,
renderer mappings and indirect token references before removing one.

## Keyboard page navigation

`AppHeader` supplies the first-focusable Skip to content link. Each primary page
owns one `main-content` landmark with `tabindex="-1"`; journal authoring supplies
it through React. The link becomes visible on focus using existing panel, spacing
and focus roles. Enter moves focus to the content, and Tab continues through its
controls. Preview-only pages without the shared header do not need this contract.
