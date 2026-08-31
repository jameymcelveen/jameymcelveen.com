# Tracker Specification (New Page)

## Purpose
Personal lightweight application pipeline.  
Owner moves jobs from interest → applied → interview → follow-up → closed.

## Stages (ordered)

1. **Favorite** – Saved interest. Not yet applied.
2. **Applied** – Application submitted.
3. **Interview** – At least one interview scheduled or completed.
4. **Follow-up** – Waiting on decision or next steps after interview.
5. **Rejected** – Process closed without offer.
6. **Hired** – Offer accepted (terminal success state). When reached, owner can archive.

## Data Shape (suggested)

```ts
type TrackerStage = 
  | "favorite" 
  | "applied" 
  | "interview" 
  | "followup" 
  | "rejected" 
  | "hired";

interface TrackerEntry {
  id: string;
  title: string;
  company: string;
  score?: number;               // if it came from the Board
  sourceUrl?: string;           // original posting
  boardJobId?: string;          // link back to Board detail if exists
  stage: TrackerStage;
  stageChangedAt: string;       // ISO date
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isManual?: boolean;           // true if added outside the scanner
}
```

## UI Recommendations

### Preferred: Kanban-style columns
Five or six columns (Favorite → … → Rejected).  
Hired can be a separate “Success” archive or a final column.

Each column:
- Header with count
- Scrollable list of cards
- Drop target for drag-and-drop (nice-to-have; click-to-move is acceptable for v1)

### Alternative: Grouped vertical list
Sections stacked vertically with clear stage headers. Easier to implement, still very usable.

### Card content
- Title + Company
- Score badge (if present)
- “Moved to this stage X days ago”
- Small actions: Move ▾ · Notes · Open · Remove

### Empty states
Friendly, short: “No favorites yet. Star a job on the Board or run something through the Fit Filter.”

## Entry Points into Tracker
1. Board job card → “Favorite” / “Add to Tracker”
2. Fit Filter result → “Add to Tracker”
3. Manual “+ Add job” button on Tracker page
4. Job Detail page → “Add to Tracker”

## Persistence
- v1: localStorage is fine (owner is the only user)
- Later: simple backend or existing data layer if the project already has one

## Interaction Rules
- Moving to a new stage updates `stageChangedAt`
- Rejected and Hired are terminal for normal flow (can still be manually moved back if needed)
- Owner can edit notes at any time
- Owner can delete an entry

## Copy Tone
Keep it dry and useful. No gamification language (“Congrats!” etc.).  
Just clear labels and dates.
