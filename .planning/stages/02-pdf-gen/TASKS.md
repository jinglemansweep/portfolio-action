# Stage 02 — PDF & DOCX Generation — Task List

> Auto-generated from [PLAN.md](./PLAN.md). Each task group must be completed and committed before proceeding to the next. Quality checks (lint, format, test) must pass before any commit.

---

## M1 — DOCX Generator

### Task 1: Add `docx` Dependency

- [ ] Add `docx` to production dependencies in `package.json` (`"docx": "^9.0.0"`)
- [ ] Run `npm install` to update `package-lock.json`
- [ ] Verify: `npm ls docx` shows the package installed
- [ ] Verify: `npm run lint` passes
- [ ] Verify: `npm test` passes (existing tests unaffected)
- [ ] Commit

### Task 2: DOCX Generator — Core Structure

- [ ] Create `src/lib/generate/docx.js`
- [ ] Export `generateDocx({ resume, skills, projects, i18n, pageSize, theme })` → `Promise<Buffer>`
- [ ] Implement `PAGE_SIZES` constant (`A4` and `Letter` with DXA dimensions)
- [ ] Implement document skeleton: page size, margins (1cm top/bottom, 1.2cm left/right), numbering config for bullet lists
- [ ] Implement custom heading styles (section heading with coloured bottom border using theme primary)
- [ ] Implement header section: name (14pt), tagline, contact details (email, phone, location, website, socials, links — only fields present in stripped data)
- [ ] Implement summary section: convert markdown to plain text paragraphs (strip formatting)
- [ ] Use `structuredClone()` on input data before any mutations
- [ ] Verify: file is syntactically valid JS
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 3: DOCX Generator — Resume Sections

- [ ] Implement experience section: title + company on left, dates right-aligned via `TabStopType.RIGHT`, description as paragraphs, skills as inline text
- [ ] Implement education section: institution, qualification, dates, optional description
- [ ] Implement accreditations section: title, issuer, date
- [ ] Implement skills section: grouped by category, each category as bold heading, skills listed with level and years
- [ ] Implement community section: name, role, description
- [ ] Implement projects section: name, dates, description, URL, skills used
- [ ] Handle missing sections gracefully (each section only rendered if data is present in stripped input)
- [ ] Use `LevelFormat.BULLET` with numbering config for any bullet lists (not unicode characters)
- [ ] Section ordering: summary → experience → education → accreditations → skills → community → projects
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 4: DOCX Generator — Unit Tests

- [ ] Create `test/unit/generate-docx.test.js`
- [ ] Test: generates non-empty buffer from full demo-style data
- [ ] Test: buffer starts with ZIP magic bytes (`PK` / `0x504B`)
- [ ] Test: handles missing experience array (stripped data)
- [ ] Test: handles missing skills data (`null`)
- [ ] Test: handles missing projects data (`null`)
- [ ] Test: handles missing education, community, accreditations arrays
- [ ] Test: respects `A4` page size (default)
- [ ] Test: respects `Letter` page size
- [ ] Test: handles resume with no contact fields (all stripped for privacy)
- [ ] Test: handles resume with minimal data (name only, no tagline/summary)
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

---

## M2 — PDF Generator

### Task 5: Resume HTML Template Shell

- [ ] Create `template/resume-pdf.html` — minimal HTML shell with placeholder tokens:
  - `${lang}` — language code
  - `${dir}` — text direction (ltr/rtl)
  - `${css}` — inline stylesheet
  - `${content}` — rendered resume body HTML
- [ ] No external dependencies (no CDN links, no `<script>` tags)
- [ ] Verify: file is valid HTML structure
- [ ] Verify: `npm run format:check` passes
- [ ] Commit

### Task 6: Resume HTML Template Builder

- [ ] Create `src/lib/generate/resume-html.js`
- [ ] Export `generateResumeHtml({ resume, skills, projects, i18n, theme })` → `string`
- [ ] Read `template/resume-pdf.html` and interpolate tokens
- [ ] Implement inline CSS stylesheet:
  - Professional print layout optimised for A4/Letter
  - Theme primary colour for section dividers/headings
  - Typography: clean sans-serif, appropriate sizes for headings/body
  - `page-break-inside: avoid` on experience entries, education entries, project cards
  - Proper spacing and margins for print
