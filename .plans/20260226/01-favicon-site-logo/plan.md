# Implementation Plan

> Source: `.plans/20260226/01-favicon-site-logo/prompt.md`

## Overview

Add favicon support to the build pipeline and display a small site logo image to the left of the site name in the nav bar. The favicon and logo share the same source image from `site.yml`. When no image is configured, the build emits a generic fallback favicon and the nav bar shows text-only branding (current behaviour).

## Architecture & Approach

The `site.yml` config already has a `favicon` field that is loaded but never consumed. This plan wires that field through the build pipeline into two outputs:

1. **Favicon link tag** — The `<link rel="icon">` in `template/index.html` currently points to a null data URL (`data:,`). When `site.favicon` is set, the build interpolates the image path into the link tag. When unset, a generic inline SVG favicon is used as a sensible default.

2. **Nav bar logo** — The `nav-bar.js` component gains an optional logo image rendered to the left of the site name. It reads the favicon path from `site` data (already available as a prop). When no image is set, the component renders text-only as it does today — no layout shift, no broken image.

The favicon image is expected to live in the user's `media/` directory (already copied to output by the build pipeline), so no new file-copying logic is needed. The path in `site.yml` is relative to the output root (e.g. `media/logo.png`).

A generic fallback SVG favicon is embedded inline in the template as a data URI, providing a clean default when no custom favicon is configured. This avoids shipping a separate fallback file.

## Components

### Favicon Interpolation in HTML Template

**Purpose:** Replace the null favicon placeholder with the configured image path or a generic SVG fallback.

**Inputs:** `site.favicon` string (path relative to output root, e.g. `media/logo.png`) passed through `generateIndex()`.

**Outputs:** A `<link rel="icon">` tag in the generated `index.html` pointing to either the custom image or a generic inline SVG.

**Notes:** The existing placeholder `<link rel="icon" href="data:," />` is replaced via the same `replaceAll()` interpolation pattern used for all other template variables. When `favicon` is empty/unset, the build inserts a generic SVG data URI — a simple filled circle in the theme primary colour. The `404.html` template should also receive favicon support for consistency. An `<link rel="apple-touch-icon">` tag is also added alongside the standard favicon for iOS home screen support, pointing to the same image (or omitted when using the SVG fallback, since iOS doesn't support SVG touch icons).

### generateIndex() Parameter Extension

**Purpose:** Pass the resolved favicon href through to the HTML template.

**Inputs:** `site.favicon` from the build orchestrator, `site.theme.primary` for fallback colour.

**Outputs:** A `favicon` interpolation value — either the user's image path or the generic SVG data URI.

**Notes:** The favicon resolution logic (custom path vs. fallback) lives in `generateIndex()` so the template stays simple. A helper function `resolveFaviconHref()` encapsulates this decision. Also resolves the Apple touch icon href — returns the custom image path for the touch icon when set, or empty string when using the SVG fallback (iOS doesn't support SVG touch icons).

### Nav Bar Logo Image

**Purpose:** Display a small logo image to the left of the site name in the header bar.

**Inputs:** `this.site.favicon` (already available on the component via the `site` prop from `app-shell.js`).

**Outputs:** An `<img>` element (when image is set) or nothing (when unset), rendered inline before the site name text.

**Notes:** The image is small (e.g. 28×28px via Tailwind `h-7 w-7`) with `rounded-full` for a clean circular appearance. Uses `object-cover` to handle non-square images. Includes `alt=""` (decorative, since the site name text is adjacent) and `loading="eager"` since it's above the fold. When `site.favicon` is falsy, the `<img>` is not rendered at all — the layout remains identical to current behaviour with no empty space or shift.

### Build Orchestrator Wiring

**Purpose:** Pass `site.favicon` from the loaded config into `generateIndex()`.

**Inputs:** `site` object from YAML compilation.

**Outputs:** `favicon` parameter added to the `generateIndex()` call.

**Notes:** Minimal change — just adding one parameter to the existing function call in `src/lib/index.js`.

### Test Coverage

**Purpose:** Verify favicon interpolation, fallback behaviour, and nav bar logo rendering expectations.

**Inputs:** Existing test fixtures (`minimal/` for no-favicon, `full/` for with-favicon).

**Outputs:** Unit tests for `generateIndex()` favicon handling; integration test assertions for favicon link tag in output HTML.

**Notes:** The `full/` fixture's `site.yml` already has an empty `favicon` field — update it with a test value (e.g. `media/test-image.png` which already exists in the full fixture's media directory). The `minimal/` fixture tests the fallback path.

## File Manifest

| File                                    | Action | Purpose                                                                                                         |
| --------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| `template/index.html`                   | Modify | Replace null favicon with `${favicon}` placeholder, add `${apple_touch_icon}`                                   |
| `template/404.html`                     | Modify | Add favicon and apple touch icon link tags for consistency                                                      |
| `src/lib/generate/index.js`             | Modify | Add `favicon` parameter, add `resolveFaviconHref()` helper, resolve apple touch icon, interpolate into template |
| `src/lib/index.js`                      | Modify | Pass `site.favicon` and `site.theme.primary` to `generateIndex()`                                               |
| `template/components/layout/nav-bar.js` | Modify | Add conditional logo image before site name                                                                     |
| `test/fixtures/full/site.yml`           | Modify | Set `favicon` to `media/test-image.png` for testing                                                             |
| `demo/site.yml`                         | Modify | Set `favicon` to a demo logo path (optional, for demo site)                                                     |
| `test/unit/generate/index.test.js`      | Modify | Add tests for favicon interpolation and fallback                                                                |
| `test/integration/build.test.js`        | Modify | Assert favicon link tag in generated HTML                                                                       |
