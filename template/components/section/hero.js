import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from '../ui/i18n-mixin.js';
import {
  iconLocation,
  iconEmail,
  iconPhone,
  iconGlobe,
  iconLink,
  brandIcon,
} from '../ui/icons.js';

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
          ${iconLocation(iconClass)} ${contact.location}
        </span>
      `);
    }

    if (contact.email) {
      pills.push(html`
        <a href="mailto:${contact.email}" class=${pillClass}>
          ${iconEmail(iconClass)} ${contact.email}
        </a>
      `);
    }

    if (contact.phone) {
      pills.push(html`
        <a href="tel:${contact.phone}" class=${pillClass}>
          ${iconPhone(iconClass)} ${contact.phone}
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
          ${iconGlobe(iconClass)} ${new URL(contact.website).hostname}
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
            ${brandIcon(social.type, iconClass)}
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
            ${iconLink(iconClass)}
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
            class="flex flex-col items-center gap-8 text-center print:gap-2 print:text-left"
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
                class="mb-6 flex flex-wrap justify-center gap-2 print:mb-0 print:justify-start print:gap-x-3 print:gap-y-0.5"
              >
                ${this._renderContactPills()}
              </div>

              <!-- Quick actions -->
              <div class="flex flex-wrap justify-center gap-3 print:hidden">
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
