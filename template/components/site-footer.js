import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class SiteFooter extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    site: { type: Object },
  };

  constructor() {
    super();
    this.site = {};
  }

  render() {
    const year = new Date().getFullYear();

    return html`
      <footer
        class="border-t border-gray-200 bg-gray-50 py-8 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div
            class="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400">
              &copy; ${year}
              ${this.site?.title
                ? html`<span
                    >${this.site.title.split(/\s*[—–|]\s*/)[0].trim()}</span
                  >`
                : ''}
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              ${this.t('footer_built_with')}
              <a
                href="https://github.com/jinglemansweep/portfolio-action"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 no-underline hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                Instant Portfolio
              </a>
            </p>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);
