import { describe, it, expect } from 'vitest';
import { compileMarkdown, renderMarkdown } from '../../src/lib/compile-markdown.js';
import { fixturePath } from '../helpers/test-utils.js';
import { join } from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

describe('compileMarkdown', () => {
  it('parses frontmatter fields', async () => {
    const pages = await compileMarkdown(
      join(fixturePath('full'), 'pages'),
    );
    expect(pages.length).toBeGreaterThanOrEqual(1);
    const about = pages.find((p) => p.slug === 'about');
    expect(about).toBeDefined();
    expect(about.title).toBe('About Me');
    expect(about.meta.nav_order).toBe(1);
    expect(about.meta.show_in_nav).toBe(true);
  });

  it('renders markdown to HTML', async () => {
    const pages = await compileMarkdown(
      join(fixturePath('full'), 'pages'),
    );
    const about = pages.find((p) => p.slug === 'about');
    expect(about.content_html).toContain('<h2>');
    expect(about.content_html).toContain('<strong>');
  });

  it('rewrites media paths (media/image.png stays relative)', async () => {
    const pages = await compileMarkdown(
      join(fixturePath('full'), 'pages'),
    );
    const about = pages.find((p) => p.slug === 'about');
    expect(about.content_html).toContain('media/');
  });

  it('derives slug from filename when frontmatter slug omitted', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'md-test-'));
    await writeFile(
      join(dir, 'my-page.md'),
      '---\ntitle: My Page\n---\nContent',
    );
    const pages = await compileMarkdown(dir);
    expect(pages[0].slug).toBe('my-page');
  });

  it('handles empty pages directory gracefully', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'empty-md-'));
    const pages = await compileMarkdown(dir);
    expect(pages).toEqual([]);
  });

  it('handles file with no frontmatter', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'nofm-'));
    await writeFile(join(dir, 'bare.md'), '# Just Markdown\n\nNo frontmatter here.');
    const pages = await compileMarkdown(dir);
    expect(pages).toHaveLength(1);
    expect(pages[0].slug).toBe('bare');
    expect(pages[0].content_html).toContain('<h1>');
  });

  it('handles nonexistent directory gracefully', async () => {
    const pages = await compileMarkdown('/nonexistent/path');
    expect(pages).toEqual([]);
  });
});

describe('renderMarkdown', () => {
  it('renders basic markdown', () => {
    const html = renderMarkdown('**bold** and *italic*');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('returns empty string for falsy input', () => {
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown(null)).toBe('');
    expect(renderMarkdown(undefined)).toBe('');
  });
});
