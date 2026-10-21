import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const RESUME_YAML_PATH = join(process.cwd(), 'src/data/resume.yaml');

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const COMPETENCY_LABELS: Record<string, string> = {
  languages: 'Languages',
  apis: 'APIs & Protocols',
  architecture: 'Architecture',
  data: 'Data',
  sql_performance: 'SQL Performance',
  cloud_devops: 'Cloud & DevOps',
  frontend: 'Frontend',
  observability: 'Observability',
  compliance: 'Compliance',
  ai_tooling: 'AI Tooling',
  integration: 'Integration',
  leadership: 'Leadership',
};

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`resume.yaml: expected mapping at ${path}`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, path: string): string {
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') {
    throw new Error(`resume.yaml: expected string at ${path}`);
  }
  return value.replace(/\s+/g, ' ').trim();
}

function asOptionalString(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return asString(value, path);
}

function asStringList(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`resume.yaml: expected list at ${path}`);
  }
  return value.map((item, i) => asString(item, `${path}[${i}]`));
}

function asNumber(value: unknown, path: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  throw new Error(`resume.yaml: expected number at ${path}`);
}

function formatDate(value: string | number): string {
  const raw = String(value);
  const ym = /^(\d{4})-(\d{2})$/.exec(raw);
  if (ym) {
    const month = MONTHS[Number(ym[2]) - 1];
    if (!month) throw new Error(`resume.yaml: invalid month in ${raw}`);
    return `${month} ${ym[1]}`;
  }
  return raw;
}

