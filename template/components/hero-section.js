import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

class HeroSection extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    resume: { type: Object },
    site: { type: Object },
    manifest: { type: Object },
  };

  constructor() {
    super();
    this.resume = {};
    this.site = {};
    this.manifest = {};
  }

  _getBackgroundClasses() {
    const style = this.site?.hero?.style || 'gradient';
    switch (style) {
      case 'solid':
        return 'bg-[var(--color-primary)]';
      case 'image':
        return 'relative bg-cover bg-center';
      case 'gradient':
      default:
        return 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]';
    }
  }

  _getBackgroundStyle() {
    if (this.site?.hero?.style === 'image' && this.site?.hero?.background) {
      return `background-image: url('${this.site.hero.background}')`;
    }
    return '';
  }

  _renderContactPills() {
    const contact = this.resume?.contact;
    if (!contact) return '';

    const pills = [];

    if (contact.email) {
      pills.push(html`
        <a
          href="mailto:${contact.email}"
          class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          ${contact.email}
        </a>
      `);
    }

    if (contact.phone) {
      pills.push(html`
        <a
          href="tel:${contact.phone}"
          class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          ${contact.phone}
        </a>
      `);
    }

    if (contact.location) {
      pills.push(html`
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          ${contact.location}
        </span>
      `);
    }

    if (contact.website) {
      pills.push(html`
        <a
          href=${contact.website}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
            />
          </svg>
          ${new URL(contact.website).hostname}
        </a>
      `);
    }

    if (contact.links?.length) {
      for (const link of contact.links) {
        const platform = link.platform || '';
        pills.push(html`
          <a
            href=${link.url}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm capitalize text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            ${platform
              ? html`<img
                  src="https://cdn.simpleicons.org/${platform}/white"
                  alt="${platform}"
                  class="h-4 w-4"
                  loading="lazy"
                />`
              : ''}
            ${platform || new URL(link.url).hostname}
          </a>
        `);
      }
    }

    return pills;
  }

  _renderQuickActions() {
    const routes = this.manifest?.routes || [];
    const i18n = window.__i18n?.labels || {};
    const actions = [];

    const skillsRoute = '/' + (i18n.route_skills || 'skills');
    if (routes.includes(skillsRoute)) {
      actions.push(html`
        <a
          href=${skillsRoute}
          class="inline-flex items-center gap-2 rounded-full border-2 border-white/50 bg-white/10 px-4 py-2 text-sm font-medium text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          ${this.t('hero_view_skills')}
        </a>
      `);
    }

    const projectsRoute = '/' + (i18n.route_projects || 'projects');
    if (routes.includes(projectsRoute)) {
      actions.push(html`
        <a
          href=${projectsRoute}
          class="inline-flex items-center gap-2 rounded-full border-2 border-white/50 bg-white/10 px-4 py-2 text-sm font-medium text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          ${this.t('projects')}
        </a>
      `);
    }

    return actions;
  }

  render() {
    const name = this.resume?.name || '';
    const tagline = this.resume?.tagline || '';
    const photo = this.resume?.photo || '';
    const overlayOpacity = this.site?.hero?.overlay_opacity ?? 0.6;
    const isImage = this.site?.hero?.style === 'image';

    return html`
      <section
        class="${this._getBackgroundClasses()} print:bg-none print:p-4"
        style=${this._getBackgroundStyle()}
      >
        <!-- Dark overlay for image backgrounds -->
        ${isImage
          ? html`<div
              class="absolute inset-0"
              style="background-color: rgba(0, 0, 0, ${overlayOpacity})"
            ></div>`
          : ''}

        <div
          class="${isImage
            ? 'relative'
            : ''} mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div
            class="flex flex-col items-center gap-8 text-center md:flex-row md:text-left"
          >
            <!-- Photo -->
            ${photo
              ? html`
                  <div class="flex-shrink-0 print:hidden">
                    <img
                      src=${photo}
                      alt=${name}
                      class="h-32 w-32 rounded-full border-4 border-white/30 object-cover shadow-lg sm:h-40 sm:w-40"
                      loading="lazy"
                    />
                  </div>
                `
              : ''}

            <!-- Content -->
            <div class="flex-1">
              <h1
                class="mb-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl print:text-2xl print:text-gray-900"
              >
                ${name}
              </h1>
              ${tagline
                ? html`<p
                    class="mb-6 text-lg text-white/90 sm:text-xl print:text-base print:text-gray-600"
                  >
                    ${tagline}
                  </p>`
                : ''}

              <!-- Contact pills -->
              <div
                class="mb-6 flex flex-wrap justify-center gap-2 md:justify-start print:gap-1"
              >
                ${this._renderContactPills()}
              </div>

              <!-- Quick actions -->
              <div
                class="flex flex-wrap justify-center gap-3 md:justify-start print:hidden"
              >
                ${this._renderQuickActions()}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

customElements.define('hero-section', HeroSection);
