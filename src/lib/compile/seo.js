/**
 * SEO file generators. All accept stripped data only (privacy guaranteed by caller).
 */

/**
 * Resolve site URL from available sources.
 */
export function resolveSiteUrl(siteUrl, env = process.env) {
  if (siteUrl) return siteUrl.replace(/\/$/, '');
  if (env.GITHUB_REPOSITORY) {
    const [owner, repo] = env.GITHUB_REPOSITORY.split('/');
    return `https://${owner}.github.io/${repo}`;
  }
  return '';
}

/**
 * Generate robots.txt content.
 */
export function generateRobotsTxt(seo, siteUrl) {
  const lines = ['User-agent: *'];
  if (seo.robots?.indexing === false) {
    lines.push('Disallow: /');
  } else {
    lines.push('Allow: /');
    if (siteUrl) {
      lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
    }
  }
  return lines.join('\n') + '\n';
}

/**
 * Generate meta robots content string.
 */
export function generateMetaRobots(seo) {
  if (seo.robots?.indexing === false) {
    return 'noindex, nofollow';
  }
  const index = 'index';
  const follow = seo.robots?.follow_links === false ? 'nofollow' : 'follow';
  return `${index}, ${follow}`;
}

/**
 * Generate sitemap.xml content.
 * @param {string[]} routes - Manifest routes
 * @param {string} siteUrl - Full site URL
 * @param {string|Date} buildDate - Build date
 * @param {object} i18n - i18n bundle
 * @param {object} [options] - Additional options
 * @param {Array<{slug: string, publish_on?: string}>} [options.blogPosts] - Blog posts to include
 * @param {string} [options.blogRoute='blog'] - Blog route segment
 */
export function generateSitemapXml(routes, siteUrl, buildDate, i18n, options) {
  if (!siteUrl) return '';

  const date =
    buildDate instanceof Date
      ? buildDate.toISOString().split('T')[0]
      : buildDate || new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const route of routes) {
    const priority =
      route === '/' ? '1.0' : isMainRoute(route, i18n) ? '0.8' : '0.6';
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}${route}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  }

  // Include individual blog post URLs
  const blogPosts = options?.blogPosts || [];
  const blogRoute = options?.blogRoute || 'blog';
  for (const post of blogPosts) {
    const postDate = post.publish_on || date;
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}/${blogRoute}/${post.slug}</loc>\n`;
    xml += `    <lastmod>${postDate}</lastmod>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  return xml;
}

function isMainRoute(route, i18n) {
  if (!i18n?.labels) return false;
  const mainRoutes = [
    `/${i18n.labels.route_skills || 'skills'}`,
    `/${i18n.labels.route_projects || 'projects'}`,
    `/${i18n.labels.route_blog || 'blog'}`,
  ];
  return mainRoutes.includes(route);
}

/**
 * Generate llms.txt content from stripped data.
 */
