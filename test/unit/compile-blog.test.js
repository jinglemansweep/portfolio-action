import { describe, it, expect } from 'vitest';
import { compileBlog } from '../../src/lib/compile-blog.js';
import { fixturePath } from '../helpers/test-utils.js';
import { join } from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const blogFixture = join(fixturePath('blog'), 'blog');
const BUILD_DATE = '2026-06-15';

describe('compileBlog', () => {
  it('parses blog post frontmatter correctly', async () => {
    const result = await compileBlog(blogFixture, {
      buildDate: BUILD_DATE,
    });
    expect(result).not.toBeNull();
    const published = result.posts.find((p) => p.slug === 'published-post');
    expect(published).toBeDefined();
    expect(published.title).toBe('Published Post');
    expect(published.tags).toContain('published');
  });

  it('excludes draft posts', async () => {
    const result = await compileBlog(blogFixture, {
      buildDate: BUILD_DATE,
    });
    expect(result).not.toBeNull();
    const draft = result.posts.find((p) => p.slug === 'draft-post');
    expect(draft).toBeUndefined();
  });

  it('excludes future-dated posts (publish_on > buildDate)', async () => {
    const result = await compileBlog(blogFixture, {
      buildDate: BUILD_DATE,
    });
    expect(result).not.toBeNull();
    const future = result.posts.find((p) => p.slug === 'future-post');
    expect(future).toBeUndefined();
  });

  it('excludes expired posts (expire_on <= buildDate)', async () => {
    const result = await compileBlog(blogFixture, {
      buildDate: BUILD_DATE,
    });
    expect(result).not.toBeNull();
    const expired = result.posts.find((p) => p.slug === 'expired-post');
    expect(expired).toBeUndefined();
  });

  it('includes post when publish_on <= buildDate and no expiry', async () => {
    const result = await compileBlog(blogFixture, {
      buildDate: BUILD_DATE,
    });
    expect(result).not.toBeNull();
    const published = result.posts.find((p) => p.slug === 'published-post');
    expect(published).toBeDefined();
  });

  it('sorts posts by publish_on descending', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'blog-sort-'));
    await writeFile(
      join(dir, '2026-01-01-older.md'),
      '---\ntitle: Older\npublish_on: 2026-01-01\n---\nOlder post.',
    );
    await writeFile(
      join(dir, '2026-03-01-newer.md'),
      '---\ntitle: Newer\npublish_on: 2026-03-01\n---\nNewer post.',
    );
    const result = await compileBlog(dir, { buildDate: '2026-06-01' });
    expect(result.posts[0].title).toBe('Newer');
    expect(result.posts[1].title).toBe('Older');
  });

  it('calculates reading time (e.g. 400 words → 2 min)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'blog-rt-'));
    const words = new Array(400).fill('word').join(' ');
    await writeFile(
      join(dir, 'long.md'),
      `---\ntitle: Long\npublish_on: 2026-01-01\n---\n${words}`,
    );
    const result = await compileBlog(dir, { buildDate: '2026-06-01' });
    expect(result.posts[0].reading_time).toBe(2);
  });

  it('builds tag index correctly', async () => {
    const result = await compileBlog(blogFixture, {
      buildDate: BUILD_DATE,
    });
    expect(result).not.toBeNull();
    expect(result.tags.published).toContain('published-post');
    expect(result.tags.test).toContain('published-post');
  });

  it('returns null when no publishable posts', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'blog-draft-'));
    await writeFile(
      join(dir, 'draft.md'),
      '---\ntitle: Draft\ndraft: true\npublish_on: 2026-01-01\n---\nDraft only.',
    );
    const result = await compileBlog(dir, { buildDate: '2026-06-01' });
    expect(result).toBeNull();
  });

  it('returns null when blog directory missing/empty', async () => {
    const result = await compileBlog('/nonexistent/path', {
      buildDate: BUILD_DATE,
    });
    expect(result).toBeNull();
  });

  it('derives slug from filename', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'blog-slug-'));
    await writeFile(
      join(dir, '2026-05-01-my-awesome-post.md'),
      '---\ntitle: Awesome\npublish_on: 2026-05-01\n---\nContent.',
    );
    const result = await compileBlog(dir, { buildDate: '2026-06-01' });
    expect(result.posts[0].slug).toBe('my-awesome-post');
  });

  it('defaults author to provided resume name', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'blog-author-'));
    await writeFile(
      join(dir, 'post.md'),
      '---\ntitle: Test\npublish_on: 2026-01-01\n---\nContent.',
    );
    const result = await compileBlog(dir, {
      buildDate: '2026-06-01',
      defaultAuthor: 'John Doe',
    });
    expect(result.posts[0].author).toBe('John Doe');
  });
});
