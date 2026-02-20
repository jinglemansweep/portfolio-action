import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';
import './card.js';

class SkillExplorer extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    skills: { type: Object },
    crossref: { type: Object },
    _searchQuery: { state: true },
    _selectedCategory: { state: true },
    _selectedTag: { state: true },
    _highlightedSkill: { state: true },
  };

  constructor() {
    super();
    this.skills = null;
    this.crossref = {};
    this._searchQuery = '';
    this._selectedCategory = '';
    this._selectedTag = '';
    this._highlightedSkill = '';
  }

  connectedCallback() {
    super.connectedCallback();
    // Read ?highlight= param from URL
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    if (highlight) {
      this._highlightedSkill = highlight.toLowerCase();
      // Auto-scroll to highlighted skill after render
      this.updateComplete.then(() => {
        const slug = this._slugify(highlight);
        const el = document.querySelector(`#skill-${slug}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  _slugify(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  _getAllCategories() {
    return this.skills?.categories || [];
  }

  _getAllTags() {
    const tags = new Set();
    for (const cat of this._getAllCategories()) {
      for (const skill of cat.skills || []) {
        for (const tag of skill.tags || []) {
          tags.add(tag);
        }
      }
    }
    return [...tags].sort();
  }

  _filterSkills(skills) {
    let filtered = [...skills];

    // Filter by search query
    if (this._searchQuery) {
      const q = this._searchQuery.toLowerCase();
      filtered = filtered.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q);
        const tagMatch = s.tags?.some((t) => t.toLowerCase().includes(q));
        return nameMatch || tagMatch;
      });
    }

    // Filter by selected tag
    if (this._selectedTag) {
      filtered = filtered.filter((s) =>
        s.tags?.some((t) => t === this._selectedTag),
      );
    }

    return filtered;
  }

  _onSearchInput(e) {
    this._searchQuery = e.target.value;
  }

  _onCategoryChange(e) {
    this._selectedCategory = e.target.value;
  }

  _selectTag(tag) {
    this._selectedTag = this._selectedTag === tag ? '' : tag;
  }

  render() {
    const categories = this._getAllCategories();
    const allTags = this._getAllTags();

    // Filter categories
    const displayCategories = this._selectedCategory
      ? categories.filter((c) => c.name === this._selectedCategory)
      : categories;

    return html`
      <div>
        <!-- Search and filter controls -->
        <div class="mb-8 space-y-4">
          <div class="flex flex-col gap-4 sm:flex-row">
            <!-- Search input -->
            <div class="flex-1">
              <label for="skill-search" class="sr-only"
                >${this.t('skill_filter_placeholder')}</label
              >
              <input
                id="skill-search"
                type="text"
                .value=${this._searchQuery}
                @input=${this._onSearchInput}
                placeholder=${this.t('skill_filter_placeholder')}
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-800"
              />
            </div>

            <!-- Category filter -->
            <div class="sm:w-56">
              <label for="skill-category" class="sr-only"
                >${this.t('skill_all_categories')}</label
              >
              <select
                id="skill-category"
                .value=${this._selectedCategory}
                @change=${this._onCategoryChange}
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-800"
              >
                <option value="">${this.t('skill_all_categories')}</option>
                ${categories.map(
                  (cat) => html`
                    <option value=${cat.name}>${cat.name}</option>
                  `,
                )}
              </select>
            </div>
          </div>

          <!-- Tag cloud -->
          ${allTags.length
            ? html`
                <div class="flex flex-wrap gap-2">
                  ${allTags.map(
                    (tag) => html`
                      <button
                        @click=${() => this._selectTag(tag)}
                        class="rounded-full px-3 py-1 text-xs font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${this
                          ._selectedTag === tag
                          ? 'bg-blue-600 text-white dark:bg-blue-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
                      >
                        ${tag}
                      </button>
                    `,
                  )}
                  ${this._selectedTag
                    ? html`
                        <button
                          @click=${() => this._selectTag('')}
                          class="rounded-full px-3 py-1 text-xs font-medium text-gray-400 underline hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          Clear
                        </button>
                      `
                    : ''}
                </div>
              `
            : ''}
        </div>

        <!-- Skills grid by category -->
        ${displayCategories.map((cat) => {
          const filteredSkills = this._filterSkills(cat.skills || []);
          if (!filteredSkills.length) return '';

          return html`
            <div class="mb-8">
              <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                ${cat.name}
              </h2>
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                ${filteredSkills.map(
                  (skill) => html`
                    <skill-card
                      .skill=${skill}
                      .category=${cat.name}
                      .crossref=${this.crossref}
                      .highlighted=${this._highlightedSkill ===
                      skill.name.toLowerCase()}
                    ></skill-card>
                  `,
                )}
              </div>
            </div>
          `;
        })}

        <!-- No results -->
        ${displayCategories.every(
          (cat) => !this._filterSkills(cat.skills || []).length,
        )
          ? html`
              <div class="py-12 text-center">
                <p class="text-gray-500 dark:text-gray-400">
                  No skills match your search.
                </p>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

customElements.define('skill-explorer', SkillExplorer);
