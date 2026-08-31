# Job Scanner Lab – Redesign Package for Cursor

This folder contains everything needed to implement the navigation + visual redesign of the Job Scanner Lab.

## Files

| File | Purpose |
|------|---------|
| `CURSOR_PROMPT.md` | **Main prompt** – paste this into Cursor as the primary instruction |
| `SITEMAP_AND_FLOWS.md` | Information architecture, routes, redirects, and user flows |
| `DESIGN_TOKENS_AND_VISUAL.md` | Color, elevation, typography, and visual direction |
| `TRACKER_SPEC.md` | Detailed spec for the new application Tracker page |

## Recommended Implementation Order in Cursor

1. Shared layout + primary navigation + redirects
2. Board page (main workspace)
3. Tracker page (new)
4. Fit Filter improvements + “Add to Board / Tracker” actions
5. Search page polish
6. Sources page
7. Job Detail page cleanup

## Key Decisions Locked

- **Board-centric** primary workflow (Option A)
- Primary user = owner; Search page is also shared with recruiters
- Fit Filter stays easily accessible and can feed both Board and Tracker
- Sources is diagnostic but always linked in nav
- New Tracker with stages: Favorite → Applied → Interview → Follow-up → Rejected (Hired terminal)
- Old shared URLs (`/lab/the-search`, `/lab/the-board`) get permanent redirects to the new cleaner routes
- Visual: professional + real depth, keep the existing orange accent and warm background personality

## How to Use

1. Open the project in Cursor
2. Paste the contents of `CURSOR_PROMPT.md` as the main instruction (or attach the whole folder)
3. Reference the other three files as needed while implementing

That’s it. The prompt is written so Cursor has clear product, routing, visual, and data guidance.
