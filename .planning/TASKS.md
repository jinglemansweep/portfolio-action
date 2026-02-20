# Instant Portfolio — Task List

> Auto-generated from [PLAN.md](./PLAN.md). Each task group must be completed and committed before proceeding to the next. Quality checks (lint, format, test) must pass before any commit.

---

## M1 — Foundation

### Task 1: Project Scaffolding

- [ ] Create `package.json` with name `portfolio`, type `module`, Node 22 engine, scripts (`lint`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`, `build`), dependencies (`js-yaml`, `markdown-it`, `gray-matter`), devDependencies (`vitest`, `@vitest/coverage-v8`, `eslint`, `prettier`, `husky`, `lint-staged`)
- [ ] Run `npm install` to generate `package-lock.json`
- [ ] Create `.gitignore` (node_modules/, _site/, coverage/, *.tgz)
- [ ] Create directory structure: `src/lib/`, `test/unit/`, `test/integration/`, `test/fixtures/`, `test/helpers/`, `i18n/`, `template/components/`
- [ ] Verify: `npm install` succeeds cleanly
- [ ] Commit

### Task 2: Dev Tooling — ESLint, Prettier, Husky, lint-staged

- [ ] Create `eslint.config.js` (flat config, ESM, Node 22 globals)
- [ ] Create `.prettierrc` (consistent formatting rules)
- [ ] Create `.lintstagedrc.json` (src, test, template JS → eslint + prettier; i18n YAML → prettier)
- [ ] Initialise Husky: `npx husky init`
- [ ] Configure `.husky/pre-commit` to run `npx lint-staged`
- [ ] Verify: `npm run lint` runs (exits clean on empty dirs)
- [ ] Verify: `npm run format:check` runs
- [ ] Commit

### Task 3: Test Framework — Vitest with Coverage

- [ ] Create `vitest.config.js` (ESM, coverage with v8 provider, include `src/lib/**`, coverage thresholds lines/branches 80%)
- [ ] Create `test/helpers/test-utils.js` with shared utilities (temp dir creation, fixture path resolver, output reader)
- [ ] Create a placeholder unit test (`test/unit/placeholder.test.js`) to verify Vitest runs
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run test:coverage` produces a coverage report
- [ ] Remove placeholder test
- [ ] Commit

### Task 4: Test Fixtures

- [ ] Create `test/fixtures/minimal/` — bare minimum valid site:
  - `site.yml` (minimal required fields: title, description, lang)
  - `resume.yml` (name, tagline, contact with at least location)
  - `skills.yml` (one category with one skill)
  - `projects.yml` (one project with required fields)
- [ ] Create `test/fixtures/full/` — all features exercised:
  - `site.yml` (all fields populated including hero, visibility, seo, i18n_overrides)
  - `resume.yml` (full contact, education, experience with skills, community, accreditations)
  - `skills.yml` (multiple categories, skills with levels/tags/links/icons)
  - `projects.yml` (multiple projects, featured flags, skills, tags)
  - `media/test-image.png` (small test image)
  - `pages/about.md` (markdown page with frontmatter: title, slug, nav_order, show_in_nav)
  - `blog/2026-01-15-test-post.md` (published post with all frontmatter fields)
  - `blog/2026-12-31-future-post.md` (future-dated post — should be excluded)
- [ ] Create `test/fixtures/blog/` — blog scheduling fixtures:
  - Published post (past publish_on, no expire_on)
  - Draft post (draft: true)
  - Future post (publish_on in future)
  - Expired post (expire_on in past)
- [ ] Create `test/fixtures/i18n-override/` — custom i18n overrides:
  - `site.yml` with `i18n_overrides.labels` overriding several keys
  - Minimal resume.yml, skills.yml, projects.yml
- [ ] Create `test/fixtures/visibility-hidden/` — all visibility flags false:
  - `site.yml` with all visibility flags set to `false`
  - Full resume.yml, skills.yml, projects.yml (data present but should be stripped)
- [ ] Create `test/fixtures/invalid/` — error testing:
  - `malformed.yml` (invalid YAML syntax)
  - `missing-fields.yml` (valid YAML, missing required fields)
  - Directory with missing required files
- [ ] Verify: fixture files are valid YAML/Markdown where expected
- [ ] Commit

### Task 5: YAML Compilation & Validation (`compile-yaml.js`, `validate.js`)

- [ ] Create `src/lib/compile-yaml.js` — YAML file reader + parser:
  - Read YAML file from path, parse with `js-yaml`
  - Merge visibility defaults (all true except email, phone → false)
  - Merge SEO defaults (indexing, follow_links, sitemap, llms_txt, rss → true)
  - Return parsed and merged data object
  - Handle missing file (throw descriptive error)
  - Handle malformed YAML (throw descriptive error with parse details)
- [ ] Create `src/lib/validate.js` — schema validation:
  - Validate `site.yml` required fields (title, description, lang)
  - Validate `resume.yml` required fields (name, tagline)
  - Validate `skills.yml` structure (categories array with skills)
  - Validate `projects.yml` structure (projects array with name, description, start)
  - Return array of validation errors with file, field, and reason
  - Provide helpful error messages for common mistakes
- [ ] Create `test/unit/compile-yaml.test.js`:
  - Test: parses valid YAML files correctly
  - Test: merges visibility defaults (email/phone false, others true)
  - Test: merges SEO defaults
  - Test: throws on missing file with descriptive message
  - Test: throws on malformed YAML with parse error details
  - Test: user overrides are preserved over defaults
- [ ] Create `test/unit/validate.test.js`:
  - Test: valid minimal fixture passes validation
  - Test: valid full fixture passes validation
  - Test: missing required fields produce specific errors
  - Test: invalid types produce specific errors
  - Test: empty/missing file produces clear error
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 6: Visibility Stripping (`strip-visibility.js`)

- [ ] Create `src/lib/strip-visibility.js`:
  - Strip contact fields (email, phone, location, website, links) from resume when flag is false
  - Strip section arrays (education, experience, community, accreditations) from resume when flag is false
  - Omit skills data entirely when visibility.skills is false
  - Omit projects data entirely when visibility.projects is false
  - Omit blog data entirely when visibility.blog is false
  - Return new objects (do not mutate inputs)
- [ ] Create `test/unit/strip-visibility.test.js`:
  - Test: default visibility preserves all data
  - Test: email=false strips contact.email from output
  - Test: phone=false strips contact.phone from output
  - Test: location=false strips contact.location
  - Test: website=false strips contact.website
  - Test: links=false strips contact.links array
  - Test: education=false removes education array entirely
  - Test: experience=false removes experience array entirely
  - Test: community=false removes community array
  - Test: accreditations=false removes accreditations array
  - Test: skills=false returns null/undefined for skills data
  - Test: projects=false returns null/undefined for projects data
  - Test: all flags false strips everything — output contains NO hidden data
  - Test: original input objects are not mutated
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 7: Markdown Compilation (`compile-markdown.js`)

- [ ] Create `src/lib/compile-markdown.js`:
  - Read markdown files from directory (pages/ or individual files)
  - Parse frontmatter with `gray-matter`
  - Render markdown body to HTML with `markdown-it`
  - Rewrite media paths as relative (`media/filename.ext`)
  - Derive slug from filename if not in frontmatter
  - Return array of `{ slug, title, description, content_html, meta }` objects
- [ ] Create `test/unit/compile-markdown.test.js`:
  - Test: parses frontmatter fields (title, slug, description, nav_order, show_in_nav)
  - Test: renders markdown to HTML (headings, bold, lists, code blocks)
  - Test: rewrites media paths (`media/image.png` stays relative)
  - Test: derives slug from filename when frontmatter slug omitted
  - Test: handles empty pages directory gracefully (returns empty array)
  - Test: handles file with no frontmatter
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 8: Blog Compilation (`compile-blog.js`)

- [ ] Create `src/lib/compile-blog.js`:
  - Read blog markdown files from directory
  - Parse frontmatter (title, slug, publish_on, expire_on, draft, tags, image, featured, reading_time, author, updated_on, description)
  - Filter: exclude drafts (draft: true)
  - Filter: exclude future posts (publish_on > buildDate)
  - Filter: exclude expired posts (expire_on <= buildDate)
  - Sort by publish_on descending (newest first)
  - Calculate reading time (word count / 200 wpm, rounded up)
  - Build tag index (tag → [slugs])
  - Derive slug from filename if not in frontmatter
  - Default author to resume.name if omitted
  - Return `{ posts: [...], tags: {...} }` or null if no publishable posts
- [ ] Create `test/unit/compile-blog.test.js`:
  - Test: parses blog post frontmatter correctly
  - Test: excludes draft posts
  - Test: excludes future-dated posts (publish_on > buildDate)
  - Test: excludes expired posts (expire_on <= buildDate)
  - Test: includes post when publish_on <= buildDate and no expiry
  - Test: sorts posts by publish_on descending
  - Test: calculates reading time (e.g. 400 words → 2 min)
  - Test: builds tag index correctly
  - Test: returns null when no publishable posts
  - Test: returns null when blog directory missing/empty
  - Test: derives slug from filename
  - Test: defaults author to provided resume name
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 9: Cross-Reference Index (`compile-crossref.js`)

- [ ] Create `src/lib/compile-crossref.js`:
  - Build normalised skill name index (lowercase) from skills data
  - Match experience skills[] against index (case-insensitive)
  - Match project skills[] against index (case-insensitive)
  - Build bidirectional maps: skillToExperience, skillToProject, experienceToSkills, projectToSkills
  - Handle null/missing skills, experience, or projects data gracefully
  - Collect warnings for unmatched skill names
  - Return `{ crossref, warnings }` object
- [ ] Create `test/unit/compile-crossref.test.js`:
  - Test: matches skills case-insensitively (Docker === docker)
  - Test: builds correct skillToExperience map
  - Test: builds correct skillToProject map
  - Test: builds correct experienceToSkills map
  - Test: builds correct projectToSkills map
  - Test: produces warnings for unmatched skill names
  - Test: handles null skills data (returns empty crossref)
  - Test: handles null projects data (omits project mappings)
  - Test: handles null experience data (omits experience mappings)
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 10: i18n Resolution (`compile-i18n.js`)

- [ ] Create `src/lib/compile-i18n.js`:
  - Load built-in language pack for site.lang from i18n/ directory (fallback: en)
  - Support `lang: custom` with `i18n_file` path
  - Deep-merge i18n_overrides from site.yml over base pack
  - Validate all required keys present (collect warnings for missing)
  - Return `{ i18n, warnings }` object
- [ ] Create built-in language packs in `i18n/`:
  - `en.yml` (reference — all keys as per PLAN.md)
  - `fr.yml`, `de.yml`, `es.yml`, `pt.yml`, `nl.yml`, `it.yml`, `ja.yml`, `zh.yml`, `ar.yml` (RTL)
- [ ] Create `test/unit/compile-i18n.test.js`:
  - Test: loads English pack by default
  - Test: loads specified language pack (e.g. fr)
  - Test: deep-merges user overrides
  - Test: falls back to English for unknown language
  - Test: warns on missing keys after merge
  - Test: supports custom locale file via i18n_file
  - Test: ar pack has dir: rtl
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 11: SEO File Generation (`compile-seo.js`)

- [ ] Create `src/lib/compile-seo.js`:
  - Generate `robots.txt` content (respects seo.robots.indexing flag)
  - Generate `sitemap.xml` content (only visible routes, i18n paths, build date as lastmod, priority per route type)
  - Generate `llms.txt` content (structured plain-text from stripped data — contact, experience, projects, education, skills, community, accreditations, blog)
  - Generate `feed.xml` content (RSS 2.0, blog posts ordered by publish_on desc, max 20 items)
  - Resolve site URL from: site_url → GITHUB_REPOSITORY env → omit absolute URLs
  - Generate meta robots content string (index/noindex, follow/nofollow)
  - All generators accept stripped data only (privacy guaranteed by caller)
- [ ] Create `test/unit/compile-seo.test.js`:
  - Test: robots.txt allows all when indexing: true
  - Test: robots.txt disallows all when indexing: false
  - Test: robots.txt includes sitemap URL when site_url available
  - Test: sitemap includes only visible routes
  - Test: sitemap excludes routes where visibility is false
  - Test: sitemap uses i18n route paths
  - Test: llms.txt includes visible sections only
  - Test: llms.txt excludes stripped contact fields
  - Test: llms.txt includes blog posts when blog enabled
  - Test: feed.xml contains published posts in correct order
  - Test: feed.xml omits when blog disabled
  - Test: meta robots string correct for all flag combinations
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 12: Manifest & Index Generation (`generate-manifest.js`, `generate-index.js`)

- [ ] Create `src/lib/generate-manifest.js`:
  - Generate routes array (/, i18n-resolved skills/projects/blog paths, custom page slugs)
  - Exclude routes where visibility is false or data is absent
  - Generate nav array from routes (Home always present; Skills, Projects, Blog conditional; custom pages sorted by nav_order)
  - Return `{ routes, nav }` object
- [ ] Create `src/lib/generate-index.js`:
  - Read `template/index.html` template file
  - Interpolate variables: lang, dir, title, description, base_path, primary, accent, theme_mode, robots_meta, rss_link, a11y_skip_to_content
  - Return compiled HTML string
- [ ] Create `template/index.html` — SPA shell template (as per PLAN.md: Tailwind CDN, Lit CDN, theme init script, component script import, CSS custom properties, base href, meta tags)
- [ ] Create `template/404.html` — SPA fallback redirect page (encodes path as query param, redirects to index.html)
- [ ] Create `test/unit/generate-manifest.test.js`:
  - Test: includes / route always
  - Test: includes skills route when visibility.skills true
  - Test: excludes skills route when visibility.skills false
  - Test: includes projects route when visible and data present
  - Test: excludes projects route when hidden or data absent
  - Test: includes blog route when enabled with posts
  - Test: excludes blog route when disabled
  - Test: includes custom page routes
  - Test: nav items match routes; hidden routes omitted from nav
  - Test: custom pages sorted by nav_order
- [ ] Create `test/unit/generate-index.test.js`:
  - Test: interpolates lang attribute
  - Test: interpolates dir attribute (ltr/rtl)
  - Test: interpolates title and description meta
  - Test: interpolates base_path in base href
  - Test: interpolates theme custom properties
  - Test: interpolates theme_mode in FOUC-prevention script
  - Test: interpolates robots meta tag
  - Test: includes RSS link when blog enabled
  - Test: omits RSS link when blog disabled
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 13: Build Orchestrator (`src/lib/index.js`) & CLI (`src/cli.js`)

- [ ] Create `src/lib/index.js` — main `build(options)` function:
  - Accept options: `{ dataDir, pagesDir, blogDir, mediaDir, outputDir, actionPath, basePath, siteUrl, buildDate }`
  - Orchestrate full build pipeline (steps 2–17 from PLAN.md):
    1. Read & validate YAML (compile-yaml + validate)
    2. Read & parse pages (compile-markdown)
    3. Read & parse blog posts (compile-blog with filtering)
    4. Resolve i18n bundle (compile-i18n)
    5. Apply visibility stripping (strip-visibility)
    6. Generate cross-reference index (compile-crossref)
    7. Generate manifest (generate-manifest)
    8. Write JSON data files to outputDir/data/
    9. Generate index.html (generate-index)
    10. Copy template components to outputDir/components/
    11. Copy 404.html to outputDir/
    12. Copy media/ to outputDir/media/ (with size warnings)
    13. Generate CNAME if custom_domain set
    14. Generate .nojekyll
    15. Generate SEO files (compile-seo → robots.txt, sitemap.xml, llms.txt, feed.xml)
  - Emit warnings to stderr (or via callback)
  - Exit with code 1 on errors with descriptive messages
  - Use GitHub Actions `::error::` / `::warning::` annotations when in Actions environment
- [ ] Create `src/cli.js` — CLI wrapper:
  - Parse args with `node:util parseArgs` (--data-dir, --pages-dir, --blog-dir, --media-dir, --output-dir, --base-path, --site-url, --build-date)
  - Resolve actionPath from `import.meta.url`
  - Call `build()` with parsed options
  - Handle errors with process.exit(1) and stderr messages
- [ ] Verify: `node src/cli.js --data-dir test/fixtures/minimal --output-dir /tmp/test-build` produces output
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 14: Integration Tests

- [ ] Create `test/integration/full-build.test.js`:
  - Build `test/fixtures/full/` via `lib/index.js`
  - Assert all expected files exist in output (_site/index.html, 404.html, .nojekyll, robots.txt, sitemap.xml, llms.txt, feed.xml)
  - Assert all JSON data files exist (site.json, resume.json, skills.json, projects.json, crossref.json, i18n.json, manifest.json)
  - Assert blog data files exist (blog/index.json, blog/tags.json, blog/<slug>.json)
  - Assert page data files exist (pages/<slug>.json)
  - Assert media files copied (media/test-image.png)
  - Assert components directory copied
  - Assert JSON content is valid and contains expected data
  - Assert index.html contains interpolated values
- [ ] Create `test/integration/visibility.test.js`:
  - Build `test/fixtures/visibility-hidden/` via `lib/index.js`
  - Assert resume.json has NO email, phone, location, website, links
  - Assert resume.json has NO education, experience, community, accreditations arrays
  - Assert skills.json does NOT exist
  - Assert projects.json does NOT exist
  - Assert sitemap.xml excludes hidden routes
  - Assert llms.txt excludes hidden sections
  - Assert manifest.json routes exclude hidden pages
- [ ] Create `test/integration/blog-filtering.test.js`:
  - Build `test/fixtures/blog/` with specific buildDate
  - Assert published post IS in blog/index.json
  - Assert draft post is NOT in blog/index.json
  - Assert future post is NOT in blog/index.json
  - Assert expired post is NOT in blog/index.json
  - Assert feed.xml contains only published post
- [ ] Verify: `npm test` passes (all unit + integration)
- [ ] Verify: `npm run test:coverage` meets 80% threshold
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 15: CI Workflow & Action Definition

- [ ] Create `.github/workflows/ci.yml`:
  - Trigger on push to main and pull requests to main
  - Job `lint`: checkout, setup Node 22 with npm cache, npm ci, npm run lint, npm run format:check
  - Job `test` (needs lint): checkout, setup Node 22 with npm cache, npm ci, npm run test:coverage, upload coverage artifact
  - Job `smoke` (needs test): checkout, setup Node 22 with npm cache, npm ci, run CLI against full fixture, verify output file structure
- [ ] Create `action.yml` — composite action definition:
  - Inputs: data_dir, pages_dir, blog_dir, media_dir, output_dir, base_path, site_url, build_date (all with defaults per PLAN.md)
  - Steps: setup Node 22, npm ci (in action_path), run cli.js with all inputs
  - Output: output_path
- [ ] Verify: CI workflow YAML is valid
- [ ] Verify: action.yml is valid
- [ ] Commit

---

## M2 — Core Components

### Task 16: i18n Mixin & App Shell

- [ ] Create `template/components/i18n-mixin.js`:
  - Export `I18nMixin(superClass)` that adds `t(key, params?)` method
  - Read from `window.__i18n.labels[key]`, fallback to key itself
  - Interpolate `{n}` style placeholders from params
- [ ] Create `template/components/app-shell.js`:
  - Extend LitElement with I18nMixin, Light DOM (createRenderRoot returns this)
  - On connectedCallback: fetch i18n.json → set `window.__i18n`; fetch all data JSON files (site, resume, skills, projects, crossref, manifest, blog index)
  - Store fetched data in reactive properties; gate rendering until data loaded (show loading state)
  - Implement History API router: read manifest routes, match current path, render corresponding page component
  - Handle 404.html redirect query param (restore original path via History API)
  - Pass data down to child components via properties
  - Render: nav-bar, router outlet (main-content), site-footer
- [ ] Verify: files are syntactically valid JS
- [ ] Verify: `npm run lint` passes (template files included)
- [ ] Commit

### Task 17: Navigation & Footer

- [ ] Create `template/components/nav-bar.js`:
  - Light DOM Lit component with I18nMixin
  - Accept nav items from app-shell (manifest.nav array)
  - Render responsive navigation: desktop horizontal, mobile hamburger menu
  - Highlight active route
  - Include slots/areas for theme-toggle and pdf-export components
  - Sticky top positioning
  - Dark mode styles (dark: variants)
- [ ] Create `template/components/site-footer.js`:
  - Light DOM Lit component with I18nMixin
  - Copyright line with current year
  - "Built with Instant Portfolio" link
  - Dark mode styles
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 18: Hero Section

- [ ] Create `template/components/hero-section.js`:
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
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 19: Home Page — Experience & Education Sections

- [ ] Create `template/components/timeline-item.js`:
  - Light DOM Lit component with I18nMixin
  - Accept: title, subtitle (company/institution), start, end, description (HTML), skills array
  - Render timeline layout with date range, title, subtitle, description
  - Render skills as pill/badge elements
  - Matched skills are clickable → navigate to `/{skills_path}?highlight=<name>`
  - Unmatched skills render as static muted pills
  - Add `id` attribute for deep-linking (e.g. `experience-<slug>`)
  - Dark mode styles
- [ ] Create `template/components/section-experience.js`:
  - Light DOM Lit component with I18nMixin
  - Accept experience array and crossref data
  - Render section heading with i18n label
  - Render timeline-item for each experience entry
  - Only renders if experience data is present (already stripped at build time)
- [ ] Create `template/components/section-education.js`:
  - Light DOM Lit component with I18nMixin
  - Accept education array
  - Render section heading with i18n label
  - Render timeline-item for each education entry
  - Only renders if education data is present
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 20: Home Page — Community, Accreditations & Compact Projects

- [ ] Create `template/components/section-community.js`:
  - Light DOM Lit component with I18nMixin
  - Accept community array
  - Render each entry: name, role, URL, description
  - Only renders if community data is present
- [ ] Create `template/components/section-accreditations.js`:
  - Light DOM Lit component with I18nMixin
  - Accept accreditations array
  - Render each entry: title, issuer, date, optional URL
  - Only renders if accreditations data is present
- [ ] Create `template/components/project-card-compact.js`:
  - Light DOM Lit component with I18nMixin
  - Accept project data (name, start, end, skills, slug)
  - Compact horizontal card with project name, date range, skill pills
  - Links to `/{projects_path}#project-<slug>`
- [ ] Create `template/components/section-projects.js`:
  - Light DOM Lit component with I18nMixin
  - Accept projects array
  - Render heading, then compact project cards in horizontal scroll/grid
  - Only renders if projects data is present
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 21: Home Page Assembly (`page-home.js`)

- [ ] Create `template/components/page-home.js`:
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
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 22: Projects Page

- [ ] Create `template/components/project-card.js`:
  - Light DOM Lit component with I18nMixin
  - Full detail project card: name, description (HTML), date range, image, skills pills, tags, URL link, repo link
  - `id="project-<slug>"` anchor for deep linking
  - Featured projects have prominent styling
  - Ongoing/completed derived from dates (no end → "Ongoing" label)
  - Dark mode styles
- [ ] Create `template/components/page-projects.js`:
  - Light DOM Lit component with I18nMixin
  - Accept projects data
  - Render featured projects prominently at top
  - Render all projects as full detail cards
  - Only route exists if projects visible + data present (enforced by manifest)
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 23: Theme Toggle & Dark Mode Setup

- [ ] Create `template/components/theme-toggle.js`:
  - Light DOM Lit component with I18nMixin
  - Cycle: light → dark → system
  - On light/dark: write to localStorage, apply `.dark` class to `<html>`
  - On system: remove localStorage entry, follow OS preference
  - Listen to `matchMedia('(prefers-color-scheme: dark)')` change events for live system updates
  - Render button with icon/label indicating current mode
  - Accessible: aria-label from i18n
- [ ] Verify Tailwind dark mode setup in `template/index.html`:
  - `@custom-variant dark (&:where(.dark, .dark *));` declaration present
  - FOUC-prevention inline script reads localStorage + theme_mode before first paint
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 24: PDF Export & Print Styles

- [ ] Create `template/components/pdf-export.js`:
  - Light DOM Lit component with I18nMixin
  - Button in nav bar
  - Lazy-load `html2pdf.js` from CDN on first click
  - Export `#printable-content` region to PDF (A4, portrait, margins, filename from site title)
  - Show generating state while processing
  - Accessible: aria-label from i18n
- [ ] Add `@media print` styles (inline in index.html or separate print stylesheet):
  - Hero renders as simple header (no background/gradient/photo)
  - Hide nav, theme toggle, PDF button, filter UI
  - Single-column A4/Letter optimised layout
  - Page break rules (avoid breaking inside timeline entries, cards)
  - Force light theme
  - Show URLs after links
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 25: 404 Page & RTL Support

- [ ] Create `template/components/page-not-found.js`:
  - Light DOM Lit component with I18nMixin
  - Render 404 title, message, and "Go Home" link (all from i18n)
  - Shown for unknown SPA routes
- [ ] Verify RTL support:
  - `generate-index.js` sets `dir="${dir}"` from i18n pack on `<html>` element
  - Components use CSS logical properties (margin-inline-start, padding-inline-end, etc.)
  - `ar.yml` has `dir: rtl`
  - Tailwind `rtl:` variants available for components needing explicit RTL overrides
- [ ] Verify: `npm run lint` passes
- [ ] Commit

---

## M3 — Skills, Blog & Pages

### Task 26: Skills Page — Explorer & Cards

- [ ] Create `template/components/skill-card.js`:
  - Light DOM Lit component with I18nMixin
  - Accept skill data (name, level, years, icon, tags, links) and crossref data
  - Render: skill name, level indicator (visual bar/badge), years, icon from Simple Icons CDN
  - Render tags as badges
  - Render links section (label or URL hostname, clickable)
  - Render "Used in" section: experience entries + project entries from crossref (visually distinguished with icons)
  - "Used in" links navigate to relevant home page sections
- [ ] Create `template/components/skill-explorer.js`:
  - Light DOM Lit component with I18nMixin
  - Accept full skills data (categories) and crossref
  - Text search input (filters by name or tag in real-time)
  - Category filter (dropdown or tabs, "All Categories" option)
  - Tag cloud (clickable tags filter the grid)
  - Render skill cards in responsive grid within collapsible category sections
  - Support `?highlight=<skill>` query param: auto-scroll to and highlight the specified skill
- [ ] Create `template/components/page-skills.js`:
  - Light DOM Lit component with I18nMixin
  - Accept skills and crossref data from app-shell
  - Render skill-explorer
  - Route only exists if visibility.skills: true (enforced by manifest)
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 27: Blog — Index Page & Post Cards

- [ ] Create `template/components/blog-card.js`:
  - Light DOM Lit component with I18nMixin
  - Accept post metadata (title, slug, description, publish_on, tags, image, reading_time, featured)
  - Render card: title, date, description, tags, image (if present), reading time
  - Featured posts have distinct styling
  - Link to `/{blog_path}/<slug>`
- [ ] Create `template/components/page-blog.js`:
  - Light DOM Lit component with I18nMixin
  - Accept blog index data (posts array, tags) from app-shell
  - Featured posts shown prominently at top
  - Render blog-card for each post
  - Tag cloud/sidebar: clickable tags filter to matching posts
  - Support `?tag=<tag>` URL for shareable filtered views
  - Client-side pagination (10 posts per page)
  - Empty state message (blog_no_posts i18n label)
  - Route only exists if blog enabled (enforced by manifest)
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 28: Blog — Individual Post Page

- [ ] Create `template/components/page-blog-post.js`:
  - Light DOM Lit component with I18nMixin
  - Accept individual post data (fetched on route change from blog/<slug>.json)
  - Render post header: title, publish date, updated date (if set), author, reading time, tags
  - Render post image (if set) as hero/banner
  - Render post body (content_html)
  - Previous/next post navigation links at bottom
  - "Back to blog" link
  - Lazy-load individual post JSON on route navigation
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 29: Custom Markdown Pages

- [ ] Create `template/components/page-custom.js`:
  - Light DOM Lit component with I18nMixin
  - Accept page data (title, content_html, meta) from app-shell
  - Render page title and HTML content
  - Lazy-load individual page JSON on route navigation
- [ ] Ensure app-shell router handles dynamic page routes:
  - Custom page slugs registered from manifest.routes
  - Page component loads `data/pages/<slug>.json` on navigation
- [ ] Verify: `npm run lint` passes
- [ ] Commit

---

## M4 — Polish & Release

### Task 30: Accessibility Audit

- [ ] Review all components for ARIA attributes:
  - Buttons have aria-label where icon-only
  - Nav uses semantic `<nav>` element with aria-label
  - Main content has `<main>` landmark with id for skip link
  - Headings use proper hierarchy (h1 → h2 → h3)
  - Images have alt text
  - Interactive elements are keyboard-focusable
  - Form inputs have labels
- [ ] Verify skip-to-content link works (`<a href="#main-content">`)
- [ ] Verify keyboard navigation through all interactive elements (tab order, enter/space activation)
- [ ] Verify colour contrast meets WCAG AA for both light and dark themes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 31: Performance Optimisation

- [ ] Add `preconnect` hints in index.html for CDN domains (jsdelivr, simpleicons)
- [ ] Verify page data is lazy-loaded (skills, projects, blog post JSON fetched only when route is navigated to)
- [ ] Verify html2pdf.js is only loaded on PDF button click (not on page load)
- [ ] Verify images use `loading="lazy"` attribute
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 32: Documentation & README

- [ ] Create `README.md`:
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
- [ ] Verify: `npm run lint` passes
- [ ] Verify: `npm run format:check` passes
- [ ] Commit

### Task 33: Final Quality Checks & Release

- [ ] Run full test suite: `npm run test:coverage` — all tests pass, coverage >= 80%
- [ ] Run lint: `npm run lint` — no errors
- [ ] Run format check: `npm run format:check` — all files formatted
- [ ] Run CLI smoke test: `node src/cli.js --data-dir test/fixtures/full --pages-dir test/fixtures/full/pages --blog-dir test/fixtures/full/blog --media-dir test/fixtures/full/media --output-dir /tmp/smoke-test` — succeeds
- [ ] Verify all expected output files present in smoke test output
- [ ] Review all files for accidental secret exposure, hardcoded paths, or debug code
- [ ] Tag `v1` release
- [ ] Commit
