/**
 * Validate parsed YAML data against expected schemas.
 * Returns an array of validation error objects.
 */

/**
 * @param {object} site - Parsed site.yml data
 * @param {object} resume - Parsed resume.yml data
 * @param {object} skills - Parsed skills.yml data
 * @param {object} projects - Parsed projects.yml data
 * @returns {Array<{file: string, field: string, reason: string}>}
 */
export function validate(site, resume, skills, projects) {
  const errors = [];

  errors.push(...validateSite(site));
  errors.push(...validateResume(resume));
  errors.push(...validateSkills(skills));
  errors.push(...validateProjects(projects));

  return errors;
}

function validateSite(data) {
  const errors = [];
  const file = 'site.yml';

  if (!data || typeof data !== 'object') {
    errors.push({ file, field: '(root)', reason: 'must be a YAML mapping' });
    return errors;
  }

  if (!data.lang || typeof data.lang !== 'string') {
    errors.push({
      file,
      field: 'lang',
      reason: 'is required and must be a string',
    });
  }

  return errors;
}

function validateResume(data) {
  const errors = [];
  const file = 'resume.yml';

  if (!data || typeof data !== 'object') {
    errors.push({ file, field: '(root)', reason: 'must be a YAML mapping' });
    return errors;
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push({
      file,
      field: 'name',
      reason: 'is required and must be a string',
    });
  }
  if (!data.tagline || typeof data.tagline !== 'string') {
    errors.push({
      file,
      field: 'tagline',
      reason: 'is required and must be a string',
    });
  }

  return errors;
}

function validateSkills(data) {
  const errors = [];
  const file = 'skills.yml';

  if (!data || typeof data !== 'object') {
    errors.push({ file, field: '(root)', reason: 'must be a YAML mapping' });
    return errors;
  }

  if (!Array.isArray(data.categories)) {
    errors.push({
      file,
      field: 'categories',
      reason: 'is required and must be an array',
    });
    return errors;
  }

  for (let i = 0; i < data.categories.length; i++) {
    const cat = data.categories[i];
    if (!cat || typeof cat !== 'object') {
      errors.push({
        file,
        field: `categories[${i}]`,
        reason: 'must be an object',
      });
      continue;
    }
    if (!Array.isArray(cat.skills)) {
      errors.push({
        file,
        field: `categories[${i}].skills`,
        reason: 'must be an array',
      });
    }
  }

  return errors;
}

function validateProjects(data) {
  const errors = [];
  const file = 'projects.yml';

  if (!data || typeof data !== 'object') {
    errors.push({ file, field: '(root)', reason: 'must be a YAML mapping' });
    return errors;
  }

  if (!Array.isArray(data.projects)) {
    errors.push({
      file,
      field: 'projects',
      reason: 'is required and must be an array',
    });
    return errors;
  }

  for (let i = 0; i < data.projects.length; i++) {
    const proj = data.projects[i];
    if (!proj || typeof proj !== 'object') {
      errors.push({
        file,
        field: `projects[${i}]`,
        reason: 'must be an object',
      });
      continue;
    }
    if (!proj.name || typeof proj.name !== 'string') {
      errors.push({
        file,
        field: `projects[${i}].name`,
        reason: 'is required and must be a string',
      });
    }
    if (!proj.description || typeof proj.description !== 'string') {
      errors.push({
        file,
        field: `projects[${i}].description`,
        reason: 'is required and must be a string',
      });
    }
    if (!proj.start) {
      errors.push({
        file,
        field: `projects[${i}].start`,
        reason: 'is required',
      });
    }
  }

  return errors;
}
