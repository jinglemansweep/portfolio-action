import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../../src/lib/index.js';
import {
  createTempDir,
  fixturePath,
  readOutputJson,
  readOutputFile,
} from '../helpers/test-utils.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const actionPath = join(__dirname, '../..');

let outputDir;
let cleanup;

beforeAll(async () => {
  const tmp = await createTempDir();
  outputDir = tmp.path;
  cleanup = tmp.cleanup;

  await build({
    dataDir: fixturePath('full'),
    pagesDir: join(fixturePath('full'), 'pages'),
    blogDir: join(fixturePath('full'), 'blog'),
    mediaDir: join(fixturePath('full'), 'media'),
    outputDir,
    actionPath,
    basePath: '/',
    siteUrl: 'https://example.com',
    buildDate: '2026-02-15',
  });
});

afterAll(async () => {
  if (cleanup) await cleanup();
});

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('full build integration', () => {
  it('generates all expected top-level files', async () => {
    expect(await fileExists(join(outputDir, 'index.html'))).toBe(true);
    expect(await fileExists(join(outputDir, '404.html'))).toBe(true);
    expect(await fileExists(join(outputDir, '.nojekyll'))).toBe(true);
    expect(await fileExists(join(outputDir, 'robots.txt'))).toBe(true);
    expect(await fileExists(join(outputDir, 'sitemap.xml'))).toBe(true);
    expect(await fileExists(join(outputDir, 'llms.txt'))).toBe(true);
    expect(await fileExists(join(outputDir, 'feed.xml'))).toBe(true);
  });

  it('generates all JSON data files', async () => {
    expect(await fileExists(join(outputDir, 'data', 'site.json'))).toBe(true);
    expect(await fileExists(join(outputDir, 'data', 'resume.json'))).toBe(true);
    expect(await fileExists(join(outputDir, 'data', 'skills.json'))).toBe(true);
    expect(await fileExists(join(outputDir, 'data', 'projects.json'))).toBe(
      true,
    );
    expect(await fileExists(join(outputDir, 'data', 'crossref.json'))).toBe(
      true,
    );
    expect(await fileExists(join(outputDir, 'data', 'i18n.json'))).toBe(true);
    expect(await fileExists(join(outputDir, 'data', 'manifest.json'))).toBe(
      true,
    );
  });

  it('generates blog data files', async () => {
    expect(
      await fileExists(join(outputDir, 'data', 'blog', 'index.json')),
    ).toBe(true);
    expect(await fileExists(join(outputDir, 'data', 'blog', 'tags.json'))).toBe(
      true,
    );
    // The test post with publish_on 2026-01-15 should exist
    expect(
      await fileExists(
        join(outputDir, 'data', 'blog', 'getting-started-typescript.json'),
      ),
    ).toBe(true);
  });

  it('generates page data files', async () => {
    expect(
      await fileExists(join(outputDir, 'data', 'pages', 'about.json')),
    ).toBe(true);
  });

  it('copies media files', async () => {
    expect(await fileExists(join(outputDir, 'media', 'test-image.png'))).toBe(
      true,
    );
  });

  it('JSON content is valid and contains expected data', async () => {
    const site = await readOutputJson(outputDir, 'data/site.json');
    expect(site.title).toBeTruthy();
    expect(site.visibility).toBeDefined();

    const resume = await readOutputJson(outputDir, 'data/resume.json');
    expect(resume.name).toBeTruthy();

    const manifest = await readOutputJson(outputDir, 'data/manifest.json');
    expect(manifest.routes).toContain('/');
    expect(manifest.nav.length).toBeGreaterThan(0);
  });

  it('index.html contains interpolated values', async () => {
    const html = await readOutputFile(outputDir, 'index.html');
    expect(html).toContain('lang="en"');
    expect(html).toContain('dir="ltr"');
    expect(html).not.toContain('${');
  });
});
