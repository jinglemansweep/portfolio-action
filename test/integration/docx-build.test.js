import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../../src/lib/index.js';
import { createTempDir, fixturePath } from '../helpers/test-utils.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { access, readFile } from 'node:fs/promises';

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

describe('DOCX build integration', () => {
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
      noPdf: true,
    });
  });

  afterAll(async () => {
    if (cleanup) await cleanup();
  });

  it('produces resume.docx in output directory', async () => {
    expect(await fileExists(join(outputDir, 'resume.docx'))).toBe(true);
  });

  it('resume.docx is a valid ZIP file (starts with PK magic bytes)', async () => {
    const buffer = await readFile(join(outputDir, 'resume.docx'));
    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4b); // K
  });

  it('does not produce a PDF file', async () => {
    expect(await fileExists(join(outputDir, 'resume.pdf'))).toBe(false);
  });
});

describe('DOCX build with docx disabled', () => {
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
      noPdf: true,
      noDocx: true,
    });
  });

  afterAll(async () => {
    if (cleanup) await cleanup();
  });

  it('produces no .docx file when disabled', async () => {
    expect(await fileExists(join(outputDir, 'resume.docx'))).toBe(false);
  });
});

describe('DOCX build with custom filename', () => {
  let outputDir, cleanup;

  beforeAll(async () => {
    const tmp = await createTempDir();
    outputDir = tmp.path;
    cleanup = tmp.cleanup;

    // Build with a modified site config that has custom filename
    // We use the minimal fixture and override via a temp site.yml
    const { writeFile: wf, mkdir: mkd } = await import('node:fs/promises');
    const tempDataDir = join(outputDir, '_data');
    await mkd(tempDataDir, { recursive: true });

    // Copy fixture YAML files with custom documents config
    const { readFile: rf } = await import('node:fs/promises');
    const siteYaml = `lang: en\ndocuments:\n  pdf: false\n  docx: true\n  filename: cv\n`;
    await wf(join(tempDataDir, 'site.yml'), siteYaml);

    // Copy other required YAML from minimal fixture
    for (const f of ['resume.yml', 'skills.yml', 'projects.yml']) {
      const content = await rf(join(fixturePath('minimal'), f));
      await wf(join(tempDataDir, f), content);
    }

    const buildOutputDir = join(outputDir, '_site');
    await build({
      dataDir: tempDataDir,
      outputDir: buildOutputDir,
      actionPath,
      basePath: '/',
    });
  });

  afterAll(async () => {
    if (cleanup) await cleanup();
  });

  it('produces cv.docx with custom filename', async () => {
    expect(await fileExists(join(outputDir, '_site', 'cv.docx'))).toBe(true);
  });

  it('does not produce resume.docx', async () => {
    expect(await fileExists(join(outputDir, '_site', 'resume.docx'))).toBe(
      false,
    );
  });
});

describe('DOCX build with visibility-hidden fixture', () => {
  let outputDir, cleanup;

  beforeAll(async () => {
    const tmp = await createTempDir();
    outputDir = tmp.path;
    cleanup = tmp.cleanup;

    await build({
      dataDir: fixturePath('visibility-hidden'),
      outputDir,
      actionPath,
      basePath: '/',
    });
  });

  afterAll(async () => {
    if (cleanup) await cleanup();
  });

  it('does not produce documents when disabled in config', async () => {
    expect(await fileExists(join(outputDir, 'resume.docx'))).toBe(false);
    expect(await fileExists(join(outputDir, 'resume.pdf'))).toBe(false);
  });
});
