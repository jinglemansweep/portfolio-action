# Instant Portfolio — Project Plan

## Overview

A **reusable GitHub Action** that builds a modern, SPA-like personal portfolio/resume site from YAML data and Markdown pages. End users create a minimal repo with their content; our action compiles it into a ready-to-deploy static site. Deployment is handled separately by the user's workflow, making the action **hosting-agnostic** — GitHub Pages, Cloudflare Pages, Netlify, S3, or any static host.

### Naming Conventions

| Context | Name | Notes |
|---|---|---|
| Brand / public name | **Instant Portfolio** | Used in README, action marketplace listing, docs |
| Codename | **portfolio** | Internal reference, shorthand |
| GitHub repo | `portfolio-action` | github.com/jinglemansweep/portfolio-action |
| npm package name | `portfolio` | `package.json` → `"name": "portfolio"` |
| Module/import paths | `portfolio` | e.g. `import { build } from 'portfolio'` |
| Action reference | `jinglemansweep/portfolio-action@v1` | In end user workflows |
| Action marketplace | `Instant Portfolio` | `action.yml` → `name` field |

---

## Architecture

### Repository Structure

**Action Repo** (`jinglemansweep/portfolio-action`):

```
portfolio-action/
├── action.yml                    # Composite action definition
├── .github/
│   └── workflows/
│       └── ci.yml                # Lint, type-check, test on push/PR
├── .husky/
│   └── pre-commit                # Runs lint-staged on commit
├── .lintstagedrc.json            # Lint-staged config
├── eslint.config.js              # ESLint flat config (v9+)
├── .prettierrc                   # Prettier config
├── src/
│   ├── cli.js                    # CLI arg parsing → calls lib/index.js
│   └── lib/                      # Core build library (pure, testable, no side effects)
│       ├── index.js              # Orchestrator — exported function, no CLI/FS globals
│       ├── compile-yaml.js       # YAML → JSON compiler
│       ├── strip-visibility.js   # Strips hidden data before serialisation (privacy)
│       ├── compile-markdown.js   # Markdown + frontmatter → JSON (rewrites media paths)
│       ├── compile-blog.js       # Blog post processing (scheduling, sorting, RSS)
│       ├── compile-crossref.js   # Builds skill ↔ experience ↔ project cross-ref index
│       ├── compile-i18n.js       # Resolves language pack + user overrides → i18n bundle
│       ├── compile-seo.js        # Generates robots.txt, sitemap.xml, llms.txt, feed.xml
│       ├── generate-index.js     # Generates index.html from template
│       ├── generate-manifest.js  # Builds site manifest (routes, metadata)
│       └── validate.js           # Schema validation for all YAML inputs
├── test/
│   ├── fixtures/                 # Sample YAML/MD files for testing
│   │   ├── minimal/              # Bare minimum valid site (all YAML, no pages/blog/media)
│   │   ├── full/                 # All features exercised
│   │   │   ├── site.yml
│   │   │   ├── resume.yml
│   │   │   ├── skills.yml
│   │   │   ├── projects.yml
│   │   │   ├── media/
│   │   │   │   └── test-image.png
│   │   │   ├── pages/
│   │   │   │   └── about.md
│   │   │   └── blog/
│   │   │       ├── 2026-01-15-test-post.md
│   │   │       └── 2026-12-31-future-post.md
│   │   ├── blog/                 # Blog scheduling fixtures (published, draft, future, expired)
│   │   ├── i18n-override/        # Custom i18n overrides
│   │   ├── visibility-hidden/    # All sections hidden
│   │   └── invalid/              # Malformed YAML for error testing
│   ├── unit/
│   │   ├── compile-yaml.test.js
│   │   ├── strip-visibility.test.js
│   │   ├── compile-markdown.test.js
│   │   ├── compile-blog.test.js
│   │   ├── compile-crossref.test.js
│   │   ├── compile-i18n.test.js
│   │   ├── compile-seo.test.js
│   │   ├── generate-manifest.test.js
│   │   ├── generate-index.test.js
│   │   └── validate.test.js
│   ├── integration/
│   │   ├── full-build.test.js    # End-to-end build from fixtures → _site/
│   │   ├── visibility.test.js    # Verifies hidden sections excluded from output
│   │   └── blog-filtering.test.js # Verifies post scheduling (drafts, future, expired)
│   └── helpers/
│       └── test-utils.js         # Shared test utilities (temp dirs, fixture loaders)
├── i18n/                         # Built-in language packs
│   ├── en.yml
│   ├── fr.yml
│   ├── de.yml
│   ├── es.yml
│   ├── pt.yml
│   ├── nl.yml
│   ├── it.yml
│   ├── ja.yml
│   ├── zh.yml
│   └── ar.yml                    # RTL support
├── template/
│   ├── index.html                # SPA shell template
│   ├── 404.html                  # SPA fallback redirect page
│   ├── components/               # Lit component library (Light DOM)
│   │   ├── app-shell.js          # Top-level app shell, router, i18n provider
│   │   ├── page-home.js          # Resume/summary landing page
│   │   ├── hero-section.js       # Hero banner (name, location, contact, bg image)
│   │   ├── page-skills.js        # Skills explorer
│   │   ├── page-custom.js        # Generic markdown page renderer
│   │   ├── section-education.js  # Education history section
│   │   ├── section-experience.js # Work history / experience section
│   │   ├── section-community.js  # Community involvement section
│   │   ├── section-projects.js   # Compact project cards for home page bottom
│   │   ├── project-card.js       # Full detail project card (projects page)
│   │   ├── project-card-compact.js # Compact horizontal card (home page)
│   │   ├── page-projects.js      # Full projects page
│   │   ├── page-blog.js          # Blog index (paginated, filterable by tag)
│   │   ├── page-blog-post.js     # Individual blog post view
│   │   ├── blog-card.js          # Blog post card for index/home
│   │   ├── section-accreditations.js
│   │   ├── nav-bar.js            # Navigation component
│   │   ├── skill-card.js         # Individual skill display (level, links, cross-refs)
│   │   ├── skill-explorer.js     # Filterable/searchable skills grid
│   │   ├── timeline-item.js      # Reusable timeline entry
│   │   ├── page-not-found.js     # 404 page for unknown SPA routes
│   │   ├── site-footer.js        # Site footer (branding, copyright, links)
│   │   ├── pdf-export.js         # PDF export button + logic
│   │   ├── theme-toggle.js       # Light/dark/system theme switcher (persists to localStorage)
│   │   └── i18n-mixin.js         # Shared mixin for translated strings
├── .gitignore                    # node_modules/, _site/, coverage/
├── package.json
├── package-lock.json             # Required by npm ci — must be committed
└── README.md
```

**End User's Repo** (minimal):

```
my-portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml            # ~20 lines referencing our action
├── media/                        # Static media (logos, images, backgrounds)
│   ├── hero-bg.jpg               # Optional hero background
│   ├── headshot.jpg
│   ├── project-logo.png
│   └── cert-badge.svg
├── pages/                        # Optional markdown pages
│   ├── about.md
│   └── projects.md
├── blog/                         # Optional blog posts (markdown)
│   ├── 2026-01-15-hello-world.md
│   ├── 2026-02-01-mesh-networking-guide.md
│   └── drafts-ignored-by-default.md
├── site.yml                      # Site configuration + visibility flags
├── resume.yml                    # Resume data
├── skills.yml                    # Skills list
└── projects.yml                  # Projects portfolio
```

---

## End User Workflow

### GitHub Pages (reference workflow)

`.github/workflows/deploy.yml`

```yaml
name: Deploy Portfolio

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build site
        uses: jinglemansweep/portfolio-action@v1

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deploy
        uses: actions/deploy-pages@v4
```

### Alternative hosting examples

#### Cloudflare Pages

```yaml
name: Deploy Portfolio (Cloudflare)

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build site
        uses: jinglemansweep/portfolio-action@v1

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy _site --project-name=my-portfolio
```

#### Netlify

```yaml
name: Deploy Portfolio (Netlify)

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build site
        uses: jinglemansweep/portfolio-action@v1

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: _site
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

#### AWS S3 + CloudFront

```yaml
name: Deploy Portfolio (S3)

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build site
        uses: jinglemansweep/portfolio-action@v1

      - name: Sync to S3
        uses: jakejarvis/s3-sync-action@v0.5.1
        with:
          args: --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          SOURCE_DIR: _site
```

---

## Data Schema

All four YAML data files are **required**: `site.yml`, `resume.yml`, `skills.yml`, and `projects.yml`. The build exits with a clear error if any are missing. Optional content directories (`pages/`, `blog/`, `media/`) are gracefully handled when absent.

### `site.yml` — Site Configuration

```yaml
title: "Louis — Infrastructure Engineer"
description: "Personal portfolio and resume"
lang: en
theme:
  primary: "#2563eb"       # Tailwind blue-600 default
  accent: "#f59e0b"
  mode: system             # light | dark | system
favicon: ""                # Optional URL or base64
og_image: ""               # Open Graph image URL
analytics_id: ""           # Optional (e.g. GA4 measurement ID)
custom_domain: ""          # Informational only — actual CNAME via Pages settings
site_url: ""               # Optional: full site URL for SEO (e.g. "https://example.com")
                           # Falls back to GitHub Pages auto-detection if not set
i18n_file: ""              # Optional: path to custom locale file (relative to repo root)
                           # Used when lang: custom — overrides built-in language packs

