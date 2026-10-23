# Create Sky

Create Sky is the playable Create/Aeronautics island modpack. Reserve **Skyweave**
for the separate civilization mod. Start with `docs/README.md`; read only the
documents relevant to the task. Runtime and dependency pins live in `empack.yml`.

## Direction

- Make geography, resources, production and travel work together. Evaluate useful
  outward and return journeys, cargo, fuel and repeated use, not just first unlocks.
- Give earlier technologies lasting roles. Prefer natural resource constraints
  and meaningful alternatives over arbitrary recipes, gates or mandatory steps.
- Use the Atlas to trace acquisition, quantities, overlaps and missing links.
  A graph route or inventory objective does not prove a working production chain.
- Airships should support machinery and transport as well as personal travel.
  Existing mods must earn their place through supported, tested interactions.
- Borrow Skyweave's vision without claiming simulated economies or contextual
  NPC behavior that the pack does not implement. Automated Logistics is deferred:
  future Skyweave should own routes/services and civilization authority.
- Sky Villages is the selected settlement candidate, not Create: Sky Village.
  Review placement, loot, salvage and delivery access together. Broader structure
  tuning, including Structures Arise, remains a separate pass.
- Keep automatic Hostile Skies raids disabled pending deliberate encounter design.
- Questlog is a bookless, optional journal. Use detectable conditions, short
  objective labels, clear descriptions and shared disclaimer IDs; no invented
  completion triggers, compulsory chapter gates or reward-based progression.

## Work and evidence

- Inspect before editing; preserve unrelated work. Default to one agent and the
  smallest complete change. Ask only consequential questions evidence cannot settle.
- Use empack and the recorded lock; reference builds are the default. Preserve
  Minecraft pins. Verify provider metadata against exact artifacts when it conflicts.
- Keep journal sources in `authoring/journal`, configuration rationale/digests in
  `authoring/changes`, maintained resources in `pack-fixes`, and the Atlas in `web`.
  Regenerate derived content through its owning scripts rather than editing copies.
- Verify builds and relevant runtime behavior. Separate inspection, automated
  checks and actual gameplay; report untested compatibility and progression claims.
- Sync instances only when authorized and stopped. Preserve worlds, seeds, LODs,
  player settings and access lists. Permission to inspect or sync is not permission
  to regenerate a world. Keep test worlds and downloads disposable.
- Keep existing backups and the preserved empack findings report. Remove temporary
  runs, logs and experiments after incorporating useful evidence into owning docs.
- Do not commit, push or release without authorization. Never commit credentials,
  worlds, third-party JARs or decompiled sources.

## Writing and commits

Use direct, concise language without marketing or repeated page introductions.
Player guides own usage; development docs own decisions and evidence. Rewrite the
owning document instead of accumulating review reports. Group by purpose; omit
incidental migration history and per-edit commentary. Keep the authoring UI
editable, organized by domain, and aligned with the existing component conventions.

Follow Skyweave's adaptation of `~/production/playground/AGENTS.md`: conventional
subject, blank line, then relevant `- [tag]: message` bullets. Bullet messages are
at most 40 characters, have no final period, and use lowercase except proper nouns
and initialisms. Scale detail to the change; do not pad small commits to 15–30 bullets.
