import 'server-only';

export type CompanyEntry = {
  name: string;
  board: 'greenhouse' | 'lever' | 'ashby' | 'rss' | 'workday';
  token: string | null;
  active: boolean;
  domain: string;
};

/** Jamey watchlist only. Copied from jobscan profiles/jamey/companies.jsonc. */
export const JAMEY_COMPANIES: CompanyEntry[] = [
  { name: 'Thorne', board: 'greenhouse', token: 'thorne', active: true, domain: 'healthcare' },
  { name: 'OPENLANE', board: 'greenhouse', token: 'openlane', active: true, domain: 'marketplace' },
  { name: 'Wolters Kluwer', board: 'workday', token: null, active: false, domain: 'healthcare' },
  { name: 'Aledade', board: 'greenhouse', token: 'aledade', active: true, domain: 'healthcare' },
  { name: 'TherapyNotes', board: 'greenhouse', token: 'therapynotes', active: true, domain: 'healthcare' },
  {
    name: 'GiveDirectly',
    board: 'lever',
    token: 'givedirectly',
    active: true,
    domain: 'mission',
  },
  {
    name: 'Christian Care Ministry',
    board: 'greenhouse',
    token: 'christiancareministry',
    active: true,
    domain: 'mission',
  },
  { name: 'Epic', board: 'greenhouse', token: 'epic', active: false, domain: 'healthcare' },
];

export const JAMEY_FEEDS: CompanyEntry[] = [
  {
    name: 'Christian Tech Jobs',
    board: 'rss',
    token: 'https://www.christiantechjobs.io/api/rss',
    active: true,
    domain: 'mission',
  },
];
