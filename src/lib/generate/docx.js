import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  BorderStyle,
  LevelFormat,
} from 'docx';

const PAGE_SIZES = {
  A4: { width: 11906, height: 16838 },
  Letter: { width: 12240, height: 15840 },
};

const CM_TO_DXA = 567;

const MARGINS = {
  top: 1 * CM_TO_DXA,
  bottom: 1 * CM_TO_DXA,
  left: 1.2 * CM_TO_DXA,
  right: 1.2 * CM_TO_DXA,
};

const FONT = 'Calibri';
const BODY_SIZE = 20; // 10pt in half-points
const NAME_SIZE = 28; // 14pt
const SECTION_HEADING_SIZE = 24; // 12pt
const SUBTITLE_SIZE = 22; // 11pt
const SMALL_SIZE = 18; // 9pt

/**
 * Generate a DOCX resume buffer from stripped data.
 * @param {object} options
 * @param {object} options.resume - Stripped resume data
 * @param {object|null} options.skills - Stripped skills data (categories)
 * @param {object|null} options.projects - Stripped projects data
 * @param {object} options.i18n - Resolved i18n labels
 * @param {string} [options.pageSize='A4'] - Page size: 'A4' or 'Letter'
 * @param {object} [options.theme] - Theme config with primary colour
 * @returns {Promise<Buffer>} DOCX file as a Buffer
 */
export async function generateDocx({
  resume,
  skills,
  projects,
  i18n,
  pageSize = 'A4',
  theme,
}) {
  const data = structuredClone(resume);
  const skillsData = skills ? structuredClone(skills) : null;
  const projectsData = projects ? structuredClone(projects) : null;
  const labels = i18n?.labels || {};
  const primary = theme?.primary || '#2563eb';
  const page = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;

  const sections = [];

  // Header: name, tagline, contact
  sections.push(...buildHeader(data, labels, primary));

  // Summary
  if (data.summary) {
    sections.push(...buildSectionHeading(labels.summary || 'Summary', primary));
    sections.push(...buildSummary(data.summary));
  }

  // Experience
  if (data.experience?.length > 0) {
    sections.push(
      ...buildSectionHeading(labels.experience || 'Experience', primary),
    );
    sections.push(...buildExperience(data.experience, labels, page));
  }

  // Education
  if (data.education?.length > 0) {
    sections.push(
      ...buildSectionHeading(labels.education || 'Education', primary),
    );
    sections.push(...buildEducation(data.education, page, labels));
  }

  // Accreditations
  if (data.accreditations?.length > 0) {
    sections.push(
      ...buildSectionHeading(
        labels.accreditations || 'Accreditations',
        primary,
      ),
    );
    sections.push(...buildAccreditations(data.accreditations, page));
  }

  // Skills
  if (skillsData?.categories?.length > 0) {
    sections.push(...buildSectionHeading(labels.skills || 'Skills', primary));
    sections.push(...buildSkills(skillsData.categories, labels));
  }

  // Community
  if (data.community?.length > 0) {
    sections.push(
      ...buildSectionHeading(labels.community || 'Community', primary),
    );
    sections.push(...buildCommunity(data.community));
  }

  // Projects
  if (projectsData?.projects?.length > 0) {
    sections.push(
      ...buildSectionHeading(labels.projects || 'Projects', primary),
    );
    sections.push(...buildProjects(projectsData.projects, labels, page));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: page.width, height: page.height },
            margin: MARGINS,
          },
        },
        children: sections,
      },
    ],
    numbering: {
      config: [
        {
          reference: 'bullet-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 180 } } },
            },
          ],
        },
      ],
    },
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

function buildHeader(data, labels, primary) {
  const paragraphs = [];

  // Name
  if (data.name) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.name,
            bold: true,
            size: NAME_SIZE,
            font: FONT,
            color: primary.replace('#', ''),
          }),
        ],
        spacing: { after: 40 },
      }),
    );
  }

  // Tagline
  if (data.tagline) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.tagline,
            size: SUBTITLE_SIZE,
            font: FONT,
            color: '555555',
          }),
        ],
        spacing: { after: 80 },
      }),
    );
  }

  // Contact details
  const contactParts = buildContactParts(data);
  if (contactParts.length > 0) {
    const runs = [];
    for (let i = 0; i < contactParts.length; i++) {
      if (i > 0) {
        runs.push(
          new TextRun({
            text: '  |  ',
            size: SMALL_SIZE,
            font: FONT,
            color: '999999',
          }),
        );
      }
      runs.push(
        new TextRun({
          text: contactParts[i],
          size: SMALL_SIZE,
          font: FONT,
          color: '333333',
        }),
      );
    }
    paragraphs.push(new Paragraph({ children: runs, spacing: { after: 200 } }));
  }

  return paragraphs;
}

