# Instant Portfolio — Agent Coding Guidelines

## Project Overview

**Instant Portfolio** is a reusable GitHub Action that builds a modern SPA-like personal portfolio/resume site from YAML data and Markdown pages. The action compiles user content into a static site deployable to any hosting platform.

| Context          | Name                                 |
| ---------------- | ------------------------------------ |
| Brand name       | **Instant Portfolio**                |
| npm package      | `portfolio`                          |
| GitHub repo      | `jinglemansweep/portfolio-action`    |
| Action reference | `jinglemansweep/portfolio-action@v1` |

## Architecture

The codebase has two distinct layers:

1. **Build library** (`src/lib/`) — Pure Node.js functions that compile YAML/Markdown into JSON data files, SEO assets, and an HTML shell. Fully testable, no side effects.
2. **Frontend components** (`template/components/`) — Lit 3 web components loaded via CDN in the browser. Light DOM, Tailwind CSS, i18n mixin.

Data flow: YAML/Markdown input → build pipeline → JSON + HTML output → browser loads JSON → Lit components render.

## Directory Structure

```
src/lib/           # Core build library (pure functions, Node.js)
src/cli.js         # CLI entry point (parseArgs → build())
template/          # SPA shell (index.html, 404.html)
template/components/  # Lit 3 web components (browser, CDN imports)
i18n/              # Built-in language packs (10 languages)
test/unit/         # Unit tests (1:1 mapping to src/lib/)
test/integration/  # Full build integration tests
test/fixtures/     # Test data (minimal, full, blog, i18n-override, visibility-hidden, invalid)
test/helpers/      # Shared test utilities
.planning/         # Project plan and task list
```

## Code Style & Conventions

### Module System

- **ESM only** — `"type": "module"` in package.json. No CommonJS.
- **Node 22** — Required engine. Uses `node:util parseArgs`, `import.meta.url`, top-level await.
- **File extensions** — Always include `.js` in import paths.

### Naming

| Context            | Convention            | Example                                        |
| ------------------ | --------------------- | ---------------------------------------------- |
| Files              | kebab-case            | `compile-yaml.js`, `page-home.js`              |
| Functions          | camelCase             | `compileYaml()`, `stripVisibility()`           |
| Classes            | PascalCase            | `HeroSection`, `SkillCard`                     |
| Constants          | SCREAMING_SNAKE       | `VISIBILITY_DEFAULTS`, `SEO_DEFAULTS`          |
| Private members    | `_` prefix            | `_mode`, `_loadData()`                         |
| Web component tags | kebab-case            | `<app-shell>`, `<page-home>`                   |
| i18n keys          | `prefix_specific`     | `skill_years`, `nav_home`, `a11y_toggle_theme` |
| Slugs              | kebab-case, lowercase | `hello-world`, `senior-engineer`               |

### Import Style

```javascript
// Node builtins — use node: prefix
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

// External packages
import yaml from 'js-yaml';
import matter from 'gray-matter';

// Local modules — always include .js extension
import { compileYaml } from './compile-yaml.js';

// Browser components — CDN URL imports
import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
```

### Export Style

```javascript
// Named exports only — no default exports
export async function compileYaml(filePath, options) { ... }
export function validate(site, resume, skills, projects) { ... }
```

### Error Handling

```javascript
// Descriptive error messages with context
throw new Error(`Required file "${filePath}" not found`);
throw new Error(`Failed to parse YAML: ${err.message}`);

// GitHub Actions-aware logging
const isActions = !!process.env.GITHUB_ACTIONS;
if (isActions) {
  process.stderr.write(`::warning::${msg}\n`);
} else {
  process.stderr.write(`Warning: ${msg}\n`);
}
```

### Immutability

Always use `structuredClone()` before mutating data. Never modify function inputs directly.

```javascript
const result = structuredClone(resume);
if (!visibility.email) delete result.contact.email;
return result;
```

## Component Patterns (Lit 3)

### Light DOM (Required)

All components must override `createRenderRoot` to return `this`. This is required for Tailwind utility classes to work — Shadow DOM breaks the CSS cascade.

```javascript
class MyComponent extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }
  // ...
}
customElements.define('my-component', MyComponent);
```

### I18nMixin

All components extend `I18nMixin(LitElement)`. Use `this.t('key')` for translated strings. Supports `{n}` parameter interpolation.

```javascript
html`<h2>${this.t('experience')}</h2>`;
html`<span>${this.t('skill_years', { n: 5 })}</span>`;
```

### Properties

```javascript
static properties = {
  data: { type: Object },        // Public property from parent
  _state: { state: true },       // Private reactive state
};

constructor() {
  super();
  this.data = {};
  this._state = null;
}
```

### Tailwind Classes

```javascript
// Dark mode via dark: variant
class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"

// Responsive (mobile-first)
class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"

// Print styles
class="print:hidden"

// Theme custom properties
class="bg-[var(--color-primary)]"
```

### Accessibility

