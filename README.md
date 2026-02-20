# Instant Portfolio

A reusable **GitHub Action** that builds a modern, SPA-like personal portfolio/resume site from YAML data and Markdown pages. Create a repo with your content, add the action to a workflow, and deploy to any static host.

## Quick Start

1. Create a new repository with your data files:

```
my-portfolio/
├── .github/workflows/deploy.yml
├── site.yml
├── resume.yml
├── skills.yml
├── projects.yml
├── pages/          # Optional markdown pages
├── blog/           # Optional blog posts
└── media/          # Optional static assets
```

2. Add the deployment workflow (`.github/workflows/deploy.yml`):

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

3. Push to `main` and your site is live.

## Data Schema

All four YAML files are **required**: `site.yml`, `resume.yml`, `skills.yml`, and `projects.yml`.

### `site.yml`

```yaml
title: 'Jane Doe — Software Engineer'
description: 'Personal portfolio and resume'
lang: en # Language code (en, fr, de, es, pt, nl, it, ja, zh, ar)

theme:
  primary: '#2563eb' # Primary colour
  accent: '#f59e0b' # Accent colour
  mode: system # light | dark | system

hero:
  style: gradient # gradient | image | solid
  background: '' # Image URL for style: image
  overlay_opacity: 0.6 # Dark overlay opacity (0-1)

visibility:
  education: true
  experience: true
  projects: true
  community: true
  accreditations: true
  skills: true # false disables /skills page
  blog: true # false disables blog entirely
  email: false # Hidden by default (privacy)
  phone: false # Hidden by default (privacy)
  location: true
  website: true
  socials: true # Social media profiles
  links: true # Custom profile links

custom_domain: '' # Write CNAME file for custom domain hosting

seo:
  robots:
    indexing: true
    follow_links: true
  sitemap: true
  llms_txt: true
  rss: true

i18n_overrides: # Override any language pack key
  labels: {}
```

### `resume.yml`

```yaml
name: 'Jane Doe'
tagline: 'Software Engineer'
photo: 'media/headshot.jpg' # Optional

contact:
  email: 'hello@example.com'
  phone: ''
  location: 'London, UK'
  website: 'https://example.com'
  socials:
    - type: github
      username: username
    - type: linkedin
      username: username
    - type: x
      username: username
  links:
    - platform: blog
      url: 'https://blog.example.com'

summary: |
  Multi-paragraph summary with **markdown** support.

education:
  - institution: 'University of Example'
    qualification: 'BSc Computer Science'
    start: '2012'
    end: '2015'

experience:
  - title: 'Senior Engineer'
    company: 'Example Corp'
    start: '2020-01'
    end: 'present'
    description: |
      Role description with **markdown** support.
    skills: ['TypeScript', 'Docker', 'Kubernetes']

community:
  - name: 'Local Tech Meetup'
    role: 'Organiser'
    url: 'https://example.com'
    description: 'Monthly tech community meetup.'

accreditations:
  - title: 'AWS Solutions Architect'
    issuer: 'Amazon'
    date: '2023'
    url: ''
```

### `skills.yml`

```yaml
categories:
  - name: 'Infrastructure'
    skills:
      - name: Docker
        level: expert # beginner | intermediate | advanced | expert
        start_year: 2017 # Calculates years dynamically
        icon: docker # Simple Icons slug (optional)
        comment: 'Primary container platform' # Optional note
        tags: ['containers']
        links:
          - label: 'Official Site'
            url: 'https://www.docker.com'
```

### `projects.yml`

```yaml
projects:
  - name: 'Project Name'
    description: |
      Project description with **markdown** support.
    url: 'https://project.example.com'
    repo: 'https://github.com/user/repo'
    start: '2024-01'
    end: '' # Empty = ongoing
    image: 'media/project.png'
    skills: ['Docker', 'Python']
    tags: ['open-source']
    comment: 'Key infrastructure project' # Optional note
    featured: true
```

## Markdown Pages

Add custom pages by creating markdown files in `pages/`:

```markdown
---
title: 'About Me'
slug: about
description: 'More about me'
nav_order: 1
show_in_nav: true
---

Your content here with full **markdown** support.
```

| Field         | Required | Default       | Description            |
| ------------- | -------- | ------------- | ---------------------- |
| `title`       | Yes      | —             | Page title             |
| `slug`        | No       | From filename | URL path               |
| `description` | No       | `""`          | Meta description       |
| `nav_order`   | No       | `999`         | Position in navigation |
| `show_in_nav` | No       | `true`        | Show in navigation bar |

## Blog

Add blog posts by creating markdown files in `blog/`:

