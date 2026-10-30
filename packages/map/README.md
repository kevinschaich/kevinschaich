# @kevinschaich/map

Shared MapLibre map pieces for Kevin's map projects: a full-bleed map with the shared control stack (`MapControls` from
`@kevinschaich/components`: zoom, locate, the (i) Data sources dialog), GeoJSON layers with per-feature colors and selection, and the glass
panel, feature card, legend and place search that sit over it. UI comes from `@kevinschaich/components`.

## Set up an app

```sh
bun add @kevinschaich/map maplibre-gl @kevinschaich/components lucide-react
# while unpublished: "@kevinschaich/map": "file:../kevinschaich/packages/map" (run `bun run build` here first)
```

`vite.config.ts`: add the plugin. It keeps MapLibre and this package out of dependency pre-bundling (the package
loads MapLibre's worker with `maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url`, which only Vite's own transform
resolves) and dedupes React, MapLibre and the components so a linked copy can't load a second React.

```ts
import { kevinschaichMap } from '@kevinschaich/map/vite'
export default defineConfig({ base: './', plugins: [react(), tailwindcss(), kevinschaichMap()] })
```

Main CSS file:

```css
@import "tailwindcss";
@import "@kevinschaich/components/theme.css";
@import "@kevinschaich/components/styles.css";
@import "@kevinschaich/map/map.css";          /* MapLibre's CSS */
@source "../node_modules/@kevinschaich/components/dist";
@source "../node_modules/@kevinschaich/map/dist";
```

and `html, body, #root { height: 100%; margin: 0; overflow: hidden }`.

## Example

```tsx
import { BASEMAP_SOURCES, BasemapTabs, FeatureCard, Legend, MapPanel, MapView, PHOTON_SOURCE, PlaceSearch, PointLayer } from '@kevinschaich/map'

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

## API

### `<MapView>`

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

### Layers: `<PointLayer>`, `<LineLayer>`, `<PolygonLayer>`

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

### Overlays

- `<MapPanel title? description?>`: the glass panel, top left on wide screens, a bottom sheet on phones.
- `<FeatureCard title subtitle? badge? onClose? footer?>`: the glass card for the selected feature, top right (left
  of the controls) or a bottom sheet over the panel on phones.
- `<Legend items={[{ value, label, color?, hint?, extra? }]} hidden onHiddenChange swatch?>`: categories with
  checkboxes; leave out `color` for a plain filter list. `swatch` is `'dot' | 'line' | 'square'`.
- `<PlaceSearch searchFeatures? featuresHeading? placeholder? onPlace? places?>`: search as you type on `Command`.
  `searchFeatures(q)` returns the app's own matches (`{ key, label, detail?, icon?, onSelect }`), listed first;
  then Photon places biased to the view. Choosing a place fits/flies there unless `onPlace` is given.

### Drawing

`<DrawTool mode={'point' | 'line' | 'polygon' | null} onCreate={(geometry) => …} onCancel? color? toolbar?>`: click or
tap to draw. Lines/areas finish on double-click, Enter, clicking the last (or, for areas, first) vertex, or the
floating bar's Finish button (on by default; it also has Undo and Stop). Backspace undoes a vertex, Escape cancels.
While a mode is on, feature `onSelect` and `onBackgroundClick` are paused (`useMap().clicks.off`).

### Helpers

`BASEMAPS`, `BASEMAP_SOURCES` and `PHOTON_SOURCE` (credits to spread into `sources`), `bboxOf(features)`,
`fitToFeatures(map, features, opts)`, `searchPlaces(text, { near, limit, lang, signal })`.

## Develop

`bun run build` (tsup → `dist/`), `bun run typecheck`. Apps linked with `file:` see rebuilt files right away (bun
symlinks each file); restart their dev server if new files appear in `dist/`.
