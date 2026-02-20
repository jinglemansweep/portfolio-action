import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class PageNotFound extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div class="mb-6">
          <span class="text-6xl font-bold text-gray-200 dark:text-gray-700">
            404
          </span>
        </div>
        <h1 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          ${this.t('not_found_title')}
        </h1>
        <p class="mb-8 text-lg text-gray-600 dark:text-gray-400">
          ${this.t('not_found_message')}
        </p>
        <a
          href="/"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white no-underline transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          ${this.t('not_found_home')}
        </a>
      </div>
    `;
  }
}

customElements.define('page-not-found', PageNotFound);