- [ ] Implement resume body HTML generation:
  - Header: name, tagline, contact details (same conditional logic as DOCX)
  - Summary: rendered via `renderMarkdown()` from existing `compile/markdown.js`
  - Experience: title, company, dates, description (markdown-rendered), skills
  - Education: institution, qualification, dates, description
  - Accreditations: title, issuer, date
  - Skills: grouped by category with level and years
  - Community: name, role, description
  - Projects: name, dates, description, URL, skills
- [ ] Same section ordering as DOCX: summary → experience → education → accreditations → skills → community → projects
- [ ] Handle missing sections gracefully (same as DOCX — only render present data)
- [ ] Use `structuredClone()` on input data before any mutations
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 7: PDF Generator (Puppeteer Wrapper)

- [ ] Create `src/lib/generate/pdf.js`
- [ ] Export `generatePdf(htmlString, { pageSize })` → `Promise<Buffer>`
- [ ] Use dynamic `import('puppeteer')` with try/catch — throw descriptive error if not installed: `'Puppeteer is required for PDF generation. Install it with: npm install puppeteer'`
- [ ] Launch browser with `--no-sandbox` and `--disable-setuid-sandbox` args (required for CI)
- [ ] Set page content with `waitUntil: 'networkidle0'`
- [ ] Generate PDF with configurable page size format, margins (1cm top/bottom, 1.2cm left/right), `printBackground: true`
- [ ] Return PDF as `Buffer`
- [ ] Always close browser in `finally` block
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 8: HTML Builder & PDF Generator — Unit Tests

- [ ] Create `test/unit/generate-resume-html.test.js`:
  - Test: returns string containing `<!DOCTYPE html>`
  - Test: contains resume name in heading element
  - Test: contains expected section headings (Experience, Education, etc.) based on i18n labels
  - Test: excludes sections not present in input data (e.g. no skills heading when skills is `null`)
  - Test: renders markdown in summary (contains `<p>` tags)
  - Test: contains inline `<style>` block
  - Test: does not contain external stylesheet or script references
  - Test: handles resume with minimal data (name only)
- [ ] Create `test/unit/generate-pdf.test.js`:
  - Test: throws descriptive error when Puppeteer is not installed (mock the dynamic import to throw)
  - Test: calls `puppeteer.launch()` with `--no-sandbox` args (mock Puppeteer module)
  - Test: calls `page.setContent()` with HTML string and `waitUntil: 'networkidle0'`
  - Test: calls `page.pdf()` with correct format and margins
  - Test: passes `A4` page size format by default
  - Test: passes `Letter` page size format when configured
  - Test: returns buffer from `page.pdf()` result
  - Test: closes browser even if `page.pdf()` throws
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

---

## M3 — Build Pipeline & Navbar Integration

### Task 9: Config Schema — `documents` Defaults & Validation

- [ ] Update `src/lib/compile/yaml.js`:
  - Add `DOCUMENTS_DEFAULTS` constant: `{ pdf: true, docx: true, page_size: 'A4', filename: 'resume' }`
  - Merge defaults into `site.documents` when `isSiteConfig: true` (same pattern as visibility defaults)
- [ ] Update `src/lib/utils/validate.js`:
  - Validate `documents.pdf` is boolean (if present)
  - Validate `documents.docx` is boolean (if present)
  - Validate `documents.page_size` is `'A4'` or `'Letter'` (if present)
  - Validate `documents.filename` is a valid filename: no slashes, no file extension, non-empty string (if present)
- [ ] Update existing unit tests:
  - `test/unit/compile-yaml.test.js`: verify `documents` defaults are merged for site config
  - `test/unit/validate.test.js`: add tests for valid/invalid `documents` config
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 10: CLI Flags & Build Orchestrator

- [ ] Update `src/cli.js`:
  - Add `'no-pdf': { type: 'boolean', default: false }` to parseArgs options
  - Add `'no-docx': { type: 'boolean', default: false }` to parseArgs options
  - Pass `noPdf: values['no-pdf']` and `noDocx: values['no-docx']` to `build()`
