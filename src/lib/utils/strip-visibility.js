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
 * @param {object} visibility - Visibility flags from site.yml
 * @param {object} resume - Parsed resume data
 * @param {object|null} skills - Parsed skills data
 * @param {object|null} projects - Parsed projects data
 * @param {object|null} blog - Parsed blog data
 * @returns {{ resume: object, skills: object|null, projects: object|null, blog: object|null }}
 */
export function stripVisibility(visibility, resume, skills, projects, blog) {
  const strippedResume = stripResume(visibility, resume);
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

function stripResume(visibility, resume) {
  const result = structuredClone(resume);

  if (result.contact) {
    if (!isWebVisible(visibility.contact_email)) delete result.contact.email;
    if (!isWebVisible(visibility.contact_phone)) delete result.contact.phone;
    if (!isWebVisible(visibility.location)) delete result.contact.location;
    if (!isWebVisible(visibility.contact_website))
      delete result.contact.website;
    if (!isWebVisible(visibility.socials)) delete result.contact.socials;
    if (!isWebVisible(visibility.links)) delete result.contact.links;
  }

  if (!isWebVisible(visibility.education)) delete result.education;
  if (!isWebVisible(visibility.experience)) delete result.experience;
  if (!isWebVisible(visibility.community)) delete result.community;
  if (!isWebVisible(visibility.accreditations)) delete result.accreditations;

  if (result.experience && !isWebVisible(visibility.experience_company)) {
    for (const exp of result.experience) {
      delete exp.company;
    }
  }

  return result;
}
