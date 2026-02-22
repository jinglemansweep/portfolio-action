import { readFile } from 'node:fs/promises';
import yaml from 'js-yaml';

const VISIBILITY_DEFAULTS = {
  education: 'all',
  experience: 'all',
  experience_company: 'all',
  projects: 'all',
  community: 'all',
  accreditations: 'all',
  skills: 'all',
  blog: 'all',
  contact_email: 'none',
  contact_phone: 'none',
  location: 'all',
  contact_website: 'all',
  socials: 'all',
  links: 'all',
};

const DOCUMENTS_DEFAULTS = {
  pdf: true,
  docx: true,
  page_size: 'A4',
  filename: 'resume',
};

const SEO_DEFAULTS = {
  robots: {
    indexing: true,
    follow_links: true,
  },
  sitemap: true,
  llms_txt: true,
  rss: true,
};

/**
 * Read and parse a YAML file, merging defaults for site config.
 * @param {string} filePath - Absolute path to the YAML file
 * @param {object} [options] - Options
 * @param {boolean} [options.isSiteConfig] - If true, merge visibility and SEO defaults
 * @returns {object} Parsed data object
 */
export async function compileYaml(filePath, options = {}) {
  let content;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Required file "${filePath}" not found`);
    }
    throw err;
  }

  let data;
  try {
    data = yaml.load(content);
  } catch (err) {
    throw new Error(
      `Failed to parse "${filePath}": ${err.message || err.reason || 'unknown error'}`,
    );
  }

  if (data == null || typeof data !== 'object') {
    throw new Error(
      `Failed to parse "${filePath}": file is empty or does not contain a YAML mapping`,
    );
  }

  if (options.isSiteConfig) {
    data.visibility = {
      ...VISIBILITY_DEFAULTS,
      ...(data.visibility || {}),
    };
    for (const [key, val] of Object.entries(data.visibility)) {
      if (val === true) data.visibility[key] = 'all';
      else if (val === false) data.visibility[key] = 'none';
    }
    data.seo = deepMerge(structuredClone(SEO_DEFAULTS), data.seo || {});
    data.documents = { ...DOCUMENTS_DEFAULTS, ...(data.documents || {}) };
  }

  return data;
}

/**
 * Format a structured location object as a display string.
 * @param {object|string} location - { city, region, country } or a string
 * @returns {string} Formatted location string, e.g. "City, Region, Country"
 */
export function formatLocation(location) {
  if (!location) return '';
  if (typeof location === 'string') return location;
  return [location.city, location.region, location.country]
    .filter(Boolean)
    .join(', ');
}

/**
 * Derive site title and description from resume data.
 * Title format: "Name (City, Country) - Tagline" (omitting parts gracefully)
 * Description: resume tagline
 * @param {object} resume - Parsed resume.yml data
 * @returns {{ title: string, description: string }}
 */
export function deriveSiteMeta(resume) {
  const name = resume?.name || '';
  const tagline = resume?.tagline || '';
  const location = formatLocation(resume?.contact?.location);

  let title = name;
  if (location) title += ` (${location})`;
  if (tagline) title += ` - ${tagline}`;

  return { title, description: tagline };
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
