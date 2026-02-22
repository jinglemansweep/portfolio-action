import { describe, it, expect } from 'vitest';
import { generateResumeHtml } from '../../src/lib/generate/resume-html.js';

const fullResume = {
  name: 'Jane Smith',
  tagline: 'Senior Software Engineer',
  contact: {
    email: 'jane@example.com',
    phone: '+1 555-0100',
    location: { city: 'London', country: 'UK' },
    website: 'https://jane.dev',
    socials: [
      { type: 'github', username: 'janesmith' },
      { type: 'linkedin', username: 'janesmith' },
    ],
    links: [{ title: 'Blog', url: 'https://blog.jane.dev' }],
  },
  summary: 'Experienced engineer with **10+ years** building scalable systems.',
  experience: [
    {
      title: 'Principal Engineer',
      company: 'Acme Corp',
      start: '2022-01',
      end: 'present',
      description: 'Leading platform architecture.',
      skills: ['TypeScript', 'Go'],
    },
  ],
  education: [
    {
      institution: 'MIT',
      qualification: 'BSc Computer Science',
      start: '2008',
      end: '2012',
    },
  ],
  accreditations: [{ title: 'AWS SA Pro', issuer: 'AWS', date: '2024' }],
  community: [
    { name: 'Tech Meetup', role: 'Organiser', description: 'Monthly meetup.' },
  ],
};

const fullSkills = {
  categories: [
    {
      name: 'Languages',
      skills: [{ name: 'TypeScript', level: 'Expert', years: 8 }],
    },
  ],
};

const fullProjects = {
  projects: [
    {
      name: 'Open Source Tool',
      description: 'A CLI tool.',
      start: '2023',
      url: 'https://example.com',
      skills: ['TypeScript'],
    },
  ],
};

const defaultI18n = {
  locale: 'en',
  dir: 'ltr',
  labels: {
    summary: 'Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    community: 'Community',
    accreditations: 'Accreditations',
    experience_present: 'Present',
    experience_skills: 'Skills',
    skill_years: '{n} years',
  },
};