hero:
  background: ""           # Optional: "media/hero-bg.jpg", URL, or empty for gradient
  overlay_opacity: 0.6     # Dark overlay on background image (0–1)
  style: gradient          # gradient | image | solid

visibility:
  # Sections — controls whether the section renders at all
  education: true
  experience: true
  projects: true             # false hides projects section on home page
  community: true
  accreditations: true
  skills: true               # false disables the /skills page AND nav entry

  # Blog
  blog: true                 # false disables blog entirely; also auto-disabled if blog/ empty/missing

  # Contact fields — controls individual field display
  email: false               # Hidden by default (privacy)
  phone: false               # Hidden by default (privacy)
  location: true
  website: true
  links: true                # Social/professional links (GitHub, LinkedIn, etc.)

seo:
  robots:
    indexing: true            # false → Disallow all in robots.txt
    follow_links: true        # false → adds nofollow to meta robots
  sitemap: true               # Generate sitemap.xml
  llms_txt: true              # Generate llms.txt
  rss: true                   # Generate RSS feed for blog (feed.xml)

i18n_overrides:            # Optional: override any language pack key
  labels: {}

# Navigation is auto-generated — NOT user-configurable in site.yml.
# Fixed order: Home, Skills, Projects, Blog, then any custom pages (from pages/ frontmatter).
# Entries are automatically hidden when their visibility flag is false or data is absent.
# Custom pages ordered by nav_order frontmatter (ascending), then alphabetically.
```

### `resume.yml` — Resume Data

```yaml
name: "Louis"
tagline: "Infrastructure Engineer & Mesh Networking Enthusiast"
photo: ""                          # Optional: URL, or "media/headshot.jpg" for local file

contact:
  email: "hello@example.com"       # Optional
  phone: ""                        # Optional
  location: "Ipswich, Suffolk, UK" # Optional
  website: "https://example.com"   # Optional
  links:                           # Optional social/professional links
    - platform: github
      url: "https://github.com/username"
    - platform: linkedin
      url: "https://linkedin.com/in/username"

summary: |
  Multi-paragraph personal summary supporting **markdown** formatting.

education:
  - institution: "University of Example"
    qualification: "BSc Computer Science"
    start: "2012"
    end: "2015"
    description: ""               # Optional

experience:
  - title: "Senior Infrastructure Engineer"
    company: "Example Corp"
    start: "2020-01"
    end: "present"
    description: |
      Markdown-supported description of role and achievements.
    skills: ["Kubernetes", "Docker", "Terraform"]   # Case-insensitive match to skills.yml

  - title: "DevOps Engineer"
    company: "Another Co"
    start: "2017-06"
    end: "2019-12"
    description: ""
    skills: ["Docker", "Python"]

community:
  - name: "IPNet Mesh Networking"
    role: "Founder & Organiser"
    url: "https://ipnt.uk"
    description: "Local MeshCore community group in Ipswich."

accreditations:
  - title: "CKA — Certified Kubernetes Administrator"
    issuer: "CNCF"
    date: "2023"
    url: ""
```

### `skills.yml` — Skills Data

```yaml
categories:
  - name: "Infrastructure & DevOps"
    skills:
      - name: Docker
        level: expert          # beginner | intermediate | advanced | expert
        years: 8
        icon: docker           # Optional — maps to Simple Icons / icon set
        tags: ["containers", "orchestration"]
        links:
          - label: "Official Site"
            url: "https://www.docker.com"
          - label: "My Docker Guide"
            url: "https://example.com/docker-guide"

      - name: Kubernetes
        level: advanced
        years: 5
        icon: kubernetes
        tags: ["containers", "orchestration"]
        links:
          - label: "kubernetes.io"
            url: "https://kubernetes.io"

      - name: NixOS
        level: advanced
        years: 3
        tags: ["linux", "declarative"]
        links:
          - url: "https://nixos.org"    # label is optional — displays URL hostname

  - name: "Programming"
    skills:
      - name: Python
        level: advanced
        years: 6
        icon: python
        tags: ["scripting", "automation"]
        links:
          - label: "Python Docs"
            url: "https://docs.python.org"

  - name: "Networking"
    skills:
      - name: MeshCore
        level: expert
        years: 2
        tags: ["mesh", "off-grid"]
        links:
          - label: "MeshCore GitHub"
            url: "https://github.com/meshcore"
          - label: "IPNet"
            url: "https://ipnt.uk"
```

**Skill link format:**

```yaml
links:
  - label: "Display Text"    # Optional — falls back to URL hostname if omitted
    url: "https://..."       # Required
```

Links can point to official documentation, personal blog posts, certifications, courses, or any relevant resource. They're displayed on the skill card as compact clickable links.

### `projects.yml` — Projects Portfolio

```yaml
projects:
  - name: "IPNet Mesh Network"
    description: |
      Community mesh networking project connecting Ipswich with off-grid
      MeshCore and Meshtastic nodes. Includes MQTT bridging, statistics
      capture, and a public dashboard.
    url: "https://ipnt.uk"
    repo: "https://github.com/ipnet-mesh"
    start: "2024-01"
    end: ""                        # Optional — empty or omitted = ongoing
    image: "media/ipnet-logo.png"  # Optional — project logo/screenshot
    skills: ["MeshCore", "Python", "Docker"]  # Case-insensitive match to skills.yml
    tags: ["open-source", "community", "networking"]
    featured: true                 # Featured projects shown prominently

  - name: "Homelab Monitoring Stack"
    description: |
      Comprehensive Prometheus/Grafana monitoring across Docker Swarm
      cluster with LLM-powered anomaly detection.
    url: ""
    repo: ""
    start: "2023-06"
    end: ""
    image: ""
    skills: ["Docker", "Prometheus", "Python"]
    tags: ["infrastructure", "monitoring"]
    featured: false
