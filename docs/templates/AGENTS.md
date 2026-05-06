# AGENTS.md — portable bootstrap (copy to new repo root)

**How to use:** Copy this file to the **root** of a new repository and rename if needed (`AGENTS.md` is widely recognized by coding agents, including Cursor). Remove sections that do not apply to that project. Fill in the bracketed placeholders. For a **ready-made kickoff prompt** that tells the AI to copy these templates and scaffold the repo, see **`EXAMPLE-PROMPT.txt`** in this folder.

This document is **not** project-specific feature work — it encodes **owner preferences** and **default engineering habits** so an AI session can align without guessing.

---

## Owner / context

- **Name:** [Jamey McElveen]
- **Email / contact:** [jamey@mcelveen.us]
- **Notes:** [e.g. time zone, employer constraints, OSS vs private — optional]

### Where “personality” lives

| Place | Use for |
|-------|---------|
| **This `AGENTS.md`** | A **short** working-style blurb (next section) so anyone opening the repo gets tone + collaboration prefs. Keeps engineering + human context in one file for agents. |
| **`OWNER.md`** (optional, same repo root) | **Longer** personal context: how you think, humor, values, career notes. See `docs/templates/OWNER.md` in the template repo. In `AGENTS.md`, add one line: “Also read `OWNER.md` for personal context.” |
| **Cursor → User Rules** | Preferences that apply to **every** project (global). Good for stable personality + red lines without copying into each repo. |

You can use **one, two, or all three**; avoid duplicating paragraphs in multiple places.

---

## Working style & personality (optional — keep brief)

Edit or delete. Helps the AI match **tone** and **collaboration**, not just stack.

- **Communication:** [e.g. direct, prefers bullet conclusions, wants tradeoffs named explicitly]
- **Feedback:** [e.g. challenge bad ideas; okay to say “this is wrong if…”]
- **Energy / humor:** [e.g. dry humor OK; keep professional in docs users read]
- **Learning:** [e.g. likes diagrams for architecture; wants links to primary sources]
- **Avoid:** [e.g. sycophancy, vague “great question”, engagement-bait closings]

---

## Principles

1. **Use only what fits the stack** — The lists below are a menu, not a checklist. For a tiny script repo, skip Makefile and heavy CI; for a product, add tests and branch protection.
2. **Prefer boring, explicit tooling** — Readable scripts, documented env vars, one obvious way to run `dev` / `build` / `lint`.
3. **No secrets in git** — Use `.env.example` with dummy values; real keys in host dashboards or secret managers.
4. **Small, reviewable changes** — Focused PRs; avoid drive-by refactors unless asked.

---

## Languages & runtimes (pick per project)

| Area | Preference |
|------|------------|
| **JavaScript / tooling** | **TypeScript** where there is a build step; **Node.js 22+** (pin in `.nvmrc` / `engines`). |
| **Package manager** | **pnpm** only. Block `npm`/`yarn` for app installs when practical (`only-allow pnpm` in `preinstall`). |
| **Backend / services** | **C# / .NET** is fine when the problem fits; same hygiene as below (lint/test/CI as appropriate). |
| **Desktop** | **Electron** is in scope when the product needs it; keep security and auto-update story explicit. |
| **Formatting** | **Prettier** for web/JSON/YAML; **EditorConfig** for cross-editor consistency. |

---

## Hosting & deploy (pick per project)

| Platform | Typical use |
|----------|-------------|
| **Vercel** | Next.js / frontends, serverless, preview deployments from Git. |
| **Railway** | Containers, long-running APIs, databases, internal networking. |
| **GitHub** | **Source of truth**; **deploy from `main`** (or documented release branch) via Vercel/Railway Git integration and/or Actions. |

**Defaults:**

- **Protect `main`** — Require PR review (and CI green where applicable) before merge; no direct pushes to `main` for shared work.
- **Production deploys** — Triggered from Git (merge to `main` or tagged releases), not from laptops.

---

## Repository layout habits

When the project is more than a single file, prefer:

- **`README.md`** — What it is, quick start, how to run `dev` / `test` / `build`, deploy pointers.
- **`Makefile`** — Thin wrappers around real commands (`help` as default target listing `dev`, `build`, `lint`, `format`, etc.). Optional for minimal repos.
- **`scripts/`** — Idempotent bash (or small Node) automation: setup, deploy helpers, codegen. Document prerequisites.
- **`.editorconfig`** — Spaces (2) for most files; tabs for `Makefile`; LF; final newline; trim trailing whitespace (except Markdown).
- **`.gitignore`** — OS junk, build dirs, `.env`, local DB files, IDE folders as needed.
- **`.env.example`** — Every required env var name with safe placeholder or comment; never real secrets.

---

## Web / Node projects (when applicable)

- **Lint:** ESLint with framework preset (e.g. `eslint-config-next` for Next.js).
- **Format:** `prettier` + `format:check` in CI when the repo uses Prettier.
- **Lockfile:** Commit **`pnpm-lock.yaml`**; avoid dual lockfiles.
- **CI (GitHub Actions):** At minimum `pnpm install --frozen-lockfile`, `lint`, `build`, and tests if present.

---

## .NET projects (when applicable)

- **Solution layout** — Clear separation of API vs libraries; Dockerfile when deploying as a container.
- **Tests** — `dotnet test` in CI for anything non-trivial.
- **Config** — `appsettings.json` + env overrides; secrets via host env, not committed.

---

## Testing (add when the project earns it)

- **Unit / integration:** Choose per stack (Vitest/Jest, Playwright, `dotnet test`, etc.).
- **CI:** Run the same commands locally that CI runs; fail PRs on red tests.

---

## AI / Cursor session behavior

- **Read this `AGENTS.md` first** when starting work in a repo that contains it. If `OWNER.md` exists in the repo root, read it for richer personal context.
- **Execute commands** (install, lint, test) in the real environment; do not only suggest commands.
- **Match existing style** in the repo — naming, imports, test patterns, doc tone.
- **Prefer full URLs and real paths** in explanations when linking to docs or configs.
- **Prose:** Clear sentences; avoid filler; code citations use the editor’s `startLine:endLine:path` format when referencing existing code.

---

## Optional: Cursor rules

If using Cursor, you can add project rules under `.cursor/rules/` that point agents to this file (e.g. “read `AGENTS.md` before large changes”). Keep rules short; put long policy here in `AGENTS.md`.

---

## Checklist for a brand-new repo

Copy/paste and trim:

- [ ] `README.md` with quick start
- [ ] `packageManager` + `engines` (if Node) + `.nvmrc`
- [ ] `pnpm` + `only-allow` (if Node)
- [ ] `.editorconfig`
- [ ] `.env.example`
- [ ] `Makefile` with `help` (optional)
- [ ] `scripts/` for non-trivial automation (optional)
- [ ] ESLint + Prettier (if JS/TS)
- [ ] `.github/workflows/ci.yml` (lint/build/test as applicable)
- [ ] Branch protection on `main`
- [ ] Vercel and/or Railway project linked to GitHub
- [ ] This `AGENTS.md` updated for the actual stack

---

*Template derived from habits used on jameymcelveen.com; customize freely for each new project.*
