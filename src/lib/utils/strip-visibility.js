/**
 * Strip hidden data from resume, skills, and projects based on visibility flags.
 * Returns new objects — does not mutate inputs.
 */

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
  const strippedSkills = visibility.skills ? skills : null;
  const strippedProjects = visibility.projects ? projects : null;
  const strippedBlog = visibility.blog ? blog : null;

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
    if (!visibility.email) delete result.contact.email;
    if (!visibility.phone) delete result.contact.phone;
    if (!visibility.location) delete result.contact.location;
    if (!visibility.website) delete result.contact.website;
    if (!visibility.socials) delete result.contact.socials;
    if (!visibility.links) delete result.contact.links;
  }

  if (!visibility.education) delete result.education;
  if (!visibility.experience) delete result.experience;
  if (!visibility.community) delete result.community;
  if (!visibility.accreditations) delete result.accreditations;

  return result;
}
