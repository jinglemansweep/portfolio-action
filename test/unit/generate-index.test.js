import { describe, it, expect } from 'vitest';
import { generateIndex } from '../../src/lib/generate/index.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateDir = join(__dirname, '../../template');

const baseOptions = {
  templateDir,
  lang: 'en',
  dir: 'ltr',
  title: 'Test Portfolio',
  description: 'A test description',
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
    expect(html).toContain('<title>Test Portfolio</title>');
    expect(html).toContain('content="A test description"');
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
});
