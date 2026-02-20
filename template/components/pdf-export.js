import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';
import { iconPrinter } from './icons.js';

class PdfExport extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  exportPdf() {
    window.print();
  }

  render() {
    return html`
      <button
        @click=${this.exportPdf}
        class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white print:hidden"
        aria-label=${this.t('pdf_export')}
        title=${this.t('pdf_export')}
      >
        ${iconPrinter()}
      </button>
    `;
  }
}

customElements.define('pdf-export', PdfExport);
