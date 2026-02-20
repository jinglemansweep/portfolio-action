import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

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
        return html`<svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>`;
      case 'dark':
        return html`<svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>`;
      default:
        return html`<svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>`;
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
