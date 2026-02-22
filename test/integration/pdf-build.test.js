import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../../src/lib/index.js';
import { createTempDir, fixturePath } from '../helpers/test-utils.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const actionPath = join(__dirname, '../..');

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// Check if Puppeteer can actually launch a browser
let chromeAvailable = false;
try {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  await browser.close();
  chromeAvailable = true;
} catch {
  // Puppeteer not installed or Chrome not available
}

describe.skipIf(!chromeAvailable)('PDF build integration', () => {
  let outputDir, cleanup;

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

  it('produces resume.pdf in output directory', async () => {
    expect(await fileExists(join(outputDir, 'resume.pdf'))).toBe(true);
  });

  it('produces resume.docx alongside PDF', async () => {
    expect(await fileExists(join(outputDir, 'resume.docx'))).toBe(true);
  });

  it('does not produce PDF when disabled', async () => {
    const tmp = await createTempDir();
    await build({
      dataDir: fixturePath('full'),
      pagesDir: join(fixturePath('full'), 'pages'),
      blogDir: join(fixturePath('full'), 'blog'),
      mediaDir: join(fixturePath('full'), 'media'),
      outputDir: tmp.path,
      actionPath,
      basePath: '/',
      noPdf: true,
      noDocx: true,
    });
    expect(await fileExists(join(tmp.path, 'resume.pdf'))).toBe(false);
    await tmp.cleanup();
  });
});
