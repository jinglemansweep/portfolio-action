import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class PageBlogPost extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    slug: { type: String },
    posts: { type: Object },
    site: { type: Object },
    blogRoute: { type: String },
    _post: { state: true },
    _loading: { state: true },
  };

  constructor() {
    super();
    this.slug = '';
    this.posts = null;
    this.site = {};
    this.blogRoute = '/blog';
    this._post = null;
    this._loading = true;
  }

  updated(changed) {
    if (changed.has('slug') && this.slug) {
      this._loadPost();
    }
  }

  async _loadPost() {
    this._loading = true;
    try {
      const res = await fetch(`data/blog/${this.slug}.json`);
      if (res.ok) {
        this._post = await res.json();
      } else {
        this._post = null;
      }
    } catch (err) {
      console.error('Failed to load blog post:', err);
      this._post = null;
    }
    this._loading = false;
  }

  _getAdjacentPosts() {
    const allPosts = this.posts?.posts || this.posts || [];
    if (!Array.isArray(allPosts)) return { prev: null, next: null };

    const index = allPosts.findIndex((p) => p.slug === this.slug);
    if (index === -1) return { prev: null, next: null };

    return {
      prev: index > 0 ? allPosts[index - 1] : null,
      next: index < allPosts.length - 1 ? allPosts[index + 1] : null,
    };
  }

  render() {
    if (this._loading) {
      return html`
        <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div class="animate-pulse space-y-4">
            <div class="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      `;
    }

    if (!this._post) {
      return html`
        <div class="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p class="text-gray-500 dark:text-gray-400">Post not found.</p>
          <a
            href=${this.blogRoute}
            class="mt-4 inline-block text-blue-600 no-underline hover:underline dark:text-blue-400"
          >
            &larr; ${this.t('blog_all_posts')}
          </a>
        </div>
      `;
    }

    const post = this._post;
    const { prev, next } = this._getAdjacentPosts();

    return html`
      <article class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Back to blog -->
        <a
          href=${this.blogRoute}
          class="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 no-underline hover:underline dark:text-blue-400"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          ${this.t('blog_all_posts')}
        </a>

        <!-- Post header -->
        <header class="mb-8">
          <!-- Featured badge -->
          ${post.featured
            ? html`
                <span
                  class="mb-3 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  ${this.t('blog_featured')}
                </span>
              `
            : ''}

          <h1
            class="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white"
          >
            ${post.title}
          </h1>

          <!-- Meta info -->
          <div
            class="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400"
          >
            ${post.author
              ? html`<span class="font-medium">${post.author}</span>`
              : ''}
            ${post.publish_on
              ? html`
                  <span class="flex items-center gap-1">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    ${post.publish_on}
                  </span>
                `
              : ''}
            ${post.updated_on
              ? html`
                  <span class="flex items-center gap-1">
                    (${this.t('blog_updated')}: ${post.updated_on})
                  </span>
                `
              : ''}
            ${post.reading_time
              ? html`
                  <span class="flex items-center gap-1">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ${this.t('blog_reading_time', { n: post.reading_time })}
                  </span>
                `
              : ''}
          </div>

          <!-- Tags -->
          ${post.tags?.length
            ? html`
                <div class="mt-3 flex flex-wrap gap-1.5">
                  ${post.tags.map(
                    (tag) => html`
                      <a
                        href="${this.blogRoute}?tag=${encodeURIComponent(tag)}"
                        class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 no-underline transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        #${tag}
                      </a>
                    `,
                  )}
                </div>
              `
            : ''}
        </header>

        <!-- Post image -->
        ${post.image
          ? html`
              <div class="mb-8 overflow-hidden rounded-xl">
                <img
                  src=${post.image}
                  alt=${post.title}
                  class="w-full object-cover"
                  loading="lazy"
                />
              </div>
            `
          : ''}

        <!-- Post content -->
        <div
          class="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-lg dark:prose-headings:text-white dark:prose-a:text-blue-400"
          .innerHTML=${post.content_html || ''}
        ></div>

        <!-- Previous / Next navigation -->
        <nav
          class="mt-12 flex items-stretch gap-4 border-t border-gray-200 pt-8 dark:border-gray-700"
        >
          ${prev
            ? html`
                <a
                  href="${this.blogRoute}/${prev.slug}"
                  class="flex flex-1 flex-col rounded-lg border border-gray-200 p-4 no-underline transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
                >
                  <span class="mb-1 text-xs text-gray-500 dark:text-gray-400"
                    >&larr; Previous</span
                  >
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                    >${prev.title}</span
                  >
                </a>
              `
            : html`<div class="flex-1"></div>`}
          ${next
            ? html`
                <a
                  href="${this.blogRoute}/${next.slug}"
                  class="flex flex-1 flex-col items-end rounded-lg border border-gray-200 p-4 text-right no-underline transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
                >
                  <span class="mb-1 text-xs text-gray-500 dark:text-gray-400"
                    >Next &rarr;</span
                  >
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                    >${next.title}</span
                  >
                </a>
              `
            : html`<div class="flex-1"></div>`}
        </nav>
      </article>
    `;
  }
}

customElements.define('page-blog-post', PageBlogPost);
