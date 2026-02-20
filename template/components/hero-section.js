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

  _getSocialUrl(type, username) {
    const urlMap = {
      github: `https://github.com/${username}`,
      linkedin: `https://linkedin.com/in/${username}`,
      x: `https://x.com/${username}`,
      tiktok: `https://tiktok.com/@${username}`,
      mastodon: null, // handled below
    };
    if (type === 'mastodon' && username.includes('@')) {
      // Format: @user@instance.social → https://instance.social/@user
      const parts = username.replace(/^@/, '').split('@');
      return `https://${parts[1]}/@${parts[0]}`;
    }
    return urlMap[type] || null;
  }

  _renderBrandIcon(type, cls) {
    const iconClass = cls || 'h-4 w-4 print:h-3 print:w-3';
    switch (type) {
      case 'github':
        return html`<svg
          class=${iconClass}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
          />
        </svg>`;
      case 'linkedin':
        return html`<svg
          class=${iconClass}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          />
        </svg>`;
      case 'x':
        return html`<svg
          class=${iconClass}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
          />
        </svg>`;
      case 'tiktok':
        return html`<svg
          class=${iconClass}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
          />
        </svg>`;
      case 'mastodon':
        return html`<svg
          class=${iconClass}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054 19.648 19.648 0 0 0 4.581.536c.394 0 .787 0 1.183-.016 2.143-.067 4.398-.359 4.66-.366a4.69 4.69 0 0 0 3.814-3.51c.37-1.465.56-3.257.56-3.257 0-.022.008-.127 0-.127Zm-3.928 6.093h-2.54V6.656c0-1.127-.478-1.7-1.44-1.7-1.06 0-1.593.68-1.593 2.024V9.52h-2.525V6.98c0-1.344-.532-2.024-1.593-2.024-.96 0-1.44.573-1.44 1.7v4.75H5.67V6.404c0-1.127.288-2.024.867-2.69.596-.665 1.378-1.006 2.35-1.006 1.123 0 1.974.43 2.535 1.29l.547.916.546-.916c.561-.86 1.412-1.29 2.535-1.29.972 0 1.754.341 2.35 1.006.579.666.867 1.563.867 2.69v4.902Z"
          />
        </svg>`;
      default:
        return html`<img
          src="https://cdn.simpleicons.org/${type}/white"
          alt="${type}"
          class=${iconClass}
          loading="lazy"
        />`;
    }
  }

  _renderContactPills() {
    const contact = this.resume?.contact;
    if (!contact) return '';

    const pills = [];

    const pillClass =
      'inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/30 print:gap-1 print:rounded-none print:bg-transparent print:px-0 print:py-0 print:text-xs print:text-gray-700 print:backdrop-blur-none';
    const pillStaticClass =
      'inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm print:gap-1 print:rounded-none print:bg-transparent print:px-0 print:py-0 print:text-xs print:text-gray-700 print:backdrop-blur-none';
    const iconClass = 'h-4 w-4 print:h-3 print:w-3';

    if (contact.location) {
      pills.push(html`
        <span class=${pillStaticClass}>
          <svg
            class=${iconClass}
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

    if (contact.email) {
      pills.push(html`
        <a href="mailto:${contact.email}" class=${pillClass}>
          <svg
            class=${iconClass}
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
        <a href="tel:${contact.phone}" class=${pillClass}>
          <svg
            class=${iconClass}
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

    if (contact.website) {
      const printOnlyPillClass =
        'hidden print:inline-flex items-center gap-1.5 print:gap-1 print:rounded-none print:bg-transparent print:px-0 print:py-0 print:text-xs print:text-gray-700';
      pills.push(html`
        <a
          href=${contact.website}
          target="_blank"
          rel="noopener noreferrer"
          class=${printOnlyPillClass}
        >
          <svg
            class=${iconClass}
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

    if (contact.socials?.length) {
      for (const social of contact.socials) {
        const url = this._getSocialUrl(social.type, social.username);
        if (!url) continue;
        const parsedUrl = new URL(url);
        const printLabel =
          parsedUrl.hostname + parsedUrl.pathname.replace(/\/+$/, '');
        pills.push(html`
          <a
            href=${url}
            target="_blank"
            rel="noopener noreferrer"
            class=${pillClass}
          >
            ${this._renderBrandIcon(social.type)}
            <span class="print:hidden">${social.username}</span>
            <span class="hidden print:inline">${printLabel}</span>
          </a>
        `);
      }
    }

    if (contact.links?.length) {
      for (const link of contact.links) {
        const platform = link.platform || '';
        const label = platform || new URL(link.url).hostname;
        // Extract username from URL path for print display
        const urlPath = new URL(link.url).pathname.replace(/^\/+|\/+$/g, '');
        const printLabel = urlPath
          ? `${platform || new URL(link.url).hostname}/${urlPath}`
          : label;
        pills.push(html`
          <a
            href=${link.url}
            target="_blank"
            rel="noopener noreferrer"
            class="${pillClass} capitalize"
          >
            <svg
              class=${iconClass}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span class="print:hidden">${label}</span>
            <span class="hidden print:inline">${printLabel}</span>
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
            : ''} mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 print:px-0 print:py-4"
        >
          <div
            class="flex flex-col items-center gap-8 text-center md:flex-row md:text-left print:gap-2 print:text-left"
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
                    class="mb-6 text-lg text-white/90 sm:text-xl print:mb-2 print:text-base print:text-gray-600"
                  >
                    ${tagline}
                  </p>`
                : ''}

              <!-- Contact pills -->
              <div
                class="mb-6 flex flex-wrap justify-center gap-2 md:justify-start print:mb-0 print:gap-x-3 print:gap-y-0.5"
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
