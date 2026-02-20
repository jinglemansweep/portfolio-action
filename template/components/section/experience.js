import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';
import '../ui/timeline-item.js';

class SectionExperience extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    experience: { type: Array },
    crossref: { type: Object },
  };

  constructor() {
    super();
    this.experience = [];
    this.crossref = {};
  }

  /**
   * Get the list of skill names that have entries in skills.yml
   * (and thus can be linked to the skills page).
   */
  _getMatchedSkillNames() {
    const skillToExp = this.crossref?.skillToExperience || {};
    const skillToProj = this.crossref?.skillToProject || {};
    const allSkills = new Set([
      ...Object.keys(skillToExp),
      ...Object.keys(skillToProj),
    ]);
    return [...allSkills];
  }

  _slugify(title, company) {
    const str = `${title}--${company}`;
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  render() {
    if (!this.experience?.length) return '';

    const matchedSkills = this._getMatchedSkillNames();

    return html`
      <section class="py-8">
        <h2
          class="mb-6 text-2xl font-bold text-gray-900 dark:text-white print:text-xl"
        >
          ${this.t('experience')}
        </h2>
        <div>
          ${this.experience.map(
            (exp) => html`
              <timeline-item
                item-id="experience-${this._slugify(exp.title, exp.company)}"
                .title=${exp.title}
                .subtitle=${exp.company}
                .start=${exp.start}
                .end=${exp.end}
                .descriptionHtml=${exp.description_html || ''}
                .skills=${exp.skills || []}
                .matchedSkills=${matchedSkills}
              ></timeline-item>
            `,
          )}
        </div>
      </section>
    `;
  }
}

customElements.define('section-experience', SectionExperience);
