import type { Feature, Position } from 'geojson'
import type { Map } from 'maplibre-gl'
import type { Bounds } from './MapView'

/** The [west, south, east, north] box around some features, or null when there are none. */
export function bboxOf(features: Feature[]): Bounds | null {
    let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity
    const visit = (c: unknown): void => {
        if (typeof (c as Position)[0] === 'number') {
            const [x, y] = c as Position
            if (x < w) w = x
            if (x > e) e = x
            if (y < s) s = y
            if (y > n) n = y
        } else (c as unknown[]).forEach(visit)
    }
    for (const f of features) {
        const g = f.geometry
        if (!g) continue
        if (g.type === 'GeometryCollection') g.geometries.forEach((x) => 'coordinates' in x && visit(x.coordinates))
        else visit(g.coordinates)
    }
    return Number.isFinite(w) ? [w, s, e, n] : null
}

/** Pan/zoom to features (a single point zooms to `pointZoom`). */
export function fitToFeatures(map: Map, features: Feature[], opts: { padding?: number; maxZoom?: number; pointZoom?: number } = {}) {
    const b = bboxOf(features)
    if (!b) return
    if (b[0] === b[2] && b[1] === b[3]) map.flyTo({ center: [b[0], b[1]], zoom: Math.max(map.getZoom(), opts.pointZoom ?? 9) })
    else map.fitBounds(b, { padding: opts.padding ?? 60, maxZoom: opts.maxZoom ?? 14 })
}

export type Place = { name: string; detail: string; lat: number; lon: number; extent?: Bounds }

/** Photon (photon.komoot.io) place search, made for search-as-you-type, biased toward a point. */
export async function searchPlaces(text: string, opts: { near?: { lat: number; lng: number }; limit?: number; lang?: string; signal?: AbortSignal } = {}): Promise<Place[]> {
    const q = new URLSearchParams({ q: text, limit: String(opts.limit ?? 6), lang: opts.lang ?? 'en' })
    if (opts.near) {
        q.set('lat', opts.near.lat.toFixed(3))
        q.set('lon', opts.near.lng.toFixed(3))
    }
    const r = await fetch(`https://photon.komoot.io/api/?${q}`, { signal: opts.signal })
    if (!r.ok) throw new Error(`Photon ${r.status}`)
    const j = (await r.json()) as {
        features: { geometry: { coordinates: [number, number] }; properties: Record<string, string> & { extent?: [number, number, number, number] } }[]
    }
    return j.features.map(({ geometry, properties: p }) => {
        const name = p.name ?? ([p.housenumber, p.street].filter(Boolean).join(' ') || p.city || p.state || 'Unnamed place')
        const detail = [p.city !== name ? p.city : undefined, p.state !== name ? p.state : undefined, p.country !== name ? p.country : undefined]
            .filter(Boolean)
            .join(', ')
        // Photon's extent is [west, north, east, south].
        const x = p.extent
        return { name, detail, lon: geometry.coordinates[0], lat: geometry.coordinates[1], extent: x ? [x[0], x[3], x[2], x[1]] : undefined }
    })
}
