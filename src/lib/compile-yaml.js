import { readFile } from 'node:fs/promises';
import yaml from 'js-yaml';

const VISIBILITY_DEFAULTS = {
  education: true,
  experience: true,
  projects: true,
  community: true,
  accreditations: true,
  skills: true,
  blog: true,
  email: false,
  phone: false,
  location: true,
  website: true,
  links: true,
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
    data.seo = deepMerge(structuredClone(SEO_DEFAULTS), data.seo || {});
  }

  return data;
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
