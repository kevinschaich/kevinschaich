import type { Plugin } from 'vite'

/**
 * Vite settings every app using `@kevinschaich/components/map` needs:
 * - MapLibre (and the map entry of `@kevinschaich/components`, which imports MapLibre's worker with `?worker&url`) stay out of dependency
 *   pre-bundling, which would move the modules and break the worker URL.
 * - React, MapLibre and the components resolve to one copy, even when the components package is linked from a local folder.
 */
export function kevinschaichMap(): Plugin {
    return {
        name: 'kevinschaich-map',
        config: () => ({
            optimizeDeps: { exclude: ['maplibre-gl', '@kevinschaich/components'] },
            resolve: { dedupe: ['react', 'react-dom', 'maplibre-gl', '@kevinschaich/components'] },
        }),
    }
}
