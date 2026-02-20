import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';
import { iconExternalLink } from '../ui/icons.js';

class SectionCommunity extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    community: { type: Array },
  };

  constructor() {
    super();
    this.community = [];
  }

  render() {
    if (!this.community?.length) return '';

    return html`
      <section class="py-8">
        <h2
          class="mb-6 text-2xl font-bold text-gray-900 dark:text-white print:text-xl"
        >
          ${this.t('community')}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          ${this.community.map(
            (item) => html`
              <div
                class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div class="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3
                      class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      ${item.url
                        ? html`<a
                            href=${item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-blue-600 no-underline hover:underline dark:text-blue-400"
                            >${item.name}</a
                          >`
                        : item.name}
                    </h3>
                    ${item.role
                      ? html`<p
                          class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          ${item.role}
                        </p>`
                      : ''}
                  </div>
                  ${item.url
                    ? html`
                        <a
                          href=${item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex-shrink-0 text-gray-400 transition-colors hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                          aria-label="Visit ${item.name}"
                        >
                          ${iconExternalLink('h-5 w-5')}
                        </a>
                      `
                    : ''}
                </div>
                ${item.description
                  ? html`<p class="text-sm text-gray-600 dark:text-gray-300">
                      ${item.description}
                    </p>`
                  : ''}
              </div>
            `,
          )}
        </div>
      </section>
    `;
  }
}

customElements.define('section-community', SectionCommunity);
