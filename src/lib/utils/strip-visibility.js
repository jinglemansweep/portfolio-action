/**
 * Strip hidden data from resume, skills, and projects based on visibility flags.
 * Returns new objects — does not mutate inputs.
 */

/**
 * Check if a visibility value means "visible on web".
 * @param {string} value - Visibility enum value ('all', 'web', 'print', 'none')
 * @returns {boolean}
 */
export function isWebVisible(value) {
  return value === 'all' || value === 'web';
}

/**
 * Check if a visibility value means "visible in print" (PDF/DOCX).
 * @param {string} value - Visibility enum value ('all', 'web', 'print', 'none')
 * @returns {boolean}
 */
export function isPrintVisible(value) {
  return value === 'all' || value === 'print';
}

/**
 * @param {object} visibility - Visibility flags from site.yml
 * @param {object} resume - Parsed resume data
 * @param {object|null} skills - Parsed skills data
 * @param {object|null} projects - Parsed projects data
 * @param {object|null} blog - Parsed blog data
 * @returns {{ resume: object, skills: object|null, projects: object|null, blog: object|null }}
 */
export function stripVisibility(visibility, resume, skills, projects, blog) {
  const strippedResume = stripResume(visibility, resume, isWebVisible);
  const strippedSkills = isWebVisible(visibility.skills) ? skills : null;
  const strippedProjects = isWebVisible(visibility.projects) ? projects : null;
  const strippedBlog = isWebVisible(visibility.blog) ? blog : null;

  return {
    resume: strippedResume,
    skills: strippedSkills,
    projects: strippedProjects,
    blog: strippedBlog,
  };
}

/**
 * Strip data for print output (PDF/DOCX). Keeps 'all' and 'print' visible.
 * @param {object} visibility - Visibility flags from site.yml
 * @param {object} resume - Parsed resume data
 * @param {object|null} skills - Parsed skills data
 * @param {object|null} projects - Parsed projects data
 * @returns {{ resume: object, skills: object|null, projects: object|null }}
 */
export function stripVisibilityForPrint(visibility, resume, skills, projects) {
  const strippedResume = stripResume(visibility, resume, isPrintVisible);
  const strippedSkills = isPrintVisible(visibility.skills) ? skills : null;
  const strippedProjects = isPrintVisible(visibility.projects)
    ? projects
    : null;

  return {
    resume: strippedResume,
    skills: strippedSkills,
    projects: strippedProjects,
  };
}

function stripResume(visibility, resume, isVisible) {
  const result = structuredClone(resume);

  if (result.contact) {
    if (!isVisible(visibility.contact_email)) delete result.contact.email;
    if (!isVisible(visibility.contact_phone)) delete result.contact.phone;
    if (!isVisible(visibility.location)) delete result.contact.location;
    if (!isVisible(visibility.contact_website)) delete result.contact.website;
    if (!isVisible(visibility.socials)) delete result.contact.socials;
    if (!isVisible(visibility.links)) delete result.contact.links;
  }

  if (!isVisible(visibility.education)) delete result.education;
  if (!isVisible(visibility.experience)) delete result.experience;
  if (!isVisible(visibility.community)) delete result.community;
  if (!isVisible(visibility.accreditations)) delete result.accreditations;

  if (result.experience && !isVisible(visibility.experience_company)) {
    for (const exp of result.experience) {
      delete exp.company;
    }
  }

  return result;
}
