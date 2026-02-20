import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';
import './project-card.js';

class PageProjects extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    projects: { type: Object },
    crossref: { type: Object },
    skills: { type: Object },
    site: { type: Object },
  };

  constructor() {
    super();
    this.projects = null;
    this.crossref = {};
    this.skills = null;
    this.site = {};
  }

  connectedCallback() {
    super.connectedCallback();
    // Scroll to anchor if present (e.g., /projects#project-slug)
    requestAnimationFrame(() => {
      if (window.location.hash) {
        const el = document.querySelector(window.location.hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  render() {
    const allProjects = this.projects?.projects || [];
    const featured = allProjects.filter((p) => p.featured);
    const regular = allProjects.filter((p) => !p.featured);

    return html`
      <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          ${this.t('projects')}
        </h1>

        <!-- Featured projects -->
        ${featured.length
          ? html`
              <div class="mb-10">
                <h2
                  class="mb-4 text-lg font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400"
                >
                  ${this.t('blog_featured')}
                </h2>
                <div class="grid gap-6 md:grid-cols-2">
                  ${featured.map(
                    (project) => html`
                      <project-card
                        .project=${project}
                        .crossref=${this.crossref}
                      ></project-card>
                    `,
                  )}
                </div>
              </div>
            `
          : ''}

        <!-- All projects -->
        ${regular.length
          ? html`
              <div class="grid gap-6 md:grid-cols-2">
                ${regular.map(
                  (project) => html`
                    <project-card
                      .project=${project}
                      .crossref=${this.crossref}
                    ></project-card>
                  `,
                )}
              </div>
            `
          : ''}
        ${!allProjects.length
          ? html`
              <div class="py-12 text-center">
                <p class="text-gray-500 dark:text-gray-400">
                  No projects to display.
                </p>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

customElements.define('page-projects', PageProjects);
