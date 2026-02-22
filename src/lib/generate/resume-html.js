import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdown } from '../compile/markdown.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(
  __dirname,
  '..',
  '..',
  '..',
  'template',
  'resume-pdf.html',
);

// Inline SVG icons for contact items (same paths as template/components/ui/icons.js)
const CONTACT_ICONS = {
  email:
    '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
  location:
    '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  website:
    '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  mastodon:
    '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 000-.043v-1.809a.052.052 0 00-.02-.041.053.053 0 00-.046-.01 20.282 20.282 0 01-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 01-.319-1.433.053.053 0 01.066-.054 19.648 19.648 0 004.581.536c.394 0 .787 0 1.183-.016 2.143-.067 4.398-.359 4.66-.366a4.69 4.69 0 003.814-3.51c.37-1.465.56-3.257.56-3.257 0-.022.008-.127 0-.127zm-3.928 6.093h-2.54V6.656c0-1.127-.478-1.7-1.44-1.7-1.06 0-1.593.68-1.593 2.024V9.52h-2.525V6.98c0-1.344-.532-2.024-1.593-2.024-.96 0-1.44.573-1.44 1.7v4.75H5.67V6.404c0-1.127.288-2.024.867-2.69.596-.665 1.378-1.006 2.35-1.006 1.123 0 1.974.43 2.535 1.29l.547.916.546-.916c.561-.86 1.412-1.29 2.535-1.29.972 0 1.754.341 2.35 1.006.579.666.867 1.563.867 2.69v4.902z"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z"/></svg>',
};

/**
 * Generate a standalone HTML string for PDF rendering.
 * @param {object} options
 * @param {object} options.resume - Stripped resume data
 * @param {object|null} options.skills - Stripped skills data
 * @param {object|null} options.projects - Stripped projects data
 * @param {object} options.i18n - Resolved i18n data
 * @param {object} [options.theme] - Theme config
 * @returns {Promise<string>} Complete HTML string
 */
export async function generateResumeHtml({
  resume,
  skills,
  projects,
  i18n,
  theme,
}) {
  const data = structuredClone(resume);
  const skillsData = skills ? structuredClone(skills) : null;
  const projectsData = projects ? structuredClone(projects) : null;
  const labels = i18n?.labels || {};
  const primary = theme?.primary || '#2563eb';
  const lang = i18n?.locale || 'en';
  const dir = i18n?.dir || 'ltr';

  const css = buildCss(primary);
  const content = buildContent(data, skillsData, projectsData, labels);

  let template = await readFile(TEMPLATE_PATH, 'utf-8');
  const replacements = {
    '${lang}': lang,
    '${dir}': dir,
    '${css}': css,
    '${content}': content,
  };
  for (const [placeholder, value] of Object.entries(replacements)) {
    template = template.replaceAll(placeholder, value);
  }

  return template;
}

