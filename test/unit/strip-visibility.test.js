import { describe, it, expect } from 'vitest';
import {
  stripVisibility,
  isWebVisible,
} from '../../src/lib/utils/strip-visibility.js';

const DEFAULTS = {
  education: 'all',
  experience: 'all',
  experience_company: 'all',
  projects: 'all',
  community: 'all',
  accreditations: 'all',
  skills: 'all',
  blog: 'all',
  contact_email: 'none',
  contact_phone: 'none',
  location: 'all',
  contact_website: 'all',
  socials: 'all',
  links: 'all',
};

function makeResume() {
  return {
    name: 'Test User',
    tagline: 'Developer',
    contact: {
      email: 'test@example.com',
      phone: '+1234567890',
      location: { city: 'London', country: 'UK' },
      website: 'https://example.com',
      socials: [{ type: 'github', username: 'test' }],
      links: [{ title: 'github', url: 'https://github.com/test' }],
    },
    education: [
      { institution: 'Uni', qualification: 'BSc', start: '2012', end: '2015' },
    ],
    experience: [
      { title: 'Dev', company: 'Corp', start: '2020', end: 'present' },
    ],
    community: [{ name: 'OSS Group', role: 'Member' }],
    accreditations: [{ title: 'CKA', issuer: 'CNCF', date: '2023' }],
  };
}

function makeSkills() {
  return {
    categories: [{ name: 'Programming', skills: [{ name: 'JavaScript' }] }],
  };
}

function makeProjects() {
  return {
    projects: [{ name: 'Project', description: 'Test', start: '2025-01' }],
  };
}

function makeBlog() {
  return { posts: [{ slug: 'test', title: 'Test Post' }], tags: {} };
}

describe('isWebVisible', () => {
  it('returns true for "all"', () => {
    expect(isWebVisible('all')).toBe(true);
  });

  it('returns true for "web"', () => {
    expect(isWebVisible('web')).toBe(true);
  });

  it('returns false for "print"', () => {
    expect(isWebVisible('print')).toBe(false);
  });

  it('returns false for "none"', () => {
    expect(isWebVisible('none')).toBe(false);
  });
});

describe('stripVisibility', () => {
  it('default visibility preserves all data', () => {
    const allVisible = {
      ...DEFAULTS,
      contact_email: 'all',
      contact_phone: 'all',
    };
    const { resume } = stripVisibility(
      allVisible,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.email).toBe('test@example.com');
    expect(resume.contact.phone).toBe('+1234567890');
    expect(resume.education).toHaveLength(1);
    expect(resume.experience).toHaveLength(1);
  });

  it('contact_email="none" strips contact.email from output', () => {
    const vis = { ...DEFAULTS, contact_email: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.email).toBeUndefined();
  });

  it('contact_phone="none" strips contact.phone from output', () => {
    const vis = { ...DEFAULTS, contact_phone: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.phone).toBeUndefined();
  });

  it('location="none" strips contact.location', () => {
    const vis = { ...DEFAULTS, location: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.location).toBeUndefined();
  });

  it('contact_website="none" strips contact.website', () => {
    const vis = { ...DEFAULTS, contact_website: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.website).toBeUndefined();
  });

  it('socials="none" strips contact.socials array', () => {
    const vis = { ...DEFAULTS, socials: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.socials).toBeUndefined();
  });

  it('links="none" strips contact.links array', () => {
    const vis = { ...DEFAULTS, links: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.links).toBeUndefined();
  });

  it('education="none" removes education array entirely', () => {
    const vis = { ...DEFAULTS, education: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.education).toBeUndefined();
  });

  it('experience="none" removes experience array entirely', () => {
    const vis = { ...DEFAULTS, experience: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.experience).toBeUndefined();
  });

  it('community="none" removes community array', () => {
    const vis = { ...DEFAULTS, community: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.community).toBeUndefined();
  });

  it('accreditations="none" removes accreditations array', () => {
    const vis = { ...DEFAULTS, accreditations: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.accreditations).toBeUndefined();
  });

  it('skills="none" returns null for skills data', () => {
    const vis = { ...DEFAULTS, skills: 'none' };
    const { skills } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(skills).toBeNull();
  });

  it('projects="none" returns null for projects data', () => {
    const vis = { ...DEFAULTS, projects: 'none' };
    const { projects } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(projects).toBeNull();
  });

  it('"web" value makes data visible for web output', () => {
    const vis = { ...DEFAULTS, contact_email: 'web', skills: 'web' };
    const { resume, skills } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.email).toBe('test@example.com');
    expect(skills).not.toBeNull();
  });

  it('"print" value hides data from web output', () => {
    const vis = { ...DEFAULTS, contact_email: 'print', skills: 'print' };
    const { resume, skills } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.email).toBeUndefined();
    expect(skills).toBeNull();
  });

  it('experience_company="none" strips company from each experience entry', () => {
    const vis = { ...DEFAULTS, experience_company: 'none' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.experience).toHaveLength(1);
    expect(resume.experience[0].title).toBe('Dev');
    expect(resume.experience[0].company).toBeUndefined();
  });

  it('experience_company="all" preserves company field', () => {
    const vis = { ...DEFAULTS, experience_company: 'all' };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.experience[0].company).toBe('Corp');
  });

  it('experience_company="none" with multiple entries strips all companies', () => {
    const vis = { ...DEFAULTS, experience_company: 'none' };
    const multiResume = makeResume();
    multiResume.experience.push({
      title: 'Junior',
      company: 'Startup',
      start: '2018',
      end: '2020',
    });
    const { resume } = stripVisibility(
      vis,
      multiResume,
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.experience).toHaveLength(2);
    expect(resume.experience[0].company).toBeUndefined();
    expect(resume.experience[1].company).toBeUndefined();
  });

  it('experience="none" takes precedence — no experience_company stripping needed', () => {
    const vis = {
      ...DEFAULTS,
      experience: 'none',
      experience_company: 'none',
    };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.experience).toBeUndefined();
  });

  it('all flags "none" strips everything — output contains NO hidden data', () => {
    const allNone = {
      education: 'none',
      experience: 'none',
      experience_company: 'none',
      projects: 'none',
      community: 'none',
      accreditations: 'none',
      skills: 'none',
      blog: 'none',
      contact_email: 'none',
      contact_phone: 'none',
      location: 'none',
      contact_website: 'none',
      socials: 'none',
      links: 'none',
    };
    const result = stripVisibility(
      allNone,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(result.skills).toBeNull();
    expect(result.projects).toBeNull();
    expect(result.blog).toBeNull();
    expect(result.resume.education).toBeUndefined();
    expect(result.resume.experience).toBeUndefined();
    expect(result.resume.community).toBeUndefined();
    expect(result.resume.accreditations).toBeUndefined();
    expect(result.resume.contact.email).toBeUndefined();
    expect(result.resume.contact.phone).toBeUndefined();
    expect(result.resume.contact.location).toBeUndefined();
    expect(result.resume.contact.website).toBeUndefined();
    expect(result.resume.contact.socials).toBeUndefined();
    expect(result.resume.contact.links).toBeUndefined();
  });

  it('original input objects are not mutated', () => {
    const vis = {
      ...DEFAULTS,
      contact_email: 'none',
      education: 'none',
      skills: 'none',
    };
    const originalResume = makeResume();
    const originalSkills = makeSkills();
    stripVisibility(
      vis,
      originalResume,
      originalSkills,
      makeProjects(),
      makeBlog(),
    );
    expect(originalResume.contact.email).toBe('test@example.com');
    expect(originalResume.education).toHaveLength(1);
    expect(originalSkills.categories).toHaveLength(1);
  });
});