```

**Field reference:**

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Project name |
| `description` | Yes | Markdown-supported project description |
| `url` | No | Live project URL |
| `repo` | No | Source code URL (GitHub, GitLab, etc.) |
| `start` | Yes | Start date (`YYYY-MM` or `YYYY`) |
| `end` | No | End date — empty/omitted means ongoing. Displayed as "Ongoing" or "Completed" accordingly. |
| `image` | No | Project image — `media/` path or external URL |
| `skills` | No | Skills used — case-insensitive match to `skills.yml` |
| `tags` | No | Freeform tags for filtering |
| `featured` | No | `true` to display prominently (default: `false`) |

### Markdown Pages — `pages/*.md`

```markdown
---
title: "Projects"
slug: projects          # Derived from filename if omitted
description: "Selected personal and open-source projects"
nav_order: 3            # Controls position in auto-generated nav
show_in_nav: true       # Default: true
---

## Project Alpha

Description here with full **markdown** support.

![Project Logo](media/project-logo.png)
```

### Media — `media/`

Static assets (images, logos, backgrounds, icons, SVGs) used across the site.

- **Root-level directory** — `media/` lives at the repository root, accessible to markdown pages, blog posts, YAML fields, and the hero section
- **Markdown references** — use `media/filename.ext` in image tags: `![Logo](media/project-logo.png)`
- **YAML references** — fields like `resume.photo`, `hero.background` can use `media/filename.ext`
- **External media** — fully qualified URLs (`https://...`) work as normal in both markdown and YAML
- **Copied at build time** — the entire `media/` directory is copied to `_site/media/`, paths are rewritten as **relative** (`media/filename.ext`) in compiled output — the `<base href>` tag handles `base_path` resolution, so absolute paths are not used
- **Size guidance** — intended for small assets (logos, badges, headshots, hero backgrounds). The action emits a warning for any individual file over 1MB to encourage CDN hosting for larger assets

### Blog Posts — `blog/*.md`

Blog posts follow the same markdown + frontmatter pattern as pages, but with additional metadata for publishing, scheduling, and categorisation.

```markdown
---
title: "Getting Started with MeshCore"
slug: getting-started-meshcore    # Derived from filename if omitted
description: "A beginner's guide to setting up your first MeshCore node"
author: ""                        # Optional — defaults to resume.name
publish_on: 2026-01-15            # Required — publish date (post hidden before this date)
expire_on: ""                     # Optional — post hidden after this date
updated_on: ""                    # Optional — shown as "Updated: <date>" if set
draft: false                      # true = excluded from build entirely (default: false)
featured: false                   # true = shown prominently on blog index
tags:
  - mesh-networking
  - meshcore
  - tutorial
image: "media/meshcore-guide.jpg" # Optional — hero/card image for the post
reading_time: true                # Auto-calculate reading time (default: true)
---

Your full blog post content here with **markdown** support.

![Node Setup](media/node-setup.png)
```

**Frontmatter field reference:**

| Field | Required | Default | Description |
|---|---|---|---|
| `title` | Yes | — | Post title |
| `slug` | No | From filename | URL slug — `getting-started-meshcore` → `/{blog_path}/getting-started-meshcore` |
| `description` | No | `""` | Short summary for meta tags and post cards |
| `author` | No | `resume.name` | Author name override |
| `publish_on` | Yes | — | Publish date (`YYYY-MM-DD`). Posts with future dates excluded from build. |
| `expire_on` | No | `""` | Expiry date (`YYYY-MM-DD`). Posts past this date excluded from build. |
| `updated_on` | No | `""` | Last updated date — shown in post if set |
| `draft` | No | `false` | `true` = excluded from build entirely, never published |
| `featured` | No | `false` | `true` = displayed prominently on blog index |
| `tags` | No | `[]` | Freeform tags for filtering/categorisation |
| `image` | No | `""` | Hero/card image — `media/` path or external URL |
| `reading_time` | No | `true` | Auto-calculate and display estimated reading time |

**Publishing rules (evaluated at build time):**

```
Include post if ALL of:
  - draft: false (or omitted)
  - publish_on <= today's date
  - expire_on is empty OR expire_on > today's date
```

Posts excluded by these rules are **not compiled** — they don't appear in any output file, sitemap, llms.txt, or RSS feed.

---

## Build Pipeline

All build logic lives in `src/lib/` as pure, importable functions. The CLI (`src/cli.js`) and the GitHub Action are thin wrappers — the same `lib/index.js` orchestrator runs in both environments, ensuring consistent behaviour and testability.

### Step-by-step (inside the action)

```
1. Checkout user repo (already done by the action consumer)
2. Read & validate YAML files (site.yml, resume.yml, skills.yml, projects.yml)
   - Merge visibility defaults (all true except email, phone)
   - Merge SEO defaults (indexing, sitemap, llms_txt all true)
   - Validate hero.background path exists in media/ if set
3. Read & parse pages/*.md (frontmatter + body → JSON)
4. Read & parse blog/*.md (frontmatter + body → JSON):
   - Filter: exclude drafts, future publish_on, expired expire_on
   - Sort by publish_on descending (newest first)
   - Calculate reading time (word count / 200 wpm)
   - Build tag index (tag → [slugs])
   - If no publishable posts or blog/ missing → treat as blog disabled
5. Resolve i18n bundle:
   - Load built-in language pack for site.lang
   - Deep-merge i18n_overrides from site.yml
   - Validate all required keys present (warn on missing)
6. Apply visibility stripping (PRIVACY — before any data is written):
   - Contact fields: delete email/phone/location/website/links from resume
     data object if their flag is false
   - Section data: remove education/experience/community/accreditations
     arrays from resume if their flag is false
   - Projects: discard projects data entirely if visibility.projects: false
   - Skills: discard skills data entirely if visibility.skills: false
   - Blog: discard blog data entirely if visibility.blog: false or no publishable posts
   - After this step, hidden data exists ONLY in the user's source YAML —
     it is never serialised, written to disk, or included in any output
7. Generate cross-reference index (from stripped data only):
   - Normalise all skill names (lowercase) from skills data (if present)
   - For each experience entry (if present), match its skills[] against the index
   - For each project entry (if present), match its skills[] against the index
   - Build bidirectional maps from whatever data survived stripping
   - Emit warnings for unmatched skill names
8. Generate site manifest:
   {
     site: { ...site.yml, visibility: { ...merged defaults } },
     resume: { ...stripped resume },
     skills: { ...stripped skills },       # omitted entirely if visibility.skills: false
     projects: { ...stripped projects },   # omitted entirely if visibility.projects: false
     blog: { posts: [...], tags: [...] },   # omitted entirely if blog disabled
     crossref: { ...from stripped data },
     i18n: { ...resolved language pack },
     pages: [ { slug, title, content_html, meta } ],
     routes: [
       "/",
       "/{route_skills}"?,                 # e.g. /skills (en), /competences (fr) — omitted if hidden
       "/{route_projects}"?,               # e.g. /projects (en), /projets (fr) — omitted if hidden/empty
       "/{route_blog}"?,                   # e.g. /blog — omitted if blog disabled
       ...custom page slugs
     ],
     nav: [ ... ]                          # Skills/Projects/Blog nav entries omitted if routes excluded
   }
9. Compile manifest → static JSON assets in _site/data/
   - _site/data/site.json                  (includes visibility flags, NOT hidden data)
   - _site/data/resume.json                (contact fields stripped, sections stripped)
   - _site/data/skills.json                (only if visibility.skills: true)
   - _site/data/projects.json              (only if visibility.projects: true)
   - _site/data/crossref.json              (only references to visible entities)
   - _site/data/i18n.json
   - _site/data/blog/<slug>.json           (only if blog enabled)
   - _site/data/blog/index.json             (post listing with metadata, tags)
   - _site/data/pages/<slug>.json
   - _site/data/manifest.json              (routes + nav)
10. Generate _site/index.html from template (injects theme vars, theme_mode, meta tags, dir attr, base_path)
11. Copy template/components/ → _site/components/ (Lit component library)
12. Copy template/404.html → _site/404.html (SPA fallback → redirects to index.html with path)
13. Copy media/ → _site/media/ (rewrite paths as relative `media/filename.ext` in compiled markdown + YAML refs — `<base href>` handles base_path)
    - Warn on any individual file > 1MB
14. Generate CNAME file if custom_domain is set
15. Generate .nojekyll file (prevents GitHub Pages Jekyll processing)
16. Generate SEO files from stripped data (compile-seo.js):
    - _site/robots.txt (respects seo.robots config)
    - _site/sitemap.xml (if seo.sitemap: true — only visible routes)
    - _site/llms.txt (if seo.llms_txt: true — generated from stripped data only)
    - _site/feed.xml (if seo.rss: true AND blog enabled — RSS 2.0 feed)
    - Site URL resolved from: site_url (site.yml or action input) → auto-detect from GITHUB_REPOSITORY env var → omit absolute URLs
17. Done — _site/ is ready for any static hosting provider
```

### Build tooling

| Concern | Tool |
|---|---|
| YAML parsing | `js-yaml` |
| Markdown → HTML | `markdown-it` (with plugins for tables, footnotes) |
| Frontmatter parsing | `gray-matter` |
| HTML template | Simple string interpolation (no SSR framework needed) |
| Minification | `terser` (JS), `cssnano` (CSS) — optional |
| Test framework | `vitest` (ESM-native, fast) |
| Coverage | `@vitest/coverage-v8` |
| Linting | `eslint` |
| Formatting | `prettier` |
| Pre-commit | `husky` + `lint-staged` |

All build logic in `src/lib/` is importable and testable without the CLI or GitHub Actions environment. See [Code Quality & Testing](#code-quality--testing) for details.

### Error Handling

The build distinguishes between **errors** (fatal — stop the build) and **warnings** (informational — build continues):

**Errors (exit code 1 + friendly message):**

| Condition | Message |
|---|---|
| Missing required YAML file | `Error: Required file "<file>" not found in <dataDir>` |
| Malformed YAML syntax | `Error: Failed to parse "<file>": <parse error details>` |
| Schema validation failure | `Error: "<file>" validation failed: <field> <reason>` |
| Missing required field | `Error: "<file>" is missing required field "<field>"` |
| Template not found | `Error: Template file not found at <path>` |
| Output dir not writable | `Error: Cannot write to output directory "<dir>"` |

**Warnings (logged to stderr, build continues):**

| Condition | Message |
|---|---|
| Unmatched skill name in experience/project | `Warning: Skill "<name>" referenced in <context> not found in skills.yml` |
| Media file > 1MB | `Warning: "<file>" is <size>MB — consider using a CDN for large assets` |
| Missing i18n key after merge | `Warning: i18n key "<key>" missing from language pack — using key as fallback` |
| Empty blog/ directory | `Warning: blog/ directory is empty — blog will be disabled` |
| No publishable blog posts | `Warning: No publishable blog posts found — blog will be disabled` |
| Hero background path not found | `Warning: hero.background "<path>" not found in media/` |
| Empty pages/ directory | `Warning: pages/ directory is empty — no custom pages will be generated` |

In GitHub Actions, errors use `::error::` annotations and warnings use `::warning::` annotations for native log integration. When run via CLI locally, errors and warnings are printed to stderr with colour formatting.

---

## Frontend Architecture

### SPA Shell (`index.html`)

```html
<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base href="${base_path}" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="${robots_meta}" />
  <!-- OG tags injected at build time -->
  ${rss_link}

  <!-- Tailwind via CDN -->
  <link href="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" rel="stylesheet" />

  <!-- Lit via CDN — loaded as side effect, components import from same URL -->
  <script type="module">
    import 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
  </script>

  <!-- App components (Light DOM — Tailwind classes work directly) -->
  <!-- app-shell fetches i18n.json + data JSON before first render -->
  <script type="module" src="./components/app-shell.js"></script>

  <!-- Theme custom properties injected at build -->
  <style>
    :root {
      --color-primary: ${primary};
      --color-accent: ${accent};
    }
  </style>

  <!-- Theme init — runs synchronously before first paint to prevent FOUC -->
  <script>
    (function() {
      const stored = localStorage.getItem('theme');
      const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
      const mode = '${theme_mode}';               // light | dark | system (from site.yml)
      const dark = stored === 'dark' || (stored !== 'light' && (
        mode === 'dark' || (mode === 'system' && prefersDark)
      ));
      if (dark) document.documentElement.classList.add('dark');
    })();
  </script>
</head>
<body>
  <a href="#main-content" class="sr-only focus:not-sr-only">${a11y_skip_to_content}</a>
  <app-shell></app-shell>
</body>
</html>
```

**Data loading:** `app-shell` fetches `i18n.json` and all data JSON files on startup. It gates rendering until data is loaded (showing a loading state), then passes data down to child components via Lit reactive properties. This avoids the race condition of loading i18n in a separate `<script>` block.

### CDN Dependencies

| Library | CDN Source | Purpose |
|---|---|---|
| Lit 3.x | `cdn.jsdelivr.net/npm/lit@3/+esm` | Web components framework |
| Tailwind CSS 4 | `cdn.jsdelivr.net/npm/@tailwindcss/browser@4` | Utility-first CSS (browser build) |
| Simple Icons | `cdn.simpleicons.org` | Technology/brand icons for skills |
| html2pdf.js | `cdn.jsdelivr.net/npm/html2pdf.js@0.10.2/+esm` | Client-side PDF export (lazy-loaded) |
| markdown-it | Build-time only | Markdown compilation |

### Routing

Client-side **History API** routing within `app-shell.js` (requires `404.html` redirect trick for GitHub Pages; other hosts configure SPA rewrites via their own mechanisms):

- `/` → `<page-home>` — hero + summary, experience, education, accreditations, community, compact project cards at bottom
- `/{skills_path}` → `<page-skills>` — interactive skills explorer (route excluded if `visibility.skills: false`)
- `/{projects_path}` → `<page-projects>` — full projects page (route excluded if `visibility.projects: false` or `projects.yml` is empty/missing)
- `/{blog_path}` → `<page-blog>` — blog index, paginated, filterable by tag (route excluded if blog disabled)
- `/{blog_path}/<slug>` → `<page-blog-post>` — individual blog post
- `/<slug>` → `<page-custom>` — renders markdown page content

Route paths for skills, projects, and blog are **i18n configurable** via `routes` labels in the language pack, defaulting to `skills`, `projects`, and `blog` in English.

Route definitions loaded from `manifest.json` at startup. Routes for skills/projects/blog are excluded from the manifest entirely when their visibility flag is `false` or data is absent. Unknown routes → `<page-not-found>` component.

### Hero Section

A full-width banner at the top of the home page. Always visible — it's the user's primary introduction.

**Content (from `resume.yml`):**
- **Name** — large, prominent heading
- **Tagline** — subtitle/role description
- **Photo** — optional circular avatar/headshot
- **Location** — shown if present in build output (stripped at build time when `visibility.location: false`)
- **Contact links** — email, phone, website, social links — only present in data if their visibility flag is `true`; components render whatever fields exist
- **Quick actions** — PDF export button, link to `/{skills_path}` (if visible), link to `/{projects_path}` (if visible)

**Background modes (from `site.yml → hero.style`):**

| Mode | Behaviour |
|---|---|
| `gradient` | Default. Smooth gradient using `theme.primary` → `theme.accent` |
| `image` | Uses `hero.background` (e.g. `media/hero-bg.jpg`). Dark overlay applied at `hero.overlay_opacity` for text contrast. Image is `object-fit: cover`, lazy-loaded. |
| `solid` | Flat `theme.primary` background |

**Responsive behaviour:**
- **Desktop** — horizontal layout: photo left, name/tagline/contact right, generous padding
- **Tablet** — stacked centred layout
- **Mobile** — compact stacked layout, smaller photo, tighter spacing

**Print** — hero renders as a simple header block (no background image/gradient, no photo, name + contact only)

### Visibility System

The `visibility` flags in `site.yml` control what data is **included in the build output**. Hidden data is **stripped at build time** — it never appears in any compiled JSON, HTML, sitemap, or llms.txt. This is a privacy-first design: if someone inspects the browser's network tab or JSON files, they will not find hidden data.

**Default values:**

```yaml
visibility:
  education: true
  experience: true
  projects: true
  community: true
  accreditations: true
  skills: true
  blog: true
  email: false        # Stripped from build output by default — privacy
  phone: false        # Stripped from build output by default — privacy
  location: true
  website: true
  links: true
```

**How visibility is applied (all at build time):**

| Flag | Effect when `false` |
|---|---|
| `education` | `resume.education` array **omitted** from `resume.json` entirely |
| `experience` | `resume.experience` array **omitted** from `resume.json` entirely |
| `projects` | `projects.json` **not generated**; `/{projects_path}` route excluded from manifest/nav/sitemap; compact project cards removed from home page; projects excluded from `crossref.json` and `llms.txt`. Also triggered automatically if `projects.yml` is empty or missing. |
| `community` | `resume.community` array **omitted** from `resume.json` entirely |
| `accreditations` | `resume.accreditations` array **omitted** from `resume.json` entirely |
| `skills` | `skills.json` **not generated**; `/{skills_path}` route excluded from manifest/nav/sitemap; skill cross-refs removed from `crossref.json`. Skill names on experience/project entries still render as static text labels (from the inline `skills[]` array). |
| `blog` | Blog data **not generated**; `/{blog_path}` route excluded from manifest/nav/sitemap; RSS feed not generated. Also auto-disabled if `blog/` directory is empty/missing or contains no publishable posts. |
| `email` | `resume.contact.email` **stripped** from `resume.json` — not present in any output file |
| `phone` | `resume.contact.phone` **stripped** from `resume.json` — not present in any output file |
| `location` | `resume.contact.location` **stripped** from `resume.json` |
| `website` | `resume.contact.website` **stripped** from `resume.json` |
| `links` | `resume.contact.links` array **stripped** from `resume.json` |

**Implementation — build-time stripping pipeline:**

```
1. Load raw YAML data (all fields present)
2. Read visibility flags (merge with defaults)
3. Strip contact fields:
   - For each contact flag (email, phone, location, website, links):
     if false → delete the field from the resume data object before serialisation
4. Strip sections:
   - For each section flag (education, experience, projects, community, accreditations):
     if false → remove the entire array/data from the output object
5. Strip skills ecosystem:
   - If skills: false → don't generate skills.json, remove skill cross-refs,
     exclude /{route_skills} route from manifest
   - If projects: false OR projects.yml empty/missing → don't generate projects.json,
     remove project cross-refs, exclude /{route_projects} route from manifest,
     exclude compact project cards from home page data
6. Serialise the stripped data to JSON
7. Generate SEO files (sitemap, llms.txt) from the already-stripped data
```

- **The raw YAML is never exposed** — only the stripped JSON is written to `_site/data/`
- **Visibility flags themselves are included** in `site.json` so components know which sections to render (but the data behind hidden sections is absent)
- **Toggling a flag requires a rebuild** — this is the tradeoff for genuine privacy. The CI/CD workflow rebuilds on every push, so this is seamless in practice
- **llms.txt and sitemap** are generated from the stripped data, so hidden sections never appear in any discoverable output

### Component Hierarchy

```
<app-shell>                                    # All components use I18nMixin
  ├── <a href="#main-content">                 # Skip-to-content link
  ├── <nav-bar>                                # Sticky top nav, driven by manifest.nav
  │   ├── <theme-toggle>                       # Light/dark/system cycle button
  │   └── <pdf-export>                         # Export PDF button (lazy-loads html2pdf.js)
  ├── <router-outlet id="main-content">        # Swaps page components
  │   ├── <page-home>
  │   │   ├── <hero-section>                   # Always visible
  │   │   │   ├── Background (gradient/image/solid)
  │   │   │   ├── Photo (if resume.photo set)
  │   │   │   ├── Name + Tagline
  │   │   │   └── Contact pills (renders fields present in data)
  │   │   └── <div id="printable-content">     # Target for print CSS + PDF export
  │   │       ├── Summary (rendered markdown)
  │   │       ├── <section-experience>         # renders if data present
  │   │       │   └── <timeline-item> ×N       #   each has skill pills
  │   │       ├── <section-education>          # renders if data present
  │   │       │   └── <timeline-item> ×N
  │   │       ├── <section-accreditations>     # renders if data present
  │   │       ├── <section-community>          # renders if data present
  │   │       └── <section-projects-compact>   # renders if projects data present
  │   │           └── <project-card-compact> ×N  # horizontal scroll/grid, links to /projects#<slug>
  │   ├── <page-projects>                      # route only exists if projects visible + data present
  │   │   └── <project-card> ×N               #   full detail cards with anchors
  │   ├── <page-blog>                          # route only exists if blog enabled + posts exist
  │   │   └── <blog-card> ×N                  #   post cards, tag filter, pagination
  │   ├── <page-blog-post>                     # individual post view
  │   │   └── Rendered markdown + metadata     #   title, date, tags, reading time, content
  │   ├── <page-skills>                        # route only exists if visibility.skills: true
  │   │   └── <skill-explorer>
  │   │       └── <skill-card> ×N             #   each has "Used in" links
  │   ├── <page-custom>
  │   │   └── (rendered markdown HTML)
  │   └── <page-not-found>                     # Shown for unknown routes
  └── <site-footer>                              # Copyright, "Built with Instant Portfolio" link
```

### Theme Switching (Light / Dark / System)

Theme mode is set in `site.yml → theme.mode` (`light`, `dark`, or `system`) and can be overridden at runtime by the user. The user's preference is persisted in `localStorage`.

**Resolution order (evaluated on every page load):**

```
1. localStorage('theme') — if set ('light' or 'dark'), use it (user explicitly chose)
2. site.yml theme.mode — if 'light' or 'dark', use it as the default
3. site.yml theme.mode: 'system' — follow prefers-color-scheme media query
```

**Implementation:**

| Concern | Approach |
|---|---|
| FOUC prevention | Inline `<script>` in `<head>` (before first paint) reads localStorage + mode, adds `.dark` class to `<html>` synchronously |
| Tailwind dark mode | Tailwind CSS 4 browser build uses `@custom-variant dark (&:where(.dark, .dark *));` — all `dark:` utilities activate when `.dark` is on `<html>` |
| Runtime toggle | `<theme-toggle>` component in nav bar cycles: light → dark → system. Updates `<html>` class + writes to `localStorage`. When set to "system", removes localStorage entry and follows OS preference. |
| System preference changes | `<theme-toggle>` listens to `matchMedia('(prefers-color-scheme: dark)')` change events. When in "system" mode, live-updates the `.dark` class without page reload. |
| Print | `@media print` forces light theme (via print stylesheet removing `.dark` class behaviour) |

**`<theme-toggle>` component** (`template/components/theme-toggle.js`):

```javascript
// theme-toggle.js
import { LitElement, html } from 'lit';
import { I18nMixin } from './i18n-mixin.js';

class ThemeToggle extends I18nMixin(LitElement) {
  createRenderRoot() { return this; }

  static properties = {
    _mode: { state: true }   // 'light' | 'dark' | 'system'
  };

  constructor() {
    super();
    const stored = localStorage.getItem('theme');
    this._mode = stored ?? 'system';
    this._mediaQuery = matchMedia('(prefers-color-scheme: dark)');
    this._mediaQuery.addEventListener('change', () => this._apply());
  }

  toggle() {
    const next = { light: 'dark', dark: 'system', system: 'light' };
    this._mode = next[this._mode];
    if (this._mode === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', this._mode);
    }
    this._apply();
  }

  _apply() {
    const dark = this._mode === 'dark' ||
      (this._mode === 'system' && this._mediaQuery.matches);
    document.documentElement.classList.toggle('dark', dark);
  }

  render() {
    const icons = { light: '☀️', dark: '🌙', system: '💻' };
    return html`
      <button
        @click=${this.toggle}
        aria-label=${this.t('a11y_toggle_theme')}
        title=${this.t('a11y_toggle_theme')}
      >${icons[this._mode]}</button>
    `;
  }
}
customElements.define('theme-toggle', ThemeToggle);
```

**localStorage schema:**

| Key | Values | Absent means |
|---|---|---|
| `theme` | `'light'` or `'dark'` | Follow site default / system preference |

### Styling Strategy

- **Light DOM** — all components override `createRenderRoot()` to return `this`, rendering into the Light DOM. This allows Tailwind utility classes and `@media print` styles to work across all components without Shadow DOM barriers. Style isolation is not needed for a single-app portfolio.
- **Tailwind CSS 4 Browser Build** — utility classes applied directly in Lit templates. Dark mode via `@custom-variant dark (&:where(.dark, .dark *));` — enables `dark:` utility classes when `.dark` is present on `<html>`.
- **CSS Custom Properties** — theme colours from `site.yml` injected as `--color-*` vars at build time
- **Responsive by default** — mobile-first, single-column on small screens, multi-column on desktop
- **Dark-first authoring** — all components use `dark:` variants from day one (e.g. `bg-white dark:bg-gray-900`, `text-gray-900 dark:text-gray-100`)

---

## Skills Explorer Feature

The `/{skills_path}` page provides an interactive, filterable view:

- **Category grouping** — collapsible sections per category
- **Search/filter** — text input filters skills by name or tag in real-time
- **Level indicators** — visual bar/badge showing beginner → expert
- **Tag cloud** — clickable tags that filter the grid
- **Icon display** — technology icons from Simple Icons CDN where available
- **Skill links** — each skill card shows its links (official docs, personal guides, certs) as compact clickable items; label falls back to URL hostname if omitted
- **"Used in" cross-refs** — experience roles and projects that reference each skill

---

## Skill ↔ Experience ↔ Project Cross-Referencing

### How it works

Experience entries in `resume.yml` and project entries in `projects.yml` both declare a `skills` list of plain strings. At build time, these are matched **case-insensitively** against skill `name` fields in `skills.yml` to produce a multi-directional index.

### Build-time resolution

The build step produces a `crossref.json` file alongside the other data assets:

```json
{
  "skillToExperience": {
    "docker": [
      { "title": "Senior Infrastructure Engineer", "company": "Example Corp", "start": "2020-01", "end": "present" },
      { "title": "DevOps Engineer", "company": "Another Co", "start": "2017-06", "end": "2019-12" }
    ],
    "kubernetes": [
      { "title": "Senior Infrastructure Engineer", "company": "Example Corp", "start": "2020-01", "end": "present" }
    ]
  },
  "skillToProject": {
    "docker": [
      { "name": "Homelab Monitoring Stack", "start": "2023-06" }
    ],
    "meshcore": [
      { "name": "IPNet Mesh Network", "start": "2024-01" }
    ]
  },
  "experienceToSkills": {
    "senior-infrastructure-engineer--example-corp": [
      { "name": "Kubernetes", "level": "advanced", "category": "Infrastructure & DevOps" },
      { "name": "Docker", "level": "expert", "category": "Infrastructure & DevOps" }
    ]
  },
  "projectToSkills": {
    "ipnet-mesh-network": [
      { "name": "MeshCore", "level": "expert", "category": "Networking" },
      { "name": "Python", "level": "advanced", "category": "Programming" }
    ]
  }
}
```

- **Keys are normalised** — skill names lowercased, experience keys slugified as `title--company`, project keys slugified from `name`
- **Unmatched skill names** — if an experience or project references a skill not found in `skills.yml`, it's still displayed as a plain label (no link), and the build emits a warning to the Actions log so the user can fix typos

### UI behaviour

**On the Home page (experience section):**
- Each experience entry renders its skills as pill/badge elements
- Matched skills are **interactive** — clicking navigates to `/skills` with that skill highlighted/filtered
- Unmatched skills render as static pills (muted style, no link)

**On the Home page (projects compact section):**
- Compact horizontal cards at the bottom of the home page — showing project name, dates, and skill pills
- Each card links to `/{projects_path}#<project-slug>` for the full detail view
- Section not rendered if projects data is absent or `visibility.projects: false`

**On the Projects page (`/{projects_path}`):**
- Full detail cards with description, dates, links, image, and skill pills
- Each project has an `id="project-<slug>"` anchor for deep linking from home page and skill cards
- Featured projects (`featured: true`) displayed prominently at the top
- Ongoing/completed derived from dates — no end date shows "Ongoing" label
- Links to project URL and repo shown as icon buttons

**On the Skills page:**
- Each skill card includes a "Used in" section listing both experience entries AND projects that reference it
- Experience and project references are visually distinguished (e.g. briefcase icon vs folder icon)
- Clicking an entry navigates back to the relevant section on the home page
- Skills with more references could optionally show a usage count or timeline bar

### Component updates

| Component | Cross-ref behaviour |
|---|---|
| `timeline-item` | Renders `skills` as clickable pills → navigates to `/skills?highlight=<name>` |
| `skill-card` | Shows "Used in: Role @ Company" links → navigates to `/#experience-<slug>` |
| `skill-explorer` | Accepts `?highlight=<name>` query param to auto-scroll and highlight a skill |
| `page-home` | Experience entries have `id="experience-<slug>"` anchors for deep linking |

---

## Internationalisation (i18n)

### Design Principles

- i18n covers **UI chrome only** — section headings, labels, button text, level names, date formatting
- User-authored content (summary, descriptions, skill names) is written in whatever language the user chooses
- The action ships built-in language packs; users can override any key or provide a full custom locale
- RTL layout support for Arabic, Hebrew, etc.

### Built-in Language Pack Format

`i18n/en.yml` (reference pack — all keys must be present):

```yaml
locale: en
dir: ltr
labels:
  # Section headings
  summary: "Summary"
  experience: "Experience"
  education: "Education"
  skills: "Skills"
  projects: "Projects"
  community: "Community"
  accreditations: "Accreditations"
  contact: "Contact"

  # Skills
  skill_level_beginner: "Beginner"
  skill_level_intermediate: "Intermediate"
  skill_level_advanced: "Advanced"
  skill_level_expert: "Expert"
  skill_years: "{n} years"
  skill_used_in: "Used in"
  skill_links: "Links"
  skill_filter_placeholder: "Filter skills..."
  skill_all_categories: "All Categories"

  # Experience
  experience_present: "Present"
  experience_skills: "Skills"

  # Projects
  project_ongoing: "Ongoing"
  project_completed: "Completed"
  project_visit: "Visit Project"
  project_source: "Source Code"

  # Navigation
  nav_home: "Home"
  nav_skills: "Skills"
  nav_projects: "Projects"
  nav_blog: "Blog"

  # Route paths (URL slugs — must be URL-safe)
  route_skills: "skills"           # → /skills
  route_projects: "projects"       # → /projects
  route_blog: "blog"               # → /blog

  # Hero
  hero_contact_email: "Email"
  hero_contact_phone: "Phone"
  hero_view_skills: "View Skills"

  # PDF
  pdf_export: "Export PDF"
  pdf_generating: "Generating..."

  # Blog
  blog_title: "Blog"
  blog_read_more: "Read more"
  blog_reading_time: "{n} min read"
  blog_published: "Published"
  blog_updated: "Updated"
  blog_tagged: "Tagged"
  blog_all_posts: "All Posts"
  blog_filter_by_tag: "Filter by tag"
  blog_no_posts: "No posts yet"
  blog_draft: "Draft"
  blog_featured: "Featured"

  # Theme
  theme_light: "Light"
  theme_dark: "Dark"
  theme_system: "System"

  # Footer
  footer_built_with: "Built with Instant Portfolio"

  # 404
  not_found_title: "Page Not Found"
  not_found_message: "The page you're looking for doesn't exist."
  not_found_home: "Go Home"

  # Dates
  date_format: "MMM YYYY"          # Used by date formatter

  # Accessibility
  a11y_skip_to_content: "Skip to content"
  a11y_toggle_theme: "Toggle dark mode"
  a11y_open_menu: "Open menu"
  a11y_close_menu: "Close menu"
```

`i18n/fr.yml` (example — must contain every key from `en.yml`):

```yaml
locale: fr
dir: ltr
labels:
  # Section headings
  summary: "Résumé"
  experience: "Expérience"
  education: "Formation"
  skills: "Compétences"
  projects: "Projets"
  community: "Communauté"
  accreditations: "Accréditations"
  contact: "Contact"

  # Skills
  skill_level_beginner: "Débutant"
  skill_level_intermediate: "Intermédiaire"
  skill_level_advanced: "Avancé"
  skill_level_expert: "Expert"
  skill_years: "{n} ans"
  skill_used_in: "Utilisé dans"
  skill_links: "Liens"
  skill_filter_placeholder: "Filtrer les compétences..."
  skill_all_categories: "Toutes les catégories"

  # Experience
  experience_present: "Présent"
  experience_skills: "Compétences"

  # Projects
  project_ongoing: "En cours"
  project_completed: "Terminé"
  project_visit: "Voir le projet"
  project_source: "Code source"

  # Navigation
  nav_home: "Accueil"
  nav_skills: "Compétences"
  nav_projects: "Projets"
  nav_blog: "Blog"

  # Route paths (URL slugs — must be URL-safe)
  route_skills: "competences"      # → /competences
  route_projects: "projets"        # → /projets
  route_blog: "blog"               # → /blog

  # Hero
  hero_contact_email: "E-mail"
  hero_contact_phone: "Téléphone"
  hero_view_skills: "Voir les compétences"

  # PDF
  pdf_export: "Exporter en PDF"
  pdf_generating: "Génération..."

  # Blog
  blog_title: "Blog"
  blog_read_more: "Lire la suite"
  blog_reading_time: "{n} min de lecture"
  blog_published: "Publié"
  blog_updated: "Mis à jour"
  blog_tagged: "Tags"
  blog_all_posts: "Tous les articles"
  blog_filter_by_tag: "Filtrer par tag"
  blog_no_posts: "Aucun article pour le moment"
  blog_draft: "Brouillon"
  blog_featured: "À la une"

  # Theme
  theme_light: "Clair"
  theme_dark: "Sombre"
  theme_system: "Système"

  # Footer
  footer_built_with: "Créé avec Instant Portfolio"

  # 404
  not_found_title: "Page introuvable"
  not_found_message: "La page que vous recherchez n'existe pas."
  not_found_home: "Retour à l'accueil"

  # Dates
  date_format: "MMM YYYY"

  # Accessibility
  a11y_skip_to_content: "Aller au contenu"
  a11y_toggle_theme: "Basculer le mode sombre"
  a11y_open_menu: "Ouvrir le menu"
  a11y_close_menu: "Fermer le menu"
```

### User Configuration

In `site.yml`:

```yaml
lang: en                          # Selects built-in language pack
i18n_overrides:                   # Optional: override any key
  labels:
    experience: "Work History"    # User prefers this heading
    community: "Open Source"
```

Or provide a full custom locale file:

```yaml
lang: custom
i18n_file: "i18n/my-locale.yml"  # Path relative to repo root
```

### Build-time Resolution

`compile-i18n.js` resolves the final i18n bundle:

```
1. Load built-in pack for site.lang (fallback: en)
2. Deep-merge any i18n_overrides from site.yml
3. Validate all required keys are present (warn on missing)
4. Output _site/data/i18n.json
5. Set dir attribute (ltr/rtl) in index.html template
```

### Runtime Usage

An `i18n-mixin.js` Lit mixin provides a `t(key, params?)` method to all components:

```javascript
// i18n-mixin.js
export const I18nMixin = (superClass) => class extends superClass {
  t(key, params = {}) {
    let str = window.__i18n?.labels?.[key] ?? key;
    // Interpolate {n} style placeholders
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }
};

// Usage in a component (Light DOM — all components override createRenderRoot):
class SectionExperience extends I18nMixin(LitElement) {
  createRenderRoot() { return this; }
  render() {
    return html`<h2>${this.t('experience')}</h2>`;
  }
}
```

### RTL Support

- `dir` attribute set on `<html>` at build time based on language pack
- Tailwind CSS 4 supports `rtl:` variants natively
- Components use logical properties (`margin-inline-start` vs `margin-left`)
- Tested with Arabic (`ar`) pack

---

## PDF Export

### Strategy

Two complementary approaches — no server required:

| Method | Trigger | Quality | Dependencies |
|---|---|---|---|
| **Print CSS** | Browser `Ctrl+P` / `⌘P` | Excellent | None — pure CSS `@media print` |
| **Client-side PDF** | "Export PDF" button | Good | `html2pdf.js` via CDN (wraps html2canvas + jsPDF) |

### Print CSS (`@media print`)

Applied automatically when the user prints. Handles:

- Render hero as simple header block (name + contact details, no background image/gradient/photo)
- Hide navigation, theme toggle, PDF button, skills filter/search UI
- Single-column layout, optimised for A4/Letter
- Page break rules: avoid breaking inside timeline entries, skill cards
- Force light theme (dark backgrounds waste ink)
- Show URLs after links: `a[href]::after { content: " (" attr(href) ")"; }`
- Respect build-time stripping — hidden sections and contact fields are already absent from the data, so print naturally excludes them
- Section ordering optimised for print (summary → experience → education → accreditations → skills → community → projects)

### Client-side PDF Export

A `<pdf-export>` Lit component renders as a button in the nav bar:

```javascript
// pdf-export.js
import { LitElement, html } from 'lit';
import { I18nMixin } from './i18n-mixin.js';

class PdfExport extends I18nMixin(LitElement) {
  // Light DOM — no Shadow DOM isolation needed
  createRenderRoot() { return this; }

  static properties = {
    generating: { type: Boolean }
  };

  async exportPdf() {
    this.generating = true;

    // Lazy-load html2pdf.js from CDN on first use (UMD → sets window.html2pdf)
    if (!window.html2pdf) {
      const mod = await import('https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.2/+esm');
      if (!window.html2pdf && mod.default) window.html2pdf = mod.default;
    }

    const element = document.querySelector('#printable-content');
    const siteName = window.__site?.title ?? 'portfolio';

    await html2pdf().set({
      margin:       [10, 10, 10, 10],
      filename:     `${siteName}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(element).save();

    this.generating = false;
  }

  render() {
    return html`
      <button
        @click=${this.exportPdf}
        ?disabled=${this.generating}
        aria-label=${this.t('pdf_export')}
      >
        ${this.generating ? this.t('pdf_generating') : this.t('pdf_export')}
      </button>
    `;
  }
}
customElements.define('pdf-export', PdfExport);
```

### Printable Content Region

The home page wraps resume content in a `#printable-content` div that:

- Contains all sections in print-optimised order
- Excludes interactive-only elements (skill filter, nav, theme toggle)
- Is the target for both `@media print` and `html2pdf.js`
- Includes a condensed skills summary (flat list, no explorer UI)

---

## SEO & Discoverability

### Configuration (`site.yml → seo`)

```yaml
seo:
  robots:
    indexing: true          # false → "Disallow: /" in robots.txt + noindex meta tag
    follow_links: true      # false → nofollow in meta robots tag
  sitemap: true             # Generate sitemap.xml
  llms_txt: true            # Generate llms.txt
  rss: true                 # Generate RSS feed for blog (feed.xml)
```

All are enabled by default. Setting `robots.indexing: false` is useful for draft/private portfolios. RSS feed only generated if blog is also enabled.

### `robots.txt`

Always generated. Content depends on `seo.robots.indexing`:

**When `indexing: true` (default):**
```
User-agent: *
Allow: /
Sitemap: https://<domain>/sitemap.xml
```

**When `indexing: false`:**
```
User-agent: *
Disallow: /
```

The `<domain>` is resolved from: `site_url` (site.yml or action input) → auto-detection from `GITHUB_REPOSITORY` env var (`<user>.github.io/<repo>`) → omit absolute URLs if none available. The build also injects a `<meta name="robots">` tag into `index.html`:
- `indexing: true` + `follow_links: true` → `<meta name="robots" content="index, follow">`
- `indexing: true` + `follow_links: false` → `<meta name="robots" content="index, nofollow">`
- `indexing: false` → `<meta name="robots" content="noindex, nofollow">`

### `sitemap.xml`

Generated when `seo.sitemap: true`. Only includes **visible** routes with i18n-resolved paths:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://<domain>/</loc>
    <lastmod>2026-02-19</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://<domain>/skills</loc>       <!-- or /competences (fr) — omitted if hidden -->
    <lastmod>2026-02-19</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://<domain>/projects</loc>     <!-- or /projets (fr) — omitted if hidden/empty -->
    <lastmod>2026-02-19</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

- `lastmod` is set to the build date (or git commit date if available)
- Priority: `/` = 1.0, `/skills` and `/projects` = 0.8, custom pages = 0.6
- Routes where `visibility` is `false` or data is absent are excluded
- URL paths use i18n `route_*` labels from the active language pack

### `llms.txt`

Generated when `seo.llms_txt: true`. Provides a structured, plain-text representation of the entire portfolio optimised for LLM consumption. This follows the emerging [llms.txt convention](https://llmstxt.org/).

**Output format:**

```
# <Name> — <Tagline>

> <Summary>

## Contact
- Location: <location>
- Website: <website>
- GitHub: <github_url>
(only fields included in build output appear — stripped fields are absent)

## Experience
### <Title> at <Company> (<Start> – <End>)
<Description>
Skills: <skill1>, <skill2>, <skill3>

### <Title> at <Company> (<Start> – <End>)
...

## Projects
### <Project Name> (<Status>) — <Start> – <End|Ongoing>
<Description>
URL: <url>
Repo: <repo>
Skills: <skill1>, <skill2>

## Education
### <Qualification> — <Institution> (<Start> – <End>)
<Description>

## Skills
### <Category>
- <Skill Name> (Level: <level>, <N> years)
- <Skill Name> (Level: <level>, <N> years)

## Community
### <Name> — <Role>
<Description>

## Accreditations
- <Title> — <Issuer> (<Date>)
```

**Key design decisions:**
- **Privacy-safe** — generated from build-time stripped data; hidden sections and contact fields are never included
- **Plain text with light markdown** — headings, lists, and blockquotes for structure, no HTML
- **Complete visible data** — includes everything a human or LLM would need to understand the person's public-facing background
- **Skill cross-references inlined** — each experience and project entry lists its skills directly, no separate lookup needed
- **Blog posts included** — if blog is enabled, recent posts are listed with title, date, description, and tags
- **Accessible at `/llms.txt`** — standard path that LLM agents and crawlers can discover

### `feed.xml` (RSS 2.0)

Generated when `seo.rss: true` AND blog is enabled (has publishable posts). Standard RSS 2.0 feed:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><Site Title></title>
    <link>https://<domain>/</link>
    <description><Site Description></description>
    <language><lang></language>
    <atom:link href="https://<domain>/feed.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title><Post Title></title>
      <link>https://<domain>/{blog_path}/<slug></link>
      <description><Post Description></description>
      <pubDate><RFC 822 date></pubDate>
      <guid>https://<domain>/{blog_path}/<slug></guid>
      <category>tag1</category>
      <category>tag2</category>
    </item>
  </channel>
</rss>
```

- Posts ordered by `publish_on` descending (newest first)
- Maximum 20 items in the feed (configurable future consideration)
- `<link>` in `<head>` of `index.html` for feed auto-discovery: `<link rel="alternate" type="application/rss+xml" href="/feed.xml">`
- Only includes published, non-expired posts (same filtering as build)

---

## Blog Feature

### Overview

Blog posts live in the `blog/` directory as markdown files with frontmatter. The build pipeline processes them identically to pages but with additional scheduling, sorting, and feed generation logic. The blog is a first-class feature with its own page, tag filtering, and RSS feed.

### Blog Index Page (`/{blog_path}`)

- **Post listing** — cards showing title, date, description, tags, optional image, reading time
- **Featured posts** — `featured: true` posts shown prominently at the top
- **Tag filtering** — clickable tag cloud or sidebar; clicking a tag filters to matching posts
- **Tag URL support** — `/{blog_path}?tag=<tag>` for shareable filtered views
- **Pagination** — client-side pagination (10 posts per page default) for large blogs
- **Empty state** — friendly message when no posts exist (using `blog_no_posts` i18n label)

### Individual Post Page (`/{blog_path}/<slug>`)

- **Post header** — title, publish date, updated date (if set), author, reading time, tags
- **Post body** — rendered markdown with full formatting, images, code blocks
- **Post image** — optional hero/banner image at the top
- **Navigation** — previous/next post links at the bottom
- **Back to blog** — link back to the blog index

### Home Page Integration

The home page does **not** show blog posts by default — the blog lives on its own page. The nav bar includes a "Blog" entry when blog is enabled.

Future consideration: optional "Latest posts" compact section on home page (similar to compact project cards).

### Data Output

```
_site/data/blog/
├── index.json          # Post listing: [{ slug, title, description, publish_on, tags, image, reading_time, featured }]
├── tags.json           # Tag index: { "tag-name": ["slug1", "slug2"], ... }
└── <slug>.json         # Individual post: { title, slug, content_html, publish_on, updated_on, tags, image, ... }
```

### Build-time Filtering

Posts are filtered at build time based on the current date (or `BUILD_DATE` env var for reproducible builds):

```
Include post if ALL of:
  ✓ draft is false (or omitted)
  ✓ publish_on <= BUILD_DATE
  ✓ expire_on is empty OR expire_on > BUILD_DATE
  ✓ visibility.blog is true
  ✓ blog/ directory exists and is not empty
```

Draft and scheduled posts are **never compiled** — they don't exist in any output. This means:
- A daily scheduled rebuild (via `workflow_dispatch` or cron trigger) naturally publishes scheduled posts
- Expired posts are automatically removed on next build
- The user's workflow can include a cron schedule for time-based publishing

**Example cron workflow addition:**

```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'           # Rebuild daily at 06:00 UTC for scheduled posts
  workflow_dispatch:
```

---

## GitHub Pages Considerations

When deploying to GitHub Pages specifically:

### SPA Support

GitHub Pages doesn't natively support SPA routing. Strategy:

1. **`404.html`** — contains a script that redirects to `index.html` with the original path encoded as a query parameter
2. **`index.html`** — on load, reads the query parameter and replaces the URL via History API
3. This is the established pattern (used by spa-github-pages) and works reliably

### Custom Domain (GitHub Pages)

- If `site.yml` has `custom_domain` set, the build writes a `CNAME` file to `_site/` (required by GitHub Pages)
- User still needs to configure DNS (A/CNAME records) and enable custom domain in repo Settings → Pages
- Other hosting providers handle custom domains via their own dashboards — the `CNAME` file is harmless and ignored
- The action README will document setup for each reference provider

---

## Action Configuration (`action.yml`)

The action is **build-only** — it compiles YAML/Markdown into a static site and outputs the path. Deployment is the user's responsibility, making it compatible with GitHub Pages, Netlify, Cloudflare Pages, S3, or any static host.

```yaml
name: "Instant Portfolio"
description: "Builds a personal portfolio/resume static site from YAML and Markdown"
branding:
  icon: "globe"
  color: "blue"

inputs:
  data_dir:
    description: "Directory containing YAML data files"
    default: "."
  pages_dir:
    description: "Directory containing markdown pages"
    default: "pages"
  blog_dir:
    description: "Directory containing blog post markdown files"
    default: "blog"
  media_dir:
    description: "Directory containing static media assets"
    default: "media"
  output_dir:
    description: "Build output directory"
    default: "_site"
  base_path:
    description: "Base path for the site (e.g. /repo-name/ for GitHub Pages project sites)"
    default: "/"
  site_url:
    description: "Full site URL for SEO (sitemap, RSS). Auto-detected from GITHUB_REPOSITORY if not set."
    default: ""
  build_date:
    description: "Override build date (YYYY-MM-DD) for reproducible builds and blog scheduling"
    default: ""

runs:
  using: "composite"
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "22"

    - name: Install build dependencies
      shell: bash
      run: npm ci
      working-directory: ${{ github.action_path }}

    - name: Build site
      shell: bash
      run: |
        node ${{ github.action_path }}/src/cli.js \
          --data-dir "${{ inputs.data_dir }}" \
          --pages-dir "${{ inputs.pages_dir }}" \
          --blog-dir "${{ inputs.blog_dir }}" \
          --media-dir "${{ inputs.media_dir }}" \
          --output-dir "${{ inputs.output_dir }}" \
          --base-path "${{ inputs.base_path }}" \
          --site-url "${{ inputs.site_url }}" \
          --build-date "${{ inputs.build_date }}"
      working-directory: ${{ github.workspace }}

outputs:
  output_path:
    description: "Path to the built site directory"
    value: ${{ inputs.output_dir }}
```

---

## Code Quality & Testing

### Build Architecture — Library / CLI Separation

All build logic lives in `src/lib/` as pure, importable functions with explicit inputs and outputs. The CLI (`src/cli.js`) and the GitHub Action (`action.yml`) are both thin wrappers that parse arguments and call `lib/index.js`. This means:

- **Unit tests** run against `lib/` directly — no CLI spawning, no filesystem mocking, no GitHub Actions environment needed
- **Integration tests** call `lib/index.js` with fixture directories and assert against the output
- **The same build** runs locally (`node src/cli.js --data-dir .`), in CI, and inside the GitHub Action

```javascript
// src/lib/index.js — the core build function
export async function build(options) {
  // options: { dataDir, pagesDir, blogDir, mediaDir, outputDir, actionPath, basePath, siteUrl, buildDate }
  // Returns: { site, resume, skills, projects, crossref, i18n, manifest, files[] }
  // Pure orchestration — reads from dataDir, writes to outputDir
}

// src/cli.js — thin CLI wrapper
// actionPath resolved from import.meta.url to locate template/ and i18n/ dirs
import { build } from './lib/index.js';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const actionPath = resolve(__dirname, '..');
const { values } = parseArgs({ /* ... */ });
await build({ dataDir: values['data-dir'], blogDir: values['blog-dir'], basePath: values['base-path'], siteUrl: values['site-url'], buildDate: values['build-date'], actionPath, /* ... */ });