function buildCss(primary) {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a1a;
      padding: 0;
      margin: 0;
    }
    h1 { font-size: 18pt; font-weight: 700; color: ${primary}; margin-bottom: 2pt; }
    .tagline { font-size: 11pt; color: #555; margin-bottom: 6pt; }
    .contact { font-size: 9pt; color: #444; margin-bottom: 12pt; }
    .contact span::after { content: '  |  '; color: #ccc; }
    .contact span:last-child::after { content: ''; }
    .contact svg { display: inline-block; vertical-align: middle; margin-right: 3pt; margin-top: -1pt; }
    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: ${primary};
      border-bottom: 2px solid ${primary};
      padding-bottom: 3pt;
      margin-top: 14pt;
      margin-bottom: 8pt;
    }
    .entry { page-break-inside: avoid; margin-bottom: 10pt; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-weight: 700; font-size: 10pt; }
    .entry-date { font-size: 9pt; color: #666; white-space: nowrap; }
    .entry-body { margin-top: 2pt; }
    .entry-body p { margin-bottom: 4pt; }
    .entry-skills { font-size: 9pt; color: #666; margin-top: 2pt; }
    .skills-badges { display: flex; flex-wrap: wrap; gap: 4pt; margin-top: 4pt; }
    .skill-badge { display: inline-block; font-size: 8pt; padding: 2pt 6pt; border: 1px solid #ccc; border-radius: 3pt; color: #333; white-space: nowrap; }
    .skill-badge .skill-years { color: #888; margin-left: 3pt; }
    .community-entry { margin-bottom: 8pt; }
    .project-url { font-size: 9pt; color: #666; }
    a { color: ${primary}; text-decoration: none; }
    @media print {
      body { padding: 0; }
      .entry { page-break-inside: avoid; }
    }
  `;
}

function buildContent(data, skillsData, projectsData, labels) {
  const parts = [];

  // Header
  parts.push(buildHeaderHtml(data));

  // Summary
  if (data.summary) {
    parts.push(`<h2>${esc(labels.summary || 'Summary')}</h2>`);
    parts.push(`<div class="entry-body">${renderMarkdown(data.summary)}</div>`);
  }

  // Experience
  if (data.experience?.length > 0) {
    parts.push(`<h2>${esc(labels.experience || 'Experience')}</h2>`);
    for (const exp of data.experience) {
      parts.push(buildExperienceHtml(exp, labels));
    }
  }

  // Education
  if (data.education?.length > 0) {
    parts.push(`<h2>${esc(labels.education || 'Education')}</h2>`);
    for (const edu of data.education) {
      parts.push(buildEducationHtml(edu, labels));
    }
  }

  // Accreditations
  if (data.accreditations?.length > 0) {
    parts.push(`<h2>${esc(labels.accreditations || 'Accreditations')}</h2>`);
    for (const acc of data.accreditations) {
      parts.push(buildAccreditationHtml(acc));
    }
  }

  // Skills (filtered to those referenced in experience/projects, rendered as badges)
  const filteredSkills = filterSkillsForDocument(
    skillsData,
    data,
    projectsData,
  );
  if (filteredSkills?.categories?.length > 0) {
    parts.push(`<h2>${esc(labels.skills || 'Skills')}</h2>`);
    parts.push(buildSkillBadgesHtml(filteredSkills, labels));
  }

  // Community
  if (data.community?.length > 0) {
    parts.push(`<h2>${esc(labels.community || 'Community')}</h2>`);
    for (const item of data.community) {
      parts.push(buildCommunityHtml(item));
    }
  }

  // Projects
  if (projectsData?.projects?.length > 0) {
    parts.push(`<h2>${esc(labels.projects || 'Projects')}</h2>`);
    for (const proj of projectsData.projects) {
      parts.push(buildProjectHtml(proj, labels));
    }
  }

  return parts.join('\n');
}

function buildHeaderHtml(data) {
  const parts = [];
  if (data.name) {
    parts.push(`<h1>${esc(data.name)}</h1>`);
  }
  if (data.tagline) {
    parts.push(`<div class="tagline">${esc(data.tagline)}</div>`);
  }

  const contactHtml = buildContactHtml(data);
  if (contactHtml) {
    parts.push(contactHtml);
  }

  return parts.join('\n');
}

function buildContactHtml(data) {
  const items = [];
  const contact = data.contact || {};

  if (contact.email) {
    items.push(`<span>${CONTACT_ICONS.email}${esc(contact.email)}</span>`);
  }
  if (contact.phone) {
    items.push(`<span>${CONTACT_ICONS.phone}${esc(contact.phone)}</span>`);
  }

  if (contact.location) {
    const loc =
      typeof contact.location === 'string'
        ? contact.location
        : [
            contact.location.city,
            contact.location.region,
            contact.location.country,
          ]
            .filter(Boolean)
            .join(', ');
    if (loc) {
      items.push(`<span>${CONTACT_ICONS.location}${esc(loc)}</span>`);
    }
  }

  if (contact.website) {
    items.push(`<span>${CONTACT_ICONS.website}${esc(contact.website)}</span>`);
  }

  if (contact.socials) {
    for (const s of contact.socials) {
      if (s.username) {
        const icon = CONTACT_ICONS[s.type] || CONTACT_ICONS.link;
        items.push(`<span>${icon}${esc(s.username)}</span>`);
      }
    }
  }

  if (contact.links) {
    for (const l of contact.links) {
      if (l.url) {
        items.push(`<span>${CONTACT_ICONS.link}${esc(l.url)}</span>`);
      }
    }
  }

  return items.length > 0 ? `<div class="contact">${items.join('')}</div>` : '';
}

function buildExperienceHtml(exp, labels) {
  const titleParts = [];
  if (exp.title) titleParts.push(exp.title);
  if (exp.company) titleParts.push(exp.company);
  const dateText = formatDateRange(exp.start, exp.end, labels);

  let html = '<div class="entry">';
  html += '<div class="entry-header">';
  html += `<span class="entry-title">${esc(titleParts.join(' — '))}</span>`;
  if (dateText) html += `<span class="entry-date">${esc(dateText)}</span>`;
  html += '</div>';

  if (exp.description) {
    html += `<div class="entry-body">${renderMarkdown(exp.description)}</div>`;
  }

  if (exp.skills?.length > 0) {
    html += `<div class="entry-skills"><strong>${esc(labels.experience_skills || 'Skills')}:</strong> ${esc(exp.skills.join(', '))}</div>`;
  }

  html += '</div>';
  return html;
}

function buildEducationHtml(edu, labels) {
  const titleParts = [];
  if (edu.institution) titleParts.push(edu.institution);
  if (edu.qualification) titleParts.push(edu.qualification);
  const dateText = formatDateRange(edu.start, edu.end, labels);

  let html = '<div class="entry">';
  html += '<div class="entry-header">';
  html += `<span class="entry-title">${esc(titleParts.join(' — '))}</span>`;
  if (dateText) html += `<span class="entry-date">${esc(dateText)}</span>`;
  html += '</div>';

  if (edu.description) {
    html += `<div class="entry-body"><p>${esc(edu.description)}</p></div>`;
  }

  html += '</div>';
  return html;
}

function buildAccreditationHtml(acc) {
  const titleParts = [];
  if (acc.title) titleParts.push(acc.title);
  if (acc.issuer) titleParts.push(acc.issuer);

  let html = '<div class="entry">';
  html += '<div class="entry-header">';
  html += `<span class="entry-title">${esc(titleParts.join(' — '))}</span>`;
  if (acc.date)
    html += `<span class="entry-date">${esc(String(acc.date))}</span>`;
  html += '</div>';
  html += '</div>';
  return html;
}

function buildSkillBadgesHtml(skillsData, labels) {
  const allSkills = [];
  for (const cat of skillsData.categories) {
    if (cat.skills) {
      for (const skill of cat.skills) {
        allSkills.push(skill);
      }
    }
  }

  allSkills.sort(
    (a, b) =>
      (b.years_active || b.years || 0) - (a.years_active || a.years || 0),
  );

  let html = '<div class="skills-badges">';
  for (const skill of allSkills) {
    const years = skill.years_active || skill.years;
    const yearsHtml = years
      ? `<span class="skill-years">${esc(
          labels.skill_years
            ? labels.skill_years.replace('{n}', years)
            : `${years}y`,
        )}</span>`
      : '';
    html += `<span class="skill-badge">${esc(skill.name || '')}${yearsHtml}</span>`;
  }
  html += '</div>';
  return html;
}

function buildCommunityHtml(item) {
  const titleParts = [];
  if (item.name) titleParts.push(item.name);
  if (item.role) titleParts.push(item.role);

  let html = '<div class="community-entry">';
  html += `<div class="entry-title">${esc(titleParts.join(' — '))}</div>`;
  if (item.description) {
    html += `<p>${esc(item.description)}</p>`;
  }
  html += '</div>';
  return html;
}

function buildProjectHtml(proj, labels) {
  const dateText = formatDateRange(proj.start, proj.end, labels);

  let html = '<div class="entry">';
  html += '<div class="entry-header">';
  html += `<span class="entry-title">${esc(proj.name || '')}</span>`;
  if (dateText) html += `<span class="entry-date">${esc(dateText)}</span>`;
  html += '</div>';

  if (proj.description) {
    html += `<div class="entry-body"><p>${esc(proj.description)}</p></div>`;
  }

  if (proj.url) {
    html += `<div class="project-url">${esc(proj.url)}</div>`;
  }

  if (proj.skills?.length > 0) {
    html += `<div class="entry-skills"><strong>${esc(labels.experience_skills || 'Skills')}:</strong> ${esc(proj.skills.join(', '))}</div>`;
  }

  html += '</div>';
  return html;
}

function formatDateRange(start, end, labels = {}) {
  if (!start && !end) return '';
  const startStr = start ? String(start) : '';
  const endStr = end
    ? end === 'present'
      ? labels.experience_present || 'Present'
      : String(end)
    : '';
  if (startStr && endStr) return `${startStr} – ${endStr}`;
  return startStr || endStr;
}

function filterSkillsForDocument(skillsData, resume, projects) {
  if (!skillsData?.categories) return skillsData;

  const referenced = new Set();
  if (resume?.experience) {
    for (const exp of resume.experience) {
      if (exp.skills) {
        for (const s of exp.skills) referenced.add(s.toLowerCase());
      }
    }
  }
  if (projects?.projects) {
    for (const proj of projects.projects) {
      if (proj.skills) {
        for (const s of proj.skills) referenced.add(s.toLowerCase());
      }
    }
  }

  if (referenced.size === 0) return skillsData;

  return {
    ...skillsData,
    categories: skillsData.categories
      .map((cat) => ({
        ...cat,
        skills: (cat.skills || []).filter((s) =>
          referenced.has((s.name || '').toLowerCase()),
        ),
      }))
      .filter((cat) => cat.skills.length > 0),
  };
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
