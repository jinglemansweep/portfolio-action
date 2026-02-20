import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { validate } from '../../src/lib/validate.js';
import { compileYaml } from '../../src/lib/compile-yaml.js';
import { fixturePath } from '../helpers/test-utils.js';

async function loadFixture(name) {
  const dir = fixturePath(name);
  const site = await compileYaml(join(dir, 'site.yml'), {
    isSiteConfig: true,
  });
  const resume = await compileYaml(join(dir, 'resume.yml'));
  const skills = await compileYaml(join(dir, 'skills.yml'));
  const projects = await compileYaml(join(dir, 'projects.yml'));
  return { site, resume, skills, projects };
}

describe('validate', () => {
  it('valid minimal fixture passes validation', async () => {
    const { site, resume, skills, projects } = await loadFixture('minimal');
    const errors = validate(site, resume, skills, projects);
    expect(errors).toHaveLength(0);
  });

  it('valid full fixture passes validation', async () => {
    const { site, resume, skills, projects } = await loadFixture('full');
    const errors = validate(site, resume, skills, projects);
    expect(errors).toHaveLength(0);
  });

  it('missing required fields produce specific errors', () => {
    const errors = validate(
      { lang: 'en' },
      { name: 'Test' },
      { categories: [] },
      { projects: [] },
    );
    expect(
      errors.some((e) => e.file === 'site.yml' && e.field === 'title'),
    ).toBe(true);
    expect(
      errors.some((e) => e.file === 'site.yml' && e.field === 'description'),
    ).toBe(true);
    expect(
      errors.some((e) => e.file === 'resume.yml' && e.field === 'tagline'),
    ).toBe(true);
  });

  it('invalid types produce specific errors', () => {
    const errors = validate(
      { title: 123, description: null, lang: 'en' },
      { name: 'Test', tagline: 'Dev' },
      { categories: 'not-an-array' },
      { projects: 'not-an-array' },
    );
    expect(
      errors.some((e) => e.file === 'site.yml' && e.field === 'title'),
    ).toBe(true);
    expect(
      errors.some((e) => e.file === 'skills.yml' && e.field === 'categories'),
    ).toBe(true);
    expect(
      errors.some((e) => e.file === 'projects.yml' && e.field === 'projects'),
    ).toBe(true);
  });

  it('empty/missing data produces clear error', () => {
    const errors = validate(null, null, null, null);
    expect(errors.length).toBeGreaterThanOrEqual(4);
    expect(errors.every((e) => e.field === '(root)')).toBe(true);
  });

  it('validates project items with missing required fields', () => {
    const errors = validate(
      { title: 'T', description: 'D', lang: 'en' },
      { name: 'N', tagline: 'T' },
      { categories: [{ name: 'Cat', skills: [{ name: 'JS' }] }] },
      { projects: [{ url: 'https://example.com' }] },
    );
    expect(errors.some((e) => e.field === 'projects[0].name')).toBe(true);
    expect(errors.some((e) => e.field === 'projects[0].description')).toBe(
      true,
    );
    expect(errors.some((e) => e.field === 'projects[0].start')).toBe(true);
  });

  it('validates category objects with missing skills array', () => {
    const errors = validate(
      { title: 'T', description: 'D', lang: 'en' },
      { name: 'N', tagline: 'T' },
      { categories: [{ name: 'Cat' }] },
      { projects: [] },
    );
    expect(errors.some((e) => e.field === 'categories[0].skills')).toBe(true);
  });

  it('validates non-object items in arrays', () => {
    const errors = validate(
      { title: 'T', description: 'D', lang: 'en' },
      { name: 'N', tagline: 'T' },
      { categories: [null] },
      { projects: ['not-an-object'] },
    );
    expect(errors.some((e) => e.field === 'categories[0]')).toBe(true);
    expect(errors.some((e) => e.field === 'projects[0]')).toBe(true);
  });
});
