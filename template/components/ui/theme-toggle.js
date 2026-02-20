import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';
import { iconSun, iconMoon, iconMonitor } from './icons.js';

class ThemeToggle extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    _mode: { state: true },
  };

  constructor() {
    super();
    const stored = localStorage.getItem('theme');
    this._mode = stored ?? 'system';
    this._mediaQuery = matchMedia('(prefers-color-scheme: dark)');
    this._onMediaChange = () => this._apply();
    this._mediaQuery.addEventListener('change', this._onMediaChange);
    this._apply();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._mediaQuery.removeEventListener('change', this._onMediaChange);
  }

  toggle() {
    const next = { light: 'dark', dark: 'system', system: 'light' };
    this._mode = next[this._mode];
    if (this._mode === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', this._mode);
    }
    this._apply();
  }

  _apply() {
    const dark =
      this._mode === 'dark' ||
      (this._mode === 'system' && this._mediaQuery.matches);
    document.documentElement.classList.toggle('dark', dark);
  }

  _getIcon() {
    switch (this._mode) {
      case 'light':
        return iconSun();
      case 'dark':
        return iconMoon();
      default:
        return iconMonitor();
    }
  }

  render() {
    const label = `${this.t('a11y_toggle_theme')} (${this.t('theme_' + this._mode)})`;

    return html`
      <button
        @click=${this.toggle}
        class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label=${label}
        title=${label}
      >
        ${this._getIcon()}
      </button>
    `;
  }
}

customElements.define('theme-toggle', ThemeToggle);
