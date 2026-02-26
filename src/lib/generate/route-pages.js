import { join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

/**
 * Inject a canonical link tag into an HTML string before the closing </head>.
 * Returns the original HTML unchanged if siteUrl is falsy.
 * @param {string} html - The HTML string to modify
 * @param {string} siteUrl - Base site URL (e.g. "https://example.com")
 * @param {string} route - Route path (e.g. "/skills")
 * @returns {string} HTML with canonical link injected
 */
export function injectCanonicalLink(html, siteUrl, route) {
  if (!siteUrl) return html;
  const href = `${siteUrl}${route}`;
  const tag = `<link rel="canonical" href="${href}" />`;
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

/**
 * Generate static HTML pages for each SPA route so that web servers
 * return HTTP 200 instead of 404. Each page is a copy of the main
 * index.html with an injected canonical link tag.
 *
 * This fixes search bot crawling: bots receive 200 + valid HTML
 * instead of 404 from the catch-all 404.html redirect.
 *
 * @param {object} options
 * @param {string[]} options.routes - Manifest routes (e.g. ["/", "/skills", "/blog"])
 * @param {string} options.outputDir - Build output directory
 * @param {string} options.indexHtml - Compiled index.html content
 * @param {string} [options.siteUrl] - Full site URL for canonical links
 * @param {Array<{slug: string}>} [options.blogPosts] - Blog posts for individual post pages
 * @param {string} [options.blogRoute='blog'] - Blog route segment (i18n-aware)
 * @returns {Promise<string[]>} List of generated route paths
 */
export async function generateRoutePages(options) {
  const {
    routes,
    outputDir,
    indexHtml,
    siteUrl = '',
    blogPosts = [],
    blogRoute = 'blog',
  } = options;

  const generated = [];

  // Generate pages for manifest routes (skip root — already has index.html)
  for (const route of routes) {
    if (route === '/') continue;
    const routeDir = join(outputDir, route.slice(1));
    await mkdir(routeDir, { recursive: true });
    const html = injectCanonicalLink(indexHtml, siteUrl, route);
    await writeFile(join(routeDir, 'index.html'), html);
    generated.push(route);
  }

  // Generate pages for individual blog posts
  for (const post of blogPosts) {
    const postRoute = `/${blogRoute}/${post.slug}`;
    const postDir = join(outputDir, blogRoute, post.slug);
    await mkdir(postDir, { recursive: true });
    const html = injectCanonicalLink(indexHtml, siteUrl, postRoute);
    await writeFile(join(postDir, 'index.html'), html);
    generated.push(postRoute);
  }

  return generated;
}
