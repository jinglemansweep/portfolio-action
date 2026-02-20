import { describe, it, expect } from 'vitest';
import { stripVisibility } from '../../src/lib/utils/strip-visibility.js';

const DEFAULTS = {
  education: true,
  experience: true,
  projects: true,
  community: true,
  accreditations: true,
  skills: true,
  blog: true,
  email: false,
  phone: false,
  location: true,
  website: true,
  socials: true,
  links: true,
};

function makeResume() {
  return {
    name: 'Test User',
    tagline: 'Developer',
    contact: {
      email: 'test@example.com',
      phone: '+1234567890',
      location: 'London, UK',
      website: 'https://example.com',
      socials: [{ type: 'github', username: 'test' }],
      links: [{ platform: 'github', url: 'https://github.com/test' }],
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

describe('stripVisibility', () => {
  it('default visibility preserves all data', () => {
    const allTrue = { ...DEFAULTS, email: true, phone: true };
    const { resume } = stripVisibility(
      allTrue,
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

  it('email=false strips contact.email from output', () => {
    const vis = { ...DEFAULTS, email: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.email).toBeUndefined();
  });

  it('phone=false strips contact.phone from output', () => {
    const vis = { ...DEFAULTS, phone: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.phone).toBeUndefined();
  });

  it('location=false strips contact.location', () => {
    const vis = { ...DEFAULTS, location: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.location).toBeUndefined();
  });

  it('website=false strips contact.website', () => {
    const vis = { ...DEFAULTS, website: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.website).toBeUndefined();
  });

  it('socials=false strips contact.socials array', () => {
    const vis = { ...DEFAULTS, socials: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.socials).toBeUndefined();
  });

  it('links=false strips contact.links array', () => {
    const vis = { ...DEFAULTS, links: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.contact.links).toBeUndefined();
  });

  it('education=false removes education array entirely', () => {
    const vis = { ...DEFAULTS, education: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.education).toBeUndefined();
  });

  it('experience=false removes experience array entirely', () => {
    const vis = { ...DEFAULTS, experience: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.experience).toBeUndefined();
  });

  it('community=false removes community array', () => {
    const vis = { ...DEFAULTS, community: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.community).toBeUndefined();
  });

  it('accreditations=false removes accreditations array', () => {
    const vis = { ...DEFAULTS, accreditations: false };
    const { resume } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(resume.accreditations).toBeUndefined();
  });

  it('skills=false returns null for skills data', () => {
    const vis = { ...DEFAULTS, skills: false };
    const { skills } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(skills).toBeNull();
  });

  it('projects=false returns null for projects data', () => {
    const vis = { ...DEFAULTS, projects: false };
    const { projects } = stripVisibility(
      vis,
      makeResume(),
      makeSkills(),
      makeProjects(),
      makeBlog(),
    );
    expect(projects).toBeNull();
  });

  it('all flags false strips everything — output contains NO hidden data', () => {
    const allFalse = {
      education: false,
      experience: false,
      projects: false,
      community: false,
      accreditations: false,
      skills: false,
      blog: false,
      email: false,
      phone: false,
      location: false,
      website: false,
      socials: false,
      links: false,
    };
    const result = stripVisibility(
      allFalse,
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
      email: false,
      education: false,
      skills: false,
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
