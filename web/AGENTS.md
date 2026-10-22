# Create Sky Atlas

Maintain the internal Create Sky progression map. Start with `../docs/development/web/README.md` and
read only the setup, data or verification sections needed for the task.

## Boundaries

- Authored YAML owns interpretation and scenarios; runtime exports own observed
  registered content. Generated projections are rebuildable, not editable authority.
- Keep assumptions, source inspection and runtime verification distinct.
  Potential reachability does not establish resource budgets or playability.
- Keep Minecraft instances and worlds read-only during routine app work.
  Publishing, applying recipe patches and syncing instances require task authorization.
- Keep extracted assets, third-party binaries, private paths, worlds and logs out
  of version control. The exporter stays in the disposable audit server.
- Preserve unrelated workspace changes. Do not treat the current uncommitted tree
  as disposable bootstrap output.

## Verification

Run `pnpm verify` for application changes and `pnpm test:python` for Python changes.
Use browser tests for interaction changes. Runtime exporter or adapter changes need
relevant snapshot checks; a static build does not validate game behavior.
Record commands, tested source or artifact identifiers, and limitations in
`../docs/development/web/verification.md`. Do not rerun expensive world scans for prose edits.

## Documentation

Follow the inherent.design prose reference when available. Web guides live in
`../docs/development/web/`; pack schemas and release procedures stay in the parent
development guides.
Use direct prose and a single owner for each topic. README owns the entry point;
setup owns commands; data owns implementation and authority; usage owns controls;
verification owns dated evidence. Link between them instead of duplicating contracts.
Consolidate completed reviews into these documents and remove temporary reports.
Keep maintained tests and source tooling; remove disposable run output after checks.
