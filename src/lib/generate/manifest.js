/**
 * Generate site manifest with routes and nav.
 * @param {object} options
 * @param {object} options.visibility - Visibility flags
 * @param {object|null} options.skills - Stripped skills data
 * @param {object|null} options.projects - Stripped projects data
 * @param {object|null} options.blog - Stripped blog data
 * @param {Array} options.pages - Compiled pages array
 * @param {object} options.i18n - Resolved i18n bundle
 * @returns {{ routes: string[], nav: Array<{label: string, path: string}> }}
 */
export function generateManifest(options) {
  const { visibility, skills, projects, blog, pages, i18n } = options;
  const labels = i18n?.labels || {};

  const routes = ['/'];
  const nav = [{ label: labels.nav_home || 'Home', path: '/' }];

  // Skills route
  if (visibility.skills && skills) {
    const skillsPath = `/${labels.route_skills || 'skills'}`;
    routes.push(skillsPath);
    nav.push({ label: labels.nav_skills || 'Skills', path: skillsPath });
  }

  // Projects route
  if (visibility.projects && projects?.projects?.length > 0) {
    const projectsPath = `/${labels.route_projects || 'projects'}`;
    routes.push(projectsPath);
    nav.push({
      label: labels.nav_projects || 'Projects',
      path: projectsPath,
    });
  }

  // Blog route
  if (visibility.blog && blog?.posts?.length > 0) {
    const blogPath = `/${labels.route_blog || 'blog'}`;
    routes.push(blogPath);
    nav.push({ label: labels.nav_blog || 'Blog', path: blogPath });
  }

  // Custom pages sorted by nav_order
  if (pages?.length > 0) {
    const sortedPages = [...pages].sort(
      (a, b) => (a.meta?.nav_order ?? 999) - (b.meta?.nav_order ?? 999),
    );
    for (const page of sortedPages) {
      const pagePath = `/${page.slug}`;
      routes.push(pagePath);
      if (page.meta?.show_in_nav !== false) {
        nav.push({ label: page.title, path: pagePath });
      }
    }
  }

  return { routes, nav };
}
