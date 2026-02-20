import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';
import './blog-card.js';

class PageBlog extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    posts: { type: Object },
    tags: { type: Object },
    site: { type: Object },
    _selectedTag: { state: true },
    _currentPage: { state: true },
  };

  constructor() {
    super();
    this.posts = null;
    this.tags = null;
    this.site = {};
    this._selectedTag = '';
    this._currentPage = 1;
    this._postsPerPage = 10;
  }

  connectedCallback() {
    super.connectedCallback();
    // Read ?tag= from URL
    const params = new URLSearchParams(window.location.search);
    const tag = params.get('tag');
    if (tag) {
      this._selectedTag = tag;
    }
  }

  _getBlogRoute() {
    const i18n = window.__i18n?.labels || {};
    return '/' + (i18n.route_blog || 'blog');
  }

  _getAllTags() {
    if (!this.tags) return [];
    return Object.keys(this.tags).sort();
  }

  _getFilteredPosts() {
    const allPosts = this.posts?.posts || this.posts || [];
    if (!Array.isArray(allPosts)) return [];

    if (!this._selectedTag) return allPosts;

    return allPosts.filter((p) => p.tags?.includes(this._selectedTag));
  }

  _getPaginatedPosts() {
    const filtered = this._getFilteredPosts();
    const start = (this._currentPage - 1) * this._postsPerPage;
    return filtered.slice(start, start + this._postsPerPage);
  }

  _getTotalPages() {
    return Math.ceil(this._getFilteredPosts().length / this._postsPerPage);
  }

  _selectTag(tag) {
    this._selectedTag = this._selectedTag === tag ? '' : tag;
    this._currentPage = 1;
    // Update URL without navigation
    const url = new URL(window.location.href);
    if (this._selectedTag) {
      url.searchParams.set('tag', this._selectedTag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.replaceState(null, '', url.toString());
  }

  _goToPage(page) {
    this._currentPage = page;
    window.scrollTo(0, 0);
  }

  render() {
    const allPosts = this.posts?.posts || this.posts || [];
    const featured = Array.isArray(allPosts)
      ? allPosts.filter((p) => p.featured)
      : [];
    const paginatedPosts = this._getPaginatedPosts();
    const totalPages = this._getTotalPages();
    const allTags = this._getAllTags();
    const blogRoute = this._getBlogRoute();

    return html`
      <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          ${this.t('blog_title')}
        </h1>

        <!-- Tag filter -->
        ${allTags.length
          ? html`
              <div class="mb-8 flex flex-wrap gap-2">
                <button
                  @click=${() => this._selectTag('')}
                  class="rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${!this
                    ._selectedTag
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
                >
                  ${this.t('blog_all_posts')}
                </button>
                ${allTags.map(
                  (tag) => html`
                    <button
                      @click=${() => this._selectTag(tag)}
                      class="rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${this
                        ._selectedTag === tag
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
                    >
                      #${tag}
                    </button>
                  `,
                )}
              </div>
            `
          : ''}

        <!-- Featured posts (only show when no tag filter active) -->
        ${!this._selectedTag && featured.length
          ? html`
              <div class="mb-10">
                <h2
                  class="mb-4 text-lg font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400"
                >
                  ${this.t('blog_featured')}
                </h2>
                <div class="grid gap-6 md:grid-cols-2">
                  ${featured.map(
                    (post) => html`
                      <blog-card
                        .post=${post}
                        .blogRoute=${blogRoute}
                      ></blog-card>
                    `,
                  )}
                </div>
              </div>
            `
          : ''}

        <!-- Blog posts grid -->
        ${paginatedPosts.length
          ? html`
              <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                ${paginatedPosts.map(
                  (post) => html`
                    <blog-card
                      .post=${post}
                      .blogRoute=${blogRoute}
                    ></blog-card>
                  `,
                )}
              </div>
            `
          : html`
              <div class="py-16 text-center">
                <svg
                  class="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <p class="text-gray-500 dark:text-gray-400">
                  ${this.t('blog_no_posts')}
                </p>
              </div>
            `}

        <!-- Pagination -->
        ${totalPages > 1
          ? html`
              <div class="mt-10 flex items-center justify-center gap-2">
                ${this._currentPage > 1
                  ? html`
                      <button
                        @click=${() => this._goToPage(this._currentPage - 1)}
                        aria-label="Previous page"
                        class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        &larr;
                      </button>
                    `
                  : ''}
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => html`
                    <button
                      @click=${() => this._goToPage(page)}
                      aria-label="Page ${page}"
                      aria-current=${page === this._currentPage
                        ? 'page'
                        : 'false'}
                      class="rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${page ===
                      this._currentPage
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}"
                    >
                      ${page}
                    </button>
                  `,
                )}
                ${this._currentPage < totalPages
                  ? html`
                      <button
                        @click=${() => this._goToPage(this._currentPage + 1)}
                        aria-label="Next page"
                        class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        &rarr;
                      </button>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }
}

customElements.define('page-blog', PageBlog);
