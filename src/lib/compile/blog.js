import { readdir, readFile } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

/**
 * Compile blog posts from a directory.
 * @param {string} dir - Directory containing blog .md files
 * @param {object} options
 * @param {Date|string} options.buildDate - Current build date for filtering
 * @param {string} [options.defaultAuthor] - Default author name (from resume.name)
 * @returns {{ posts: Array, tags: object } | null} null if no publishable posts
 */
export async function compileBlog(dir, options = {}) {
  const buildDate = options.buildDate
    ? new Date(options.buildDate)
    : new Date();
  const defaultAuthor = options.defaultAuthor || '';

  let files;
  try {
    files = await readdir(dir);
  } catch {
    return null;
  }

  const mdFiles = files.filter((f) => extname(f) === '.md').sort();
  if (mdFiles.length === 0) return null;

  const posts = [];

  for (const file of mdFiles) {
    const filePath = join(dir, file);
    const raw = await readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    // Skip drafts
    if (frontmatter.draft === true) continue;

    // Skip future posts
    if (frontmatter.publish_on) {
      const publishDate = new Date(frontmatter.publish_on);
      if (publishDate > buildDate) continue;
    }

    // Skip expired posts
    if (frontmatter.expire_on) {
      const expireDate = new Date(frontmatter.expire_on);
      if (expireDate <= buildDate) continue;
    }

    const slug = frontmatter.slug || deriveSlug(file);
    const contentHtml = md.render(content);
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    posts.push({
      slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || '',
      author: frontmatter.author || defaultAuthor,
      publish_on: normalizeDate(frontmatter.publish_on),
      expire_on: normalizeDate(frontmatter.expire_on),
      updated_on: normalizeDate(frontmatter.updated_on),
      draft: false,
      featured: frontmatter.featured || false,
      tags: frontmatter.tags || [],
      image: frontmatter.image || '',
      reading_time: readingTime,
      content_html: contentHtml,
    });
  }

  if (posts.length === 0) return null;

  // Sort by publish_on descending (newest first)
  posts.sort((a, b) => {
    const dateA = a.publish_on ? new Date(a.publish_on) : new Date(0);
    const dateB = b.publish_on ? new Date(b.publish_on) : new Date(0);
    return dateB - dateA;
  });

  // Build tag index
  const tags = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tags[tag]) tags[tag] = [];
      tags[tag].push(post.slug);
    }
  }

  return { posts, tags };
}

/**
 * Normalize a date value to a YYYY-MM-DD string.
 * js-yaml parses bare dates (e.g. 2026-01-01) into Date objects,
 * which serialize to ISO strings. This converts them back to
 * the YYYY-MM-DD format expected by formatDate().
 */
function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

function deriveSlug(filename) {
  // Remove date prefix pattern (YYYY-MM-DD-)
  const name = basename(filename, extname(filename));
  return name
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