describe('generateResumeHtml', () => {
  it('returns string containing <!DOCTYPE html>', async () => {
    const html = await generateResumeHtml({
      resume: fullResume,
      skills: fullSkills,
      projects: fullProjects,
      i18n: defaultI18n,
    });
    expect(html).toContain('<!doctype html>');
  });

  it('contains resume name in heading element', async () => {
    const html = await generateResumeHtml({
      resume: fullResume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('<h1>Jane Smith</h1>');
  });

  it('contains expected section headings based on i18n labels', async () => {
    const html = await generateResumeHtml({
      resume: fullResume,
      skills: fullSkills,
      projects: fullProjects,
      i18n: defaultI18n,
    });
    expect(html).toContain('<h2>Experience</h2>');
    expect(html).toContain('<h2>Education</h2>');
    expect(html).toContain('<h2>Skills</h2>');
    expect(html).toContain('<h2>Projects</h2>');
    expect(html).toContain('<h2>Community</h2>');
    expect(html).toContain('<h2>Accreditations</h2>');
  });

  it('excludes sections not present in input data', async () => {
    const html = await generateResumeHtml({
      resume: { name: 'Test', tagline: 'Dev' },
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).not.toContain('<h2>Skills</h2>');
    expect(html).not.toContain('<h2>Experience</h2>');
    expect(html).not.toContain('<h2>Projects</h2>');
  });

  it('renders markdown in summary (contains <p> tags)', async () => {
    const html = await generateResumeHtml({
      resume: fullResume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('<p>');
    expect(html).toContain('<strong>');
  });

  it('contains inline <style> block', async () => {
    const html = await generateResumeHtml({
      resume: fullResume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('<style>');
    expect(html).toContain('</style>');
  });

  it('does not contain external stylesheet or script references', async () => {
    const html = await generateResumeHtml({
      resume: fullResume,
      skills: fullSkills,
      projects: fullProjects,
      i18n: defaultI18n,
    });
    expect(html).not.toContain('<link rel="stylesheet"');
    expect(html).not.toContain('<script');
  });

  it('handles resume with minimal data (name only)', async () => {
    const html = await generateResumeHtml({
      resume: { name: 'Minimal' },
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('Minimal');
    expect(html).toContain('<!doctype html>');
  });

  it('renders social icons as inline SVGs in contact section', async () => {
    const html = await generateResumeHtml({
      resume: fullResume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('<svg');
    expect(html).toContain('janesmith');
    // Should not include "github:" prefix with icons
    expect(html).not.toContain('github:');
  });

  it('renders contact icons for email, phone, location, and website', async () => {
    const html = await generateResumeHtml({
      resume: fullResume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('jane@example.com');
    expect(html).toContain('+1 555-0100');
    expect(html).toContain('London, UK');
    expect(html).toContain('https://jane.dev');
  });

  it('renders skills as inline badges sorted by years descending', async () => {
    const skills = {
      categories: [
        {
          name: 'Backend',
          skills: [{ name: 'Go', level: 'Advanced', years: 3 }],
        },
        {
          name: 'Frontend',
          skills: [{ name: 'TypeScript', level: 'Expert', years: 8 }],
        },
      ],
    };
    const resume = {
      name: 'Test',
      experience: [{ title: 'Dev', skills: ['TypeScript', 'Go'] }],
    };
    const html = await generateResumeHtml({
      resume,
      skills,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('skill-badge');
    expect(html).toContain('skills-badges');
    expect(html).not.toContain('<ul');
    // TypeScript (8y) should appear before Go (3y)
    const tsPos = html.indexOf('TypeScript');
    const goPos = html.indexOf('Go');
    expect(tsPos).toBeLessThan(goPos);
  });

  it('filters skills to those referenced in experience', async () => {
    const skills = {
      categories: [
        {
          name: 'Languages',
          skills: [
            { name: 'TypeScript', level: 'Expert', years: 8 },
            { name: 'Rust', level: 'Beginner', years: 1 },
          ],
        },
      ],
    };
    const html = await generateResumeHtml({
      resume: fullResume,
      skills,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('TypeScript');
    expect(html).not.toContain('Rust');
  });

  it('shows all skills when no experience skills are referenced', async () => {
    const resume = { name: 'Test', tagline: 'Dev' };
    const skills = {
      categories: [
        {
          name: 'Languages',
          skills: [
            { name: 'TypeScript', level: 'Expert', years: 8 },
            { name: 'Rust', level: 'Beginner', years: 1 },
          ],
        },
      ],
    };
    const html = await generateResumeHtml({
      resume,
      skills,
      projects: null,
      i18n: defaultI18n,
    });
    expect(html).toContain('TypeScript');
    expect(html).toContain('Rust');
  });

  it('includes skills referenced in projects', async () => {
    const resume = { name: 'Test', tagline: 'Dev' };
    const skills = {
      categories: [
        {
          name: 'Languages',
          skills: [
            { name: 'TypeScript', level: 'Expert', years: 8 },
            { name: 'Rust', level: 'Beginner', years: 1 },
          ],
        },
      ],
    };
    const projects = {
      projects: [{ name: 'Tool', skills: ['Rust'] }],
    };
    const html = await generateResumeHtml({
      resume,
      skills,
      projects,
      i18n: defaultI18n,
    });
    expect(html).toContain('Rust');
    expect(html).not.toContain('TypeScript');
  });

  it('does not mutate input data', async () => {
    const resume = structuredClone(fullResume);
    const skills = structuredClone(fullSkills);
    const projects = structuredClone(fullProjects);

    await generateResumeHtml({
      resume,
      skills,
      projects,
      i18n: defaultI18n,
    });

    expect(resume).toEqual(fullResume);
    expect(skills).toEqual(fullSkills);
    expect(projects).toEqual(fullProjects);
  });
});
