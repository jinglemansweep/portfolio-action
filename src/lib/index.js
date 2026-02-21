import { join } from 'node:path';
import {
  mkdir,
  readFile,
  writeFile,
  cp,
  readdir,
  stat,
} from 'node:fs/promises';
import { compileYaml } from './compile/yaml.js';
import { validate } from './utils/validate.js';
import { stripVisibility } from './utils/strip-visibility.js';
import { compileMarkdown, renderMarkdown } from './compile/markdown.js';
import { compileBlog } from './compile/blog.js';
import { compileCrossref } from './compile/crossref.js';
import { compileI18n } from './compile/i18n.js';
import {
  generateRobotsTxt,
  generateMetaRobots,
  generateSitemapXml,
  generateLlmsTxt,
  generateFeedXml,
  resolveSiteUrl,
} from './compile/seo.js';
import { generateManifest } from './generate/manifest.js';
import { generateIndex } from './generate/index.js';

const isActions = !!process.env.GITHUB_ACTIONS;

function warn(msg) {
  if (isActions) {
    process.stderr.write(`::warning::${msg}\n`);
  } else {
    process.stderr.write(`Warning: ${msg}\n`);
  }
}

function error(msg) {
  if (isActions) {
    process.stderr.write(`::error::${msg}\n`);
  } else {
    process.stderr.write(`Error: ${msg}\n`);
  }
}

/**
 * Main build function.
 * @param {object} options
 * @param {string} options.dataDir - Directory containing YAML data files
 * @param {string} [options.pagesDir] - Directory containing markdown pages
 * @param {string} [options.blogDir] - Directory containing blog posts
 * @param {string} [options.mediaDir] - Directory containing media files
 * @param {string} options.outputDir - Output directory
 * @param {string} options.actionPath - Path to action root (for template/i18n dirs)
 * @param {string} [options.basePath='/'] - Base path for the site
 * @param {string} [options.siteUrl=''] - Full site URL for SEO
 * @param {string} [options.buildDate] - Build date override (YYYY-MM-DD)
 */
