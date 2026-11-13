import { readdirSync } from 'node:fs'
import { defineConfig } from 'tsup'

// dist is cleared by the build script, not by `clean`: these configs run at the same time, so a clean here races
// the other configs' output.
// One entry per shadcn component (dist/ui/<name>.js) plus the index and the map entries (dist/map/index.js, imported
// as '@kevinschaich/components/map', and the Vite plugin dist/map/vite.js), with shared code split into chunks, so a
// project only ships what it imports. Dependencies stay external. scripts/use-client.mjs adds "use client" after
// the build, since the bundler drops directives.
const ui = Object.fromEntries(
    readdirSync('src/components/ui')
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => [`ui/${f.slice(0, -4)}`, `src/components/ui/${f}`]),
)

export default defineConfig([
    {
    entry: { index: 'src/index.ts', 'map/index': 'src/map/index.ts', 'map/vite': 'src/map/vite.ts', ...ui },
    format: ['esm'],
    dts: true,
    splitting: true,
    treeshake: true,
    clean: false,
    sourcemap: false,
    // MapLibre is an optional peer, only imported by the map entry. Its worker import (`…?worker&url`) is left for
    // the app's Vite to resolve, which is why map apps add kevinschaichMap() from '@kevinschaich/components/map/vite'.
    external: [/^maplibre-gl/, 'vite'],
    },
    // The shared OpenGraph card. Rendered on a server (Satori), never in the browser, and it reads the backdrop off
    // disk relative to its own file, so it is kept unsplit and out of the "use client" pass.
    {
        entry: { 'og/index': 'src/og/index.ts' },
        format: ['esm'],
        dts: true,
        splitting: false,
        clean: false,
        sourcemap: false,
    },
    // The runtime kit for no-build pages, served from kevinschaich.com/kit/v1/: standalone browser modules.
    {
        entry: { 'kit/brand': 'src/brand.ts', 'kit/byline': 'src/byline.ts' },
        format: ['esm'],
        clean: false,
        splitting: false,
        sourcemap: false,
    },
])
