import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Resolve the favicon href value.
 * @param {string} favicon - User-provided favicon path (may be empty/falsy)
 * @param {string} primaryColour - Primary theme colour for fallback SVG
 * @returns {string} Favicon href (custom path or inline SVG data URI)
 */
export function resolveFaviconHref(favicon, primaryColour) {
  if (favicon) return favicon;
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${encodeURIComponent(primaryColour)}"/></svg>`;
}

/**
 * Resolve the apple-touch-icon link tag.
 * @param {string} favicon - User-provided favicon path (may be empty/falsy)
 * @returns {string} Full link tag HTML or empty string
 */
export function resolveAppleTouchIconTag(favicon) {
  if (favicon) return `<link rel="apple-touch-icon" href="${favicon}" />`;
  return '';
}

/**
 * Generate index.html from template with interpolated variables.
 * @param {object} options
 * @param {string} options.templateDir - Path to template directory
 * @param {string} options.lang - Language code
 * @param {string} options.dir - Text direction (ltr/rtl)
 * @param {string} options.title - Site title
 * @param {string} options.description - Site description
 * @param {string} options.basePath - Base path for site
 * @param {string} options.primary - Primary theme colour
 * @param {string} options.accent - Accent theme colour
 * @param {string} options.themeMode - Theme mode (light/dark/system)
 * @param {string} options.robotsMeta - Meta robots content
 * @param {string} options.rssLink - RSS link tag HTML or empty string
 * @param {string} options.canonicalLink - Canonical link tag HTML or empty string
 * @param {string} options.favicon - Resolved favicon href
 * @param {string} options.appleTouchIcon - Apple touch icon tag HTML or empty string
 * @param {string} options.skipToContent - Skip to content label
 * @returns {string} Compiled HTML string
 */
export async function generateIndex(options) {
  const templatePath = join(options.templateDir, 'index.html');
  let html = await readFile(templatePath, 'utf-8');

  const replacements = {
    '${lang}': options.lang || 'en',
    '${dir}': options.dir || 'ltr',
    '${title}': options.title || '',
    '${description}': options.description || '',
    '${base_path}': options.basePath || '/',
    '${primary}': options.primary || '#2563eb',
    '${accent}': options.accent || '#f59e0b',
    '${theme_mode}': options.themeMode || 'system',
    '${robots_meta}': options.robotsMeta || 'index, follow',
    '${canonical_link}': options.canonicalLink || '',
    '${favicon}': options.favicon || 'data:,',
    '${apple_touch_icon}': options.appleTouchIcon || '',
    '${rss_link}': options.rssLink || '',
    '${a11y_skip_to_content}': options.skipToContent || 'Skip to content',
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.replaceAll(placeholder, value);
  }

  return html;
}
