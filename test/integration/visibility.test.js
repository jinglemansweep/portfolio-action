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
    dataDir: fixturePath('visibility-hidden'),
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

describe('visibility-hidden build', () => {
  it('resume.json has NO email, phone, location, website, links', async () => {
    const resume = await readOutputJson(outputDir, 'data/resume.json');
    expect(resume.contact?.email).toBeUndefined();
    expect(resume.contact?.phone).toBeUndefined();
    expect(resume.contact?.location).toBeUndefined();
    expect(resume.contact?.website).toBeUndefined();
    expect(resume.contact?.links).toBeUndefined();
  });

  it('resume.json has NO education, experience, community, accreditations', async () => {
    const resume = await readOutputJson(outputDir, 'data/resume.json');
    expect(resume.education).toBeUndefined();
    expect(resume.experience).toBeUndefined();
    expect(resume.community).toBeUndefined();
    expect(resume.accreditations).toBeUndefined();
  });

  it('skills.json does NOT exist', async () => {
    expect(await fileExists(join(outputDir, 'data', 'skills.json'))).toBe(
      false,
    );
  });

  it('projects.json does NOT exist', async () => {
    expect(await fileExists(join(outputDir, 'data', 'projects.json'))).toBe(
      false,
    );
  });

  it('sitemap.xml excludes hidden routes', async () => {
    const sitemap = await readOutputFile(outputDir, 'sitemap.xml');
    expect(sitemap).not.toContain('/skills');
    expect(sitemap).not.toContain('/projects');
    expect(sitemap).not.toContain('/blog');
  });

  it('llms.txt excludes hidden sections', async () => {
    const llms = await readOutputFile(outputDir, 'llms.txt');
    expect(llms).not.toContain('## Experience');
    expect(llms).not.toContain('## Education');
    expect(llms).not.toContain('## Skills');
    expect(llms).not.toContain('## Projects');
  });

  it('manifest.json routes exclude hidden pages', async () => {
    const manifest = await readOutputJson(outputDir, 'data/manifest.json');
    expect(manifest.routes).toContain('/');
    expect(manifest.routes).not.toContain('/skills');
    expect(manifest.routes).not.toContain('/projects');
    expect(manifest.routes).not.toContain('/blog');
  });
});
