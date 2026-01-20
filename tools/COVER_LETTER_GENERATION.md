# AI-Powered Cover Letter Generation

This folder contains context and prompts for generating customized cover letters using Cursor AI.

## Quick Start

1. Copy a job description into a new file (e.g., `job-description.txt`)
2. Open Cursor and paste the prompt below
3. The AI will generate a tailored cover letter

---

## Generation Prompt

Paste this into Cursor chat along with the job description:

```
Using the context from my resume and cover letter style guide in this repo:

1. Read /tools/RESUME_CONTEXT.md for my background
2. Read /tools/COVER_LETTER_STYLE.md for my writing style
3. Analyze the job description I'm providing

Generate a cover letter that:
- Highlights relevant experience from my background
- Matches the company's mission and values
- Uses my established writing tone
- Includes a specific, relevant example of value I could bring
- Mentions my AI/Cursor expertise as a differentiator
- Offers remote availability with timezone flexibility

Job Description:
[PASTE JOB DESCRIPTION HERE]
```

---

## Alternative: Quick Generation

For faster generation without reading files:

```
I'm Jamey McElveen, a Senior Software Architect with 25+ years experience.

Key highlights:
- Programming Manager at ACS Technologies (25 years) - led 20+ developers, built Realm serving 50,000+ churches
- Senior Engineer at SecureGive - Snowflake/.NET APIs, increased velocity 30% with Cursor AI
- Senior Developer at McLeod Health - modernized legacy C# to .NET Core, introduced Git/CI/CD
- B.S. Computer Engineering, Clemson University
- Published author: "iPhone Game Development"
- Tech stack: C#, .NET Core, React, TypeScript, Angular, Snowflake, PostgreSQL

Writing style:
- Personal connection to the product when possible
- Concrete examples of value I could add
- Emphasis on AI-augmented development as differentiator
- Remote-ready, timezone flexible
- Mission-aligned for Christian tech roles

Generate a cover letter for this role:
[PASTE JOB DESCRIPTION HERE]
```

---

## Output Location

Save generated cover letters to:

```
/tools/generated/[company-name]-[date].md
```

Example: `/tools/generated/faithlife-2026-01-20.md`
