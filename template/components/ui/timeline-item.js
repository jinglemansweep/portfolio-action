import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class TimelineItem extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    title: { type: String },
    subtitle: { type: String },
    start: { type: String },
    end: { type: String },
    comment: { type: String },
    descriptionHtml: { type: String, attribute: 'description-html' },
    skills: { type: Array },
    itemId: { type: String, attribute: 'item-id' },
    matchedSkills: { type: Array, attribute: false },
  };

  constructor() {
    super();
    this.title = '';
    this.subtitle = '';
    this.start = '';
    this.end = '';
    this.comment = '';
    this.descriptionHtml = '';
    this.skills = [];
    this.itemId = '';
    this.matchedSkills = [];
  }

  _formatDate(dateStr) {
    return this.formatDate(dateStr);
  }

  _isSkillMatched(skillName) {
    if (!this.matchedSkills?.length) return false;
    return this.matchedSkills.some(
      (s) => s.toLowerCase() === skillName.toLowerCase(),
    );
  }

  _getSkillsRoute() {
    const i18n = window.__i18n?.labels || {};
    return '/' + (i18n.route_skills || 'skills');
  }

  render() {
    const endDisplay = this.end
      ? this._formatDate(this.end)
      : this.t('experience_present');

    return html`
      <div
        id=${this.itemId || ''}
        class="relative border-l-2 border-blue-200 py-4 pl-6 dark:border-blue-800"
      >
        <!-- Timeline dot -->
        <div
          class="absolute -left-[9px] top-6 h-4 w-4 rounded-full border-2 border-blue-500 bg-white dark:border-blue-400 dark:bg-gray-900"
        ></div>

        <!-- Date range -->
        <div class="mb-1 text-sm text-gray-500 dark:text-gray-400">
          ${this._formatDate(this.start)} &mdash; ${endDisplay}
        </div>

        <!-- Title -->
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          ${this.title}
        </h3>

        <!-- Subtitle (company / institution) -->
        ${this.subtitle
          ? html`<p class="text-base text-gray-600 dark:text-gray-300">
              ${this.subtitle}
            </p>`
          : ''}

        <!-- Comment -->
        ${this.comment
          ? html`<p
              class="mt-1 text-sm italic text-gray-500 dark:text-gray-400"
            >
              ${this.comment}
            </p>`
          : ''}

        <!-- Description -->
        ${this.descriptionHtml
          ? html`<div
              class="prose prose-sm mt-2 max-w-none text-gray-600 dark:prose-invert dark:text-gray-300"
              .innerHTML=${this.descriptionHtml}
            ></div>`
          : ''}

        <!-- Skills pills -->
        ${this.skills?.length
          ? html`
              <div class="mt-3 flex flex-wrap gap-1.5">
                ${this.skills.map((skill) => {
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
      </div>
    `;
  }
}

customElements.define('timeline-item', TimelineItem);
