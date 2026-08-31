# Job Scanner Lab – Redesign Prompt for Cursor

You are implementing a clean, professional redesign of the personal Job Scanner Lab at jameymcelveen.com/lab.

## Core Goals
- Re-think navigation and workflow (currently piecemeal).
- Keep professional tone, add visual depth (elevated cards, subtle shadows, better hierarchy).
- Primary user is the owner (Jamey). The Search page is also shared with recruiters to “flex”.
- Old shared URLs must continue to work via redirects.

## Route Map (New Preferred + Redirects)

| New Preferred Route     | Purpose                          | Old URL (must redirect)          |
|-------------------------|----------------------------------|----------------------------------|
| `/lab/board`            | Ranked job board (main workspace)| `/lab/the-board`                 |
| `/lab/search`           | Public candidate + criteria page | `/lab/the-search`                |
| `/lab/fit-filter`       | Paste JD → 3-gate verdict        | `/lab/fit-filter` (keep)         |
| `/lab/tracker`          | Application pipeline (new)       | —                                |
| `/lab/sources`          | Scanner telemetry (diagnostic)   | `/lab/the-board/sources` or `/lab/sources` |
| `/lab/board/jobs/[id]`  | Job detail                      | `/lab/the-board/jobs/[id]`       |

Implement permanent redirects from the old paths to the new ones.

## Primary Navigation (persistent on every page)

```
Board · Fit Filter · Tracker · Search · Sources
```

- Active state clearly indicated.
- “Sources” is quieter visually (secondary weight is fine) but always present.
- Logo / name “JAMEY-MCELVEEN” top-left links to Board (or Search — your choice, default Board).

## Page Responsibilities

### 1. Board (`/lab/board`) — Main Daily Workspace
- Header: “The Board” + short description of the ranking rubric.
- Last scan timestamp + Refresh button + link to Sources.
- Ranked list of jobs that passed the scanner (score ≥ 45).
- Near Misses section (lower scores).
- Each job card shows:
  - Score (large)
  - Title + Company
  - Tags (REMOTE, salary if known, age, source)
  - Actions: **Details** | **Run the gates** | **Favorite** (or “Add to Tracker”)
- “Run the gates” pre-fills Fit Filter with that posting (or opens Fit Filter with the text).
- Ability for the owner to manually add a job to the Board (because some boards can’t be scraped).

### 2. Fit Filter (`/lab/fit-filter`)
- Paste any job description.
- Runs the three gates: Comp · Load-bearing quals · Day shape.
- Outputs clear APPLY / SKIP (or PASS/FAIL) with reasoning, keyword coverage %, honest gaps, and opening claim when strong.
- From a positive result the owner can:
  - Add to Board
  - Add to Tracker (Favorite stage)
- Keep the existing strong copy tone (“Titles lie. Requirement lists do not.” etc.).

### 3. Tracker (`/lab/tracker`) — NEW
Simple personal application pipeline.

Stages (columns or grouped list — Kanban preferred if easy, otherwise clean grouped list):
1. **Favorite** (saved interest, not yet applied)
2. **Applied**
3. **Interview**
4. **Follow-up**
5. **Rejected**
6. (Optional terminal) **Hired** — when reached, owner can archive / stop tracking.

Each card in Tracker should show:
- Job title + company
- Score (if it came from Board)
- Date moved into current stage
- Quick actions: move to next stage, edit notes, open original posting / detail page, remove

Owner can also manually create an entry (for jobs found outside the scanner).

### 4. Search (`/lab/search`)
Public-facing “flex” page for recruiters.
- Keep the strong existing content structure:
  - The Candidate
  - The Hunt (Role, Location, Stack, Domains, Comp)
  - Scanner Criteria
  - How I Decide (the three gates)
  - Last scan stats
  - Proof of Work
  - The Ask + contact
- Make it feel polished and confident.
- Clear CTAs: “View the Board” and “Try the Fit Filter”.

### 5. Sources (`/lab/sources`)
Quiet diagnostic page.
- List of sources the scanner hits + hit counts from last run.
- Clearly labeled as telemetry / health.
- Link back to Board.

### 6. Job Detail (`/lab/board/jobs/[id]`)
- Clean header with score, title, company, key metadata.
- Original posting (or cleaned version).
- Score breakdown / gates if available.
- Actions: Run the gates again, Add to Tracker, Open original link.

## Visual Direction
- Professional, restrained, modern.
- Add real depth: soft elevated cards, subtle borders or shadows, clear section separation.
- Warm off-white / cream background (keep the current feel) or very slight cool neutral.
- Accent: the existing orange/rust for interactive elements and scores.
- Typography: strong hierarchy, excellent readability, generous but not sparse spacing.
- Job cards should feel scannable and tactile.
- Mobile-friendly but desktop-first (owner uses it heavily on desktop).

## Data / Behavior Notes for Implementation
- Board jobs come from the existing scanner.
- Owner can manually inject jobs into Board and into Tracker.
- Tracker is personal state (needs persistence — localStorage is acceptable for v1, or simple backend if already present).
- Fit Filter should accept pre-filled content when coming from Board “Run the gates”.
- All pages share the same header/nav component.

## Tone of Copy
Keep the existing voice: direct, slightly wry, high-signal, no corporate fluff.
Examples already in the product:
- “Titles lie. Requirement lists do not.”
- “AI as a power-up, not a cheat code.”
- “Most postings should fail. That is the point.”

## Deliverables Expected from You (Cursor)
1. Updated routing with redirects.
2. Shared layout + primary nav.
3. Redesigned Board, Fit Filter, Search, Sources pages.
4. New Tracker page with stage management.
5. Improved Job Detail page.
6. Consistent card components and visual depth.

Start with the shared layout + Board page, then Tracker, then the others.

Reference the existing screenshots and live pages for content accuracy, but improve structure and visual hierarchy significantly.
