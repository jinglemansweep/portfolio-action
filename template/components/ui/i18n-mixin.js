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
  };
