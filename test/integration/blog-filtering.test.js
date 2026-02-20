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

const __dirname = dirname(fileURLToPath(import.meta.url));
const actionPath = join(__dirname, '../..');

let outputDir;
let cleanup;

beforeAll(async () => {
  const tmp = await createTempDir();
  outputDir = tmp.path;
  cleanup = tmp.cleanup;

  await build({
    dataDir: fixturePath('blog'),
    blogDir: join(fixturePath('blog'), 'blog'),
    outputDir,
    actionPath,
    basePath: '/',
    siteUrl: 'https://example.com',
    buildDate: '2026-06-15',
  });
});

afterAll(async () => {
  if (cleanup) await cleanup();
});

describe('blog filtering integration', () => {
  it('published post IS in blog/index.json', async () => {
    const posts = await readOutputJson(outputDir, 'data/blog/index.json');
    expect(posts.some((p) => p.slug === 'published-post')).toBe(true);
  });

  it('draft post is NOT in blog/index.json', async () => {
    const posts = await readOutputJson(outputDir, 'data/blog/index.json');
    expect(posts.some((p) => p.slug === 'draft-post')).toBe(false);
  });

  it('future post is NOT in blog/index.json', async () => {
    const posts = await readOutputJson(outputDir, 'data/blog/index.json');
    expect(posts.some((p) => p.slug === 'future-post')).toBe(false);
  });

  it('expired post is NOT in blog/index.json', async () => {
    const posts = await readOutputJson(outputDir, 'data/blog/index.json');
    expect(posts.some((p) => p.slug === 'expired-post')).toBe(false);
  });

  it('feed.xml contains only published post', async () => {
    const feed = await readOutputFile(outputDir, 'feed.xml');
    expect(feed).toContain('Published Post');
    expect(feed).not.toContain('Draft Post');
    expect(feed).not.toContain('Future Post');
    expect(feed).not.toContain('Expired Post');
  });
});
