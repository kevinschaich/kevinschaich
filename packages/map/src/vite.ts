import type { Plugin } from 'vite'

/**
 * Vite settings every app using `@kevinschaich/map` needs:
 * - MapLibre (and this package, which imports MapLibre's worker with `?worker&url`) stay out of dependency
 *   pre-bundling, which would move the modules and break the worker URL.
 * - React, MapLibre and the components resolve to one copy, even when this package is linked from a local folder.
 */
export function kevinschaichMap(): Plugin {
    return {
        name: 'kevinschaich-map',
        config: () => ({
            optimizeDeps: { exclude: ['maplibre-gl', '@kevinschaich/map'] },
            resolve: { dedupe: ['react', 'react-dom', 'maplibre-gl', '@kevinschaich/components'] },
        }),
    }
}
