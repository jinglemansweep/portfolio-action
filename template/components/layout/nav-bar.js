import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';
import { iconMenuOpen, iconMenuClosed } from '../ui/icons.js';
import '../ui/theme-toggle.js';

class NavBar extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    nav: { type: Array },
    site: { type: Object },
    resume: { type: Object },
    currentPath: { type: String, attribute: 'current-path' },
    _menuOpen: { state: true },
  };

  constructor() {
    super();
    this.nav = [];
    this.site = {};
    this.resume = {};
    this.currentPath = '/';
    this._menuOpen = false;
  }

  _toggleMenu() {
    this._menuOpen = !this._menuOpen;
  }

  _closeMenu() {
    this._menuOpen = false;
  }

  _isActive(path) {
    if (path === '/') return this.currentPath === '/';
    return this.currentPath === path || this.currentPath.startsWith(path + '/');
  }

  _renderDownloadLinks() {
    const docs = this.site?.documents;
    if (!docs) return '';

    const filename = docs.filename || 'resume';
    const links = [];

    if (docs.pdf) {
      links.push(html`
        <a
          href="${filename}.pdf"
          download
          class="rounded-lg p-2 text-sm font-medium text-gray-600 no-underline transition-colors hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label=${this.t('doc_download_pdf')}
          title=${this.t('doc_download_pdf')}
        >
          <span class="hidden sm:inline">PDF</span>
          <span class="sm:hidden" aria-hidden="true">PDF</span>
        </a>
      `);
    }

    if (docs.docx) {
      links.push(html`
        <a
          href="${filename}.docx"
          download
          class="rounded-lg p-2 text-sm font-medium text-gray-600 no-underline transition-colors hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label=${this.t('doc_download_docx')}
          title=${this.t('doc_download_docx')}
        >
          <span class="hidden sm:inline">DOCX</span>
          <span class="sm:hidden" aria-hidden="true">DOCX</span>
        </a>
      `);
    }

    return links;
  }

  render() {
    const displayTitle = this.resume?.name || 'Portfolio';

    return html`
      <nav
        aria-label=${this.t('a11y_navigation')}
        class="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm print:hidden dark:border-gray-700 dark:bg-gray-900/95"
      >
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between">
            <!-- Site title / logo -->
            <div class="flex-shrink-0">
              <a
                href="/"
                class="flex items-center gap-2 text-lg font-bold text-gray-900 no-underline hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              >
                ${this.site?.favicon
                  ? html`<img
                      src="${this.site.favicon}"
                      alt=""
                      class="h-7 w-7 rounded-full object-cover"
                      loading="eager"
                    />`
                  : ''}
                ${displayTitle}
              </a>
            </div>

            <!-- Desktop navigation -->
            <div class="hidden items-center gap-1 md:flex">
              ${(this.nav || []).map(
                (item) => html`
                  <a
                    href=${item.path}
                    class="rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${this._isActive(
                      item.path,
                    )
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}"
                  >
                    ${item.label}
                  </a>
                `,
              )}

              <div
                class="ml-2 flex items-center gap-1 border-l border-gray-200 pl-2 dark:border-gray-700"
              >
                ${this._renderDownloadLinks()}
                <theme-toggle></theme-toggle>
              </div>
            </div>

            <!-- Mobile menu button -->
            <div class="flex items-center gap-2 md:hidden">
              ${this._renderDownloadLinks()}
              <theme-toggle></theme-toggle>
              <button
                @click=${this._toggleMenu}
                class="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label=${this._menuOpen
                  ? this.t('a11y_close_menu')
                  : this.t('a11y_open_menu')}
                aria-expanded=${this._menuOpen}
              >
                ${this._menuOpen ? iconMenuOpen() : iconMenuClosed()}
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        ${this._menuOpen
          ? html`
              <div
                class="border-t border-gray-200 md:hidden dark:border-gray-700"
              >
                <div class="space-y-1 px-4 py-3">
                  ${(this.nav || []).map(
                    (item) => html`
                      <a
                        href=${item.path}
                        @click=${this._closeMenu}
                        class="block rounded-lg px-3 py-2 text-base font-medium no-underline ${this._isActive(
                          item.path,
                        )
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}"
                      >
                        ${item.label}
                      </a>
                    `,
                  )}
                </div>
              </div>
            `
          : ''}
      </nav>
    `;
  }
}

customElements.define('nav-bar', NavBar);