```markdown
---
title: 'My First Post'
publish_on: 2026-01-15
tags:
  - tutorial
  - getting-started
draft: false
featured: false
image: 'media/post-hero.jpg'
---

Your blog post content here.
```

| Field         | Required | Default       | Description                                           |
| ------------- | -------- | ------------- | ----------------------------------------------------- |
| `title`       | Yes      | —             | Post title                                            |
| `publish_on`  | Yes      | —             | Publish date (YYYY-MM-DD). Future dates are excluded. |
| `slug`        | No       | From filename | URL path (derived from filename if omitted)           |
| `description` | No       | `""`          | Short description for cards and RSS feed              |
| `expire_on`   | No       | `""`          | Expiry date. Posts past this date are excluded.       |
| `updated_on`  | No       | `""`          | Last updated date                                     |
| `author`      | No       | `resume.name` | Author name                                           |
| `draft`       | No       | `false`       | Drafts are excluded from build                        |
| `featured`    | No       | `false`       | Shown prominently on blog index                       |
| `tags`        | No       | `[]`          | Post tags for filtering                               |
| `image`       | No       | `""`          | Hero/card image                                       |

Blog posts include automatic reading time calculation and RSS feed generation (`feed.xml`).

## Action Inputs

| Input        | Default       | Description                                                               |
| ------------ | ------------- | ------------------------------------------------------------------------- |
| `data_dir`   | `.`           | Directory containing YAML data files                                      |
| `pages_dir`  | `pages`       | Directory containing markdown pages                                       |
| `blog_dir`   | `blog`        | Directory containing blog posts                                           |
| `media_dir`  | `media`       | Directory containing static media                                         |
| `output_dir` | `_site`       | Build output directory                                                    |
| `base_path`  | `/`           | Base path (e.g. `/repo-name/` for project sites)                          |
| `site_url`   | Auto-detected | Full site URL for SEO. Auto-detected from `GITHUB_REPOSITORY` if not set. |
| `build_date` | Today         | Override build date (YYYY-MM-DD) for reproducible builds                  |

## Visibility System

The visibility system in `site.yml` controls what data appears in the built site. Hidden data is **stripped at build time** and never reaches the browser.

- **Contact fields** (`email`, `phone`, `location`, `website`, `socials`, `links`): Control individual field visibility
- **Sections** (`education`, `experience`, `community`, `accreditations`): Hide entire resume sections
- **Pages** (`skills`, `projects`, `blog`): Disable dedicated pages and navigation entries

Defaults: `email` and `phone` are hidden by default for privacy. All other fields default to visible.

## Internationalisation (i18n)

Built-in language packs: **English**, French, German, Spanish, Portuguese, Dutch, Italian, Japanese, Chinese, and Arabic (with RTL support).

Set the language in `site.yml`:

```yaml
lang: fr # Use French
```

Override any label:

```yaml
i18n_overrides:
  labels:
    nav_home: 'Accueil'
    hero_view_skills: 'Voir les compétences'
```

For a fully custom locale, create a YAML file and reference it:

```yaml
lang: custom
i18n_file: 'i18n/my-locale.yml'
```

## Theme Configuration

Configure colours and dark mode behaviour in `site.yml`:

```yaml
theme:
  primary: '#2563eb' # Primary brand colour
  accent: '#f59e0b' # Accent colour
  mode: system # light | dark | system
```

The theme toggle in the navigation bar cycles through light, dark, and system modes. User preference is persisted in `localStorage`.

## SEO Features

- **robots.txt** — Configurable indexing and link following
- **sitemap.xml** — Auto-generated from site routes
- **llms.txt** — Structured text summary for LLM crawlers
- **feed.xml** — RSS 2.0 feed for blog posts
- **Meta robots** — Per-page robot directives

All SEO features are enabled by default and configurable via `site.yml`.

## Alternative Deployment Targets

### Cloudflare Pages

```yaml
- name: Build site
  uses: jinglemansweep/portfolio-action@v1

- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy _site --project-name=my-portfolio
```

### Netlify

```yaml
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

### AWS S3

```yaml
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

### Scheduled Builds

To publish blog posts on schedule, add a cron trigger:

```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *' # Daily at 6am UTC
```

## Development

### Prerequisites

- Node.js 22+

### Local Build

```bash
npm install
node src/cli.js --data-dir path/to/data --output-dir _site
```

### Demo Site

Build and serve the included demo site locally:

```bash
npm run demo        # Build demo site to _site/
npm run demo:serve  # Serve at http://localhost:3000
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report (80% threshold)
```

### Linting & Formatting

```bash
npm run lint          # ESLint
npm run format:check  # Prettier check
npm run format        # Prettier fix
```

## License

MIT
