import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';
import { iconArrowRight } from '../ui/icons.js';

class ProjectCardCompact extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    project: { type: Object },
  };

  constructor() {
    super();
    this.project = {};
  }

  _slugify(name) {
    return (name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  _getProjectsRoute() {
    const i18n = window.__i18n?.labels || {};
    return '/' + (i18n.route_projects || 'projects');
  }

  render() {
    const p = this.project;
    if (!p?.name) return '';

    const slug = this._slugify(p.name);
    const projectsRoute = this._getProjectsRoute();
    const endLabel = p.end ? p.end : this.t('project_ongoing');

    return html`
      <a
        href="${projectsRoute}#project-${slug}"
        class="group block rounded-lg border border-gray-200 bg-white p-4 no-underline shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h3
              class="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
            >
              ${p.name}
            </h3>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              ${p.start} &mdash; ${endLabel}
            </p>
          </div>

          <!-- Arrow icon -->
          ${iconArrowRight(
            'h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-gray-500',
          )}
        </div>

        ${p.skills?.length
          ? html`
              <div class="mt-2 flex flex-wrap gap-1">
                ${p.skills
                  .slice(0, 5)
                  .map(
                    (skill) => html`
                      <span
                        class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      >
                        ${skill}
                      </span>
                    `,
                  )}
                ${p.skills.length > 5
                  ? html`<span
                      class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      >+${p.skills.length - 5}</span
                    >`
                  : ''}
              </div>
            `
          : ''}
      </a>
    `;
  }
}

customElements.define('project-card-compact', ProjectCardCompact);
