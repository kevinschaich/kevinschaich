import { readdirSync } from 'node:fs'
import { defineConfig } from 'tsup'

// One entry per shadcn component (dist/ui/<name>.js) plus the index, with shared code split into chunks, so a
// project only ships what it imports. Dependencies stay external. scripts/use-client.mjs adds "use client" after
// the build, since the bundler drops directives.
const ui = Object.fromEntries(
    readdirSync('src/components/ui')
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => [`ui/${f.slice(0, -4)}`, `src/components/ui/${f}`]),
)

export default defineConfig([
    {
    entry: { index: 'src/index.ts', ...ui },
    format: ['esm'],
    dts: true,
    splitting: true,
    treeshake: true,
    clean: true,
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
