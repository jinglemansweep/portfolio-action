import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';

class PageCustom extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    page: { type: Object },
    slug: { type: String },
    site: { type: Object },
    _pageData: { state: true },
    _loading: { state: true },
  };

  constructor() {
    super();
    this.page = null;
    this.slug = '';
    this.site = {};
    this._pageData = null;
    this._loading = false;
  }

  updated(changed) {
    // If page data is passed directly (from manifest), use it
    if (changed.has('page') && this.page?.content_html) {
      this._pageData = this.page;
      this._loading = false;
      return;
    }

    // If only slug is provided, fetch page data
    if (changed.has('slug') && this.slug && !this.page?.content_html) {
      this._loadPage();
    }
  }

  async _loadPage() {
    this._loading = true;
    try {
      const res = await fetch(`data/pages/${this.slug}.json`);
      if (res.ok) {
        this._pageData = await res.json();
      } else {
        this._pageData = null;
      }
    } catch (err) {
      console.error('Failed to load page:', err);
      this._pageData = null;
    }
    this._loading = false;
  }

  render() {
    const data = this._pageData || this.page;

    if (this._loading) {
      return html`
        <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div class="animate-pulse space-y-4">
            <div class="h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      `;
    }

    if (!data) {
      return html`
        <div class="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p class="text-gray-500 dark:text-gray-400">Page not found.</p>
        </div>
      `;
    }

    return html`
      <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        ${data.title
          ? html`
              <h1 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                ${data.title}
              </h1>
            `
          : ''}

        <div
          class="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-lg dark:prose-headings:text-white dark:prose-a:text-blue-400"
          .innerHTML=${data.content_html || ''}
        ></div>
      </div>
    `;
  }
}

customElements.define('page-custom', PageCustom);
