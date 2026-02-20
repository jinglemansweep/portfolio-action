import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class PdfExport extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    _generating: { state: true },
  };

  constructor() {
    super();
    this._generating = false;
  }

  async exportPdf() {
    if (this._generating) return;
    this._generating = true;

    try {
      // Lazy-load html2pdf.js from CDN on first use
      if (!window.html2pdf) {
        const mod =
          await import('https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.2/+esm');
        if (!window.html2pdf && mod.default) {
          window.html2pdf = mod.default;
        }
      }

      const element = document.querySelector('#printable-content');
      if (!element) {
        console.warn('No #printable-content element found for PDF export.');
        this._generating = false;
        return;
      }

      const siteName =
        window.__site?.title?.split(/\s*[—–|]\s*/)[0]?.trim() || 'portfolio';

      await window
        .html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${siteName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      this._generating = false;
    }
  }

  render() {
    return html`
      <button
        @click=${this.exportPdf}
        ?disabled=${this._generating}
        class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-wait disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label=${this.t('pdf_export')}
        title=${this._generating
          ? this.t('pdf_generating')
          : this.t('pdf_export')}
      >
        ${this._generating
          ? html`<svg
              class="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>`
          : html`<svg
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>`}
      </button>
    `;
  }
}

customElements.define('pdf-export', PdfExport);
