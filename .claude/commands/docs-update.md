# Update Documentation

Perform a full analysis of the codebase and ensure all documentation files (README.md, CLAUDE.md, and any other documentation resources) are accurate, complete, and reflect the current state of the project.

## Steps

1. **Audit the codebase** — Thoroughly read all source files, configuration, workflows, and tests to build a complete picture of the project's current features, options, inputs, and behaviour.

2. **Review all documentation files** — Read README.md, CLAUDE.md, and any other Markdown or documentation files in the repository.

3. **Remove stale documentation** — Delete or update any references to features, configuration options, inputs, concepts, or functionality that no longer exist in the codebase. No hallucinations — every documented item must have a corresponding implementation.

4. **Add missing documentation** — Document any newly added features, configuration options, CLI flags, action inputs, components, build steps, or other functionality that is not yet covered in the docs.

5. **Verify accuracy** — Cross-check all documented examples, defaults, file paths, directory structures, and option names against the actual codebase. Fix any discrepancies.

6. **Run all quality checks** — After making changes, run ALL quality gates and ensure they pass:
   * `npm run lint`
   * `npm run format:check` (run `npm run format` first if needed)
   * `npm test`
   * `npm run test:coverage`

7. **Summary** — Provide a summary of all changes made to documentation files, listing what was added, removed, or corrected.

## Rules

* Every claim in the documentation MUST be verifiable in the codebase
* Do NOT invent or assume features that do not exist
* Do NOT remove documentation sections that are still accurate
* Preserve the existing structure and style of each documentation file
* All quality checks and tests MUST pass before committing
