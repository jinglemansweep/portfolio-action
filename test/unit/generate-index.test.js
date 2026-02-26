import { describe, it, expect } from 'vitest';
import {
  generateIndex,
  resolveFaviconHref,
  resolveAppleTouchIconTag,
} from '../../src/lib/generate/index.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateDir = join(__dirname, '../../template');

const baseOptions = {
  templateDir,
  lang: 'en',
  dir: 'ltr',
  title: 'Test User (London, UK) - Software Developer',
  description: 'Software Developer',
  basePath: '/',
  primary: '#2563eb',
  accent: '#f59e0b',
  themeMode: 'system',
  robotsMeta: 'index, follow',
  rssLink: '',
  skipToContent: 'Skip to content',
};

describe('generateIndex', () => {
  it('interpolates lang attribute', async () => {
    const html = await generateIndex({ ...baseOptions, lang: 'fr' });
    expect(html).toContain('lang="fr"');
  });

  it('interpolates dir attribute (ltr/rtl)', async () => {
    const html = await generateIndex({ ...baseOptions, dir: 'rtl' });
    expect(html).toContain('dir="rtl"');
  });

  it('interpolates title and description meta', async () => {
    const html = await generateIndex(baseOptions);
    expect(html).toContain(
      '<title>Test User (London, UK) - Software Developer</title>',
    );
    expect(html).toContain('content="Software Developer"');
  });

  it('interpolates base_path in base href', async () => {
    const html = await generateIndex({
      ...baseOptions,
      basePath: '/my-repo/',
    });
    expect(html).toContain('href="/my-repo/"');
  });

  it('interpolates theme custom properties', async () => {
    const html = await generateIndex(baseOptions);
    expect(html).toContain('--color-primary: #2563eb');
    expect(html).toContain('--color-accent: #f59e0b');
  });

  it('interpolates theme_mode in FOUC-prevention script', async () => {
    const html = await generateIndex({
      ...baseOptions,
      themeMode: 'dark',
    });
    expect(html).toContain("const mode = 'dark'");
  });

  it('interpolates robots meta tag', async () => {
    const html = await generateIndex({
      ...baseOptions,
      robotsMeta: 'noindex, nofollow',
    });
    expect(html).toContain('content="noindex, nofollow"');
  });

  it('includes RSS link when blog enabled', async () => {
    const rssLink =
      '<link rel="alternate" type="application/rss+xml" href="/feed.xml" />';
    const html = await generateIndex({ ...baseOptions, rssLink });
    expect(html).toContain('application/rss+xml');
  });

  it('omits RSS link when blog disabled', async () => {
    const html = await generateIndex({ ...baseOptions, rssLink: '' });
    expect(html).not.toContain('application/rss+xml');
  });

  it('includes canonical link when provided', async () => {
    const canonicalLink =
      '<link rel="canonical" href="https://example.com/" />';
    const html = await generateIndex({ ...baseOptions, canonicalLink });
    expect(html).toContain(
      '<link rel="canonical" href="https://example.com/" />',
    );
  });

  it('omits canonical link when not provided', async () => {
    const html = await generateIndex(baseOptions);
    expect(html).not.toContain('canonical');
  });

  it('uses defaults for missing optional fields', async () => {
    const html = await generateIndex({ templateDir });
    expect(html).toContain('lang="en"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('href="/"');
    expect(html).toContain('--color-primary: #2563eb');
    expect(html).toContain('--color-accent: #f59e0b');
    expect(html).toContain("const mode = 'system'");
    expect(html).toContain('content="index, follow"');
    expect(html).toContain('Skip to content');
  });

  it('interpolates custom favicon href', async () => {
    const html = await generateIndex({
      ...baseOptions,
      favicon: 'media/logo.png',
      appleTouchIcon: '<link rel="apple-touch-icon" href="media/logo.png" />',
    });
    expect(html).toContain('<link rel="icon" href="media/logo.png"');
    expect(html).toContain(
      '<link rel="apple-touch-icon" href="media/logo.png" />',
    );
  });

  it('uses default favicon when not provided', async () => {
    const html = await generateIndex({ ...baseOptions });
    expect(html).toContain('href="data:,"');
  });

  it('includes apple-touch-icon when custom favicon set', async () => {
    const html = await generateIndex({
      ...baseOptions,
      appleTouchIcon: '<link rel="apple-touch-icon" href="media/logo.png" />',
    });
    expect(html).toContain('rel="apple-touch-icon"');
  });

  it('omits apple-touch-icon when no custom favicon', async () => {
    const html = await generateIndex({
      ...baseOptions,
      appleTouchIcon: '',
    });
    expect(html).not.toContain('apple-touch-icon');
  });
});

describe('resolveFaviconHref', () => {
  it('returns custom path when favicon is set', () => {
    expect(resolveFaviconHref('media/logo.png', '#2563eb')).toBe(
      'media/logo.png',
    );
  });

  it('returns SVG data URI when favicon is empty', () => {
    const result = resolveFaviconHref('', '#2563eb');
    expect(result).toMatch(/^data:image\/svg\+xml,/);
    expect(result).toContain(`fill="${encodeURIComponent('#2563eb')}"`);
  });

  it('returns SVG data URI when favicon is undefined', () => {
    const result = resolveFaviconHref(undefined, '#ff0000');
    expect(result).toMatch(/^data:image\/svg\+xml,/);
  });
});

describe('resolveAppleTouchIconTag', () => {
  it('returns link tag when favicon set', () => {
    const result = resolveAppleTouchIconTag('media/logo.png');
    expect(result).toContain('rel="apple-touch-icon"');
  });

  it('returns empty string when favicon empty', () => {
    expect(resolveAppleTouchIconTag('')).toBe('');
  });
});
