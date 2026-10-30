# @kevinschaich/components

Every [shadcn](https://ui.shadcn.com) component (base-nova style, zinc, Base UI) plus Kevin's branding: Public Sans
and JetBrains Mono, [shadcn/typeset](https://ui.shadcn.com/docs/typeset), and the byline. Components start as shadcn's
source and are customized here where Kevin wants them different (each change commented); a weekly job
re-syncs them and opens a PR, which keeps those customizations.

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

### Map controls

`<MapControls map={map} sources={SOURCES} />` puts the shared top-right control stack on a MapLibre map: grouped
glass buttons for zoom +/−, locate me (flies there and shows a dot) and the (i) Data sources dialog. It takes just
the `maplibregl.Map` (typed loosely as `MapLike`, so this package has no MapLibre dependency) and renders into the
map's container, so it works with or without `@kevinschaich/map`'s `<MapView>`. Props: `sources`,
`sourcesDescription`, `zoom` and `locate` (default `true`), and `children` for extra buttons (use `<ControlButton>`).

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