- Decorative SVGs: add `aria-hidden="true"`
- Icon-only buttons: add `aria-label`
- Nav elements: add `aria-label`
- Form inputs: associate with `<label>` elements
- Focus styles: add `focus:ring-2 focus:ring-blue-500 focus:outline-none`
- Images: always include `alt` attribute

## Testing

### Framework

Vitest with v8 coverage provider. Coverage thresholds: **80% lines, 80% branches**.

### Structure

```javascript
import { describe, it, expect } from 'vitest';
import { fixturePath } from '../helpers/test-utils.js';

describe('moduleName', () => {
  it('does specific thing', () => {
    expect(result).toBe(expected);
  });

  it('throws on invalid input', async () => {
    await expect(fn()).rejects.toThrow('message');
  });
});
```

### Integration Tests

```javascript
let outputDir, cleanup;
beforeAll(async () => {
  const tmp = await createTempDir();
  outputDir = tmp.path;
  cleanup = tmp.cleanup;
  await build({ dataDir: fixturePath('full'), outputDir, ... });
});
afterAll(async () => {
  if (cleanup) await cleanup();
});
```

### Fixtures

| Fixture              | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `minimal/`           | Bare minimum valid site (4 YAML files)             |
| `full/`              | All features: YAML + pages + blog + media          |
| `blog/`              | Blog scheduling: published, draft, future, expired |
| `i18n-override/`     | Custom i18n label overrides                        |
| `visibility-hidden/` | All visibility flags false                         |
| `invalid/`           | Malformed YAML, missing fields                     |

### Helpers

```javascript
import {
  createTempDir,
  fixturePath,
  readOutputJson,
  readOutputFile,
} from '../helpers/test-utils.js';
```

## Build Pipeline

The build orchestrator (`src/lib/index.js`) runs these steps in order:

1. Load & validate YAML (`compile-yaml.js`, `validate.js`)
2. Strip visibility (`strip-visibility.js`)
3. Compile markdown pages (`compile-markdown.js`)
4. Compile blog posts (`compile-blog.js`)
5. Resolve i18n (`compile-i18n.js`)
6. Generate crossref index (`compile-crossref.js`)
7. Generate manifest (`generate-manifest.js`)
8. Write JSON data files
9. Generate index.html (`generate-index.js`)
10. Copy components, 404.html, media
11. Generate SEO files (`compile-seo.js`)

### CLI Usage

```bash
node src/cli.js \
  --data-dir ./data \
  --pages-dir ./pages \
  --blog-dir ./blog \
  --media-dir ./media \
  --output-dir ./_site \
  --base-path / \
  --site-url https://example.com
```

## Quality Gates

All checks must pass before committing:

```bash
npm run lint          # ESLint (flat config v9)
npm run format:check  # Prettier
npm test              # Vitest (116 tests)
npm run test:coverage # Must meet 80% threshold
```

Pre-commit hooks (Husky + lint-staged) automatically run ESLint --fix and Prettier --write on staged files.

## Git Conventions

- Branch: `feat/implementation`
- Commit format: `Task N: Short description` followed by a body paragraph
- One commit per task/logical unit
- Always include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` when AI-assisted
- Never commit `.env`, credentials, or `coverage/`

## Key Design Decisions

### Privacy-First

Visibility stripping happens at **build time**. Hidden data is never written to the output directory. Components never need visibility checks — absent data simply doesn't render.

### Case-Insensitive Skill Matching

Cross-references between skills, experience, and projects match case-insensitively via `.toLowerCase()`.

### Blog Scheduling at Build Time

Draft, future, and expired posts are filtered during compilation. They are never included in output JSON. A cron-triggered workflow can publish posts on schedule.

### Manifest-Driven Routing

`manifest.json` contains only routes where visibility is true and data exists. The SPA router in `app-shell.js` reads the manifest — no manual route filtering needed.

### 404.html SPA Redirect

GitHub Pages serves `404.html` for unknown paths. This page redirects to `index.html?p=<encoded-path>`, and `app-shell.js` restores the original path via History API.

### CDN-Only Frontend

Components import Lit from `https://cdn.jsdelivr.net/npm/lit@3/+esm`. No bundler or build step for the frontend. Tailwind CSS 4 loaded via browser CDN build.

## Common Gotchas

1. **Light DOM is mandatory** — `createRenderRoot() { return this; }` in every component. Shadow DOM breaks Tailwind.
2. **File extensions required** — ESM imports must include `.js`: `import { foo } from './bar.js'`
3. **Prettier reformats YAML** — `test/fixtures/invalid/malformed.yml` is in `.prettierignore` because it's intentionally broken.
4. **`--no-error-on-unmatched-pattern`** — The lint script uses this flag because directories may have no JS files during early development.
5. **`structuredClone` before mutation** — Never mutate input objects. Clone first, then modify.
6. **Slug collisions** — The slugify function collapses multiple hyphens: `senior-engineer--corp` becomes `senior-engineer-corp`.
7. **SEO files require `site_url`** — `sitemap.xml` and `feed.xml` are only generated when a site URL is provided.
8. **Coverage only tracks `src/lib/`** — Component code in `template/` is excluded from coverage reports.
