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
    .skill-category { font-weight: 700; margin-top: 8pt; margin-bottom: 4pt; }
    .skill-list { list-style: disc; padding-left: 18pt; }
    .skill-list li { margin-bottom: 1pt; }
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

  // Skills
  if (skillsData?.categories?.length > 0) {
    parts.push(`<h2>${esc(labels.skills || 'Skills')}</h2>`);
    for (const cat of skillsData.categories) {
      parts.push(buildSkillCategoryHtml(cat, labels));
    }
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

  const contactParts = buildContactPartsHtml(data);
  if (contactParts.length > 0) {
    parts.push(
      `<div class="contact">${contactParts.map((c) => `<span>${esc(c)}</span>`).join('')}</div>`,
    );
  }

  return parts.join('\n');
}

function buildContactPartsHtml(data) {
  const parts = [];
  const contact = data.contact || {};

  if (contact.email) parts.push(contact.email);
  if (contact.phone) parts.push(contact.phone);

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
    if (loc) parts.push(loc);
  }

  if (contact.website) parts.push(contact.website);

  if (contact.socials) {
    for (const s of contact.socials) {
      if (s.username) parts.push(`${s.type || ''}: ${s.username}`.trim());
    }
  }

  if (contact.links) {
    for (const l of contact.links) {
      if (l.url) parts.push(l.url);
    }
  }

  return parts;
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

function buildSkillCategoryHtml(cat, labels) {
  let html = '';
  if (cat.name) {
    html += `<div class="skill-category">${esc(cat.name)}</div>`;
  }
  if (cat.skills?.length > 0) {
    html += '<ul class="skill-list">';
    for (const skill of cat.skills) {
      const parts = [skill.name || ''];
      if (skill.level) parts.push(skill.level);
      if (skill.years) {
        const yearsLabel = labels.skill_years
          ? labels.skill_years.replace('{n}', skill.years)
          : `${skill.years} years`;
        parts.push(yearsLabel);
      }
      html += `<li>${esc(parts.join(' — '))}</li>`;
    }
    html += '</ul>';
  }
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

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