// test/unit/compile-crossref.test.js — tests lib directly
import { compileCrossref } from '../../src/lib/compile-crossref.js';
test('matches skills case-insensitively', () => {
  const result = compileCrossref(skills, resume, projects);
  expect(result.skillToExperience['docker']).toHaveLength(2);
});
```

### Pre-commit Hooks

Enforced via **Husky** + **lint-staged** — runs on every commit automatically:

```json
// .lintstagedrc.json
{
  "src/**/*.js": ["eslint --fix", "prettier --write"],
  "test/**/*.js": ["eslint --fix", "prettier --write"],
  "template/**/*.js": ["eslint --fix", "prettier --write"],
  "i18n/**/*.yml": ["prettier --write"]
}
```

**Toolchain:**

| Tool | Purpose | Config |
|---|---|---|
| Husky | Git hook management | `.husky/pre-commit` |
| lint-staged | Run linters on staged files only | `.lintstagedrc.json` |
| ESLint | Code quality + style enforcement | `eslint.config.js` (flat config) |
| Prettier | Consistent formatting (JS, YAML, MD) | `.prettierrc` |

### Test Framework

**Vitest** — fast, ESM-native, compatible with Node 22:

```json
// package.json (relevant scripts)
{
  "name": "portfolio",
  "description": "Instant Portfolio — build engine",
  "scripts": {
    "lint": "eslint src/ test/ template/",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "build": "node src/cli.js"
  },
  "dependencies": {
    "js-yaml": "^4.x",
    "markdown-it": "^14.x",
    "gray-matter": "^4.x"
  },
  "devDependencies": {
    "vitest": "^3.x",
    "@vitest/coverage-v8": "^3.x",
    "eslint": "^9.x",
    "prettier": "^3.x",
    "husky": "^9.x",
    "lint-staged": "^15.x"
  }
}
```

### Test Suites

**Unit tests** (`test/unit/`) — each `src/lib/*.js` module has a corresponding test file:

| Test file | What it covers |
|---|---|
| `compile-yaml.test.js` | YAML parsing, default merging, missing file handling |
| `strip-visibility.test.js` | Contact field stripping (email, phone absent when false), section removal (education array gone when false), skills.json omission, crossref exclusion. Verifies stripped data contains NO hidden fields. |
| `compile-markdown.test.js` | Frontmatter extraction, markdown rendering, media path rewriting |
| `compile-blog.test.js` | Post scheduling (drafts, future dates, expiry), sorting, reading time, tag index |
| `compile-crossref.test.js` | Case-insensitive matching, bidirectional index, unmatched skill warnings |
| `compile-i18n.test.js` | Language pack loading, override merging, missing key validation |
| `compile-seo.test.js` | robots.txt content, sitemap route filtering, llms.txt structure |
| `generate-manifest.test.js` | Route generation, nav assembly, visibility filtering |
| `generate-index.test.js` | Template interpolation, meta tags, dir attribute, robots meta |
| `validate.test.js` | Schema validation, required fields, type checking, helpful errors |

**Integration tests** (`test/integration/`) — full build pipeline with real fixtures:

| Test file | What it covers |
|---|---|
| `full-build.test.js` | Builds `test/fixtures/full/` → asserts all expected files in output, JSON structure, HTML content |
| `visibility.test.js` | Builds `test/fixtures/visibility-hidden/` → asserts hidden data absent from all JSON files, sitemap, llms.txt. Verifies no stripped contact fields in resume.json. |
| `blog-filtering.test.js` | Builds blog fixtures → asserts drafts excluded, future posts excluded, expired posts excluded, published posts present, RSS feed correct |

**Test fixtures** (`test/fixtures/`) — representative user repos:

| Fixture | Purpose |
|---|---|
| `minimal/` | All four required YAML files with minimal content, no pages/blog/media — tests baseline build |
| `full/` | All YAML files, media, pages — tests complete happy path |
| `i18n-override/` | Custom `i18n_overrides` in site.yml — tests merge logic |
| `visibility-hidden/` | All visibility flags `false` — tests section exclusion everywhere |
| `blog/` | Posts with various states: published, draft, future-dated, expired — tests scheduling logic |
| `invalid/` | Malformed YAML, missing required fields — tests error reporting |

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to the action repo:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  # Smoke test: runs the CLI directly against fixtures as an end-user would.
  # Complements the vitest integration suite (which runs via npm run test:coverage above)
  # by validating the CLI entrypoint and output file structure.
  smoke:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - name: Build full fixture via CLI
        run: node src/cli.js --data-dir test/fixtures/full --pages-dir test/fixtures/full/pages --blog-dir test/fixtures/full/blog --media-dir test/fixtures/full/media --output-dir _site
      - name: Verify output structure
        run: |
          test -f _site/index.html
          test -f _site/404.html
          test -f _site/.nojekyll
          test -f _site/robots.txt
          test -f _site/sitemap.xml
          test -f _site/llms.txt
          test -f _site/data/site.json
          test -f _site/data/resume.json
          test -f _site/data/skills.json
          test -f _site/data/projects.json
          test -f _site/data/crossref.json
          test -f _site/data/i18n.json
          test -f _site/data/manifest.json
          test -f _site/data/blog/index.json
          test -f _site/data/blog/tags.json
          test -f _site/feed.xml
          test -d _site/components
          echo "All expected output files present"
```

### Coverage Target

Minimum **80% line coverage** enforced in CI. The `lib/` modules should aim for **95%+** since they're pure functions with well-defined inputs/outputs.

---

## Milestones

### M1 — Foundation
- [ ] Scaffold action repo structure (lib/ separation, test/ directories)
- [ ] Configure pre-commit: Husky + lint-staged + ESLint + Prettier
- [ ] Configure Vitest with coverage
- [ ] CI workflow: lint → test (Node 22) → smoke test
- [ ] `src/lib/validate.js` — schema validation for all YAML inputs
- [ ] Build pipeline: YAML → JSON compilation (with visibility default merging)
- [ ] Build pipeline: visibility stripping (contact fields + sections removed before serialisation)
- [ ] Build pipeline: Markdown + frontmatter → JSON compilation (with media path rewriting)
- [ ] Build pipeline: blog post processing (scheduling, sorting, reading time, tag index)
- [ ] Build pipeline: media/ directory copy + size warnings
- [ ] Build pipeline: i18n resolution (language pack + overrides → i18n.json)
- [ ] Build pipeline: skill ↔ experience ↔ project cross-reference index generation
- [ ] Build pipeline: manifest generation (visibility-aware routes and nav)
- [ ] Build pipeline: `index.html` generation from template (incl. `dir` attr, meta robots, RSS link, `theme_mode` for FOUC-prevention script)
- [ ] Build pipeline: SEO file generation (robots.txt, sitemap.xml, llms.txt, feed.xml)
- [ ] Ship built-in language packs: en, fr, de, es, pt, nl, it, ja, zh, ar
- [ ] `action.yml` composite action definition
- [ ] SPA 404 redirect support
- [ ] Test fixtures: minimal, full, i18n-override, visibility-hidden, invalid, blog (with drafts/scheduled/expired)
- [ ] Unit tests for all `src/lib/` modules (target 95%+ coverage)
- [ ] Integration tests: full-build, visibility, blog-filtering

### M2 — Core Components
- [ ] `i18n-mixin` — shared `t(key, params?)` method for all components
- [ ] `app-shell` — router, data loading, layout, i18n provider
- [ ] `nav-bar` — responsive navigation from manifest (routes already filtered by build)
- [ ] `hero-section` — name, tagline, photo, contact pills, background modes (gradient/image/solid)
- [ ] `page-home` — resume landing page (renders sections present in data — hidden sections already stripped)
- [ ] `section-experience` + `timeline-item`
- [ ] `section-education` + `timeline-item`
- [ ] `section-community`
- [ ] `section-projects` + `project-card-compact` (compact horizontal cards for home page bottom, link to projects page)
- [ ] `page-projects` + `project-card` (full detail page with anchors, featured display)
- [ ] `section-accreditations`
- [ ] Skill pills on experience entries (clickable → `/{skills_path}?highlight=`)
- [ ] Deep-link anchors on experience entries (`#experience-<slug>`)
- [ ] `#printable-content` region with print-optimised section order
- [ ] `@media print` stylesheet (hero as simple header, hidden data already absent from build)
- [ ] `pdf-export` component (lazy-loads html2pdf.js from CDN)
- [ ] `theme-toggle` component (light/dark/system cycle, localStorage persistence, OS preference listener)
- [ ] Tailwind dark mode setup (`@custom-variant` declaration, FOUC-prevention `<script>` in template)
- [ ] `page-not-found` component (404 for unknown SPA routes, links back to home)
- [ ] `site-footer` component (copyright, "Built with Instant Portfolio" link)
- [ ] RTL layout support (logical properties, `dir` attr, Tailwind `rtl:` variants)

### M3 — Skills, Blog & Pages
- [ ] `page-skills` + `skill-explorer` + `skill-card`
- [ ] Search/filter functionality
- [ ] Tag-based filtering
- [ ] "Used in" experience + project links on skill cards (from `crossref.json`)
- [ ] `?highlight=<skill>` query param support on skills page
- [ ] `page-blog` — blog index (post cards, tag cloud, pagination)
- [ ] `page-blog-post` — individual post view (header, content, prev/next nav)
- [ ] `blog-card` — post card component (title, date, tags, image, reading time)
- [ ] Blog tag filtering (`?tag=<tag>` URL support)
- [ ] `page-custom` — markdown page renderer
- [ ] Dynamic route registration from pages

### M4 — Polish & Release
- [ ] Accessibility audit (ARIA, keyboard nav, contrast)
- [ ] Performance: lazy-load page data, preconnect CDNs
- [ ] Comprehensive README with setup guide
- [ ] Reference workflows: GitHub Pages, Cloudflare Pages, Netlify, S3 (incl. cron schedule example)
- [ ] Example user repo (template repo)
- [ ] Tag `v1` release

### Future Considerations
- [ ] Build-time PDF generation via Puppeteer (higher quality, consistent output)
- [ ] Additional language packs (community contributed)
- [ ] "Latest posts" compact section on home page
- [ ] Blog post series/collections
- [ ] Blog search (client-side full-text)
- [ ] Analytics integration
- [ ] Custom Lit component injection (user-provided components)
- [ ] Open Props design token integration
