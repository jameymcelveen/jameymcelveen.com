# Design Tokens & Visual Direction

## Goals
- Professional and confident (not playful, not corporate-bland)
- Add **depth** without looking heavy
- Keep the existing warm off-white personality
- Make the Board and Tracker feel like real working tools
- Make Search feel like a polished public page

## Color Palette (suggested)

```css
--bg:            #F8F6F1;          /* warm off-white */
--surface:       #FFFFFF;
--surface-elev:  #FFFFFF;
--border:        #E8E4DC;
--border-strong: #D6D0C4;

--text:          #1A1A1A;
--text-secondary:#5C5C5C;
--text-muted:    #8A8A8A;

--accent:        #C45C26;          /* existing orange/rust – keep */
--accent-hover:  #A84A1C;
--accent-subtle: #FDF0E9;

--success:       #2F6B3A;          /* APPLY / PASS */
--danger:        #9B2C2C;          /* SKIP / FAIL */
--warning:       #9A6B1F;

--score-high:    #1A1A1A;          /* 50+ */
--score-mid:     #5C5C5C;          /* near miss */
```

## Depth / Elevation

Use subtle, consistent elevation:

```css
/* Card resting */
box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06);
border: 1px solid var(--border);

/* Card hover / interactive */
box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
```

Avoid heavy drop shadows or glassmorphism. Prefer soft, almost “paper” elevation.

## Typography

- Headings: tight, confident, slightly condensed if the font supports it
- Body: excellent readability, 16–17px base
- Scores: large, tabular, bold (the number is the primary signal on Board)
- Labels (FIELD TELEMETRY, etc.): small, uppercase or tracked, accent color

Keep the existing “FIELD …” eyebrow labels — they give the product character.

## Spacing & Layout

- Desktop max content width ≈ 720–780px for reading pages (Search, Fit Filter results)
- Board and Tracker can go a bit wider (up to ~960px) because of the lists
- Generous vertical rhythm between sections
- Cards have consistent internal padding (20–24px)

## Component Notes

### Job Card (Board)
```
┌─────────────────────────────────────────────┐
│  58          Sr. Lead Data Engineer         │
│              Chick-fil-A                    │
│              [REMOTE]  12d old  rss         │
│                                             │
│              Details   Run the gates   ★    │
└─────────────────────────────────────────────┘
```
Score is the dominant left element. Actions are secondary but always visible.

### Tracker Card
Similar but shows current stage and “Moved 3d ago”. Drag handle or explicit “Move to…” control.

### Fit Filter Result
Large, decisive APPLY or SKIP stamp (keep the existing visual language, just refine it).  
Then clear sections: What the robots see · What the filter sees · Honest gaps · Opening claim.

## Navigation
- Sticky top bar
- Clean, minimal
- Active item uses accent underline or filled pill
- Sources can be slightly lower visual weight if desired

## Mobile
- Stack everything cleanly
- Primary nav collapses to a simple menu or bottom bar (owner is mostly desktop, so desktop polish is higher priority)

## Do Not
- Add illustrations or decorative icons that feel “product-y”
- Use heavy gradients or neon accents
- Make it look like a generic SaaS dashboard
- Lose the existing copy voice
