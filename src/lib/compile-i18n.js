import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';

/**
 * Resolve the i18n bundle for the site.
 * @param {object} options
 * @param {string} options.lang - Language code from site.yml
 * @param {string} options.i18nDir - Path to built-in i18n directory
 * @param {object} [options.overrides] - i18n_overrides from site.yml
 * @param {string} [options.i18nFile] - Path to custom locale file
 * @returns {{ i18n: object, warnings: string[] }}
 */
export async function compileI18n(options) {
  const { lang, i18nDir, overrides, i18nFile } = options;
  const warnings = [];

  // Load base language pack
  let basePack;

  if (lang === 'custom' && i18nFile) {
    try {
      const content = await readFile(i18nFile, 'utf-8');
      basePack = yaml.load(content);
    } catch {
      warnings.push(`Custom locale file "${i18nFile}" not found, falling back to English`);
      basePack = await loadBuiltinPack(i18nDir, 'en');
    }
  } else {
    basePack = await loadBuiltinPack(i18nDir, lang);
    if (!basePack) {
      warnings.push(`Language pack for "${lang}" not found, falling back to English`);
      basePack = await loadBuiltinPack(i18nDir, 'en');
    }
  }

  // Load English as reference for key validation
  const enPack = lang === 'en' ? basePack : await loadBuiltinPack(i18nDir, 'en');

  // Deep-merge overrides
  if (overrides?.labels && basePack.labels) {
    basePack.labels = { ...basePack.labels, ...overrides.labels };
  }

  // Validate all required keys present
  if (enPack?.labels && basePack?.labels) {
    for (const key of Object.keys(enPack.labels)) {
      if (!(key in basePack.labels)) {
        warnings.push(`i18n key "${key}" missing from language pack — using key as fallback`);
        basePack.labels[key] = key;
      }
    }
  }

  return { i18n: basePack, warnings };
}

async function loadBuiltinPack(i18nDir, lang) {
  try {
    const filePath = join(i18nDir, `${lang}.yml`);
    const content = await readFile(filePath, 'utf-8');
    return yaml.load(content);
  } catch {
    return null;
  }
}
