import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { compileYaml } from '../../src/lib/compile/yaml.js';
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
