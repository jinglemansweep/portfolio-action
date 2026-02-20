import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';
import { iconStar, iconExternalLink, iconCode } from './icons.js';

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
                  ${iconStar()} ${this.t('blog_featured')}
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

          <!-- Comment -->
          ${p.comment
            ? html`<p
                class="mb-4 text-sm text-gray-500 italic dark:text-gray-400"
              >
                ${p.comment}
              </p>`
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
                    ${iconExternalLink()} ${this.t('project_visit')}
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
                    ${iconCode()} ${this.t('project_source')}
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
