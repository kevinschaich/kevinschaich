import { readdirSync } from 'node:fs'
import { defineConfig } from 'tsup'

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
    clean: true,
    sourcemap: false,
    // MapLibre is an optional peer, only imported by the map entry. Its worker import (`…?worker&url`) is left for
    // the app's Vite to resolve, which is why map apps add kevinschaichMap() from '@kevinschaich/components/map/vite'.
    external: [/^maplibre-gl/, 'vite'],
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
