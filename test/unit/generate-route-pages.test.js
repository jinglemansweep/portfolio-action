import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  generateRoutePages,
  injectCanonicalLink,
} from '../../src/lib/generate/route-pages.js';
import { createTempDir } from '../helpers/test-utils.js';

describe('injectCanonicalLink', () => {
  const html = '<html><head><title>Test</title></head><body></body></html>';

  it('injects canonical link before closing head tag', () => {
    const result = injectCanonicalLink(html, 'https://example.com', '/skills');
    expect(result).toContain(
      '<link rel="canonical" href="https://example.com/skills" />',
    );
    expect(result).toContain('</head>');
  });

  it('returns html unchanged when siteUrl is empty', () => {
    const result = injectCanonicalLink(html, '', '/skills');
    expect(result).toBe(html);
  });

  it('returns html unchanged when siteUrl is falsy', () => {
    const result = injectCanonicalLink(html, undefined, '/skills');
    expect(result).toBe(html);
  });

  it('handles root route', () => {
    const result = injectCanonicalLink(html, 'https://example.com', '/');
    expect(result).toContain(
      '<link rel="canonical" href="https://example.com/" />',
    );
  });
});

describe('generateRoutePages', () => {
  let outputDir, cleanup;
  const indexHtml =
    '<!doctype html><html><head><title>Test</title></head><body></body></html>';

  beforeAll(async () => {
    const tmp = await createTempDir();
    outputDir = tmp.path;
    cleanup = tmp.cleanup;
  });

  afterAll(async () => {
    if (cleanup) await cleanup();
  });

  it('generates index.html for each non-root route', async () => {
    const routes = ['/', '/skills', '/projects'];
    const generated = await generateRoutePages({
      routes,
      outputDir,
      indexHtml,
      siteUrl: 'https://example.com',
    });

    expect(generated).toContain('/skills');
    expect(generated).toContain('/projects');
    expect(generated).not.toContain('/');

    const skillsHtml = await readFile(
      join(outputDir, 'skills', 'index.html'),
      'utf-8',
    );
    expect(skillsHtml).toContain('canonical');
    expect(skillsHtml).toContain('https://example.com/skills');

    const projectsHtml = await readFile(
      join(outputDir, 'projects', 'index.html'),
      'utf-8',
    );
    expect(projectsHtml).toContain('https://example.com/projects');
  });

  it('generates blog post pages', async () => {
    const generated = await generateRoutePages({
      routes: ['/'],
      outputDir,
      indexHtml,
      siteUrl: 'https://example.com',
      blogPosts: [{ slug: 'hello-world' }, { slug: 'second-post' }],
      blogRoute: 'blog',
    });

    expect(generated).toContain('/blog/hello-world');
    expect(generated).toContain('/blog/second-post');

    const postHtml = await readFile(
      join(outputDir, 'blog', 'hello-world', 'index.html'),
      'utf-8',
    );
    expect(postHtml).toContain('https://example.com/blog/hello-world');
  });

  it('works without siteUrl (no canonical injected)', async () => {
    const tmp = await createTempDir();
    const generated = await generateRoutePages({
      routes: ['/', '/about'],
      outputDir: tmp.path,
      indexHtml,
    });

    expect(generated).toEqual(['/about']);
    const aboutHtml = await readFile(
      join(tmp.path, 'about', 'index.html'),
      'utf-8',
    );
    expect(aboutHtml).not.toContain('canonical');
    expect(aboutHtml).toContain('<title>Test</title>');
    await tmp.cleanup();
  });

  it('uses custom blogRoute for i18n paths', async () => {
    const tmp = await createTempDir();
    await generateRoutePages({
      routes: ['/'],
      outputDir: tmp.path,
      indexHtml,
      siteUrl: 'https://example.com',
      blogPosts: [{ slug: 'mon-article' }],
      blogRoute: 'articles',
    });

    const postHtml = await readFile(
      join(tmp.path, 'articles', 'mon-article', 'index.html'),
      'utf-8',
    );
    expect(postHtml).toContain('https://example.com/articles/mon-article');
    await tmp.cleanup();
  });

  it('returns empty array when only root route exists and no blog', async () => {
    const tmp = await createTempDir();
    const generated = await generateRoutePages({
      routes: ['/'],
      outputDir: tmp.path,
      indexHtml,
    });
    expect(generated).toEqual([]);
    await tmp.cleanup();
  });
});
