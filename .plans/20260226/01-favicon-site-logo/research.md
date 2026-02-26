# Research

> Source: `.plans/20260226/01-favicon-site-logo/prompt.md`

No external references, libraries, or third-party dependencies were found in the prompt. This feature uses only existing project infrastructure (YAML config, Lit components, Tailwind CSS, build pipeline).

## Codebase Findings

### Existing Favicon Field

- `site.yml` already defines a `favicon` field (currently empty string) in both `demo/` and `test/fixtures/full/` configs.
- The field is loaded into `site.json` output but **never consumed** by the build pipeline or template.
- `template/index.html` line 11 has a null favicon placeholder: `<link rel="icon" href="data:," />`.

### Existing OG Image Field

- `site.yml` also defines `og_image` (empty) — loaded but unused. Not in scope for this plan but worth noting as a related future improvement.

### Nav Bar Component

- `template/components/layout/nav-bar.js` renders text-only branding from `this.resume?.name`.
- The component receives both `site` and `resume` props from `app-shell.js`, so `site.favicon` is already accessible.
- Light DOM with Tailwind classes; no Shadow DOM restrictions.

### Media Handling

- Build pipeline copies the entire `media/` directory to output. Favicon images placed in `media/` will be available at runtime.
- Files >1 MB trigger a warning during build.

### Build Pipeline Gap

- `src/lib/generate/index.js` `generateIndex()` accepts 14 named parameters but does **not** include `favicon`.
- `src/lib/index.js` calls `generateIndex()` without passing `site.favicon`.

## Compatibility Matrix

No external dependencies introduced — all changes use existing project infrastructure.

| Component A            | Component B     | Status     | Notes                                 |
| ---------------------- | --------------- | ---------- | ------------------------------------- |
| site.yml favicon field | generateIndex() | Compatible | Field exists, just needs wiring       |
| nav-bar.js             | site prop       | Compatible | Already receives site data            |
| Media copy step        | Favicon images  | Compatible | Images in media/ are copied to output |

## Licence Summary

No new dependencies introduced.

| Dependency | Licence | Compatibility Notes |
| ---------- | ------- | ------------------- |
| N/A        | N/A     | No new dependencies |
