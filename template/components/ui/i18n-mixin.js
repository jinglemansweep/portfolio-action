/**
 * I18nMixin — shared internationalisation mixin for all Lit components.
 * Provides a `t(key, params?)` method that reads from the global i18n bundle.
 *
 * Usage:
 *   class MyComponent extends I18nMixin(LitElement) { ... }
 *   this.t('skill_years', { n: 5 }) → "5 years"
 */
export const I18nMixin = (superClass) =>
  class extends superClass {
    /**
     * Translate a key with optional parameter interpolation.
     * Reads from window.__i18n.labels[key], falls back to the key itself.
     * Interpolates {name} style placeholders from the params object.
     *
     * @param {string} key - The i18n label key
     * @param {Record<string, string|number>} [params={}] - Interpolation params
     * @returns {string} The translated string
     */
    t(key, params = {}) {
      let str = window.__i18n?.labels?.[key] ?? key;
      for (const [k, v] of Object.entries(params)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
      return str;
    }

    /**
     * Format a date string using locale-aware Intl.DateTimeFormat.
     * Handles: "YYYY-MM" → "Jan 2022", "YYYY-MM-DD" → "Jan 10, 2025",
     * "YYYY" → as-is, "present" → translated via i18n key.
     *
     * @param {string} dateStr - The date string to format
     * @returns {string} The formatted date
     */
    formatDate(dateStr) {
      if (!dateStr) return '';
      const lower = dateStr.toLowerCase();
      if (lower === 'present') return this.t('experience_present');

      const locale = window.__i18n?.locale || 'en';

      // YYYY only — return as-is
      if (/^\d{4}$/.test(dateStr)) return dateStr;

      // YYYY-MM — month and year
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        const [year, month] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1);
        return new Intl.DateTimeFormat(locale, {
          month: 'short',
          year: 'numeric',
        }).format(d);
      }

      // YYYY-MM-DD — full date
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(d);
      }

      return dateStr;
    }
  };
