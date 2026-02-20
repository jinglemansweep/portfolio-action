import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';
import './hero-section.js';
import './section-experience.js';
import './section-education.js';
import './section-accreditations.js';
import './section-community.js';
import './section-projects.js';

class PageHome extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    resume: { type: Object },
    site: { type: Object },
    skills: { type: Object },
    projects: { type: Object },
    crossref: { type: Object },
    manifest: { type: Object },
  };

  constructor() {
    super();
    this.resume = {};
    this.site = {};
    this.skills = null;
    this.projects = null;
    this.crossref = {};
    this.manifest = {};
  }

  render() {
    const resume = this.resume || {};
    const projectsList = this.projects?.projects || [];

    return html`
      <div>
        <!-- Hero section — always visible -->
        <hero-section
          .resume=${resume}
          .site=${this.site}
          .manifest=${this.manifest}
        ></hero-section>

        <!-- Printable content region — target for PDF export and @media print -->
        <div
          id="printable-content"
          class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
        >
          <!-- Summary -->
          ${resume.summary_html
            ? html`
                <section class="py-8">
                  <h2
                    class="mb-4 text-2xl font-bold text-gray-900 dark:text-white print:text-xl"
                  >
                    ${this.t('summary')}
                  </h2>
                  <div
                    class="prose max-w-none text-gray-600 dark:prose-invert dark:text-gray-300"
                    .innerHTML=${resume.summary_html}
                  ></div>
                </section>
              `
            : ''}

          <!-- Experience -->
          ${resume.experience?.length
            ? html`
                <section-experience
                  .experience=${resume.experience}
                  .crossref=${this.crossref}
                ></section-experience>
              `
            : ''}

          <!-- Education -->
          ${resume.education?.length
            ? html`
                <section-education
                  .education=${resume.education}
                ></section-education>
              `
            : ''}

          <!-- Accreditations -->
          ${resume.accreditations?.length
            ? html`
                <section-accreditations
                  .accreditations=${resume.accreditations}
                ></section-accreditations>
              `
            : ''}

          <!-- Community -->
          ${resume.community?.length
            ? html`
                <section-community
                  .community=${resume.community}
                ></section-community>
              `
            : ''}

          <!-- Projects (compact) -->
          ${projectsList.length
            ? html`
                <section-projects .projects=${projectsList}></section-projects>
              `
            : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('page-home', PageHome);
