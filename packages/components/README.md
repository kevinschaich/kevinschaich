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
the `maplibregl.Map` (typed loosely as `MapLike`, so the main entry has no MapLibre dependency) and renders into the
map's container, so it works with or without `<MapView>` (see Map below). Props: `sources`,
`sourcesDescription`, `zoom` and `locate` (default `true`), and `children` for extra buttons (use `<ControlButton>`).

No build step? Load the runtime kit from kevinschaich.com instead, which always matches `main`:

```html
<link rel="stylesheet" href="https://kevinschaich.com/kit/v1/brand.css">
<script type="module" src="https://kevinschaich.com/kit/v1/brand.js"></script>
<span data-ks-byline="kevinschaich/backroads"></span>
```

## Map

Shared MapLibre pieces for the map projects, in their own entry point so apps without a map never pull in MapLibre:
`@kevinschaich/components/map` (a full-bleed map with the `MapControls` stack, GeoJSON layers with per-feature colors and
selection, and the glass panel, feature card, legend and place search that sit over it), `@kevinschaich/components/map/vite`
(the Vite plugin) and `@kevinschaich/components/map.css`.

### Set up an app

```sh
bun add @kevinschaich/components maplibre-gl lucide-react
```

`maplibre-gl` is an optional peer dependency: only apps that import `@kevinschaich/components/map` need it.

`vite.config.ts`: add the plugin. It keeps MapLibre and this package out of dependency pre-bundling (the map entry
loads MapLibre's worker with `maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url`, which only Vite's own transform
resolves) and dedupes React, MapLibre and the components so a linked copy can't load a second React.

```ts
import { kevinschaichMap } from '@kevinschaich/components/map/vite'
export default defineConfig({ base: './', plugins: [react(), tailwindcss(), kevinschaichMap()] })
```

Main CSS file:

```css
@import "tailwindcss";
@import "@kevinschaich/components/theme.css";
@import "@kevinschaich/components/styles.css";
@import "@kevinschaich/components/map.css";          /* MapLibre's CSS */
@source "../node_modules/@kevinschaich/components/dist";
```

and `html, body, #root { height: 100%; margin: 0; overflow: hidden }`.

### Example

```tsx
import { BASEMAP_SOURCES, BasemapTabs, FeatureCard, Legend, MapPanel, MapView, PHOTON_SOURCE, PlaceSearch, PointLayer } from '@kevinschaich/components/map'

<MapView center={[-100, 40]} zoom={3} storageKey="my-app" sources={[...MY_SOURCES, ...BASEMAP_SOURCES, PHOTON_SOURCE]}
    onBackgroundClick={() => setSelected(null)}>
    <PointLayer id="parks" data="parks.geojson" color={{ property: 'kind', colors: { a: '#7CB342', b: '#0288D1' } }}
        hide={{ property: 'kind', values: hidden }} selectedId={selected} onSelect={(f) => setSelected(f.properties.id)} cluster label="name" />
    <MapPanel title="My App" description="What to do here.">
        <PlaceSearch searchFeatures={(q) => myHits(q)} />
        <Legend items={[{ value: 'a', label: 'A', color: '#7CB342' }]} hidden={hidden} onHiddenChange={setHidden} />
        <span className="text-sm font-medium">Basemap</span>
        <BasemapTabs />
        <Byline repo="kevinschaich/my-app" />
    </MapPanel>
    {selected && <FeatureCard title="…" badge={<Badge>…</Badge>} onClose={() => setSelected(null)}>…</FeatureCard>}
</MapView>
```

### API

#### `<MapView>`

Full-bleed map (`fixed inset-0` unless `className` is given). Children render once the style has loaded, inside the
map context, so layers and overlays can call `useMap()`.

