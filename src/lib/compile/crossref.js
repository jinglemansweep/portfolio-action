/**
 * Build cross-reference index between skills, experience, and projects.
 * @param {object|null} skills - Parsed skills data (categories array)
 * @param {object|null} resume - Parsed resume data (may have experience)
 * @param {object|null} projects - Parsed projects data (projects array)
 * @returns {{ crossref: object, warnings: string[] }}
 */
export function compileCrossref(skills, resume, projects) {
  const warnings = [];

  // Build normalised skill index
  const skillIndex = new Map();
  if (skills?.categories) {
    for (const cat of skills.categories) {
      if (!cat.skills) continue;
      for (const skill of cat.skills) {
        skillIndex.set(skill.name.toLowerCase(), {
          name: skill.name,
          level: skill.level || null,
          category: cat.name,
        });
      }
    }
  }

  const skillToExperience = {};
  const skillToProject = {};
  const experienceToSkills = {};
  const projectToSkills = {};

  // Match experience skills
  if (resume?.experience) {
    for (const exp of resume.experience) {
      if (!exp.skills) continue;
      const expKey = slugify(
        exp.company ? `${exp.title}--${exp.company}` : exp.title,
      );
      const matchedSkills = [];

      for (const skillName of exp.skills) {
        const key = skillName.toLowerCase();
        const matched = skillIndex.get(key);
        if (matched) {
          if (!skillToExperience[key]) skillToExperience[key] = [];
          skillToExperience[key].push({
            title: exp.title,
            ...(exp.company ? { company: exp.company } : {}),
            start: exp.start,
            end: exp.end || null,
          });
          matchedSkills.push({
            name: matched.name,
            level: matched.level,
            category: matched.category,
          });
        } else if (skillIndex.size > 0) {
          warnings.push(
            `Skill "${skillName}" referenced in experience "${exp.title}" not found in skills.yml`,
          );
        }
      }

      if (matchedSkills.length > 0) {
        experienceToSkills[expKey] = matchedSkills;
      }
    }
  }

  // Match project skills
  if (projects?.projects) {
    for (const proj of projects.projects) {
      if (!proj.skills) continue;
      const projKey = slugify(proj.name);
      const matchedSkills = [];

      for (const skillName of proj.skills) {
        const key = skillName.toLowerCase();
        const matched = skillIndex.get(key);
        if (matched) {
          if (!skillToProject[key]) skillToProject[key] = [];
          skillToProject[key].push({
            name: proj.name,
            start: proj.start,
          });
          matchedSkills.push({
            name: matched.name,
            level: matched.level,
            category: matched.category,
          });
        } else if (skillIndex.size > 0) {
          warnings.push(
            `Skill "${skillName}" referenced in project "${proj.name}" not found in skills.yml`,
          );
        }
      }

      if (matchedSkills.length > 0) {
        projectToSkills[projKey] = matchedSkills;
      }
    }
  }

  return {
    crossref: {
      skillToExperience,
      skillToProject,
      experienceToSkills,
      projectToSkills,
    },
    warnings,
  };
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