function formatPeriod(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function startYear(start: string): number {
  const y = /^(\d{4})/.exec(start);
  if (!y) throw new Error(`resume.yaml: cannot read year from ${start}`);
  return Number(y[1]);
}

function endYear(end: string): number | null {
  if (/present/i.test(end)) return null;
  const y = /^(\d{4})/.exec(end);
  if (!y) return null;
  return Number(y[1]);
}

function parseContact(raw: unknown) {
  const c = asRecord(raw, 'contact');
  return {
    location: asString(c.location, 'contact.location'),
    phone: asString(c.phone, 'contact.phone'),
    email: asString(c.email, 'contact.email'),
    website: asString(c.website, 'contact.website'),
    availability: asString(c.availability, 'contact.availability'),
  };
}

function parseCompetencies(raw: unknown) {
  const c = asRecord(raw, 'competencies');
  return Object.keys(c).map((key) => ({
    key,
    label: COMPETENCY_LABELS[key] ?? key.replace(/_/g, ' '),
    items: asStringList(c[key], `competencies.${key}`),
  }));
}

function parseProduct(raw: unknown, path: string) {
  const p = asRecord(raw, path);
  return {
    name: asString(p.name, `${path}.name`),
    highlights: asStringList(p.highlights, `${path}.highlights`),
  };
}

function parseExperienceItem(raw: unknown, path: string) {
  const j = asRecord(raw, path);
  const start = asString(j.start, `${path}.start`);
  const end = asString(j.end, `${path}.end`);
  const productsRaw = j.products;
  const products = productsRaw
    ? Object.entries(asRecord(productsRaw, `${path}.products`)).map(([id, value]) =>
        parseProduct(value, `${path}.products.${id}`)
      )
    : [];
  const ey = endYear(end);
  const tenureYears = (ey ?? new Date().getFullYear()) - startYear(start);
  return {
    title: asString(j.title, `${path}.title`),
    company: asString(j.company, `${path}.company`),
    domain: asOptionalString(j.domain, `${path}.domain`),
    url: asOptionalString(j.url, `${path}.url`),
    start,
    end,
    period: formatPeriod(start, end),
    note: asOptionalString(j.note, `${path}.note`),
    highlights: asStringList(j.highlights, `${path}.highlights`),
    products,
    isLongTenure: tenureYears >= 10,
  };
}

function parseCommunityItem(raw: unknown, path: string) {
  const c = asRecord(raw, path);
  return {
    organization: asString(c.organization, `${path}.organization`),
    role: asString(c.role, `${path}.role`),
    url: asOptionalString(c.url, `${path}.url`),
    highlights: asStringList(c.highlights, `${path}.highlights`),
  };
}

function parseEducation(raw: unknown) {
  const e = asRecord(raw, 'education');
  return {
    degree: asString(e.degree, 'education.degree'),
    institution: asString(e.institution, 'education.institution'),
    schoolMotto: asOptionalString(e.school_motto, 'education.school_motto'),
    notes: asOptionalString(e.notes, 'education.notes') ?? '',
  };
}

function parsePublication(raw: unknown, path: string) {
  const p = asRecord(raw, path);
  return {
    title: asString(p.title, `${path}.title`),
    publisher: asString(p.publisher, `${path}.publisher`),
    year: asNumber(p.year, `${path}.year`),
    coauthor: asOptionalString(p.coauthor, `${path}.coauthor`),
    url: asOptionalString(p.url, `${path}.url`),
    notes: asOptionalString(p.notes, `${path}.notes`) ?? '',
  };
}

function parseActiveProject(raw: unknown, path: string) {
  const p = asRecord(raw, path);
  return {
    name: asString(p.name, `${path}.name`),
    url: asString(p.url, `${path}.url`),
    stack: asStringList(p.stack, `${path}.stack`),
    description: asString(p.description, `${path}.description`),
  };
}

function parseResumeDocument(raw: unknown) {
  const d = asRecord(raw, 'root');
  const highlights = asStringList(d.summary_highlights, 'summary_highlights');
  if (highlights.length < 3) {
    throw new Error('resume.yaml: summary_highlights needs at least 3 entries');
  }
  const publicationsRaw = d.publications;
  if (!Array.isArray(publicationsRaw) || publicationsRaw.length === 0) {
    throw new Error('resume.yaml: publications must be a non-empty list');
  }
  const experienceRaw = d.experience;
  if (!Array.isArray(experienceRaw)) {
    throw new Error('resume.yaml: experience must be a list');
  }
  const communityRaw = d.community;
  if (!Array.isArray(communityRaw)) {
    throw new Error('resume.yaml: community must be a list');
  }
  const projectsRaw = d.active_projects;
  if (!Array.isArray(projectsRaw)) {
    throw new Error('resume.yaml: active_projects must be a list');
  }
  return {
    name: asString(d.name, 'name'),
    title: asString(d.title, 'title'),
    contact: parseContact(d.contact),
    summary: asString(d.summary, 'summary'),
    summaryHighlights: highlights as [string, string, string, ...string[]],
    competencies: parseCompetencies(d.competencies),
    experience: experienceRaw.map((item, i) => parseExperienceItem(item, `experience[${i}]`)),
    community: communityRaw.map((item, i) => parseCommunityItem(item, `community[${i}]`)),
    education: parseEducation(d.education),
    publications: publicationsRaw.map((item, i) => parsePublication(item, `publications[${i}]`)),
    activeProjects: projectsRaw.map((item, i) => parseActiveProject(item, `active_projects[${i}]`)),
  };
}

export type Resume = ReturnType<typeof parseResumeDocument>;

let cached: Resume | undefined;

/** Server-only. Reads src/data/resume.yaml at build/request time. */
export function getResume(): Resume {
  if (!cached) {
    cached = parseResumeDocument(parse(readFileSync(RESUME_YAML_PATH, 'utf8')));
  }
  return cached;
}

export function resumeHref(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

/** Shape previously served from profile.json resume. */
export function getResumeData() {
  const r = getResume();
  const pub = r.publications[0];
  const [h1, h2, h3] = r.summaryHighlights;
  return {
    summary: r.summary,
    summaryHighlight1: h1,
    summaryHighlight2: h2,
    summaryHighlight3: h3,
    subtitle: r.contact.availability,
    education: {
      degree: r.education.degree,
      school: r.education.institution,
      schoolMotto: r.education.schoolMotto ?? '',
      notes: r.education.notes,
    },
    publication: {
      title: pub.title,
      publisher: pub.publisher,
      url: pub.url,
      description: pub.notes,
    },
  };
}

/** Shape previously served from profile.json workExperience. */
export function getWorkExperience() {
  return getResume().experience.map((job) => {
    const bullets = [
      ...job.highlights,
      ...job.products.flatMap((product) =>
        product.highlights.map((line) => `${product.name} - ${line}`)
      ),
    ];
    const highlight = [job.domain, job.url].filter(Boolean).join(' - ');
    return {
      title: job.title,
      company: job.company,
      period: job.period,
      bullets,
      highlight: highlight || undefined,
      note: job.note,
      isLongTenure: job.isLongTenure,
    };
  });
}

/** Four-column site stack, flattened from YAML competencies. */
export function getSkills() {
  const byKey = Object.fromEntries(getResume().competencies.map((c) => [c.key, c.items]));
  return {
    languages: byKey.languages ?? [],
    frameworks: [...(byKey.apis ?? []), ...(byKey.architecture ?? []), ...(byKey.frontend ?? [])],
    data: [...(byKey.data ?? []), ...(byKey.sql_performance ?? [])],
    tools: [
      ...(byKey.cloud_devops ?? []),
      ...(byKey.observability ?? []),
      ...(byKey.compliance ?? []),
      ...(byKey.ai_tooling ?? []),
      ...(byKey.integration ?? []),
      ...(byKey.leadership ?? []),
    ],
  };
}

/** Community block previously served from profile.json engineering. */
export function getEngineering() {
  return {
    title: 'Community',
    items: getResume().community.map((c) => ({
      label: c.organization,
      description: [c.role, ...c.highlights].join(' '),
    })),
  };
}

export type ResumePageData = ReturnType<typeof getResumeData>;
export type WorkExperience = ReturnType<typeof getWorkExperience>;
export type Skills = ReturnType<typeof getSkills>;
export type Engineering = ReturnType<typeof getEngineering>;