- [ ] Update `src/lib/index.js`:
  - Add `noPdf` and `noDocx` to destructured options
  - After SEO file generation (step 15), add step 16 (DOCX) and step 17 (PDF)
  - Step 16: if `site.documents.docx && !noPdf` → dynamic import `./generate/docx.js`, call `generateDocx()`, write `{filename}.docx` to outputDir
  - Step 17: if `site.documents.pdf && !noPdf` → dynamic import `./generate/pdf.js` + `./generate/resume-html.js`, build HTML, call `generatePdf()`, write `{filename}.pdf` to outputDir
  - Apply CLI overrides to `site.documents` before writing `site.json` (so navbar reflects actual generation)
  - If PDF generation fails due to missing Puppeteer, emit warning and continue (don't break the build)
- [ ] Verify: CLI builds with `--no-pdf --no-docx` and produces no document files
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 11: Action.yml Updates

- [ ] Add `pdf` input to `action.yml`: `description: "Install Chrome for PDF generation (set false to skip)", default: "true"`
- [ ] Add conditional step: `Setup Chrome for PDF generation` (uses `browser-actions/setup-chrome@latest`, `if: inputs.pdf != 'false'`)
- [ ] Add conditional step: `Install Puppeteer for PDF generation` (runs `npm install puppeteer && npx puppeteer browsers install chrome`, `if: inputs.pdf != 'false'`)
- [ ] Update `Build site` step to pass `--no-pdf` when `inputs.pdf == 'false'`
- [ ] Verify: `action.yml` is valid YAML
- [ ] Commit

### Task 12: i18n Labels — All Language Packs

- [ ] Add `doc_download_pdf` and `doc_download_docx` labels to `i18n/en.yml`:
  - `doc_download_pdf: "Download PDF"`
  - `doc_download_docx: "Download DOCX"`
- [ ] Add translated labels to `i18n/fr.yml` (`"Télécharger PDF"`, `"Télécharger DOCX"`)
- [ ] Add translated labels to `i18n/de.yml` (`"PDF herunterladen"`, `"DOCX herunterladen"`)
- [ ] Add translated labels to `i18n/es.yml` (`"Descargar PDF"`, `"Descargar DOCX"`)
- [ ] Add translated labels to `i18n/pt.yml` (`"Baixar PDF"`, `"Baixar DOCX"`)
- [ ] Add translated labels to `i18n/nl.yml` (`"PDF downloaden"`, `"DOCX downloaden"`)
- [ ] Add translated labels to `i18n/it.yml` (`"Scarica PDF"`, `"Scarica DOCX"`)
- [ ] Add translated labels to `i18n/ja.yml` (`"PDFをダウンロード"`, `"DOCXをダウンロード"`)
- [ ] Add translated labels to `i18n/zh.yml` (`"下载PDF"`, `"下载DOCX"`)
- [ ] Add translated labels to `i18n/ar.yml` (`"تحميل PDF"`, `"تحميل DOCX"`)
- [ ] Remove `pdf_export` and `pdf_generating` labels from all 10 language packs (replaced by download links)
- [ ] Update `test/unit/compile-i18n.test.js` if it asserts specific label keys
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run lint` passes
- [ ] Verify: `npm run format:check` passes
- [ ] Commit

### Task 13: Remove `pdf-export` Component & Update Navbar

- [ ] Delete `template/components/layout/pdf-export.js`
- [ ] Update `template/components/layout/app-shell.js`:
  - Remove import/reference to `pdf-export.js`
  - Pass `site.documents` config to `<nav-bar>` component as a property
- [ ] Update `template/components/layout/nav-bar.js`:
  - Accept `documents` property (from app-shell via `site.documents`)
  - Remove any `<pdf-export>` element from the template
  - Add PDF download link: `<a href="${basePath}${filename}.pdf" download>` — shown only if `documents.pdf` is true
  - Add DOCX download link: `<a href="${basePath}${filename}.docx" download>` — shown only if `documents.docx` is true
  - Position download links where the PDF export button was (right side of nav, before theme toggle)
  - Style links consistently with existing nav buttons (Tailwind classes, dark mode variants)
  - Add `aria-label` using `this.t('doc_download_pdf')` and `this.t('doc_download_docx')` respectively
  - Add focus styles: `focus:ring-2 focus:ring-blue-500 focus:outline-none`
  - Ensure links are hidden when neither format is enabled
  - Handle mobile responsive layout (icon-only with `aria-label` on small screens)
- [ ] Update `template/components/section/hero-section.js` (if it references pdf-export):
  - Remove any PDF export button/link from hero quick actions
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 14: Demo Site & Fixture Updates

- [ ] Update `demo/site.yml`: add `documents` section with defaults (`pdf: true`, `docx: true`, `page_size: A4`, `filename: resume`)
- [ ] Update `test/fixtures/full/site.yml`: add `documents` section
- [ ] Update `test/fixtures/minimal/site.yml`: no `documents` section (verify defaults are applied)
- [ ] Update `test/fixtures/visibility-hidden/site.yml`: add `documents: { pdf: false, docx: false }` (consistent with "all hidden" theme)
- [ ] Verify: `npm test` passes (existing tests still work with new defaults)
- [ ] Verify: `npm run lint` passes
- [ ] Commit

---

## M4 — Testing & Quality

### Task 15: Integration Tests — Document Generation

- [ ] Update `test/integration/full-build.test.js`:
  - Test: default build with `--no-pdf --no-docx` flags produces no `.pdf` or `.docx` files (keep existing smoke test fast)
  - Test: `site.json` output contains `documents` config with defaults
- [ ] Create `test/integration/docx-build.test.js` (or add to existing):
  - Test: build with `documents.docx: true` produces `resume.docx` in output directory
  - Test: `resume.docx` is a valid ZIP file (starts with `PK` magic bytes)
  - Test: build with `documents.docx: false` produces no `.docx` file
  - Test: custom `documents.filename: 'cv'` produces `cv.docx`
  - Test: visibility-stripped build produces DOCX without hidden sections
- [ ] Create `test/integration/pdf-build.test.js` (conditionally skipped if Puppeteer not available):
  - Test: build with `documents.pdf: true` produces `resume.pdf` in output directory
  - Test: build with `documents.pdf: false` produces no `.pdf` file
  - Test: custom `documents.filename: 'cv'` produces `cv.pdf`
  - Skip all tests with `describe.skipIf()` when Puppeteer is not installed
- [ ] Test: `site.json` reflects effective config after `--no-pdf` override (`documents.pdf` is `false`)
- [ ] Verify: `npm test` passes
- [ ] Verify: `npm run test:coverage` meets 80% threshold
- [ ] Verify: `npm run lint` passes
- [ ] Commit

### Task 16: CI Workflow Updates

- [ ] Update `.github/workflows/ci.yml`:
  - Update `smoke` job: add `--no-pdf --no-docx` flags to CLI command (avoid Chrome dependency in basic smoke test)
  - Add `documents` job (runs after `test`):
    - Install Chrome via `browser-actions/setup-chrome@latest`
    - Install Puppeteer: `npm install puppeteer && npx puppeteer browsers install chrome`
    - Run CLI with full fixtures (PDF + DOCX enabled by default)
    - Verify `_site/resume.pdf` and `_site/resume.docx` exist
- [ ] Verify: CI workflow YAML is valid
- [ ] Commit

### Task 17: Final Quality Checks

- [ ] Run full test suite: `npm run test:coverage` — all tests pass, coverage >= 80%
- [ ] Run lint: `npm run lint` — no errors
- [ ] Run format check: `npm run format:check` — all files formatted
- [ ] Run CLI smoke test with DOCX: `node src/cli.js --data-dir demo --pages-dir demo/pages --blog-dir demo/blog --media-dir demo/media --output-dir /tmp/smoke-test --no-pdf` — succeeds and produces `resume.docx`
- [ ] Verify DOCX opens correctly in LibreOffice/Word (manual check)
- [ ] If Puppeteer installed: run CLI smoke test with PDF and verify output
- [ ] Review all new files for accidental secret exposure, hardcoded paths, or debug code
- [ ] Verify no dead imports (pdf-export.js references fully removed)
- [ ] Verify `CLAUDE.md` is still accurate (update if new conventions introduced)
- [ ] Commit
