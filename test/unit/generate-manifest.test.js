import { describe, it, expect } from 'vitest';
import { generateManifest } from '../../src/lib/generate/manifest.js';

const baseI18n = {
  labels: {
    nav_home: 'Home',
    nav_skills: 'Skills',
    nav_projects: 'Projects',
    nav_blog: 'Blog',
    route_skills: 'skills',
    route_projects: 'projects',
    route_blog: 'blog',
  },
};

const allVisible = {
  skills: true,
  projects: true,
  blog: true,
};

describe('generateManifest', () => {
  it('includes / route always', () => {
    const { routes } = generateManifest({
      visibility: allVisible,
      skills: null,
      projects: null,
      blog: null,
      pages: [],
      i18n: baseI18n,
    });
    expect(routes).toContain('/');
  });

  it('includes skills route when visibility.skills true', () => {
    const { routes } = generateManifest({
      visibility: allVisible,
      skills: { categories: [{ name: 'Dev', skills: [] }] },
      projects: null,
      blog: null,
      pages: [],
      i18n: baseI18n,
    });
    expect(routes).toContain('/skills');
  });

  it('excludes skills route when visibility.skills false', () => {
    const { routes } = generateManifest({
      visibility: { ...allVisible, skills: false },
      skills: { categories: [] },
      projects: null,
      blog: null,
      pages: [],
      i18n: baseI18n,
    });
    expect(routes).not.toContain('/skills');
  });

  it('includes projects route when visible and data present', () => {
    const { routes } = generateManifest({
      visibility: allVisible,
      skills: null,
      projects: { projects: [{ name: 'P', description: 'D', start: '2025' }] },
      blog: null,
      pages: [],
      i18n: baseI18n,
    });
    expect(routes).toContain('/projects');
  });

  it('excludes projects route when hidden or data absent', () => {
    const { routes: r1 } = generateManifest({
      visibility: { ...allVisible, projects: false },
      skills: null,
      projects: { projects: [{ name: 'P' }] },
      blog: null,
      pages: [],
      i18n: baseI18n,
    });
    expect(r1).not.toContain('/projects');

    const { routes: r2 } = generateManifest({
      visibility: allVisible,
      skills: null,
      projects: null,
      blog: null,
      pages: [],
      i18n: baseI18n,
    });
    expect(r2).not.toContain('/projects');
  });

  it('includes blog route when enabled with posts', () => {
    const { routes } = generateManifest({
      visibility: allVisible,
      skills: null,
      projects: null,
      blog: { posts: [{ slug: 'test' }] },
      pages: [],
      i18n: baseI18n,
    });
    expect(routes).toContain('/blog');
  });

  it('excludes blog route when disabled', () => {
    const { routes } = generateManifest({
      visibility: { ...allVisible, blog: false },
      skills: null,
      projects: null,
      blog: { posts: [{ slug: 'test' }] },
      pages: [],
      i18n: baseI18n,
    });
    expect(routes).not.toContain('/blog');
  });

  it('includes custom page routes', () => {
    const { routes } = generateManifest({
      visibility: allVisible,
      skills: null,
      projects: null,
      blog: null,
      pages: [
        {
          slug: 'about',
          title: 'About',
          meta: { nav_order: 1, show_in_nav: true },
        },
      ],
      i18n: baseI18n,
    });
    expect(routes).toContain('/about');
  });

  it('nav items match routes; hidden routes omitted from nav', () => {
    const { nav } = generateManifest({
      visibility: { ...allVisible, skills: false },
      skills: null,
      projects: { projects: [{ name: 'P', description: 'D', start: '2025' }] },
      blog: null,
      pages: [],
      i18n: baseI18n,
    });
    expect(nav.some((n) => n.path === '/')).toBe(true);
    expect(nav.some((n) => n.path === '/skills')).toBe(false);
    expect(nav.some((n) => n.path === '/projects')).toBe(true);
  });

  it('custom pages sorted by nav_order', () => {
    const { nav } = generateManifest({
      visibility: allVisible,
      skills: null,
      projects: null,
      blog: null,
      pages: [
        {
          slug: 'contact',
          title: 'Contact',
          meta: { nav_order: 5, show_in_nav: true },
        },
        {
          slug: 'about',
          title: 'About',
          meta: { nav_order: 1, show_in_nav: true },
        },
      ],
      i18n: baseI18n,
    });
    const pageNavItems = nav.filter(
      (n) => n.path === '/about' || n.path === '/contact',
    );
    expect(pageNavItems[0].path).toBe('/about');
    expect(pageNavItems[1].path).toBe('/contact');
  });
});
