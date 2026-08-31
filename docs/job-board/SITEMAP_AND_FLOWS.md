# Sitemap & Primary User Flows

## Final Information Architecture

```
/lab
├── board                    ← Main workspace (ranked jobs)
│   └── jobs/[id]            ← Job detail
├── fit-filter               ← Paste JD → 3-gate verdict
├── tracker                  ← Application pipeline (new)
├── search                   ← Public candidate + criteria (flex page)
└── sources                  ← Scanner telemetry (diagnostic)
```

Redirects required:
- `/lab/the-board`           → `/lab/board`
- `/lab/the-search`          → `/lab/search`
- `/lab/the-board/jobs/:id`  → `/lab/board/jobs/:id`
- `/lab/the-board/sources`   → `/lab/sources` (or keep both)

## Primary Navigation (always visible)

```
[ JAMEY-MCELVEEN ]     Board · Fit Filter · Tracker · Search · Sources
```

Active page is underlined or colored with the accent.

---

## Key User Flows

### Flow 1 – Daily Scan (Owner)
1. Land on **Board**
2. Scan ranked list + near misses
3. For interesting jobs:
   - Click **Details** → read full posting
   - Click **Run the gates** → Fit Filter opens pre-filled → get APPLY/SKIP
   - Click **Favorite** → moves card into Tracker (Favorite stage)
4. Optionally open **Sources** to check scanner health

### Flow 2 – Manual Job Discovery (Owner)
1. Find a job on a board that cannot be scraped
2. Go to **Fit Filter** → paste JD → run gates
3. If strong:
   - “Add to Board” (so it appears in ranked list with a manual flag)
   - “Add to Tracker” (Favorite stage)
4. Later move it through Tracker stages as the process advances

### Flow 3 – Application Tracking (Owner)
1. Open **Tracker**
2. See cards in stages: Favorite → Applied → Interview → Follow-up → Rejected
3. Drag or click to advance stage
4. Add notes, open original posting, or archive when Rejected / Hired

### Flow 4 – Recruiter / External Visitor
1. Receives link to **Search** (`/lab/the-search` or new `/lab/search`)
2. Reads candidate story, criteria, and the three gates
3. Optionally clicks through to Board or tries Fit Filter
4. Contacts via the email / LinkedIn on the page

---

## Tracker Stage Definitions

| Stage       | Meaning                                      | Typical next action          |
|-------------|----------------------------------------------|------------------------------|
| Favorite    | Interested, not yet applied                  | Apply → Applied              |
| Applied     | Application submitted                        | Interview scheduled          |
| Interview   | At least one interview completed or scheduled| Follow-up or Rejected        |
| Follow-up   | Waiting on decision / next steps             | Rejected or Hired            |
| Rejected    | Closed – no offer                            | Archive                      |
| Hired       | Offer accepted (terminal success)            | Archive / stop tracking      |

---

## Component Inventory (suggested)

- `AppShell` – header + primary nav + footer
- `JobCard` – used on Board and Tracker
- `ScoreBadge`
- `StagePill` / stage selector
- `FitFilterForm` + `FitFilterResult`
- `EmptyState`
- `ManualAddJobModal` (for Board and Tracker)
- `JobDetailHeader` + content sections
