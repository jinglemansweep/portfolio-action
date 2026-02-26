# Task List

> Source: `.plans/20260226/01-favicon-site-logo/plan.md`

## Build Pipeline — Favicon Interpolation

### Template Updates

- [x] **Replace null favicon with interpolation placeholder in `template/index.html`** — On line 11, replace `<link rel="icon" href="data:," />` with `<link rel="icon" href="${favicon}" />`. Add a new line immediately after it: `${apple_touch_icon}`. The `${apple_touch_icon}` placeholder will be replaced by the build with either a full `<link rel="apple-touch-icon" href="...">` tag or an empty string.

- [x] **Add favicon link tags to `template/404.html`** — In the `<head>` section (after `<meta charset="utf-8" />`), add `<link rel="icon" href="${favicon}" />` and `${apple_touch_icon}` on the next line. Update the 404 template processing in `src/lib/index.js` (around line 285–289) to interpolate `${favicon}` and `${apple_touch_icon}` into the 404 HTML, using the same resolved values as `index.html`. Currently only `__BASE_PATH__` is replaced — add `.replaceAll('${favicon}', faviconHref).replaceAll('${apple_touch_icon}', appleTouchIconTag)` to the chain.

### Generator Function Updates

- [x] **Add `resolveFaviconHref()` helper to `src/lib/generate/index.js`** — Add an exported function `resolveFaviconHref(favicon, primaryColour)` that returns: (a) if `favicon` is a non-empty string, return `favicon` as-is (the user's custom path); (b) if `favicon` is falsy/empty, return an inline SVG data URI for a simple filled circle using the primary colour. The SVG should be: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${encodeURIComponent(primaryColour)}"/></svg>`. Also add an exported function `resolveAppleTouchIconTag(favicon)` that returns: (a) if `favicon` is a non-empty string, return `<link rel="apple-touch-icon" href="${favicon}" />`; (b) if falsy/empty, return `''` (empty string, since iOS doesn't support SVG touch icons).

- [x] **Add `favicon` and `appleTouchIcon` to `generateIndex()` interpolation** — In `src/lib/generate/index.js`, add two new parameters to the `options` JSDoc: `{string} options.favicon` (resolved favicon href) and `{string} options.appleTouchIcon` (apple touch icon tag HTML or empty string). Add two entries to the `replacements` object: `'${favicon}': options.favicon || 'data:,'` and `'${apple_touch_icon}': options.appleTouchIcon || ''`.

### Build Orchestrator Wiring

- [x] **Pass favicon data to `generateIndex()` in `src/lib/index.js`** — Import `resolveFaviconHref` and `resolveAppleTouchIconTag` from `./generate/index.js`. Before the `generateIndex()` call (around line 247), resolve the values: `const faviconHref = resolveFaviconHref(site.favicon, site.theme?.primary || '#2563eb')` and `const appleTouchIconTag = resolveAppleTouchIconTag(site.favicon)`. Add `favicon: faviconHref` and `appleTouchIcon: appleTouchIconTag` to the `generateIndex()` options object. Also use `faviconHref` and `appleTouchIconTag` when interpolating the 404 template later in the file (Step 11, around line 289).

## Frontend — Nav Bar Logo

- [x] **Add conditional logo image to `template/components/layout/nav-bar.js`** — In the `render()` method, inside the site title `<a>` tag (line 93–98), add a conditional `<img>` element before the `${displayTitle}` text. The image should only render when `this.site?.favicon` is truthy. Implementation: change the `<a>` tag content from `${displayTitle}` to `${this.site?.favicon ? html`<img src="${this.site.favicon}" alt="" class="h-7 w-7 rounded-full object-cover" loading="eager" />` : ''} ${displayTitle}`. Also add `flex items-center gap-2` to the `<a>` tag's class list so the logo and text align horizontally. The `alt=""` is intentional — the image is decorative since the site name text is adjacent.

## Test Fixtures

- [x] **Set favicon in `test/fixtures/full/site.yml`** — Change line 6 from `favicon: ''` to `favicon: 'media/test-image.png'`. The file `test/fixtures/full/media/test-image.png` already exists, so no new fixture files are needed.

- [x] **Set favicon in `demo/site.yml`** — Change line 6 from `favicon: ''` to `favicon: 'media/avatar.jpg'` (or whichever logo/avatar image exists in the demo media directory). If no suitable image exists in `demo/media/`, leave this as an empty string and note it for the user to add their own image later.

## Tests

### Unit Tests

- [x] **Add favicon interpolation tests to `test/unit/generate-index.test.js`** — Add the following test cases to the existing `describe('generateIndex')` block:
  - [x] `it('interpolates custom favicon href')` — Call `generateIndex({ ...baseOptions, favicon: 'media/logo.png', appleTouchIcon: '<link rel="apple-touch-icon" href="media/logo.png" />' })`, assert the output contains `href="media/logo.png"` in a `<link rel="icon"` tag and contains the apple touch icon tag.
  - [x] `it('uses default favicon when not provided')` — Call `generateIndex({ ...baseOptions })` (no favicon option), assert the output contains `href="data:,"` (the fallback default from the replacements map).
  - [x] `it('includes apple-touch-icon when custom favicon set')` — Call with `appleTouchIcon` set to a link tag, assert the output contains `rel="apple-touch-icon"`.
  - [x] `it('omits apple-touch-icon when no custom favicon')` — Call with `appleTouchIcon` set to `''`, assert the output does not contain `apple-touch-icon`.

- [x] **Add unit tests for `resolveFaviconHref()` and `resolveAppleTouchIconTag()`** — In `test/unit/generate-index.test.js`, add a new `describe('resolveFaviconHref')` block with:
  - [x] `it('returns custom path when favicon is set')` — Call `resolveFaviconHref('media/logo.png', '#2563eb')`, assert it returns `'media/logo.png'`.
  - [x] `it('returns SVG data URI when favicon is empty')` — Call `resolveFaviconHref('', '#2563eb')`, assert the result starts with `'data:image/svg+xml,'` and contains `fill=` with the encoded colour.
  - [x] `it('returns SVG data URI when favicon is undefined')` — Call `resolveFaviconHref(undefined, '#ff0000')`, assert it starts with `'data:image/svg+xml,'`.
  - [x] Add a `describe('resolveAppleTouchIconTag')` block with: `it('returns link tag when favicon set')` — assert returns a string containing `rel="apple-touch-icon"`; `it('returns empty string when favicon empty')` — assert returns `''`.

### Integration Tests

- [x] **Add favicon assertions to `test/integration/full-build.test.js`** — Add a new test case `it('index.html contains favicon link tag')` that reads `index.html` from the output directory and asserts it contains `<link rel="icon" href="media/test-image.png"` (matching the `full` fixture's `site.yml` favicon value). Also assert it contains `rel="apple-touch-icon"`. Optionally add `it('404.html contains favicon link tag')` that reads `404.html` and asserts the same favicon href is present.
