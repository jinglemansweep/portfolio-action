import { describe, it, expect } from 'vitest';
import { compileCrossref } from '../../src/lib/compile-crossref.js';

const skills = {
  categories: [
    {
      name: 'DevOps',
      skills: [
        { name: 'Docker', level: 'expert' },
        { name: 'Kubernetes', level: 'advanced' },
      ],
    },
    {
      name: 'Programming',
      skills: [{ name: 'Python', level: 'advanced' }],
    },
  ],
};

const resume = {
  experience: [
    {
      title: 'Senior Engineer',
      company: 'Corp',
      start: '2020',
      end: 'present',
      skills: ['Docker', 'Kubernetes'],
    },
    {
      title: 'DevOps Engineer',
      company: 'Other',
      start: '2017',
      end: '2019',
      skills: ['docker', 'Python'],
    },
  ],
};

const projects = {
  projects: [
    {
      name: 'My Project',
      start: '2024-01',
      skills: ['Docker', 'Python'],
    },
    {
      name: 'Side Project',
      start: '2023-06',
      skills: ['Kubernetes'],
    },
  ],
};

describe('compileCrossref', () => {
  it('matches skills case-insensitively (Docker === docker)', () => {
    const { crossref } = compileCrossref(skills, resume, projects);
    expect(crossref.skillToExperience['docker']).toHaveLength(2);
  });

  it('builds correct skillToExperience map', () => {
    const { crossref } = compileCrossref(skills, resume, projects);
    expect(crossref.skillToExperience['docker'][0].title).toBe(
      'Senior Engineer',
    );
    expect(crossref.skillToExperience['kubernetes']).toHaveLength(1);
  });

  it('builds correct skillToProject map', () => {
    const { crossref } = compileCrossref(skills, resume, projects);
    expect(crossref.skillToProject['docker']).toHaveLength(1);
    expect(crossref.skillToProject['docker'][0].name).toBe('My Project');
    expect(crossref.skillToProject['python']).toHaveLength(1);
  });

  it('builds correct experienceToSkills map', () => {
    const { crossref } = compileCrossref(skills, resume, projects);
    const key = 'senior-engineer-corp';
    expect(crossref.experienceToSkills[key]).toHaveLength(2);
    expect(
      crossref.experienceToSkills[key].some((s) => s.name === 'Docker'),
    ).toBe(true);
  });

  it('builds correct projectToSkills map', () => {
    const { crossref } = compileCrossref(skills, resume, projects);
    expect(crossref.projectToSkills['my-project']).toHaveLength(2);
  });

  it('produces warnings for unmatched skill names', () => {
    const resumeWithUnmatched = {
      experience: [
        {
          title: 'Dev',
          company: 'Co',
          start: '2020',
          skills: ['NonExistent'],
        },
      ],
    };
    const { warnings } = compileCrossref(skills, resumeWithUnmatched, null);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('NonExistent');
  });

  it('handles null skills data (returns empty crossref)', () => {
    const { crossref, warnings } = compileCrossref(null, resume, projects);
    expect(crossref.skillToExperience).toEqual({});
    expect(crossref.skillToProject).toEqual({});
    expect(warnings).toHaveLength(0);
  });

  it('handles null projects data (omits project mappings)', () => {
    const { crossref } = compileCrossref(skills, resume, null);
    expect(crossref.skillToProject).toEqual({});
    expect(crossref.projectToSkills).toEqual({});
    expect(Object.keys(crossref.skillToExperience).length).toBeGreaterThan(0);
  });

  it('handles null experience data (omits experience mappings)', () => {
    const { crossref } = compileCrossref(skills, null, projects);
    expect(crossref.skillToExperience).toEqual({});
    expect(crossref.experienceToSkills).toEqual({});
    expect(Object.keys(crossref.skillToProject).length).toBeGreaterThan(0);
  });
});
