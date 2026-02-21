# Instant Portfolio — Task List

> Auto-generated from [PLAN.md](./PLAN.md). Each task group must be completed and committed before proceeding to the next. Quality checks (lint, format, test) must pass before any commit.

---

## M1 — Foundation

### Task 1: Project Scaffolding

- [x] Create `package.json` with name `portfolio`, type `module`, Node 22 engine, scripts (`lint`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`, `build`), dependencies (`js-yaml`, `markdown-it`, `gray-matter`), devDependencies (`vitest`, `@vitest/coverage-v8`, `eslint`, `prettier`, `husky`, `lint-staged`)
- [x] Run `npm install` to generate `package-lock.json`
- [x] Create `.gitignore` (node_modules/, _site/, coverage/, *.tgz)
- [x] Create directory structure: `src/lib/`, `test/unit/`, `test/integration/`, `test/fixtures/`, `test/helpers/`, `i18n/`, `template/components/`
- [x] Verify: `npm install` succeeds cleanly
- [x] Commit

### Task 2: Dev Tooling — ESLint, Prettier, Husky, lint-staged

- [x] Create `eslint.config.js` (flat config, ESM, Node 22 globals)
- [x] Create `.prettierrc` (consistent formatting rules)
- [x] Create `.lintstagedrc.json` (src, test, template JS → eslint + prettier; i18n YAML → prettier)
- [x] Initialise Husky: `npx husky init`
- [x] Configure `.husky/pre-commit` to run `npx lint-staged`
- [x] Verify: `npm run lint` runs (exits clean on empty dirs)
- [x] Verify: `npm run format:check` runs
- [x] Commit

### Task 3: Test Framework — Vitest with Coverage

- [x] Create `vitest.config.js` (ESM, coverage with v8 provider, include `src/lib/**`, coverage thresholds lines/branches 80%)
- [x] Create `test/helpers/test-utils.js` with shared utilities (temp dir creation, fixture path resolver, output reader)
- [x] Create a placeholder unit test (`test/unit/placeholder.test.js`) to verify Vitest runs
- [x] Verify: `npm test` passes
- [x] Verify: `npm run test:coverage` produces a coverage report
- [x] Remove placeholder test
- [x] Commit

### Task 4: Test Fixtures

- [x] Create `test/fixtures/minimal/` — bare minimum valid site
- [x] Create `test/fixtures/full/` — all features exercised
- [x] Create `test/fixtures/blog/` — blog scheduling fixtures
- [x] Create `test/fixtures/i18n-override/` — custom i18n overrides
- [x] Create `test/fixtures/visibility-hidden/` — all visibility flags false
- [x] Create `test/fixtures/invalid/` — error testing
- [x] Verify: fixture files are valid YAML/Markdown where expected
- [x] Commit

### Task 5: YAML Compilation & Validation (`compile-yaml.js`, `validate.js`)

- [x] Create `src/lib/compile-yaml.js` — YAML file reader + parser
- [x] Create `src/lib/validate.js` — schema validation
- [x] Create `test/unit/compile-yaml.test.js` (6 tests)
- [x] Create `test/unit/validate.test.js` (5 tests)
- [x] Verify: `npm test` passes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 6: Visibility Stripping (`strip-visibility.js`)

- [x] Create `src/lib/strip-visibility.js`
- [x] Create `test/unit/strip-visibility.test.js` (14 tests)
- [x] Verify: `npm test` passes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 7: Markdown Compilation (`compile-markdown.js`)

- [x] Create `src/lib/compile-markdown.js`
- [x] Create `test/unit/compile-markdown.test.js` (9 tests)
- [x] Verify: `npm test` passes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 8: Blog Compilation (`compile-blog.js`)

- [x] Create `src/lib/compile-blog.js`
- [x] Create `test/unit/compile-blog.test.js` (12 tests)
- [x] Verify: `npm test` passes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 9: Cross-Reference Index (`compile-crossref.js`)

- [x] Create `src/lib/compile-crossref.js`
- [x] Create `test/unit/compile-crossref.test.js` (9 tests)
- [x] Verify: `npm test` passes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 10: i18n Resolution (`compile-i18n.js`)

- [x] Create `src/lib/compile-i18n.js`
- [x] Create built-in language packs (en, fr, de, es, pt, nl, it, ja, zh, ar)
- [x] Create `test/unit/compile-i18n.test.js` (7 tests)
- [x] Verify: `npm test` passes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 11: SEO File Generation (`compile-seo.js`)

- [x] Create `src/lib/compile-seo.js`
- [x] Create `test/unit/compile-seo.test.js` (12 tests)
- [x] Verify: `npm test` passes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 12: Manifest & Index Generation (`generate-manifest.js`, `generate-index.js`)

- [x] Create `src/lib/generate-manifest.js`
- [x] Create `src/lib/generate-index.js`
- [x] Create `template/index.html` — SPA shell template
- [x] Create `template/404.html` — SPA fallback redirect
- [x] Create `test/unit/generate-manifest.test.js` (10 tests)
- [x] Create `test/unit/generate-index.test.js` (9 tests)
- [x] Verify: `npm test` passes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 13: Build Orchestrator (`src/lib/index.js`) & CLI (`src/cli.js`)

- [x] Create `src/lib/index.js` — main `build(options)` function
- [x] Create `src/cli.js` — CLI wrapper
- [x] Verify: CLI produces output from minimal fixture
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 14: Integration Tests

- [x] Create `test/integration/full-build.test.js` (7 tests)
- [x] Create `test/integration/visibility.test.js` (7 tests)
- [x] Create `test/integration/blog-filtering.test.js` (5 tests)
- [x] Verify: `npm test` passes (116 tests)
- [x] Verify: `npm run test:coverage` meets 80% threshold (83.47% branches)
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 15: CI Workflow & Action Definition

- [x] Create `.github/workflows/ci.yml`
- [x] Create `action.yml` — composite action definition
- [x] Verify: CI workflow YAML is valid
- [x] Verify: action.yml is valid
- [x] Commit

---

## M2 — Core Components

### Task 16: i18n Mixin & App Shell

- [x] Create `template/components/i18n-mixin.js`:
  - Export `I18nMixin(superClass)` that adds `t(key, params?)` method
  - Read from `window.__i18n.labels[key]`, fallback to key itself
  - Interpolate `{n}` style placeholders from params
- [x] Create `template/components/app-shell.js`:
  - Extend LitElement with I18nMixin, Light DOM (createRenderRoot returns this)
  - On connectedCallback: fetch i18n.json → set `window.__i18n`; fetch all data JSON files (site, resume, skills, projects, crossref, manifest, blog index)
  - Store fetched data in reactive properties; gate rendering until data loaded (show loading state)
  - Implement History API router: read manifest routes, match current path, render corresponding page component
  - Handle 404.html redirect query param (restore original path via History API)
  - Pass data down to child components via properties
  - Render: nav-bar, router outlet (main-content), site-footer
- [x] Verify: files are syntactically valid JS
- [x] Verify: `npm run lint` passes (template files included)
- [x] Commit

### Task 17: Navigation & Footer

- [x] Create `template/components/nav-bar.js`:
  - Light DOM Lit component with I18nMixin
  - Accept nav items from app-shell (manifest.nav array)
  - Render responsive navigation: desktop horizontal, mobile hamburger menu
  - Highlight active route
  - Include slots/areas for theme-toggle and pdf-export components
  - Sticky top positioning
  - Dark mode styles (dark: variants)
- [x] Create `template/components/site-footer.js`:
  - Light DOM Lit component with I18nMixin
  - Copyright line with current year
  - "Built with Instant Portfolio" link
  - Dark mode styles
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 18: Hero Section

- [x] Create `template/components/hero-section.js`:
  - Light DOM Lit component with I18nMixin
  - Accept resume data (name, tagline, photo, contact) and site data (hero config, theme)
  - Render name (large heading), tagline (subtitle)
  - Render photo as circular avatar if present
  - Render contact pills: only fields present in data (email, phone, location, website, social links) — hidden fields already absent from data
  - Render quick actions: PDF export button, link to skills (if route exists), link to projects (if route exists)
  - Background modes: gradient (primary → accent), image (with dark overlay at configured opacity), solid (primary colour)
  - Responsive: desktop horizontal layout, tablet/mobile stacked centered
  - Dark mode styles
  - Print: render as simple header block (no background/photo, name + contact only)
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 19: Home Page — Experience & Education Sections

- [x] Create `template/components/timeline-item.js`:
  - Light DOM Lit component with I18nMixin
  - Accept: title, subtitle (company/institution), start, end, description (HTML), skills array
  - Render timeline layout with date range, title, subtitle, description
  - Render skills as pill/badge elements
  - Matched skills are clickable → navigate to `/{skills_path}?highlight=<name>`
  - Unmatched skills render as static muted pills
  - Add `id` attribute for deep-linking (e.g. `experience-<slug>`)
  - Dark mode styles
- [x] Create `template/components/section-experience.js`:
  - Light DOM Lit component with I18nMixin
  - Accept experience array and crossref data
  - Render section heading with i18n label
  - Render timeline-item for each experience entry
  - Only renders if experience data is present (already stripped at build time)
- [x] Create `template/components/section-education.js`:
  - Light DOM Lit component with I18nMixin
  - Accept education array
  - Render section heading with i18n label
  - Render timeline-item for each education entry
  - Only renders if education data is present
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 20: Home Page — Community, Accreditations & Compact Projects

- [x] Create `template/components/section-community.js`:
  - Light DOM Lit component with I18nMixin
  - Accept community array
  - Render each entry: name, role, URL, description
  - Only renders if community data is present
- [x] Create `template/components/section-accreditations.js`:
  - Light DOM Lit component with I18nMixin
  - Accept accreditations array
  - Render each entry: title, issuer, date, optional URL
  - Only renders if accreditations data is present
- [x] Create `template/components/project-card-compact.js`:
  - Light DOM Lit component with I18nMixin
  - Accept project data (name, start, end, skills, slug)
  - Compact horizontal card with project name, date range, skill pills
  - Links to `/{projects_path}#project-<slug>`
- [x] Create `template/components/section-projects.js`:
  - Light DOM Lit component with I18nMixin
  - Accept projects array
  - Render heading, then compact project cards in horizontal scroll/grid
  - Only renders if projects data is present
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 21: Home Page Assembly (`page-home.js`)

- [x] Create `template/components/page-home.js`:
  - Light DOM Lit component with I18nMixin
  - Accept all data from app-shell (resume, skills, projects, crossref, site, i18n, routes)
  - Render hero-section
  - Render `#printable-content` wrapper containing (in order):
    - Summary (rendered markdown from resume.summary)
    - section-experience (if data present)
    - section-education (if data present)
    - section-accreditations (if data present)
    - section-community (if data present)
    - section-projects compact (if data present)
  - Sections only render when their data exists — no visibility checks needed in components (build already stripped)
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 22: Projects Page

- [x] Create `template/components/project-card.js`:
  - Light DOM Lit component with I18nMixin
  - Full detail project card: name, description (HTML), date range, image, skills pills, tags, URL link, repo link
  - `id="project-<slug>"` anchor for deep linking
  - Featured projects have prominent styling
  - Ongoing/completed derived from dates (no end → "Ongoing" label)
  - Dark mode styles
- [x] Create `template/components/page-projects.js`:
  - Light DOM Lit component with I18nMixin
  - Accept projects data
  - Render featured projects prominently at top
  - Render all projects as full detail cards
  - Only route exists if projects visible + data present (enforced by manifest)
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 23: Theme Toggle & Dark Mode Setup

- [x] Create `template/components/theme-toggle.js`:
  - Light DOM Lit component with I18nMixin
  - Cycle: light → dark → system
  - On light/dark: write to localStorage, apply `.dark` class to `<html>`
  - On system: remove localStorage entry, follow OS preference
  - Listen to `matchMedia('(prefers-color-scheme: dark)')` change events for live system updates
  - Render button with icon/label indicating current mode
  - Accessible: aria-label from i18n
- [x] Verify Tailwind dark mode setup in `template/index.html`:
  - `@custom-variant dark (&:where(.dark, .dark *));` declaration present
  - FOUC-prevention inline script reads localStorage + theme_mode before first paint
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 24: PDF Export & Print Styles

- [x] Create `template/components/pdf-export.js`:
  - Light DOM Lit component with I18nMixin
  - Button in nav bar
  - Lazy-load `html2pdf.js` from CDN on first click
  - Export `#printable-content` region to PDF (A4, portrait, margins, filename from site title)
  - Show generating state while processing
  - Accessible: aria-label from i18n
- [x] Add `@media print` styles (inline in index.html or separate print stylesheet):
  - Hero renders as simple header (no background/gradient/photo)
  - Hide nav, theme toggle, PDF button, filter UI
  - Single-column A4/Letter optimised layout
  - Page break rules (avoid breaking inside timeline entries, cards)
  - Force light theme
  - Show URLs after links
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 25: 404 Page & RTL Support

- [x] Create `template/components/page-not-found.js`:
  - Light DOM Lit component with I18nMixin
  - Render 404 title, message, and "Go Home" link (all from i18n)
  - Shown for unknown SPA routes
- [x] Verify RTL support:
  - `generate-index.js` sets `dir="${dir}"` from i18n pack on `<html>` element
  - Components use CSS logical properties (margin-inline-start, padding-inline-end, etc.)
  - `ar.yml` has `dir: rtl`
  - Tailwind `rtl:` variants available for components needing explicit RTL overrides
- [x] Verify: `npm run lint` passes
- [x] Commit

---

## M3 — Skills, Blog & Pages

### Task 26: Skills Page — Explorer & Cards

- [x] Create `template/components/skill-card.js`:
  - Light DOM Lit component with I18nMixin
  - Accept skill data (name, level, years, icon, tags, links) and crossref data
  - Render: skill name, level indicator (visual bar/badge), years, icon from Simple Icons CDN
  - Render tags as badges
  - Render links section (label or URL hostname, clickable)
  - Render "Used in" section: experience entries + project entries from crossref (visually distinguished with icons)
  - "Used in" links navigate to relevant home page sections
- [x] Create `template/components/skill-explorer.js`:
  - Light DOM Lit component with I18nMixin
  - Accept full skills data (categories) and crossref
  - Text search input (filters by name or tag in real-time)
  - Category filter (dropdown or tabs, "All Categories" option)
  - Tag cloud (clickable tags filter the grid)
  - Render skill cards in responsive grid within collapsible category sections
  - Support `?highlight=<skill>` query param: auto-scroll to and highlight the specified skill
- [x] Create `template/components/page-skills.js`:
  - Light DOM Lit component with I18nMixin
  - Accept skills and crossref data from app-shell
  - Render skill-explorer
  - Route only exists if visibility.skills: true (enforced by manifest)
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 27: Blog — Index Page & Post Cards

- [x] Create `template/components/blog-card.js`:
  - Light DOM Lit component with I18nMixin
  - Accept post metadata (title, slug, description, publish_on, tags, image, reading_time, featured)
  - Render card: title, date, description, tags, image (if present), reading time
  - Featured posts have distinct styling
  - Link to `/{blog_path}/<slug>`
- [x] Create `template/components/page-blog.js`:
  - Light DOM Lit component with I18nMixin
  - Accept blog index data (posts array, tags) from app-shell
  - Featured posts shown prominently at top
  - Render blog-card for each post
  - Tag cloud/sidebar: clickable tags filter to matching posts
  - Support `?tag=<tag>` URL for shareable filtered views
  - Client-side pagination (10 posts per page)
  - Empty state message (blog_no_posts i18n label)
  - Route only exists if blog enabled (enforced by manifest)
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 28: Blog — Individual Post Page

- [x] Create `template/components/page-blog-post.js`:
  - Light DOM Lit component with I18nMixin
  - Accept individual post data (fetched on route change from blog/<slug>.json)
  - Render post header: title, publish date, updated date (if set), author, reading time, tags
  - Render post image (if set) as hero/banner
  - Render post body (content_html)
  - Previous/next post navigation links at bottom
  - "Back to blog" link
  - Lazy-load individual post JSON on route navigation
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 29: Custom Markdown Pages

- [x] Create `template/components/page-custom.js`:
  - Light DOM Lit component with I18nMixin
  - Accept page data (title, content_html, meta) from app-shell
  - Render page title and HTML content
  - Lazy-load individual page JSON on route navigation
- [x] Ensure app-shell router handles dynamic page routes:
  - Custom page slugs registered from manifest.routes
  - Page component loads `data/pages/<slug>.json` on navigation
- [x] Verify: `npm run lint` passes
- [x] Commit

---

## M4 — Polish & Release

### Task 30: Accessibility Audit

- [x] Review all components for ARIA attributes:
  - Buttons have aria-label where icon-only
  - Nav uses semantic `<nav>` element with aria-label
  - Main content has `<main>` landmark with id for skip link
  - Headings use proper hierarchy (h1 → h2 → h3)
  - Images have alt text
  - Interactive elements are keyboard-focusable
  - Form inputs have labels
- [x] Verify skip-to-content link works (`<a href="#main-content">`)
- [x] Verify keyboard navigation through all interactive elements (tab order, enter/space activation)
- [x] Verify colour contrast meets WCAG AA for both light and dark themes
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 31: Performance Optimisation

- [x] Add `preconnect` hints in index.html for CDN domains (jsdelivr, simpleicons)
- [x] Verify page data is lazy-loaded (skills, projects, blog post JSON fetched only when route is navigated to)
- [x] Verify html2pdf.js is only loaded on PDF button click (not on page load)
- [x] Verify images use `loading="lazy"` attribute
- [x] Verify: `npm run lint` passes
- [x] Commit

### Task 32: Documentation & README

- [x] Create `README.md`:
  - Project title and description ("Instant Portfolio" branding)
  - Quick start guide (create repo, add YAML files, add workflow, deploy)
  - Data schema reference (site.yml, resume.yml, skills.yml, projects.yml)
  - Markdown pages guide (frontmatter fields, media references)
  - Blog guide (frontmatter fields, scheduling, RSS)
  - Configuration reference (all action inputs)
  - Visibility system explanation
  - i18n guide (built-in languages, overrides, custom locales)
  - Theme configuration (light/dark/system, custom colours)
  - SEO features (robots.txt, sitemap, llms.txt, RSS)
  - Reference deployment workflows: GitHub Pages, Cloudflare Pages, Netlify, S3 (incl. cron schedule example)
  - Development guide (local build, testing, contributing)
- [x] Verify: `npm run lint` passes
- [x] Verify: `npm run format:check` passes
- [x] Commit

### Task 33: Final Quality Checks & Release

- [x] Run full test suite: `npm run test:coverage` — all tests pass, coverage >= 80%
- [x] Run lint: `npm run lint` — no errors
- [x] Run format check: `npm run format:check` — all files formatted
- [x] Run CLI smoke test: `node src/cli.js --data-dir test/fixtures/full --pages-dir test/fixtures/full/pages --blog-dir test/fixtures/full/blog --media-dir test/fixtures/full/media --output-dir /tmp/smoke-test` — succeeds
- [x] Verify all expected output files present in smoke test output
- [x] Review all files for accidental secret exposure, hardcoded paths, or debug code
- [x] Tag `v1` release
- [x] Commit

### Task 34: Agent Coding Guidelines (CLAUDE.md)

- [x] Scan and analyse the entire codebase: directory structure, module patterns, naming conventions, import styles, test patterns
- [x] Review `.planning/PLAN.md` and `.planning/TASKS.md` for project context, naming conventions, and architectural decisions
- [x] Review all config files (eslint, prettier, vitest, lint-staged, husky) for enforced standards
- [x] Create `CLAUDE.md` at the project root with comprehensive agent coding guidelines covering:
  - Project overview and architecture summary
  - Directory structure and file organisation
  - Code style and conventions (ESM, Node 22, naming, imports)
  - Component patterns (Lit 3, Light DOM, I18nMixin, Tailwind)
  - Testing conventions (Vitest, fixture structure, coverage thresholds)
  - Build pipeline and CLI usage
  - Git workflow and commit conventions
  - Quality gates (lint, format, test) that must pass before commits
  - Common pitfalls and gotchas discovered during development
- [x] Verify: `npm run lint` passes
- [x] Verify: `npm run format:check` passes
- [x] Commit
