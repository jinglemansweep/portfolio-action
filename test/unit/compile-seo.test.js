import { describe, it, expect } from 'vitest';
import {
  generateRobotsTxt,
  generateMetaRobots,
  generateSitemapXml,
  generateLlmsTxt,
  generateFeedXml,
} from '../../src/lib/compile/seo.js';

describe('generateRobotsTxt', () => {
  it('allows all when indexing: true', () => {
    const txt = generateRobotsTxt(
      { robots: { indexing: true } },
      'https://example.com',
    );
    expect(txt).toContain('Allow: /');
    expect(txt).not.toContain('Disallow');
  });

  it('disallows all when indexing: false', () => {
    const txt = generateRobotsTxt(
      { robots: { indexing: false } },
      'https://example.com',
    );
    expect(txt).toContain('Disallow: /');
    expect(txt).not.toContain('Allow');
  });

  it('includes sitemap URL when site_url available', () => {
    const txt = generateRobotsTxt(
      { robots: { indexing: true } },
      'https://example.com',
    );
    expect(txt).toContain('Sitemap: https://example.com/sitemap.xml');
  });
});

describe('generateMetaRobots', () => {
  it('returns correct string for all flag combinations', () => {
    expect(
      generateMetaRobots({ robots: { indexing: true, follow_links: true } }),
    ).toBe('index, follow');
    expect(
      generateMetaRobots({
        robots: { indexing: true, follow_links: false },
      }),
    ).toBe('index, nofollow');
    expect(generateMetaRobots({ robots: { indexing: false } })).toBe(
      'noindex, nofollow',
    );
  });
});

describe('generateSitemapXml', () => {
  const i18n = {
    labels: {
      route_skills: 'skills',
      route_projects: 'projects',
      route_blog: 'blog',
    },
  };

  it('includes only visible routes', () => {
    const xml = generateSitemapXml(
      ['/', '/skills', '/projects'],
      'https://example.com',
      '2026-01-15',
      i18n,
    );
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/skills</loc>');
    expect(xml).toContain('<loc>https://example.com/projects</loc>');
  });

  it('excludes routes not in the list (already filtered by caller)', () => {
    const xml = generateSitemapXml(
      ['/'],
      'https://example.com',
      '2026-01-15',
      i18n,
    );
    expect(xml).not.toContain('/skills');
    expect(xml).not.toContain('/projects');
  });

  it('uses i18n route paths', () => {
    const frI18n = {
      labels: {
        route_skills: 'competences',
        route_projects: 'projets',
        route_blog: 'blog',
      },
    };
    const xml = generateSitemapXml(
      ['/', '/competences', '/projets'],
      'https://example.com',
      '2026-01-15',
      frI18n,
    );
    expect(xml).toContain('/competences');
    expect(xml).toContain('/projets');
  });
});

describe('generateLlmsTxt', () => {
  it('includes visible sections only', () => {
    const txt = generateLlmsTxt({
      resume: {
        name: 'Test',
        tagline: 'Dev',
        experience: [
          {
            title: 'Engineer',
            company: 'Corp',
            start: '2020',
            end: 'present',
          },
        ],
      },
      skills: null,
      projects: null,
      blog: null,
    });
    expect(txt).toContain('## Experience');
    expect(txt).not.toContain('## Skills');
    expect(txt).not.toContain('## Projects');
  });

  it('excludes stripped contact fields', () => {
    const txt = generateLlmsTxt({
      resume: {
        name: 'Test',
        contact: { location: { city: 'London', country: 'UK' } },
      },
      skills: null,
      projects: null,
      blog: null,
    });
    expect(txt).toContain('London, UK');
    expect(txt).not.toContain('email');
  });

  it('includes blog posts when blog enabled', () => {
    const txt = generateLlmsTxt({
      resume: { name: 'Test' },
      skills: null,
      projects: null,
      blog: {
        posts: [
          {
            title: 'Test Post',
            slug: 'test',
            publish_on: '2026-01-15',
            tags: ['test'],
          },
        ],
      },
    });
    expect(txt).toContain('## Blog');
    expect(txt).toContain('Test Post');
  });
});

describe('generateFeedXml', () => {
  it('contains published posts in correct order', () => {
    const xml = generateFeedXml({
      site: { title: 'Test Site', description: 'Desc', lang: 'en' },
      blog: {
        posts: [
          {
            title: 'Post 1',
            slug: 'post-1',
            description: 'First',
            publish_on: '2026-03-01',
            tags: ['a'],
          },
          {
            title: 'Post 2',
            slug: 'post-2',
            description: 'Second',
            publish_on: '2026-01-01',
            tags: ['b'],
          },
        ],
      },
      siteUrl: 'https://example.com',
      i18n: { labels: { route_blog: 'blog' } },
    });
    expect(xml).toContain('<title>Post 1</title>');
    expect(xml).toContain('<title>Post 2</title>');
    expect(xml.indexOf('Post 1')).toBeLessThan(xml.indexOf('Post 2'));
  });

  it('omits when blog disabled', () => {
    const xml = generateFeedXml({
      site: { title: 'Test' },
      blog: null,
      siteUrl: 'https://example.com',
      i18n: {},
    });
    expect(xml).toBe('');
  });
});
