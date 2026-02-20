import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';
import '../project/card-compact.js';

class SectionProjects extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    projects: { type: Array },
  };

  constructor() {
    super();
    this.projects = [];
  }

  render() {
    if (!this.projects?.length) return '';

    return html`
      <section class="py-8">
        <h2
          class="mb-6 text-2xl font-bold text-gray-900 dark:text-white print:text-xl"
        >
          ${this.t('projects')}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          ${this.projects.map(
            (project) => html`
              <project-card-compact .project=${project}></project-card-compact>
            `,
          )}
        </div>
      </section>
    `;
  }
}

customElements.define('section-projects', SectionProjects);
