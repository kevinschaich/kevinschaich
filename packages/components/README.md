# @kevinschaich/components

Every [shadcn](https://ui.shadcn.com) component (base-nova style, zinc, Base UI) plus Kevin's branding: Public Sans
and JetBrains Mono, [shadcn/typeset](https://ui.shadcn.com/docs/typeset), and the byline. Components are shadcn's
source, unmodified; a weekly job re-syncs them and opens a PR.

```sh
bun add @kevinschaich/components
```

```css
@import "tailwindcss";
@import "@kevinschaich/components/theme.css";
@import "@kevinschaich/components/styles.css";
@source "../node_modules/@kevinschaich/components/dist";
```

```tsx
import { Button, Card, Byline } from '@kevinschaich/components'

<Byline repo="kevinschaich/backroads" />
```

Put `class="dark"` on `<html>` for the dark theme. Components also import one at a time from
`@kevinschaich/components/ui/<name>`.

No build step? Load the runtime kit from kevinschaich.com instead, which always matches `main`:

```html
<link rel="stylesheet" href="https://kevinschaich.com/kit/v1/brand.css">
<script type="module" src="https://kevinschaich.com/kit/v1/brand.js"></script>
<span data-ks-byline="kevinschaich/backroads"></span>
```

## Working on it

- Add a shadcn component: `bunx shadcn add <name>` here, then export it from `src/index.ts`.
- `bun run build` regenerates the plain-CSS tokens from `src/theme.css` and builds `dist/`.
- Release: bump `version` and push; CI publishes through npm trusted publishing.