export async function build(options) {
  const {
    dataDir,
    pagesDir,
    blogDir,
    mediaDir,
    outputDir,
    actionPath,
    basePath = '/',
    siteUrl = '',
    buildDate,
  } = options;

  const templateDir = join(actionPath, 'template');
  const i18nDir = join(actionPath, 'i18n');
  const allWarnings = [];

  // Step 1: Read & validate YAML
  const site = await compileYaml(join(dataDir, 'site.yml'), {
    isSiteConfig: true,
  });
  const resume = await compileYaml(join(dataDir, 'resume.yml'));
  const skills = await compileYaml(join(dataDir, 'skills.yml'));
  const projects = await compileYaml(join(dataDir, 'projects.yml'));

  const errors = validate(site, resume, skills, projects);
  if (errors.length > 0) {
    for (const e of errors) {
      error(`"${e.file}" validation failed: ${e.field} ${e.reason}`);
    }
    throw new Error('Validation failed');
  }

  // Step 2: Read & parse pages
  const pages = pagesDir ? await compileMarkdown(pagesDir) : [];

  // Step 3: Read & parse blog posts
  const rawBlog = blogDir
    ? await compileBlog(blogDir, {
        buildDate: buildDate || new Date().toISOString().split('T')[0],
        defaultAuthor: resume.name,
      })
    : null;

  if (blogDir && !rawBlog) {
    warn('No publishable blog posts found — blog will be disabled');
  }

  // Step 4: Resolve i18n
  const { i18n, warnings: i18nWarnings } = await compileI18n({
    lang: site.lang,
    i18nDir,
    overrides: site.i18n_overrides,
    i18nFile: site.i18n_file,
  });
  allWarnings.push(...i18nWarnings);

  // Step 5: Apply visibility stripping
  const stripped = stripVisibility(
    site.visibility,
    resume,
    skills,
    projects,
    rawBlog,
  );

  // Step 6: Cross-reference index
  const { crossref, warnings: crossrefWarnings } = compileCrossref(
    stripped.skills,
    stripped.resume,
    stripped.projects,
  );
  allWarnings.push(...crossrefWarnings);

  // Step 7: Generate manifest
  const manifest = generateManifest({
    visibility: site.visibility,
    skills: stripped.skills,
    projects: stripped.projects,
    blog: stripped.blog,
    pages,
    i18n,
  });

  // Step 8: Write JSON data files
  const dataOutputDir = join(outputDir, 'data');
  await mkdir(dataOutputDir, { recursive: true });

  // Render summary markdown
  if (stripped.resume.summary) {
    stripped.resume.summary_html = renderMarkdown(stripped.resume.summary);
  }

  await writeJson(join(dataOutputDir, 'site.json'), {
    ...site,
    visibility: site.visibility,
  });
  await writeJson(join(dataOutputDir, 'resume.json'), stripped.resume);

  if (stripped.skills) {
    await writeJson(join(dataOutputDir, 'skills.json'), stripped.skills);
  }
  if (stripped.projects) {
    await writeJson(join(dataOutputDir, 'projects.json'), stripped.projects);
  }

  await writeJson(join(dataOutputDir, 'crossref.json'), crossref);
  await writeJson(join(dataOutputDir, 'i18n.json'), i18n);
  await writeJson(join(dataOutputDir, 'manifest.json'), manifest);

  // Blog data files
  if (stripped.blog) {
    const blogDataDir = join(dataOutputDir, 'blog');
    await mkdir(blogDataDir, { recursive: true });

    const blogIndex = stripped.blog.posts.map(
      ({ content_html: _html, ...rest }) => rest,
    );
    await writeJson(join(blogDataDir, 'index.json'), blogIndex);
    await writeJson(join(blogDataDir, 'tags.json'), stripped.blog.tags);

    for (const post of stripped.blog.posts) {
      await writeJson(join(blogDataDir, `${post.slug}.json`), post);
    }
  }

  // Page data files
  if (pages.length > 0) {
    const pagesDataDir = join(dataOutputDir, 'pages');
    await mkdir(pagesDataDir, { recursive: true });
    for (const page of pages) {
      await writeJson(join(pagesDataDir, `${page.slug}.json`), page);
    }
  }

  // Step 9: Generate index.html
  const resolvedSiteUrl = resolveSiteUrl(siteUrl);
  const rssLink =
    stripped.blog && site.seo?.rss !== false
      ? '<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="feed.xml" />'
      : '';

  const indexHtml = await generateIndex({
    templateDir,
    lang: i18n.locale || site.lang,
    dir: i18n.dir || 'ltr',
    title: site.title,
    description: site.description,
    basePath,
    primary: site.theme?.primary || '#2563eb',
    accent: site.theme?.accent || '#f59e0b',
    themeMode: site.theme?.mode || 'system',
    robotsMeta: generateMetaRobots(site.seo),
    rssLink,
    skipToContent: i18n.labels?.a11y_skip_to_content || 'Skip to content',
  });
  await writeFile(join(outputDir, 'index.html'), indexHtml);

  // Step 10: Copy template components
  const componentsDir = join(templateDir, 'components');
  const outputComponentsDir = join(outputDir, 'components');
  try {
    await cp(componentsDir, outputComponentsDir, { recursive: true });
  } catch {
    // Components directory may not exist yet during early development
  }

  // Step 11: Generate 404.html (with base path) and copy prose.css
  const notFoundTemplate = await readFile(
    join(templateDir, '404.html'),
    'utf8',
  );
  const notFoundHtml = notFoundTemplate.replace('__BASE_PATH__', basePath);
  await writeFile(join(outputDir, '404.html'), notFoundHtml);
  await cp(join(templateDir, 'prose.css'), join(outputDir, 'prose.css'));

  // Step 12: Copy media
  if (mediaDir) {
    try {
      const mediaFiles = await readdir(mediaDir);
      if (mediaFiles.length > 0) {
        const outputMediaDir = join(outputDir, 'media');
        await cp(mediaDir, outputMediaDir, { recursive: true });

        // Warn on large files
        for (const file of mediaFiles) {
          try {
            const stats = await stat(join(mediaDir, file));
            if (stats.size > 1024 * 1024) {
              const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
              warn(
                `"${file}" is ${sizeMb}MB — consider using a CDN for large assets`,
              );
            }
          } catch {
            // Skip stat errors
          }
        }
      }
    } catch {
      // Media directory doesn't exist, that's fine
    }
  }

  // Step 13: CNAME
  if (site.custom_domain) {
    await writeFile(join(outputDir, 'CNAME'), site.custom_domain);
  }

  // Step 14: .nojekyll
  await writeFile(join(outputDir, '.nojekyll'), '');

  // Step 15: SEO files
  const robotsTxt = generateRobotsTxt(site.seo, resolvedSiteUrl);
  await writeFile(join(outputDir, 'robots.txt'), robotsTxt);

  if (site.seo.sitemap) {
    const sitemapXml = generateSitemapXml(
      manifest.routes,
      resolvedSiteUrl,
      buildDate || new Date().toISOString().split('T')[0],
      i18n,
    );
    if (sitemapXml) {
      await writeFile(join(outputDir, 'sitemap.xml'), sitemapXml);
    }
  }

  if (site.seo.llms_txt) {
    const llmsTxt = generateLlmsTxt({
      resume: stripped.resume,
      skills: stripped.skills,
      projects: stripped.projects,
      blog: stripped.blog,
      i18n,
    });
    await writeFile(join(outputDir, 'llms.txt'), llmsTxt);
  }

  if (site.seo.rss && stripped.blog) {
    const feedXml = generateFeedXml({
      site,
      blog: stripped.blog,
      siteUrl: resolvedSiteUrl,
      i18n,
    });
    if (feedXml) {
      await writeFile(join(outputDir, 'feed.xml'), feedXml);
    }
  }

  // Emit warnings
  for (const w of allWarnings) {
    warn(w);
  }
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2));
}
