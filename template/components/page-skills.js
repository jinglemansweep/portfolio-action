import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';
import './skill-explorer.js';

class PageSkills extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    skills: { type: Object },
    crossref: { type: Object },
    site: { type: Object },
  };

  constructor() {
    super();
    this.skills = null;
    this.crossref = {};
    this.site = {};
  }

  render() {
    return html`
      <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          ${this.t('skills')}
        </h1>

        <skill-explorer
          .skills=${this.skills}
          .crossref=${this.crossref}
        ></skill-explorer>
      </div>
    `;
  }
}

customElements.define('page-skills', PageSkills);
