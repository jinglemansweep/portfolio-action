import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';
import '../ui/timeline-item.js';

class SectionEducation extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    education: { type: Array },
  };

  constructor() {
    super();
    this.education = [];
  }

  render() {
    if (!this.education?.length) return '';

    return html`
      <section class="py-8">
        <h2
          class="mb-6 text-2xl font-bold text-gray-900 dark:text-white print:text-xl"
        >
          ${this.t('education')}
        </h2>
        <div>
          ${this.education.map(
            (edu) => html`
              <timeline-item
                .title=${edu.qualification}
                .subtitle=${edu.institution}
                .start=${edu.start}
                .end=${edu.end}
                .descriptionHtml=${edu.description_html ||
                edu.description ||
                ''}
              ></timeline-item>
            `,
          )}
        </div>
      </section>
    `;
  }
}

customElements.define('section-education', SectionEducation);
