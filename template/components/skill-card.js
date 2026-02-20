import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';
import { iconExternalLink, iconBriefcase, iconFolder } from './icons.js';

class SkillCard extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    skill: { type: Object },
    category: { type: String },
    crossref: { type: Object },
    highlighted: { type: Boolean },
  };

  constructor() {
    super();
    this.skill = {};
    this.category = '';
    this.crossref = {};
    this.highlighted = false;
  }

  _getLevelLabel(level) {
    const key = `skill_level_${level}`;
    return this.t(key);
  }

  _getLevelWidth(level) {
    const widths = {
      beginner: 'w-1/4',
      intermediate: 'w-1/2',
      advanced: 'w-3/4',
      expert: 'w-full',
    };
    return widths[level] || 'w-1/4';
  }

  _getLevelColor(level) {
    const colors = {
      beginner: 'bg-green-400 dark:bg-green-500',
      intermediate: 'bg-blue-400 dark:bg-blue-500',
      advanced: 'bg-purple-500 dark:bg-purple-400',
      expert: 'bg-orange-500 dark:bg-orange-400',
    };
    return colors[level] || 'bg-gray-400';
  }

  _getUsedIn() {
    const name = this.skill?.name?.toLowerCase();
    if (!name) return { experiences: [], projects: [] };

    const experiences = this.crossref?.skillToExperience?.[name] || [];
    const projects = this.crossref?.skillToProject?.[name] || [];

    return { experiences, projects };
  }

  _slugify(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  render() {
    const s = this.skill;
    if (!s?.name) return '';

    const { experiences, projects } = this._getUsedIn();
    const hasUsedIn = experiences.length > 0 || projects.length > 0;
    const i18n = window.__i18n?.labels || {};
    const projectsRoute = '/' + (i18n.route_projects || 'projects');

    return html`
      <div
        id="skill-${this._slugify(s.name)}"
        class="rounded-xl border ${this.highlighted
          ? 'border-blue-400 ring-2 ring-blue-200 dark:border-blue-500 dark:ring-blue-800'
          : 'border-gray-200 dark:border-gray-700'} bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
      >
        <!-- Header: icon + name -->
        <div class="mb-3 flex items-center gap-3">
          ${s.icon
            ? html`
                <img
                  src="https://cdn.simpleicons.org/${s.icon}"
                  alt="${s.name}"
                  class="h-8 w-8 dark:invert"
                  crossorigin="anonymous"
                  loading="lazy"
                />
              `
            : html`
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                >
                  ${s.name.charAt(0).toUpperCase()}
                </div>
              `}
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              ${s.name}
            </h3>
            ${s.start_year
              ? html`<p class="text-xs text-gray-500 dark:text-gray-400">
                  ${this.t('skill_years', {
                    n: new Date().getFullYear() - s.start_year,
                  })}
                </p>`
              : ''}
          </div>
        </div>

        <!-- Level bar -->
        ${s.level
          ? html`
              <div class="mb-3">
                <div
                  class="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
                >
                  <span>${this._getLevelLabel(s.level)}</span>
                </div>
                <div
                  class="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"
                >
                  <div
                    class="${this._getLevelWidth(
                      s.level,
                    )} ${this._getLevelColor(
                      s.level,
                    )} h-full rounded-full transition-all"
                  ></div>
                </div>
              </div>
            `
          : ''}

        <!-- Tags -->
        ${s.tags?.length
          ? html`
              <div class="mb-3 flex flex-wrap gap-1">
                ${s.tags.map(
                  (tag) => html`
                    <span
                      class="inline-flex items-center rounded bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700/50 dark:text-gray-400"
                    >
                      ${tag}
                    </span>
                  `,
                )}
              </div>
            `
          : ''}

        <!-- Links -->
        ${s.links?.length
          ? html`
              <div class="mb-3">
                <p
                  class="mb-1 text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
                >
                  ${this.t('skill_links')}
                </p>
                <div class="flex flex-col gap-0.5">
                  ${s.links.map((link) => {
                    const label = link.label || new URL(link.url).hostname;
                    return html`
                      <a
                        href=${link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1 text-xs text-blue-600 no-underline hover:underline dark:text-blue-400"
                      >
                        ${iconExternalLink('h-3 w-3')} ${label}
                      </a>
                    `;
                  })}
                </div>
              </div>
            `
          : ''}

        <!-- Comment -->
        ${s.comment
          ? html`<p
              class="mb-3 text-sm text-gray-500 italic dark:text-gray-400"
            >
              ${s.comment}
            </p>`
          : ''}

        <!-- Used in (cross-references) -->
        ${hasUsedIn
          ? html`
              <div class="border-t border-gray-100 pt-3 dark:border-gray-700">
                <p
                  class="mb-1.5 text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
                >
                  ${this.t('skill_used_in')}
                </p>
                <div class="flex flex-col gap-1">
                  ${experiences.map((exp) => {
                    const slug = this._slugify(`${exp.title}--${exp.company}`);
                    return html`
                      <a
                        href="/#experience-${slug}"
                        class="inline-flex items-center gap-1.5 text-xs text-gray-600 no-underline hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                      >
                        ${iconBriefcase('h-3.5 w-3.5 flex-shrink-0')}
                        <span class="truncate"
                          >${exp.title} @ ${exp.company}</span
                        >
                      </a>
                    `;
                  })}
                  ${projects.map((proj) => {
                    const slug = this._slugify(proj.name);
                    return html`
                      <a
                        href="${projectsRoute}#project-${slug}"
                        class="inline-flex items-center gap-1.5 text-xs text-gray-600 no-underline hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                      >
                        ${iconFolder('h-3.5 w-3.5 flex-shrink-0')}
                        <span class="truncate">${proj.name}</span>
                      </a>
                    `;
                  })}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

customElements.define('skill-card', SkillCard);
