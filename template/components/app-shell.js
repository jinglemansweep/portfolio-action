import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { I18nMixin } from './i18n-mixin.js';

// Import all page and section components
import './nav-bar.js';
import './site-footer.js';
import './page-home.js';
import './page-projects.js';
import './page-skills.js';
import './page-blog.js';
import './page-blog-post.js';
import './page-custom.js';
import './page-not-found.js';

class AppShell extends I18nMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    _loaded: { state: true },
    _currentPath: { state: true },
    _site: { state: true },
    _resume: { state: true },
    _skills: { state: true },
    _projects: { state: true },
    _crossref: { state: true },
    _manifest: { state: true },
    _pages: { state: true },
    _blogIndex: { state: true },
    _blogTags: { state: true },
  };

  constructor() {
    super();
    this._loaded = false;
    this._currentPath = '/';
    this._site = null;
    this._resume = null;
    this._skills = null;
    this._projects = null;
    this._crossref = null;
    this._manifest = null;
    this._pages = [];
    this._blogIndex = null;
    this._blogTags = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleSpaRedirect();
    this._currentPath = this._normalizePath(window.location.pathname);
    window.addEventListener('popstate', () => {
      this._currentPath = this._normalizePath(window.location.pathname);
    });
    this._loadData();
  }

  /**
   * Handle the 404.html SPA redirect. If the URL contains a ?p= parameter,
   * restore the original path via History API.
   */
  _handleSpaRedirect() {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('p');
    if (redirectPath) {
      const decoded = decodeURIComponent(redirectPath);
      window.history.replaceState(null, '', decoded);
    }
  }

  /**
   * Normalize a path by stripping the base path prefix, hash fragment,
   * and ensuring it starts with / and has no trailing slash (except root).
   */
  _normalizePath(path) {
    const base = document.querySelector('base')?.getAttribute('href') || '/';
    let normalized = path.split('#')[0];
    if (base !== '/' && normalized.startsWith(base)) {
      normalized = normalized.slice(base.length);
    }
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    if (normalized !== '/' && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  /**
   * Load i18n bundle and all data JSON files.
   */
  async _loadData() {
    try {
      // Load i18n first so t() works during rendering
      const i18nRes = await fetch('data/i18n.json');
      if (i18nRes.ok) {
        window.__i18n = await i18nRes.json();
      }

      // Load all data files in parallel
      const [siteRes, resumeRes, manifestRes, crossrefRes] = await Promise.all([
        fetch('data/site.json'),
        fetch('data/resume.json'),
        fetch('data/manifest.json'),
        fetch('data/crossref.json'),
      ]);

      this._site = siteRes.ok ? await siteRes.json() : {};
      this._resume = resumeRes.ok ? await resumeRes.json() : {};
      this._manifest = manifestRes.ok ? await manifestRes.json() : {};
      this._crossref = crossrefRes.ok ? await crossrefRes.json() : {};

      // Store site data globally for pdf-export
      window.__site = this._site;

      // Conditionally load skills, projects, blog
      const optionalLoads = [];

      if (this._site?.visibility?.skills !== false) {
        optionalLoads.push(
          fetch('data/skills.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => (this._skills = d)),
        );
      }

      if (this._site?.visibility?.projects !== false) {
        optionalLoads.push(
          fetch('data/projects.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => (this._projects = d)),
        );
      }

      if (this._site?.visibility?.blog !== false) {
        optionalLoads.push(
          fetch('data/blog/index.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => (this._blogIndex = d)),
        );
        optionalLoads.push(
          fetch('data/blog/tags.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => (this._blogTags = d)),
        );
      }

      // Load custom pages metadata from manifest
      if (this._manifest?.pages) {
        this._pages = this._manifest.pages;
      }

      await Promise.all(optionalLoads);
      this._loaded = true;
    } catch (err) {
      console.error('Failed to load site data:', err);
      this._loaded = true; // Still render, will show error state
    }
  }

  /**
   * Navigate to a new path via History API.
   */
  navigate(path) {
    const base = document.querySelector('base')?.getAttribute('href') || '/';
    const [pathname, hash] = path.split('#');
    const fullPath =
      base === '/' ? pathname : base + pathname.replace(/^\//, '');
    const fullPathWithHash = hash ? `${fullPath}#${hash}` : fullPath;
    window.history.pushState(null, '', fullPathWithHash);
    this._currentPath = this._normalizePath(fullPath);

    if (hash) {
      // Defer scroll so the page component renders first
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        window.scrollTo(0, 0);
      });
    } else {
      window.scrollTo(0, 0);
    }
  }

  /**
   * Handle navigation link clicks. Intercept internal links
   * and use History API instead of full page reload.
   */
  _handleLinkClick(e) {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    // Skip external links, hash-only links, and non-http links
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#')
    ) {
      return;
    }

    e.preventDefault();
    this.navigate(href);
  }

  /**
   * Match current path against manifest routes and render
   * the appropriate page component.
   */
  _renderPage() {
    const path = this._currentPath;
    const routes = this._manifest?.routes || [];
    const i18n = window.__i18n?.labels || {};

    // Home page
    if (path === '/') {
      return html`<page-home
        .resume=${this._resume}
        .site=${this._site}
        .skills=${this._skills}
        .projects=${this._projects}
        .crossref=${this._crossref}
        .manifest=${this._manifest}
      ></page-home>`;
    }

    // Skills page
    const skillsRoute = '/' + (i18n.route_skills || 'skills');
    if (path === skillsRoute && routes.includes(skillsRoute)) {
      return html`<page-skills
        .skills=${this._skills}
        .crossref=${this._crossref}
        .site=${this._site}
      ></page-skills>`;
    }

    // Projects page
    const projectsRoute = '/' + (i18n.route_projects || 'projects');
    if (path === projectsRoute && routes.includes(projectsRoute)) {
      return html`<page-projects
        .projects=${this._projects}
        .crossref=${this._crossref}
        .skills=${this._skills}
        .site=${this._site}
      ></page-projects>`;
    }

    // Blog index
    const blogRoute = '/' + (i18n.route_blog || 'blog');
    if (path === blogRoute && routes.includes(blogRoute)) {
      return html`<page-blog
        .posts=${this._blogIndex}
        .tags=${this._blogTags}
        .site=${this._site}
      ></page-blog>`;
    }

    // Blog post — /{blog_path}/<slug>
    if (path.startsWith(blogRoute + '/') && routes.includes(blogRoute)) {
      const slug = path.slice(blogRoute.length + 1);
      return html`<page-blog-post
        .slug=${slug}
        .posts=${this._blogIndex}
        .site=${this._site}
        .blogRoute=${blogRoute}
      ></page-blog-post>`;
    }

    // Custom pages — match against manifest pages
    if (this._pages?.length) {
      const page = this._pages.find((p) => '/' + p.slug === path);
      if (page) {
        return html`<page-custom
          .page=${page}
          .site=${this._site}
        ></page-custom>`;
      }
    }

    // Check if route exists in manifest routes for custom pages
    if (routes.includes(path)) {
      // It is a valid route but we may need to load page data
      const slug = path.replace(/^\//, '');
      return html`<page-custom
        .slug=${slug}
        .site=${this._site}
      ></page-custom>`;
    }

    // 404
    return html`<page-not-found></page-not-found>`;
  }

  render() {
    if (!this._loaded) {
      return html`
        <div
          class="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900"
        >
          <div class="text-center">
            <div
              class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"
            ></div>
            <p class="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      `;
    }

    return html`
      <div
        class="flex min-h-screen flex-col bg-white dark:bg-gray-900"
        @click=${this._handleLinkClick}
      >
        <nav-bar
          .nav=${this._manifest?.nav || []}
          .site=${this._site}
          .currentPath=${this._currentPath}
        ></nav-bar>

        <main id="main-content" class="flex-1">${this._renderPage()}</main>

        <site-footer .site=${this._site}></site-footer>
      </div>
    `;
  }
}

customElements.define('app-shell', AppShell);
