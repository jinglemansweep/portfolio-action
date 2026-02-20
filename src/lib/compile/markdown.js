import { readdir, readFile } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

/**
 * Compile markdown files from a directory into structured data.
 * @param {string} dir - Directory containing .md files
 * @returns {Array<{slug: string, title: string, description: string, content_html: string, meta: object}>}
 */
export async function compileMarkdown(dir) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }

  const mdFiles = files.filter((f) => extname(f) === '.md').sort();
  const pages = [];

  for (const file of mdFiles) {
    const filePath = join(dir, file);
    const raw = await readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const slug = frontmatter.slug || deriveSlug(file);
    const contentHtml = md.render(content);

    pages.push({
      slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || '',
      content_html: contentHtml,
      meta: {
        nav_order: frontmatter.nav_order ?? 999,
        show_in_nav: frontmatter.show_in_nav !== false,
        ...frontmatter,
      },
    });
  }

  return pages;
}

/**
 * Compile a single markdown string into HTML.
 * @param {string} markdownString
 * @returns {string} HTML string
 */
export function renderMarkdown(markdownString) {
  if (!markdownString) return '';
  return md.render(markdownString);
}

function deriveSlug(filename) {
  return basename(filename, extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
