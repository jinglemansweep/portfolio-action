import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  compileYaml,
  deriveSiteMeta,
  formatLocation,
} from '../../src/lib/compile/yaml.js';
import { fixturePath } from '../helpers/test-utils.js';

describe('compileYaml', () => {
  it('parses valid YAML files correctly', async () => {
    const data = await compileYaml(join(fixturePath('minimal'), 'resume.yml'));
    expect(data.name).toBe('Test User');
    expect(data.tagline).toBe('Software Developer');
  });

  it('merges visibility defaults when isSiteConfig is true', async () => {
    const data = await compileYaml(join(fixturePath('minimal'), 'site.yml'), {
      isSiteConfig: true,
    });
    expect(data.visibility.contact_email).toBe('none');
    expect(data.visibility.contact_phone).toBe('none');
    expect(data.visibility.education).toBe('all');
    expect(data.visibility.experience).toBe('all');
    expect(data.visibility.experience_company).toBe('all');
    expect(data.visibility.location).toBe('all');
    expect(data.visibility.socials).toBe('all');
    expect(data.visibility.skills).toBe('all');
    expect(data.visibility.blog).toBe('all');
  });

  it('merges SEO defaults when isSiteConfig is true', async () => {
    const data = await compileYaml(join(fixturePath('minimal'), 'site.yml'), {
      isSiteConfig: true,
    });
    expect(data.seo.robots.indexing).toBe(true);
    expect(data.seo.robots.follow_links).toBe(true);
    expect(data.seo.sitemap).toBe(true);
    expect(data.seo.llms_txt).toBe(true);
    expect(data.seo.rss).toBe(true);
  });

  it('throws on missing file with descriptive message', async () => {
    await expect(compileYaml('/nonexistent/path/file.yml')).rejects.toThrow(
      'not found',
    );
  });

  it('throws on malformed YAML with parse error details', async () => {
    await expect(
      compileYaml(join(fixturePath('invalid'), 'malformed.yml')),
    ).rejects.toThrow('Failed to parse');
  });

  it('user overrides are preserved over defaults', async () => {
    const data = await compileYaml(
      join(fixturePath('visibility-hidden'), 'site.yml'),
      { isSiteConfig: true },
    );
    expect(data.visibility.contact_email).toBe('none');
    expect(data.visibility.contact_phone).toBe('none');
    expect(data.visibility.education).toBe('none');
    expect(data.visibility.experience).toBe('none');
    expect(data.visibility.experience_company).toBe('none');
    expect(data.visibility.skills).toBe('none');
    expect(data.visibility.projects).toBe('none');
    expect(data.visibility.blog).toBe('none');
  });

  it('merges documents defaults when isSiteConfig is true', async () => {
    const data = await compileYaml(join(fixturePath('minimal'), 'site.yml'), {
      isSiteConfig: true,
    });
    expect(data.documents.pdf).toBe(true);
    expect(data.documents.docx).toBe(true);
    expect(data.documents.page_size).toBe('A4');
    expect(data.documents.filename).toBe('resume');
  });

  it('normalizes boolean true to "all" and false to "none"', async () => {
    const data = await compileYaml(join(fixturePath('full'), 'site.yml'), {
      isSiteConfig: true,
    });
    // full/site.yml has boolean values — they should be normalized
    expect(data.visibility.education).toBe('all');
    expect(data.visibility.experience).toBe('all');
    expect(data.visibility.contact_phone).toBe('none');
    expect(data.visibility.contact_email).toBe('all');
  });
});

describe('formatLocation', () => {
  it('formats a full location object', () => {
    expect(
      formatLocation({ city: 'London', region: 'England', country: 'UK' }),
    ).toBe('London, England, UK');
  });

  it('omits empty parts', () => {
    expect(formatLocation({ city: 'London', country: 'UK' })).toBe(
      'London, UK',
    );
  });

  it('handles city only', () => {
    expect(formatLocation({ city: 'Berlin' })).toBe('Berlin');
  });

  it('returns empty string for null/undefined', () => {
    expect(formatLocation(null)).toBe('');
    expect(formatLocation(undefined)).toBe('');
  });

  it('passes through plain strings', () => {
    expect(formatLocation('London, UK')).toBe('London, UK');
  });

  it('returns empty string for empty object', () => {
    expect(formatLocation({})).toBe('');
  });
});

describe('deriveSiteMeta', () => {
  it('derives title with name, location, and tagline', () => {
    const result = deriveSiteMeta({
      name: 'Jane Smith',
      tagline: 'Full-Stack Developer',
      contact: { location: { city: 'Bristol', country: 'UK' } },
    });
    expect(result.title).toBe(
      'Jane Smith (Bristol, UK) - Full-Stack Developer',
    );
    expect(result.description).toBe('Full-Stack Developer');
  });

  it('omits location when missing', () => {
    const result = deriveSiteMeta({
      name: 'Jane Smith',
      tagline: 'Developer',
    });
    expect(result.title).toBe('Jane Smith - Developer');
  });

  it('omits tagline when missing', () => {
    const result = deriveSiteMeta({
      name: 'Jane Smith',
      contact: { location: { city: 'London', country: 'UK' } },
    });
    expect(result.title).toBe('Jane Smith (London, UK)');
    expect(result.description).toBe('');
  });

  it('handles name only', () => {
    const result = deriveSiteMeta({ name: 'Jane Smith' });
    expect(result.title).toBe('Jane Smith');
    expect(result.description).toBe('');
  });

  it('handles null/undefined resume', () => {
    const result = deriveSiteMeta(null);
    expect(result.title).toBe('');
    expect(result.description).toBe('');
  });
});
