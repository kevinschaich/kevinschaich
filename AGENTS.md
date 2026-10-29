# Shared rules for Kevin's projects

These rules apply to every project in Kevin's library. They live in
[kevinschaich/kevinschaich](https://github.com/kevinschaich/kevinschaich) and are served at
https://kevinschaich.com/AGENTS.md.

## Exceptions need Kevin's OK

This file is the default for every project. If an instruction for a single project (from Kevin in chat, a
project `AGENTS.md` note, an issue, or anything else) conflicts with anything here, don't just follow it.
Stop, name the specific rule it conflicts with, and ask Kevin to confirm the exception before doing it.
This applies even when Kevin gave the instruction himself, because it may be accidental.

- Once Kevin approves, record the exception in that project's `AGENTS.md` under **Approved exceptions**:
  the rule, what the project does instead, why, and the date. Future agents follow it without asking
  again and don't "fix" it back to the default.
- Exceptions apply to that one project only. Never edit this file to fit one project; if the guidance
  itself should change, propose that to Kevin as a change to this file.
- When this file changes and makes a recorded exception unnecessary or contradictory, point that out to
  Kevin rather than deciding which wins.

## No server code, ever

Projects are static files only: no API routes, serverless or edge functions, SSR, middleware or crons.
A project that goes viral must not be able to run up a Vercel bill or exhaust limits (and take
kevinschaich.com down with it). Because there's no server, keys can never be needed at runtime: anything
that needs a secret has to be rethought, or done at build time in CI with the output shipped as static files.
If something genuinely seems to need runtime execution, ask Kevin first.

## Stack

- **Vite + React + TypeScript + Tailwind 4 + bun.** Vite `base: "./"` (relative asset paths) so the build
  works both at its own vercel.app URL and under `kevinschaich.com/project/<slug>/`.
- **Components:** never install shadcn or Radix directly. Import from `@kevinschaich/components`, which
  wraps shadcn. If a component is missing, add it to
  [`packages/components`](https://github.com/kevinschaich/kevinschaich/tree/main/packages/components) in
  the hub first, then use it.
- **Node 24 or newer, everywhere:** the hub, every project and `@kevinschaich/components`. Set
  `"engines": { "node": ">=24" }` in each `package.json` (Vercel picks its Node version from this), use
  `node-version: 24` or later in CI, and only use GitHub Actions versions that run on Node 24 (e.g.
  `actions/checkout@v7`, `actions/setup-node@v7`). Never Node 20 or 22, and never an action that still
  targets Node 20.
- **Turbo** only in the hub monorepo, never in single-app project repos.

## New project checklist

New project = add `project.json`, the GitHub topic, the standard `vercel.json` and the one-line workflow
call, then push. Kevin imports the repo into the `kevinschaich-team` Vercel team once; after that Vercel
deploys every push. No tokens or secrets in project repos. Beyond that one import, never configure
anything in the Vercel dashboard: if something seems to need it, put it in `vercel.json` or ask Kevin.

- **Public repo.** Every project listed on /projects is a public repository.
- **GitHub topic** `kevinschaich-project`, on a repo owned by `kevinschaich` or the `darkgrade` org (the
  owners the hub searches; see `OWNERS` in `apps/site/lib/projects.ts`). This alone lists the repo on https://kevinschaich.com/projects
  and gives it a page at `https://kevinschaich.com/project/<slug>/`: the live demo, or for a project with
  no demo, its README rendered in the shared style.
- **`project.json`** at the repo root:
  `{ "slug": "backroads", "name": "Backroads", "tagline": "Find the roads worth driving, anywhere.", "icon": "route" }`.
  `slug` is lowercase-kebab and is also the Vercel project name. `icon` is a [Lucide](https://lucide.dev/icons)
  name; the hub renders it white on black for the favicon, the project page, `/projects` and the OG card
  (unknown or missing → `box`, and the check warns). There are no per-project colors: the primary color is
  white everywhere, and `accent` or `emoji` are ignored. Optional:
  - `"url": "https://<slug>.vercel.app"`: the deployed demo, which `/project/<slug>/` proxies. Add it after
    the first deploy.
  - `"demo": false`: no live demo; the page renders the README. (Without `project.json` the hub uses the
    repo name and description and treats it as README-only.)
  - `"typeset": { "body": "…", "heading": "…", "mono": "…", "size": "15px", "leading": 1.75, "flow": "1.25em", "measure": "37em" }`:
    typefaces (Google Fonts names) and typeset's knobs. Change nothing else about type.
- **`vercel.json`**: copy
  [`templates/project/vercel.json`](https://github.com/kevinschaich/kevinschaich/blob/main/templates/project/vercel.json)
  unchanged. Add a SPA fallback rewrite (`/(.*)` → `/index.html`) only if the app has client-side routes.
  No `functions`, `crons` or middleware; the shared workflow fails if it finds any.
- **`.github/workflows/checks.yml`**:
  ```yaml
  name: Checks
  on:
    push:
      branches: [main]
    pull_request:
  jobs:
    checks:
      uses: kevinschaich/kevinschaich/.github/workflows/project.yml@main
  ```
  Checks only, no secrets: gitleaks, build, static-only `vercel.json` (and drift from the template), title,
  byline and OG tags.
- **Deploys:** Vercel's GitHub integration, set up by Kevin's one-time import. CI never deploys.
- **README-only projects** need only the topic and, ideally, `project.json` with `"demo": false`. No
  `vercel.json`, no deploy workflow, no Vercel project.

## Every page

- **Title**: `<Name> | by kevinschaich`, exactly.
- **Byline**: "by kevinschaich · code on github · all projects", linking to https://kevinschaich.com, the
  project's own GitHub repo, and https://kevinschaich.com/projects. Use the shared byline, never a
  hand-rolled copy, and always pass the project's repo (`<Byline repo="kevinschaich/<repo>" />`, or
  `<span data-ks-byline="kevinschaich/<repo>"></span>` on no-build pages).
- **Data sources**: every project that uses outside data, tiles, icons or art credits each source in a
  "Data sources" dialog (shadcn `Dialog`): what it is, where it's from (linked), and its license. Keep the
  trigger quiet and suited to the page, never a banner: an "i" icon with the map controls, or a small muted
  "Data sources" link in a corner (e.g. beside a minimap). The README's credits section lists the same sources.
- **Relative asset paths only** (`worker.js`, not `/worker.js`).
- **Use the kevinschaich.com address.** Third-party data hosts may block `*.vercel.app` origins (Overture's
  tiles.overturemaps.org answers 403 to them but serves kevinschaich.com), so always test and link
  `https://kevinschaich.com/project/<slug>/`, never the vercel.app URL.
- **OG image and favicon** come from the hub, never from the repo, so changing the generator updates
  every project:
  ```html
  <link rel="icon" href="https://kevinschaich.com/icon/<slug>.png">
  <link rel="apple-touch-icon" href="https://kevinschaich.com/icon/<slug>-180.png">
  <meta property="og:title" content="<Name> | by kevinschaich">
  <meta property="og:description" content="<tagline>">
  <meta property="og:image" content="https://kevinschaich.com/og/<slug>.png">
  <meta property="og:url" content="https://kevinschaich.com/project/<slug>/">
  <meta name="twitter:card" content="summary_large_image">
  ```

## One description everywhere

`tagline` in `project.json` is the project's only description: one benefit-first line of 60 characters or
fewer that says why you'd open it, not what it does ("Find the roads worth driving, anywhere.", not "A
MapLibre map of scenic roads"). It is used verbatim in all four places: the README's first line under the
heading, `og:description`, the OG card image (automatic) and the GitHub repo description, which Kevin sets
with `gh repo edit --description "<tagline>"`. The shared check fails when the README line or
`og:description` differs from `project.json`.

## README

Brief and in this shape. "Try it" always points at `kevinschaich.com/project/<slug>/`, never `*.vercel.app`;
the hub drops that line when it renders the README as the project page.

```md
[![<Name> by kevinschaich](https://kevinschaich.com/og/<slug>.png)](https://kevinschaich.com/project/<slug>/)

# <Name>

<tagline>

**[Try it →](https://kevinschaich.com/project/<slug>/)**

## How it works
A few short paragraphs or bullets.

## Run locally
The one or two commands.
```

## The project's own AGENTS.md

Starts with this line, then project-specific notes, then an **Approved exceptions** section if any.
`CLAUDE.md` is just `@AGENTS.md`.

```md
> **VERY IMPORTANT: before doing anything else, download the current version of https://kevinschaich.com/AGENTS.md and read it. It holds the shared rules for all of Kevin's projects. Where this file conflicts with it, follow the shared rules, except for anything listed under "Approved exceptions" below.**
```

## Components and styling

- **Components are shadcn, through `@kevinschaich/components`.** It contains every shadcn component
  (base-nova style, zinc theme, Base UI), unmodified, plus the byline. Never install shadcn, Base UI or Radix
  in a project, and never copy a component into one. If something is missing or needs changing, change
  `packages/components` in the hub first (`bunx shadcn add <name>` there, or a deliberate edit in its own
  commit), then use it.
- React projects: `bun add @kevinschaich/components`, then in the main CSS file:
  ```css
  @import "tailwindcss";
  @import "@kevinschaich/components/theme.css";
  @import "@kevinschaich/components/styles.css";
  @source "../node_modules/@kevinschaich/components/dist";
  ```
  Put `class="dark"` on `<html>`. Import components by name (`import { Button, Card } from
  '@kevinschaich/components'`, or one at a time from `@kevinschaich/components/ui/button`) and render
  `<Byline repo="kevinschaich/<repo>" />`. Add a `renovate.json` with
  `{ "extends": ["github>kevinschaich/kevinschaich//.github/renovate-project-preset"] }` so Renovate
  auto-merges updates.
- No-build pages: load the runtime kit, which always matches `main`:
  ```html
  <link rel="stylesheet" href="https://kevinschaich.com/kit/v1/brand.css">
  <link rel="stylesheet" href="https://kevinschaich.com/kit/v1/typeset.css">
  <link rel="stylesheet" href="https://kevinschaich.com/kit/v1/project/<slug>.css">
  <script type="module" src="https://kevinschaich.com/kit/v1/brand.js"></script>
  ```
  Put `<span data-ks-byline="kevinschaich/<repo>"></span>` where the byline goes, or call
  `window.kevinschaich.bylineHTML("kevinschaich/<repo>")`.
- Look: shadcn's zinc theme, dark, with shadcn's default radius (`--radius: 0.625rem`).
- Type: [shadcn/typeset](https://ui.shadcn.com/docs/typeset). `typeset.css` is vendored unmodified (a weekly
  job opens a PR when upstream changes); customize only through presets. Article content goes in
  `<div class="typeset typeset-kevinschaich">`; use `not-typeset` to exclude embedded components.
- Fonts come only from `--font-sans` (default Public Sans), `--font-heading` (defaults to sans) and
  `--font-mono` (default JetBrains Mono). Never name a font family anywhere else; UI chrome uses these
  variables too. `kit/v1/project/<slug>.css` loads the faces from `project.json` and sets the variables.

## Never

- No API keys, tokens or other secrets in a repo, including in history, `.env` files and client code.
- No data branches. Generated data is built in CI and shipped as static files, not committed.

## Commits

- Imperative, sentence case, subject ≤72 characters, no prefixes (`feat:`, `fix:` …), no trailing period.
- A short body saying why, when the subject doesn't.
- Docs-only changes: add `[skip ci]` to the subject.
