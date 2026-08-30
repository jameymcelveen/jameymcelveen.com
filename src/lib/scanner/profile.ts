export type JameyProfile = {
  comp: { salaryFloor: number; hourlyFloor: number };
  location: {
    remoteOk: boolean;
    home: string;
    onsiteAllow: string[];
    onsiteDeny: string[];
  };
  level: { accept: string[]; reject: string[] };
  stack: {
    primary: Record<string, number>;
    adjacent: Record<string, number>;
    dated: Record<string, number>;
  };
  gapsHard: string[];
  scamSignals: string[];
  dayShape: { runSignals: string[]; buildSignals: string[] };
  rubric: {
    stackDepth: number;
    domain: number;
    level: number;
    comp: number;
    freshness: number;
    remoteCulture: number;
    aiFriendly: number;
  };
  domainAffinity: Record<string, number>;
  aiFriendlySignals: { positive: string[]; negative: string[] };
  thresholds: { backlogMinScore: number; priorityMinScore: number };
};

/** Copied from jobscan profiles/jamey/profile.jsonc. Server-only. */
export const JAMEY_PROFILE: JameyProfile = {
  comp: { salaryFloor: 135_000, hourlyFloor: 65 },
  location: {
    remoteOk: true,
    home: 'Florence, SC',
    onsiteAllow: [
      'florence sc',
      'darlington',
      'hartsville',
      'sumter',
      'marion sc',
      'lake city sc',
      'myrtle beach',
      'conway sc',
      'camden sc',
      'bishopville',
      'manning sc',
      'summerville',
    ],
    onsiteDeny: [
      'charleston',
      'columbia sc',
      'charlotte',
      'greenville sc',
      'raleigh',
      'atlanta',
    ],
  },
  level: {
    accept: ['senior', 'staff', 'lead', 'principal', 'architect', 'sr.', 'distinguished'],
    reject: ['junior', 'intern', 'associate', 'entry level'],
  },
  stack: {
    primary: {
      'c#': 5,
      '.net': 5,
      dotnet: 5,
      'asp.net': 4,
      'entity framework': 3,
      typescript: 4,
      angular: 4,
      react: 4,
      postgresql: 4,
      postgres: 4,
      'sql server': 4,
      't-sql': 3,
      kubernetes: 3,
      eks: 3,
      aws: 3,
      azure: 3,
      'rest api': 2,
      openapi: 2,
      swagger: 2,
      microservices: 3,
      'multi-tenant': 4,
      saas: 2,
      signalr: 2,
      'ci/cd': 2,
      'github actions': 2,
      opentelemetry: 3,
      snowflake: 2,
      etl: 2,
      oidc: 2,
      architect: 3,
    },
    adjacent: {
      scala: 2,
      'react native': 2,
      electron: 1,
      node: 1,
      graphql: 1,
      redis: 1,
      kafka: 1,
      docker: 2,
      linux: 1,
      mcp: 3,
      rag: 2,
      llm: 2,
      'ai agent': 3,
      fhir: 2,
      hl7: 2,
      hipaa: 3,
      epic: 2,
      oracle: 1,
      python: 1,
    },
    dated: { java: 1, struts: 1, wcf: 1, soap: 1 },
  },
  gapsHard: [
    'terraform',
    'argocd',
    'argo cd',
    'helm',
    'pulumi',
    'cloudformation',
    'salesforce',
    'mulesoft',
    'power automate',
    'powerapps',
    'power platform',
    'sharepoint admin',
    'dbt',
    'spark',
    'databricks',
    'rust',
    'golang',
    'langchain',
    'langgraph',
  ],
  scamSignals: [],
  dayShape: {
    runSignals: [
      'on-call',
      'on call',
      'pagerduty',
      'sre',
      'site reliability',
      'incident response',
      'runbook',
      'infrastructure as code',
      'platform engineer',
      'devops engineer',
      'sysadmin',
      'system administrator',
      'o365',
      'office 365',
      'active directory',
      'desktop support',
      'tier 2',
      'tier 3',
    ],
    buildSignals: [
      'design',
      'architect',
      'build',
      'ship',
      'develop',
      'implement',
      'greenfield',
      'modernize',
      'api design',
      'system design',
      'code review',
      'technical lead',
    ],
  },
  rubric: {
    stackDepth: 35,
    domain: 15,
    level: 15,
    comp: 10,
    freshness: 10,
    remoteCulture: 10,
    aiFriendly: 5,
  },
  domainAffinity: {
    healthcare: 1.0,
    mission: 0.85,
    faith: 0.85,
    fintech: 0.6,
    marketplace: 0.45,
    saas: 0.45,
    other: 0.2,
  },
  aiFriendlySignals: {
    positive: ['ai-assisted', 'copilot', 'cursor', 'llm', 'ai tooling', 'agentic', 'mcp'],
    negative: ['no ai', 'ai is prohibited', 'without ai assistance', 'ai-free'],
  },
  thresholds: { backlogMinScore: 45, priorityMinScore: 70 },
};

export const FRESHNESS_MAX_DAYS = 7;
export const NEAR_MISS_BAND = 15;

export const SEARCH_QUERIES = [
  '.NET',
  'Senior Software Engineer C#',
  'Staff Software Engineer',
  'Principal Software Engineer',
  'Principal Engineer',
  'Backend Engineer C#',
  'Backend Engineer .NET',
  'Platform Engineer .NET',
  'Software Architect',
  'Solutions Architect',
  'Lead Software Engineer',
  'Staff Engineer backend',
] as const;