| Prop | |
| --- | --- |
| `center`, `zoom` | Starting view (default the contiguous U.S.). |
| `bounds` | `[w, s, e, n]` to start fitted to instead. |
| `hash` | Keep `#zoom/lat/lon` in the URL (default `true`); a hash on load wins over everything. |
| `storageKey` | Remember basemap and last view in localStorage under this prefix. |
| `basemap` / `defaultBasemap` / `onBasemapChange` | `'dark' \| 'streets' \| 'satellite' \| 'none'`, controlled or not (default `'dark'`). |
| `sources`, `sourcesDescription` | Credits for the (i) Data sources dialog in the control stack (omit to hide the (i)). |
| `zoomControl`, `locateControl` | Default `true`. |
| `controls` | Extra buttons at the bottom of the control stack (`<ControlButton>` from `@kevinschaich/components`). |
| `lightUiOnLightBasemap` | Drop `<html class="dark">` while Streets shows (Backroads' approved exception). Default off. |
| `onBackgroundClick` | A click that hit no interactive feature (e.g. close the card). |
| `options` | Extra `maplibregl.MapOptions`. |
| `ref` | The `maplibregl.Map`. |

`useMap()` → `{ map, basemap, setBasemap, interactive }`. `<BasemapTabs choices?>` renders the basemap switch; put it in
the panel under a "Basemap" heading, always shown.

#### Layers: `<PointLayer>`, `<LineLayer>`, `<PolygonLayer>`

Each adds one GeoJSON source and its MapLibre layers (ids prefixed with `id`) and removes them on unmount.

| Prop | |
| --- | --- |
| `id` | Unique per map. |
| `data` | A `FeatureCollection` or a URL to one. Changing it calls `setData`. |
| `color` | `'#hex'`, or `{ property, colors: { value: '#hex' }, fallback? }`. |
| `hide` | `{ property, values }`: hide features whose property is one of `values` (pairs with `Legend`). |
| `filter` | Any extra MapLibre filter expression. |
| `featureId` | Property that identifies a feature (default `'id'`, promoted to the feature id). |
| `selectedId` | Draws a highlight on that feature. |
| `onSelect(feature)`, `onHover(feature \| null)` | Make the layer interactive (pointer cursor, hover emphasis). |
| `fit` | Fit to the data once loaded (`true` or padding px); skipped when the URL already has a view. |
| `beforeId` | Insert below this layer. |
| `label`, `labelMinZoom` | Show a property as text (at points, along lines, at polygon centers) from `labelMinZoom` (default 7). |
| `hidden` | Hide the layer without removing it. |

Style props (`color`, `radius`/`width`/`opacity`/`outlineWidth`, `label`, `hidden`) can change at any time; the layer
re-applies them. `color` also takes a numeric ramp: `{ property, stops: [[value, '#hex'], …], fallback? }` (values
that aren't numbers get `fallback`). `colorExpr(color, default)` returns the MapLibre expression.

`PointLayer` adds `radius`, `opacity` and `cluster` (`true` or `{ radius, maxZoom }`; clicking a cluster zooms into it) and `badge` (`{ filter, color? }`: a small
white-check-on-blue mark at the top right of each point matching `filter`, like a verified check). `LineLayer` adds `width` and `opacity`; `PolygonLayer` adds
`opacity` (fill) and `outlineWidth`. Text uses MapLibre's demo glyphs (`Open Sans Semibold`).

#### Overlays

- `<MapPanel title? description?>`: the glass panel, top left on wide screens, a bottom sheet on phones.
- `<FeatureCard title subtitle? badge? onClose? footer?>`: the glass card for the selected feature, top right (left
  of the controls) or a bottom sheet over the panel on phones.
- `<Legend items={[{ value, label, color?, hint?, extra? }]} hidden onHiddenChange swatch?>`: categories with
  checkboxes; leave out `color` for a plain filter list. `swatch` is `'dot' | 'line' | 'square'`.
- `<PlaceSearch searchFeatures? featuresHeading? placeholder? onPlace? places?>`: search as you type on `Command`.
  `searchFeatures(q)` returns the app's own matches (`{ key, label, detail?, icon?, onSelect }`), listed first;
  then Photon places biased to the view. Choosing a place fits/flies there unless `onPlace` is given.

#### Drawing

`<DrawTool mode={'point' | 'line' | 'polygon' | null} onCreate={(geometry) => …} onCancel? color? toolbar?>`: click or
tap to draw. Lines/areas finish on double-click, Enter, clicking the last (or, for areas, first) vertex, or the
floating bar's Finish button (on by default; it also has Undo and Stop). Backspace undoes a vertex, Escape cancels.
While a mode is on, feature `onSelect` and `onBackgroundClick` are paused (`useMap().clicks.off`).

#### Helpers

`BASEMAPS`, `BASEMAP_SOURCES` and `PHOTON_SOURCE` (credits to spread into `sources`), `bboxOf(features)`,
`fitToFeatures(map, features, opts)`, `searchPlaces(text, { near, limit, lang, signal })`.

## Working on it

- Add a shadcn component: `bunx shadcn add <name>` here, then export it from `src/index.ts`.
- `bun run build` regenerates the plain-CSS tokens from `src/theme.css` and builds `dist/`.
- Release: bump `version` and push; CI publishes through npm trusted publishing.
