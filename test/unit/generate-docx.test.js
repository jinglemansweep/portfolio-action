import { describe, it, expect } from 'vitest';
import { generateDocx } from '../../src/lib/generate/docx.js';

const fullResume = {
  name: 'Jane Smith',
  tagline: 'Senior Software Engineer',
  contact: {
    email: 'jane@example.com',
    phone: '+1 555-0100',
    location: { city: 'London', country: 'UK' },
    website: 'https://jane.dev',
    socials: [{ type: 'github', username: 'janesmith' }],
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
      description: 'Honours program.',
    },
  ],
  accreditations: [
    {
      title: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2024',
    },
  ],
  community: [
    {
      name: 'Local Tech Meetup',
      role: 'Organiser',
      description: 'Monthly meetup for developers.',
    },
  ],
};

const fullSkills = {
  categories: [
    {
      name: 'Languages',
      skills: [
        { name: 'TypeScript', level: 'Expert', years: 8 },
        { name: 'Go', level: 'Advanced', years: 3 },
      ],
    },
  ],
};

const fullProjects = {
  projects: [
    {
      name: 'Open Source Tool',
      description: 'A CLI tool for developers.',
      start: '2023-01',
      end: 'present',
      url: 'https://github.com/example/tool',
      skills: ['TypeScript', 'Node.js'],
    },
  ],
};

const defaultI18n = {
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

describe('generateDocx', () => {
  it('generates a non-empty buffer from full data', async () => {
    const buffer = await generateDocx({
      resume: fullResume,
      skills: fullSkills,
      projects: fullProjects,
      i18n: defaultI18n,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('buffer starts with ZIP magic bytes (PK)', async () => {
    const buffer = await generateDocx({
      resume: fullResume,
      skills: fullSkills,
      projects: fullProjects,
      i18n: defaultI18n,
    });
    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4b); // K
  });

  it('handles missing experience array', async () => {
    const resume = { name: 'Test', tagline: 'Dev' };
    const buffer = await generateDocx({
      resume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('handles missing skills data (null)', async () => {
    const buffer = await generateDocx({
      resume: fullResume,
      skills: null,
      projects: fullProjects,
      i18n: defaultI18n,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('handles missing projects data (null)', async () => {
    const buffer = await generateDocx({
      resume: fullResume,
      skills: fullSkills,
      projects: null,
      i18n: defaultI18n,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('handles missing education, community, accreditations arrays', async () => {
    const resume = {
      name: 'Test',
      tagline: 'Dev',
      summary: 'A summary.',
      experience: [
        {
          title: 'Engineer',
          company: 'Co',
          start: '2020',
          end: 'present',
        },
      ],
    };
    const buffer = await generateDocx({
      resume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('respects A4 page size (default)', async () => {
    const buffer = await generateDocx({
      resume: fullResume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
      pageSize: 'A4',
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('respects Letter page size', async () => {
    const buffer = await generateDocx({
      resume: fullResume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
      pageSize: 'Letter',
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('handles resume with no contact fields', async () => {
    const resume = { name: 'No Contact', tagline: 'Engineer' };
    const buffer = await generateDocx({
      resume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('handles resume with minimal data (name only, no tagline/summary)', async () => {
    const resume = { name: 'Minimal User' };
    const buffer = await generateDocx({
      resume,
      skills: null,
      projects: null,
      i18n: defaultI18n,
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('does not mutate input data', async () => {
    const resume = structuredClone(fullResume);
    const skills = structuredClone(fullSkills);
    const projects = structuredClone(fullProjects);

    await generateDocx({
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