export function generateLlmsTxt(data) {
  const { resume, skills, projects, blog } = data;
  const lines = [];

  // Header
  if (resume?.name) {
    const header = resume.tagline
      ? `# ${resume.name} — ${resume.tagline}`
      : `# ${resume.name}`;
    lines.push(header);
    lines.push('');
  }

  // Summary
  if (resume?.summary) {
    lines.push(`> ${resume.summary.trim().replace(/\n/g, '\n> ')}`);
    lines.push('');
  }

  // Contact
  if (resume?.contact) {
    const contactFields = [];
    if (resume.contact.location) {
      const loc =
        typeof resume.contact.location === 'object'
          ? [
              resume.contact.location.city,
              resume.contact.location.region,
              resume.contact.location.country,
            ]
              .filter(Boolean)
              .join(', ')
          : resume.contact.location;
      contactFields.push(`- Location: ${loc}`);
    }
    if (resume.contact.website)
      contactFields.push(`- Website: ${resume.contact.website}`);
    if (resume.contact.email)
      contactFields.push(`- Email: ${resume.contact.email}`);
    if (resume.contact.socials) {
      for (const social of resume.contact.socials) {
        contactFields.push(`- ${social.type}: ${social.username}`);
      }
    }
    if (resume.contact.links) {
      for (const link of resume.contact.links) {
        contactFields.push(`- ${link.title}: ${link.url}`);
      }
    }
    if (contactFields.length > 0) {
      lines.push('## Contact');
      lines.push(...contactFields);
      lines.push('');
    }
  }

  // Experience
  if (resume?.experience?.length > 0) {
    lines.push('## Experience');
    for (const exp of resume.experience) {
      const end = exp.end || 'Present';
      lines.push(`### ${exp.title} at ${exp.company} (${exp.start} – ${end})`);
      if (exp.description) lines.push(exp.description.trim());
      if (exp.skills?.length > 0)
        lines.push(`Skills: ${exp.skills.join(', ')}`);
      lines.push('');
    }
  }

  // Projects
  if (projects?.projects?.length > 0) {
    lines.push('## Projects');
    for (const proj of projects.projects) {
      const end = proj.end || 'Ongoing';
      lines.push(`### ${proj.name} — ${proj.start} – ${end}`);
      if (proj.description) lines.push(proj.description.trim());
      if (proj.url) lines.push(`URL: ${proj.url}`);
      if (proj.repo) lines.push(`Repo: ${proj.repo}`);
      if (proj.skills?.length > 0)
        lines.push(`Skills: ${proj.skills.join(', ')}`);
      lines.push('');
    }
  }

  // Education
  if (resume?.education?.length > 0) {
    lines.push('## Education');
    for (const edu of resume.education) {
      const end = edu.end || 'Present';
      lines.push(
        `### ${edu.qualification} — ${edu.institution} (${edu.start} – ${end})`,
      );
      if (edu.description) lines.push(edu.description.trim());
      lines.push('');
    }
  }

  // Skills
  if (skills?.categories?.length > 0) {
    lines.push('## Skills');
    for (const cat of skills.categories) {
      lines.push(`### ${cat.name}`);
      for (const skill of cat.skills || []) {
        const parts = [skill.name];
        if (skill.level) parts.push(`Level: ${skill.level}`);
        if (skill.years_active) {
          parts.push(`${skill.years_active} years`);
        }
        lines.push(`- ${parts.join(', ')}`);
      }
      lines.push('');
    }
  }

  // Community
  if (resume?.community?.length > 0) {
    lines.push('## Community');
    for (const c of resume.community) {
      lines.push(`### ${c.name} — ${c.role}`);
      if (c.description) lines.push(c.description.trim());
      lines.push('');
    }
  }

  // Accreditations
  if (resume?.accreditations?.length > 0) {
    lines.push('## Accreditations');
    for (const a of resume.accreditations) {
      const parts = [a.title, a.issuer];
      if (a.date) parts.push(`(${a.date})`);
      lines.push(`- ${parts.join(' — ')}`);
    }
    lines.push('');
  }

  // Blog
  if (blog?.posts?.length > 0) {
    lines.push('## Blog');
    for (const post of blog.posts) {
      lines.push(`### ${post.title}`);
      if (post.publish_on) lines.push(`Published: ${post.publish_on}`);
      if (post.description) lines.push(post.description);
      if (post.tags?.length > 0) lines.push(`Tags: ${post.tags.join(', ')}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate RSS feed.xml content.
 */
export function generateFeedXml(data) {
  const { site, blog, siteUrl, i18n } = data;
  if (!blog?.posts?.length) return '';
  if (!siteUrl) return '';

  const blogPath = i18n?.labels?.route_blog || 'blog';
  const maxItems = 20;
  const posts = blog.posts.slice(0, maxItems);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
  xml += '  <channel>\n';
  xml += `    <title>${escapeXml(site?.title || '')}</title>\n`;
  xml += `    <link>${siteUrl}/</link>\n`;
  xml += `    <description>${escapeXml(site?.description || '')}</description>\n`;
  xml += `    <language>${site?.lang || 'en'}</language>\n`;
  xml += `    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>\n`;

  for (const post of posts) {
    const postUrl = `${siteUrl}/${blogPath}/${post.slug}`;
    xml += '    <item>\n';
    xml += `      <title>${escapeXml(post.title)}</title>\n`;
    xml += `      <link>${postUrl}</link>\n`;
    xml += `      <description>${escapeXml(post.description || '')}</description>\n`;
    if (post.publish_on) {
      xml += `      <pubDate>${toRfc822(post.publish_on)}</pubDate>\n`;
    }
    xml += `      <guid>${postUrl}</guid>\n`;
    for (const tag of post.tags || []) {
      xml += `      <category>${escapeXml(tag)}</category>\n`;
    }
    xml += '    </item>\n';
  }

  xml += '  </channel>\n';
  xml += '</rss>\n';
  return xml;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr) {
  const d = new Date(dateStr);
  return d.toUTCString();
}