function buildContactParts(data) {
  const parts = [];
  const contact = data.contact || {};

  if (contact.email) parts.push(contact.email);
  if (contact.phone) parts.push(contact.phone);

  if (contact.location) {
    const loc =
      typeof contact.location === 'string'
        ? contact.location
        : [
            contact.location.city,
            contact.location.region,
            contact.location.country,
          ]
            .filter(Boolean)
            .join(', ');
    if (loc) parts.push(loc);
  }

  if (contact.website) parts.push(contact.website);

  if (contact.socials) {
    for (const s of contact.socials) {
      if (s.username) parts.push(`${s.type || ''}: ${s.username}`.trim());
    }
  }

  if (contact.links) {
    for (const l of contact.links) {
      if (l.url) parts.push(l.url);
    }
  }

  return parts;
}

function buildSectionHeading(text, primary) {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: SECTION_HEADING_SIZE,
          font: FONT,
          color: primary.replace('#', ''),
        }),
      ],
      spacing: { before: 240, after: 80 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: primary.replace('#', ''),
          space: 4,
        },
      },
    }),
  ];
}

function buildSummary(summary) {
  // Strip markdown formatting to plain text
  const text = summary
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();

  return text
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map(
      (p) =>
        new Paragraph({
          children: [
            new TextRun({
              text: p.replace(/\n/g, ' ').trim(),
              size: BODY_SIZE,
              font: FONT,
            }),
          ],
          spacing: { after: 120 },
        }),
    );
}

