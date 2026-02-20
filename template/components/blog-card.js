import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class BlogCard extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    post: { type: Object },
    blogRoute: { type: String },
  };

  constructor() {
    super();
    this.post = {};
    this.blogRoute = '/blog';
  }

  render() {
    const p = this.post;
    if (!p?.slug) return '';

    const postUrl = `${this.blogRoute}/${p.slug}`;

    return html`
      <a
        href=${postUrl}
        class="group block overflow-hidden rounded-xl border border-gray-200 bg-white no-underline shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
      >
        <!-- Post image -->
        ${p.image
          ? html`
              <div
                class="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700"
              >
                <img
                  src=${p.image}
                  alt=${p.title}
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            `
          : ''}

        <div class="p-5">
          <!-- Featured badge -->
          ${p.featured
            ? html`
                <span
                  class="mb-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  ${this.t('blog_featured')}
                </span>
              `
            : ''}

          <!-- Title -->
          <h3
            class="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
          >
            ${p.title}
          </h3>

          <!-- Date + reading time -->
          <div
            class="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <time>${p.publish_on}</time>
            ${p.reading_time
              ? html`
                  <span>&middot;</span>
                  <span
                    >${this.t('blog_reading_time', { n: p.reading_time })}</span
                  >
                `
              : ''}
          </div>

          <!-- Description -->
          ${p.description
            ? html`<p
                class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300"
              >
                ${p.description}
              </p>`
            : ''}

          <!-- Tags -->
          ${p.tags?.length
            ? html`
                <div class="flex flex-wrap gap-1">
                  ${p.tags.map(
                    (tag) => html`
                      <span
                        class="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      >
                        #${tag}
                      </span>
                    `,
                  )}
                </div>
              `
            : ''}
        </div>
      </a>
    `;
  }
}

customElements.define('blog-card', BlogCard);
