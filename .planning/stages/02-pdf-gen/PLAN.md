# Stage 02 — Build-Time PDF & DOCX Generation

## Overview

Add **build-time PDF and DOCX resume generation** to the Portfolio Action build pipeline. Both formats are generated from the same stripped YAML data already used by the SPA, producing professional resume documents alongside the static site.

**Stack**: `docx` (npm) for DOCX, `puppeteer` (headless Chrome) for PDF. Entire pipeline is Node.js — no Python or system-level dependencies beyond Chrome.

---

## Architecture Decisions

### Enabled by Default via `site.yml`

PDF and DOCX generation are controlled by `documents.pdf` and `documents.docx` flags in `site.yml`, both defaulting to `true`. This means a standard build generates both document formats out of the box. The same config drives **which download links appear in the navbar** — if a format is disabled, its download link is hidden.

CLI flags (`--no-pdf`, `--no-docx`) exist as overrides for local development (e.g., skipping PDF when Puppeteer isn't installed locally).

### Data Source

Both generators consume **already-stripped data** from step 5 of the build pipeline (after `stripVisibility()`). This guarantees privacy consistency — hidden contact fields and sections are never included in generated documents.

### DOCX: Programmatic Generation (no template file)

The `docx` npm package builds documents entirely in JavaScript. No `.docx` template file to maintain, no XML run-splitting gotchas (the pitfall with `docxtemplater`). The generator receives structured data objects and emits `Paragraph`/`Table` elements.

### PDF: Dedicated HTML Template + Puppeteer

A standalone `template/resume-pdf.html` template is purpose-built for PDF rendering. It uses inline Tailwind classes and is populated via string interpolation at build time (same pattern as `generateIndex()`). Puppeteer loads the populated HTML string via `page.setContent()` and renders to PDF. This avoids CDN dependencies, component rendering delays, and SPA routing complexity.

**Why not render the SPA?** The SPA loads Lit components from CDN, requires client-side routing, and renders asynchronously. A dedicated template is faster, more reliable, and produces consistent output.

### Dependency Strategy

| Package | Location | Rationale |
|---------|----------|-----------|
| `docx` | `dependencies` | Lightweight (~2MB installed), pure JS, always available |
| `puppeteer` | **Not in package.json** | Heavy (~400MB with Chrome). Dynamic `import()` with clear error if missing. |

Since PDF is enabled by default, the GitHub Action installs Puppeteer + Chrome by default. Users can set the `pdf` action input to `false` to skip Chrome setup and save ~30s install time. For local CLI usage, users who want PDF need to run `npm install puppeteer` once.

### Page Size

Configurable via `site.yml` (or CLI flag), defaulting to A4. Affects both PDF and DOCX output.

```js
const PAGE_SIZES = {
  A4:     { width: 11906, height: 16838, puppeteer: 'A4' },
  Letter: { width: 12240, height: 15840, puppeteer: 'Letter' },
};
```

---

## Configuration

### `site.yml` Addition

```yaml
documents:
  pdf: true            # Generate PDF resume (default: true)
  docx: true           # Generate DOCX resume (default: true)
  page_size: A4        # A4 | Letter (default: A4)
  filename: resume     # Base filename without extension (default: resume)
                       # Produces resume.pdf, resume.docx
```

The `documents` section is optional. All fields have sensible defaults. The `pdf` and `docx` flags control both **build-time generation** and **navbar download link visibility** — a single source of truth.

### CLI Arguments

```bash
# Standard build (PDF + DOCX enabled by site.yml defaults)
node src/cli.js --data-dir ./data --output-dir _site

# Skip PDF locally (e.g., Puppeteer not installed)
node src/cli.js --data-dir ./data --output-dir _site --no-pdf

# Skip both documents
node src/cli.js --data-dir ./data --output-dir _site --no-pdf --no-docx
```

New flags (overrides — the primary config lives in `site.yml`):
- `--no-pdf` (boolean) — Skip PDF generation regardless of `site.yml` config
- `--no-docx` (boolean) — Skip DOCX generation regardless of `site.yml` config

### `action.yml` Inputs

```yaml
inputs:
  pdf:
    description: "Install Chrome for PDF generation (set false to skip Chrome setup and save install time)"
    default: "true"
```

The `pdf` action input controls **Chrome installation only** — the actual generation toggle lives in `site.yml`. The `docx` package is always available (lightweight dependency), so no action input is needed for DOCX.

---

## New Files

### `src/lib/generate/docx.js` — DOCX Generator

Pure function that takes stripped data and returns a DOCX buffer.

```
generateDocx({ resume, skills, projects, i18n, pageSize }) → Promise<Buffer>
```

**Document structure** (following the reference implementation pattern):

1. **Header**: Name, tagline, contact details (email, phone, location, website, links — only fields present in stripped data)
2. **Summary**: Rendered as plain text paragraphs (markdown stripped to text)
3. **Experience**: Each entry with title + company on left, dates right-aligned via `TabStopType.RIGHT`. Description as paragraphs. Skills as inline text. Highlights as bullet list using `LevelFormat.BULLET`.
4. **Education**: Institution, qualification, dates, optional description
5. **Skills**: Grouped by category. Each category as bold heading, skills listed with level and years
6. **Projects**: Name, dates, description, URL, skills used
7. **Community**: Name, role, description
8. **Accreditations**: Title, issuer, date

**Section ordering**: Same as the SPA home page — summary, experience, education, accreditations, skills (flat), community, projects. Sections absent from stripped data are simply not rendered.

**Styling**:
- A4/Letter page size with configurable margins (1cm top/bottom, 1.2cm left/right)
- Section headings with coloured bottom border divider (using theme primary colour)
- Professional typography: 10pt body, 14pt name, 12pt section headings
- Right-aligned dates via tab stops
- Proper bullet lists via numbering config (not unicode characters)

**Key `docx` gotchas to handle**:
- Sizes in half-points (`size: 20` = 10pt)
- Page dimensions in DXA (1440 DXA = 1 inch)
- Never use `\n` — use separate `Paragraph` elements
- Use `LevelFormat.BULLET` for bullet lists, not unicode characters
- Table widths must use `WidthType.DXA`
- Always set page size explicitly

### `src/lib/generate/pdf.js` — PDF Generator

Pure function that takes an HTML string and renders it to a PDF buffer via Puppeteer.

```
generatePdf(htmlString, { pageSize }) → Promise<Buffer>
```

**Implementation**:
```js
export async function generatePdf(htmlString, { pageSize = 'A4' } = {}) {
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    throw new Error(
      'Puppeteer is required for PDF generation. Install it with: npm install puppeteer'
    );
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlString, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: pageSize,
      margin: { top: '1cm', bottom: '1cm', left: '1.2cm', right: '1.2cm' },
      printBackground: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
```

### `src/lib/generate/resume-html.js` — PDF HTML Template Builder

Pure function that builds an HTML string suitable for Puppeteer PDF rendering.

```
generateResumeHtml({ resume, skills, projects, i18n, theme }) → string
```

This generates a standalone HTML page with:
- Inline CSS (no CDN dependencies — must render offline in headless Chrome)
- Clean professional layout optimised for A4/Letter print
- Same section ordering and content as the DOCX generator
- Theme primary colour for section dividers/accents
- Proper page break handling (`page-break-inside: avoid` on entries)
- Markdown-rendered summary and descriptions (using existing `renderMarkdown()`)

### `template/resume-pdf.html` — HTML Template Shell

A minimal HTML template with placeholder tokens for interpolation:

```html
<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <style>${css}</style>
</head>
<body>${content}</body>
</html>
```

The CSS is embedded inline — no external dependencies. The template is populated by `generateResumeHtml()` and fed to `generatePdf()`.

### Test Files

- `test/unit/generate-docx.test.js` — Unit tests for DOCX generation
- `test/unit/generate-pdf.test.js` — Unit tests for PDF generation (mocked Puppeteer)
- `test/unit/generate-resume-html.test.js` — Unit tests for HTML template building

---

## Navbar UI — Document Download Links

### Behaviour

The navbar replaces the existing client-side `<pdf-export>` button (which uses `html2pdf.js` CDN) with **download links** for build-time generated documents. The links are driven by `site.documents` config from `site.json`:

| `documents.pdf` | `documents.docx` | Navbar shows |
|:---:|:---:|---|
| `true` | `true` | PDF download link + DOCX download link |
| `true` | `false` | PDF download link only |
| `false` | `true` | DOCX download link only |
| `false` | `false` | No download links |

### Component Changes

**`template/components/layout/nav-bar.js`** — Add download link(s) to the navbar, positioned where the existing PDF export button sits (right side of nav, before theme toggle). Each link is a simple `<a>` element with `download` attribute:

```html
<!-- Shown if documents.pdf is true -->
<a href="${basePath}${filename}.pdf" download
   class="..." aria-label="${this.t('doc_download_pdf')}">
  <!-- PDF icon (download/document icon) -->
  PDF
</a>

<!-- Shown if documents.docx is true -->
<a href="${basePath}${filename}.docx" download
   class="..." aria-label="${this.t('doc_download_docx')}">
  DOCX
</a>
```

The component reads `this.site.documents` (passed down from `app-shell`) to determine which links to render. `filename` comes from `site.documents.filename` (default: `resume`).

**`template/components/layout/pdf-export.js`** — **Removed**. The client-side `html2pdf.js` export is replaced by the build-time approach. The component file is deleted and its import removed from `app-shell.js`.

### i18n Labels

New labels added to all language packs:

```yaml
# Documents
doc_download_pdf: "Download PDF"
doc_download_docx: "Download DOCX"
```

### Accessibility

- Each download link has an `aria-label` using the i18n label
- Links use `download` attribute for proper browser download behaviour
- Icon-only variants (mobile/compact) must have accessible text via `aria-label`
- Focus styles: `focus:ring-2 focus:ring-blue-500 focus:outline-none`

---

## Modified Files

### `src/lib/index.js` — Build Orchestrator

Add two new steps after SEO file generation (step 15):

```
Step 16 (new): Generate DOCX (if documents.docx enabled and not overridden by --no-docx)
Step 17 (new): Generate PDF (if documents.pdf enabled and not overridden by --no-pdf)
```

Both steps:
1. Read `documents` config from `site` (merged with defaults)
2. Check CLI override flags
3. Call the generator with stripped data
4. Write output to `{outputDir}/{filename}.{ext}`

```js
const docsConfig = site.documents; // already merged with defaults by compileYaml
const generateDocx = docsConfig.docx && !options.noPdf;
const generatePdf = docsConfig.pdf && !options.noPdf;

// Step 16: Generate DOCX
if (generateDocx) {
  const { generateDocx } = await import('./generate/docx.js');
  const buffer = await generateDocx({
    resume: stripped.resume,
    skills: stripped.skills,
    projects: stripped.projects,
    i18n,
    pageSize: docsConfig.page_size,
    theme: site.theme,
  });
  await writeFile(join(outputDir, `${docsConfig.filename}.docx`), buffer);
}

// Step 17: Generate PDF
if (generatePdf) {
  const { generatePdf } = await import('./generate/pdf.js');
  const { generateResumeHtml } = await import('./generate/resume-html.js');
  const htmlString = generateResumeHtml({
    resume: stripped.resume,
    skills: stripped.skills,
    projects: stripped.projects,
    i18n,
    theme: site.theme,
  });
  const buffer = await generatePdf(htmlString, { pageSize: docsConfig.page_size });
  await writeFile(join(outputDir, `${docsConfig.filename}.pdf`), buffer);
}
```

Dynamic `import()` is used for both generators so that `docx` and `puppeteer` are only loaded when needed. The `documents` config written to `site.json` reflects the effective values (after CLI overrides), so the navbar shows download links only for formats that were actually generated.

### `src/cli.js` — CLI Entry Point

Add `--no-pdf` and `--no-docx` negation flags to `parseArgs`:

```js
const { values } = parseArgs({
  options: {
    // ... existing options ...
    'no-pdf': { type: 'boolean', default: false },
    'no-docx': { type: 'boolean', default: false },
  },
});
```

Pass to `build()`:

```js
await build({
  // ... existing options ...
  noPdf: values['no-pdf'],
  noDocx: values['no-docx'],
});
```

### `action.yml` — GitHub Action Definition

Add new input for Chrome setup control:

```yaml
inputs:
  pdf:
    description: "Install Chrome for PDF generation (set false to skip Chrome setup)"
    default: "true"
```

Add Chrome setup steps (run by default, skipped when `pdf: false`):

```yaml
steps:
  # ... existing steps ...

  - name: Setup Chrome for PDF generation
    if: inputs.pdf != 'false'
    uses: browser-actions/setup-chrome@latest

  - name: Install Puppeteer for PDF generation
    if: inputs.pdf != 'false'
    shell: bash
    run: npm install puppeteer && npx puppeteer browsers install chrome
    working-directory: ${{ github.action_path }}

  - name: Build site
    shell: bash
    run: |
      node ${{ github.action_path }}/src/cli.js \
        --data-dir "${{ inputs.data_dir }}" \
        # ... existing args ...
        ${{ inputs.pdf == 'false' && '--no-pdf' || '' }}
```

No `docx` action input needed — the `docx` npm package is lightweight and always installed via `npm ci`.

### `package.json`

Add `docx` to production dependencies:

```json
"dependencies": {
  "docx": "^9.0.0",
  "gray-matter": "^4.0.3",
  "js-yaml": "^4.1.0",
  "markdown-it": "^14.1.0"
}
```

`puppeteer` is NOT added — it's installed on-demand.

### `src/lib/utils/validate.js`

Add validation for the optional `documents` section:

- `documents.page_size` must be `A4` or `Letter` (if present)
- `documents.filename` must be a valid filename (no slashes, no extension, if present)

### `src/lib/compile/yaml.js`

Add defaults for the `documents` section when `isSiteConfig: true`:

```js
const DOCUMENTS_DEFAULTS = {
  pdf: true,
  docx: true,
  page_size: 'A4',
  filename: 'resume',
};
```

---

## Implementation Milestones

### M1 — DOCX Generator

**Goal**: Generate a professional DOCX resume from stripped data.

Tasks:
1. Install `docx` dependency
2. Create `src/lib/generate/docx.js` with `generateDocx()` function
3. Implement all resume sections (header, summary, experience, education, skills, projects, community, accreditations)
4. Support configurable page size (A4/Letter)
5. Handle missing sections gracefully (stripped data may omit them)
6. Write unit tests (`test/unit/generate-docx.test.js`)
7. Manual verification: generate a DOCX from demo data and verify in LibreOffice/Word

### M2 — PDF HTML Template + Generator

**Goal**: Generate a print-optimised HTML page and render it to PDF via Puppeteer.

Tasks:
1. Create `template/resume-pdf.html` template shell
2. Create `src/lib/generate/resume-html.js` with `generateResumeHtml()` function
3. Design and implement inline CSS for professional print layout
4. Create `src/lib/generate/pdf.js` with `generatePdf()` function
5. Handle Puppeteer not-installed gracefully (clear error message)
6. Support configurable page size
7. Handle `--no-sandbox` for CI environments
8. Write unit tests for HTML generation (`test/unit/generate-resume-html.test.js`)
9. Write unit tests for PDF generation with mocked Puppeteer (`test/unit/generate-pdf.test.js`)
10. Manual verification: generate a PDF from demo data

### M3 — Build Pipeline & Navbar Integration

**Goal**: Wire generators into the build pipeline, CLI, and GitHub Action. Add download links to the navbar.

Tasks:
1. Add `documents` defaults to `compileYaml()` for site config
2. Add `documents` validation to `validate()`
3. Add `--no-pdf` and `--no-docx` CLI override flags to `src/cli.js`
4. Add `pdf` input to `action.yml` with conditional Chrome setup
5. Add document generation steps to `src/lib/index.js` (steps 16–17)
6. Use dynamic `import()` for both generators (lazy loading)
7. Write effective `documents` config into `site.json` (reflecting CLI overrides)
8. Remove `<pdf-export>` component (client-side html2pdf.js) and its import from `app-shell.js`
9. Update `<nav-bar>` to render PDF/DOCX download links based on `site.documents` config
10. Add `doc_download_pdf` and `doc_download_docx` i18n labels to all 10 language packs
11. Update demo `site.yml` to include `documents` section
12. Update integration tests to verify document generation

### M4 — Testing & Quality

**Goal**: Comprehensive test coverage meeting 80% threshold.

Tasks:
1. Unit tests for `generateDocx()`:
   - Generates valid buffer from full data
   - Handles missing sections (skills stripped, projects stripped, etc.)
   - Respects page size config
   - Section ordering matches spec
2. Unit tests for `generateResumeHtml()`:
   - Generates valid HTML string
   - Includes all present sections
   - Excludes stripped sections
   - Renders markdown in summary/descriptions
   - Includes inline CSS
3. Unit tests for `generatePdf()`:
   - Calls Puppeteer with correct options
   - Passes page size correctly
   - Throws descriptive error when Puppeteer not installed
4. Integration tests:
   - Default build produces both `resume.docx` and `resume.pdf` in output
   - Build with `--no-pdf --no-docx` produces no document files
   - Visibility-stripped build: documents don't contain hidden data
   - Custom filename via `documents.filename` works
   - `site.json` output reflects effective `documents` config (including CLI overrides)
5. Validation tests:
   - Invalid `page_size` rejected
   - Invalid `filename` rejected
   - Missing `documents` section uses defaults (`pdf: true`, `docx: true`, `page_size: A4`)
6. Navbar/i18n tests:
   - New i18n labels present in all 10 language packs
   - `pdf-export.js` component removed (no dead imports)
6. Run all quality gates: `npm run lint`, `npm run format:check`, `npm test`, `npm run test:coverage`

---

## Testing Strategy

### DOCX Tests

The `docx` package's `Packer.toBuffer()` returns a Buffer containing a valid ZIP (DOCX is a ZIP of XML files). Tests can:
- Verify the buffer is non-empty and starts with the ZIP magic bytes (`PK`)
- Use the `docx` package's own utilities or `JSZip` to inspect internal XML
- Assert section presence/absence based on input data

### PDF Tests (Mocked)

Puppeteer is heavy and requires Chrome. Unit tests should **mock** the dynamic import:
- Mock `puppeteer.launch()` → returns mock browser
- Mock `page.setContent()` and `page.pdf()` → returns a fake buffer
- Assert correct arguments passed (page size, margins, `waitUntil`)
- Test the "not installed" error path by making the import throw

Integration tests for PDF can be **skipped in CI** unless Chrome is available (detected via env var or try/catch), or run only in a dedicated CI job with Chrome pre-installed.

### HTML Template Tests

The `generateResumeHtml()` function returns a string. Tests can assert:
- Contains `<!DOCTYPE html>`
- Contains the resume name in an `<h1>` or similar
- Contains expected section headings
- Does not contain data from stripped sections
- Contains inline `<style>` block (no external CSS references)

---

## CI/CD Changes

### Existing CI Workflow

No changes needed for lint/test/smoke jobs — document generation is opt-in and won't run unless flags are passed.

### New CI Job (Optional)

Add a `documents` job to verify PDF/DOCX generation works in CI:

```yaml
documents:
  runs-on: ubuntu-latest
  needs: test
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: "22"
        cache: "npm"
    - run: npm ci
    - uses: browser-actions/setup-chrome@latest
    - run: npm install puppeteer && npx puppeteer browsers install chrome
    - name: Build with documents (default — both enabled)
      run: |
        node src/cli.js \
          --data-dir test/fixtures/full \
          --pages-dir test/fixtures/full/pages \
          --blog-dir test/fixtures/full/blog \
          --media-dir test/fixtures/full/media \
          --output-dir _site
    - name: Verify document output
      run: |
        test -f _site/resume.pdf
        test -f _site/resume.docx
        echo "Document generation verified"
```

The existing `smoke` job should add `--no-pdf --no-docx` to avoid needing Chrome, or be updated to install Chrome too.

---

## End User Workflow

### Standard (PDF + DOCX — default)

Both documents are generated by default. No extra config needed:

```yaml
- name: Build site
  uses: jinglemansweep/portfolio-action@v1
```

### DOCX Only (skip Chrome install)

For faster CI builds when PDF isn't needed. Set `documents.pdf: false` in `site.yml`:

```yaml
# site.yml
documents:
  pdf: false
```

```yaml
# workflow
- name: Build site
  uses: jinglemansweep/portfolio-action@v1
  with:
    pdf: "false"   # Skip Chrome install
```

### No Documents

Disable both in `site.yml`:

```yaml
# site.yml
documents:
  pdf: false
  docx: false
```

### Local CLI

```bash
# Full build (install puppeteer once for PDF support)
npm install puppeteer
node src/cli.js --data-dir ./data --output-dir _site

# Skip PDF locally (no Puppeteer needed)
node src/cli.js --data-dir ./data --output-dir _site --no-pdf

# Skip all documents
node src/cli.js --data-dir ./data --output-dir _site --no-pdf --no-docx
```

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/generate/docx.js` | **New** | DOCX generator (programmatic via `docx` npm) |
| `src/lib/generate/pdf.js` | **New** | PDF generator (Puppeteer wrapper) |
| `src/lib/generate/resume-html.js` | **New** | HTML template builder for PDF rendering |
| `template/resume-pdf.html` | **New** | Minimal HTML shell template for PDF |
| `test/unit/generate-docx.test.js` | **New** | DOCX generator unit tests |
| `test/unit/generate-pdf.test.js` | **New** | PDF generator unit tests (mocked) |
| `test/unit/generate-resume-html.test.js` | **New** | HTML builder unit tests |
| `src/lib/index.js` | **Modify** | Add steps 16–17 for document generation |
| `src/cli.js` | **Modify** | Add `--no-pdf` and `--no-docx` flags |
| `action.yml` | **Modify** | Add `pdf` input + conditional Chrome setup |
| `package.json` | **Modify** | Add `docx` dependency |
| `src/lib/compile/yaml.js` | **Modify** | Add `documents` defaults |
| `src/lib/utils/validate.js` | **Modify** | Add `documents` validation |
| `template/components/layout/nav-bar.js` | **Modify** | Add PDF/DOCX download links driven by `site.documents` |
| `template/components/layout/pdf-export.js` | **Delete** | Replaced by build-time document generation |
| `template/components/layout/app-shell.js` | **Modify** | Remove `pdf-export` import, pass `documents` config to nav-bar |
| `i18n/*.yml` (all 10 packs) | **Modify** | Add `doc_download_pdf` and `doc_download_docx` labels |
| `demo/site.yml` | **Modify** | Add `documents` section |

---

## Key Gotchas

1. **`docx` sizes are in half-points** — `size: 20` = 10pt font. Page dimensions in DXA (1440 = 1 inch).
2. **Never use `\n` in `docx`** — use separate `Paragraph` elements for line breaks.
3. **Use `LevelFormat.BULLET`** for bullet lists, not unicode bullet characters.
4. **Puppeteer `--no-sandbox`** is required in CI/Docker environments.
5. **`waitUntil: 'networkidle0'`** ensures all inline content is rendered before PDF capture.
6. **Dynamic import error handling** — when Puppeteer isn't installed, `import('puppeteer')` throws `ERR_MODULE_NOT_FOUND`. Catch this and provide a helpful error message.
7. **`structuredClone()` before mutation** — clone input data before any modifications in generators.
8. **Privacy consistency** — both generators MUST consume stripped data only, never raw YAML. This is enforced by the call site in `index.js` which passes `stripped.resume`, not `resume`.
