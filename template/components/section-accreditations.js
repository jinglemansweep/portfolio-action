import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class SectionAccreditations extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    accreditations: { type: Array },
  };

  constructor() {
    super();
    this.accreditations = [];
  }

  render() {
    if (!this.accreditations?.length) return '';

    return html`
      <section class="py-8">
        <h2
          class="mb-6 text-2xl font-bold text-gray-900 dark:text-white print:text-xl"
        >
          ${this.t('accreditations')}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          ${this.accreditations.map(
            (acc) => html`
              <div
                class="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <!-- Badge icon -->
                <div
                  class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40"
                >
                  <svg
                    class="h-5 w-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>

                <div class="min-w-0 flex-1">
                  <h3
                    class="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    ${acc.url
                      ? html`<a
                          href=${acc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-blue-600 no-underline hover:underline dark:text-blue-400"
                          >${acc.title}</a
                        >`
                      : acc.title}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    ${acc.issuer}
                    ${acc.date
                      ? html`<span class="mx-1">&middot;</span> ${acc.date}`
                      : ''}
                  </p>
                </div>
              </div>
            `,
          )}
        </div>
      </section>
    `;
  }
}

customElements.define('section-accreditations', SectionAccreditations);
