import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class ProjectCard extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    project: { type: Object },
    crossref: { type: Object },
  };

  constructor() {
    super();
    this.project = {};
    this.crossref = {};
  }

  _slugify(name) {
    return (name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  _getSkillsRoute() {
    const i18n = window.__i18n?.labels || {};
    return '/' + (i18n.route_skills || 'skills');
  }

  /**
   * Check if a skill name has a corresponding entry in skills.yml
   * (via the crossref data).
   */
  _isSkillMatched(skillName) {
    const skillToExp = this.crossref?.skillToExperience || {};
    const skillToProj = this.crossref?.skillToProject || {};
    const lower = skillName.toLowerCase();
    return lower in skillToExp || lower in skillToProj;
  }

  render() {
    const p = this.project;
    if (!p?.name) return '';

    const slug = this._slugify(p.name);
    const isOngoing = !p.end;
    const statusLabel = isOngoing
      ? this.t('project_ongoing')
      : this.t('project_completed');
    const statusClass = isOngoing
      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';

    return html`
      <div
        id="project-${slug}"
        class="overflow-hidden rounded-xl border ${p.featured
          ? 'border-blue-300 dark:border-blue-600'
          : 'border-gray-200 dark:border-gray-700'} bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
      >
        <!-- Project image -->
        ${p.image
          ? html`
              <div
                class="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700"
              >
                <img
                  src=${p.image}
                  alt=${p.name}
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            `
          : ''}

        <div class="p-5">
          <!-- Header row: name + status -->
          <div class="mb-2 flex items-start justify-between gap-2">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              ${p.name}
            </h3>
            <span
              class="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}"
            >
              ${statusLabel}
            </span>
          </div>

          <!-- Featured badge -->
          ${p.featured
            ? html`
                <span
                  class="mb-3 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  ${this.t('blog_featured')}
                </span>
              `
            : ''}

          <!-- Date range -->
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            ${p.start} &mdash; ${p.end || this.t('experience_present')}
          </p>

          <!-- Description -->
          ${p.description_html
            ? html`
                <div
                  class="prose prose-sm mb-4 max-w-none text-gray-600 dark:prose-invert dark:text-gray-300"
                  .innerHTML=${p.description_html}
                ></div>
              `
            : ''}

          <!-- Skills pills -->
          ${p.skills?.length
            ? html`
                <div class="mb-4 flex flex-wrap gap-1.5">
                  ${p.skills.map((skill) => {
                    const matched = this._isSkillMatched(skill);
                    if (matched) {
                      return html`
                        <a
                          href="${this._getSkillsRoute()}?highlight=${encodeURIComponent(
                            skill,
                          )}"
                          class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 no-underline transition-colors hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                        >
                          ${skill}
                        </a>
                      `;
                    }
                    return html`
                      <span
                        class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      >
                        ${skill}
                      </span>
                    `;
                  })}
                </div>
              `
            : ''}

          <!-- Tags -->
          ${p.tags?.length
            ? html`
                <div class="mb-4 flex flex-wrap gap-1">
                  ${p.tags.map(
                    (tag) => html`
                      <span
                        class="inline-flex items-center rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700/50 dark:text-gray-400"
                      >
                        #${tag}
                      </span>
                    `,
                  )}
                </div>
              `
            : ''}

          <!-- Action links -->
          <div class="flex flex-wrap gap-3">
            ${p.url
              ? html`
                  <a
                    href=${p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white no-underline transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    ${this.t('project_visit')}
                  </a>
                `
              : ''}
            ${p.repo
              ? html`
                  <a
                    href=${p.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 no-underline transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    ${this.t('project_source')}
                  </a>
                `
              : ''}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('project-card', ProjectCard);
