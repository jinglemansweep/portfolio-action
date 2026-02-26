# Issues

> Source: `.plans/20260226/01-favicon-site-logo/prompt.md`

## Open Questions

- [RESOLVED] **Fallback favicon design:** The plan proposes a generic inline SVG (coloured circle using theme primary). Should this be a simple geometric shape, or something more specific like a briefcase/portfolio icon? → **Decision:** Use a simple filled circle in the theme primary colour. Minimal, universal, matches the site's colour scheme.
- [RESOLVED] **Favicon format support:** Should the build validate that the favicon path points to a supported image format (PNG, SVG, ICO)? → **Decision:** No validation. Trust the user's input — browsers handle most formats gracefully and fail silently on bad paths.
- [RESOLVED] **Apple touch icon:** Should `<link rel="apple-touch-icon">` be added alongside the standard favicon? → **Decision:** Include now. Add `<link rel="apple-touch-icon">` pointing to the same image alongside the standard favicon link.

## Potential Blockers

- None identified. All required infrastructure (config field, media copying, template interpolation) already exists.

## Risks

- [RESOLVED] **Image path correctness:** If a user sets `favicon: logo.png` instead of `favicon: media/logo.png`, the path won't resolve. → **Decision:** No build-time validation. Clear example in `demo/site.yml` makes the expected path format obvious. Consistent with the no-validation decision for format support.

## Future Considerations

- **OG image support:** The `og_image` field in `site.yml` is also unused. A follow-up could wire it into Open Graph meta tags in the same way favicon is wired into the link tag.
- **Web app manifest:** A `manifest.json` with icon entries would improve PWA support. This is out of scope but could reuse the same favicon image.
- **Multiple favicon sizes:** Modern best practice includes multiple icon sizes (16×16, 32×32, 180×180 for Apple). This plan uses a single image for simplicity; multi-size support could be added later.
