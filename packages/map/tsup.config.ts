import { defineConfig } from 'tsup'

// ESM with types; every dependency stays external. The MapLibre worker import (`…?worker&url`) is left as-is for the
// app's Vite to resolve, which is why apps add `kevinschaichMap()` from `@kevinschaich/map/vite` (see README).
export default defineConfig({
    entry: { index: 'src/index.ts', vite: 'src/vite.ts' },
    format: ['esm'],
    dts: true,
    splitting: true,
    treeshake: true,
    clean: true,
    sourcemap: false,
    external: [/^maplibre-gl/, /^@kevinschaich\//, 'react', 'react-dom', 'lucide-react', 'vite'],
})