function buildExperience(experience, labels, page) {
  const paragraphs = [];
  const rightTabPos = page.width - MARGINS.left - MARGINS.right;

  for (const exp of experience) {
    // Title + Company | Dates
    const titleParts = [];
    if (exp.title) titleParts.push(exp.title);
    if (exp.company) titleParts.push(exp.company);
    const titleText = titleParts.join(' — ');

    const dateText = formatDateRange(exp.start, exp.end, labels);

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: titleText,
            bold: true,
            size: BODY_SIZE,
            font: FONT,
          }),
          new TextRun({ text: '\t', size: BODY_SIZE, font: FONT }),
          new TextRun({
            text: dateText,
            size: SMALL_SIZE,
            font: FONT,
            color: '666666',
          }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: rightTabPos }],
        spacing: { before: 160, after: 40 },
      }),
    );

    // Description
    if (exp.description) {
      const descText = stripMarkdown(exp.description);
      for (const line of descText.split(/\n\n+/).filter((l) => l.trim())) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace(/\n/g, ' ').trim(),
                size: BODY_SIZE,
                font: FONT,
              }),
            ],
            spacing: { after: 60 },
          }),
        );
      }
    }

    // Skills
    if (exp.skills?.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${labels.experience_skills || 'Skills'}: `,
              bold: true,
              size: SMALL_SIZE,
              font: FONT,
              color: '666666',
            }),
            new TextRun({
              text: exp.skills.join(', '),
              size: SMALL_SIZE,
              font: FONT,
              color: '666666',
            }),
          ],
          spacing: { after: 80 },
        }),
      );
    }
  }

  return paragraphs;
}

function buildEducation(education, page, labels) {
  const paragraphs = [];
  const rightTabPos = page.width - MARGINS.left - MARGINS.right;

  for (const edu of education) {
    // Institution + Qualification | Dates
    const titleParts = [];
    if (edu.institution) titleParts.push(edu.institution);
    if (edu.qualification) titleParts.push(edu.qualification);
    const titleText = titleParts.join(' — ');

    const dateText = formatDateRange(edu.start, edu.end, labels);

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: titleText,
            bold: true,
            size: BODY_SIZE,
            font: FONT,
          }),
          new TextRun({ text: '\t', size: BODY_SIZE, font: FONT }),
          new TextRun({
            text: dateText,
            size: SMALL_SIZE,
            font: FONT,
            color: '666666',
          }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: rightTabPos }],
        spacing: { before: 120, after: 40 },
      }),
    );

    // Description
    if (edu.description) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: stripMarkdown(edu.description).trim(),
              size: BODY_SIZE,
              font: FONT,
            }),
          ],
          spacing: { after: 60 },
        }),
      );
    }
  }

  return paragraphs;
}

function buildAccreditations(accreditations, page) {
  const paragraphs = [];
  const rightTabPos = page.width - MARGINS.left - MARGINS.right;

  for (const acc of accreditations) {
    const titleParts = [];
    if (acc.title) titleParts.push(acc.title);
    if (acc.issuer) titleParts.push(acc.issuer);
    const titleText = titleParts.join(' — ');

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: titleText,
            bold: true,
            size: BODY_SIZE,
            font: FONT,
          }),
          ...(acc.date
            ? [
                new TextRun({ text: '\t', size: BODY_SIZE, font: FONT }),
                new TextRun({
                  text: String(acc.date),
                  size: SMALL_SIZE,
                  font: FONT,
                  color: '666666',
                }),
              ]
            : []),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: rightTabPos }],
        spacing: { before: 80, after: 40 },
      }),
    );
  }

  return paragraphs;
}

function buildSkills(categories, labels) {
  const paragraphs = [];

  for (const cat of categories) {
    if (cat.name) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cat.name,
              bold: true,
              size: BODY_SIZE,
              font: FONT,
            }),
          ],
          spacing: { before: 120, after: 40 },
        }),
      );
    }

    if (cat.skills?.length > 0) {
      for (const skill of cat.skills) {
        const parts = [skill.name || ''];
        if (skill.level) parts.push(skill.level);
        if (skill.years) {
          const yearsLabel = labels.skill_years
            ? labels.skill_years.replace('{n}', skill.years)
            : `${skill.years} years`;
          parts.push(yearsLabel);
        }

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: parts.join(' — '),
                size: BODY_SIZE,
                font: FONT,
              }),
            ],
            numbering: { reference: 'bullet-list', level: 0 },
            spacing: { after: 20 },
          }),
        );
      }
    }
  }

  return paragraphs;
}

function buildCommunity(community) {
  const paragraphs = [];

  for (const item of community) {
    const titleParts = [];
    if (item.name) titleParts.push(item.name);
    if (item.role) titleParts.push(item.role);

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: titleParts.join(' — '),
            bold: true,
            size: BODY_SIZE,
            font: FONT,
          }),
        ],
        spacing: { before: 120, after: 40 },
      }),
    );

    if (item.description) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: stripMarkdown(item.description).trim(),
              size: BODY_SIZE,
              font: FONT,
            }),
          ],
          spacing: { after: 60 },
        }),
      );
    }
  }

  return paragraphs;
}

function buildProjects(projectsList, labels, page) {
  const paragraphs = [];
  const rightTabPos = page.width - MARGINS.left - MARGINS.right;

  for (const proj of projectsList) {
    const dateText = formatDateRange(proj.start, proj.end, labels);

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: proj.name || '',
            bold: true,
            size: BODY_SIZE,
            font: FONT,
          }),
          ...(dateText
            ? [
                new TextRun({ text: '\t', size: BODY_SIZE, font: FONT }),
                new TextRun({
                  text: dateText,
                  size: SMALL_SIZE,
                  font: FONT,
                  color: '666666',
                }),
              ]
            : []),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: rightTabPos }],
        spacing: { before: 120, after: 40 },
      }),
    );

    if (proj.description) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: stripMarkdown(proj.description).trim(),
              size: BODY_SIZE,
              font: FONT,
            }),
          ],
          spacing: { after: 40 },
        }),
      );
    }

    if (proj.url) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.url,
              size: SMALL_SIZE,
              font: FONT,
              color: '666666',
            }),
          ],
          spacing: { after: 40 },
        }),
      );
    }

    if (proj.skills?.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${labels.experience_skills || 'Skills'}: `,
              bold: true,
              size: SMALL_SIZE,
              font: FONT,
              color: '666666',
            }),
            new TextRun({
              text: proj.skills.join(', '),
              size: SMALL_SIZE,
              font: FONT,
              color: '666666',
            }),
          ],
          spacing: { after: 60 },
        }),
      );
    }
  }

  return paragraphs;
}

function formatDateRange(start, end, labels = {}) {
  if (!start && !end) return '';
  const startStr = start ? String(start) : '';
  const endStr = end
    ? end === 'present'
      ? labels.experience_present || 'Present'
      : String(end)
    : '';
  if (startStr && endStr) return `${startStr} – ${endStr}`;
  return startStr || endStr;
}

function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .trim();
}
