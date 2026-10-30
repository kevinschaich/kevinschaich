import type { FeatureCollection } from 'geojson'
import type { ExpressionSpecification, FilterSpecification, GeoJSONSource, Map as MlMap, LayerSpecification, MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { useMap } from './MapView'
import { bboxOf } from './util'

/**
 * One color; a color per value of a property (with a fallback for anything else); or a numeric ramp that blends
 * between `stops` (`[value, color]`, ascending) by a number property.
 */
export type ColorBy =
    | string
    | { property: string; colors: Record<string, string>; fallback?: string }
    | { property: string; stops: [number, string][]; fallback?: string }

export type LayerProps = {
    /** Unique per map; also the prefix of the MapLibre layer ids (`<id>`, `<id>-hl`, …). */
    id: string
    /** GeoJSON, or a URL to it (relative URLs resolve against the page). */
    data: FeatureCollection | string
    color?: ColorBy
    /** Hide features whose `property` value is in `values` (e.g. categories switched off in a Legend). */
    hide?: { property: string; values: (string | number)[] }
    /** Any extra MapLibre filter, combined with `hide`. */
    filter?: FilterSpecification
    /** Property that identifies a feature; used for selection and hover. Default "id". */
    featureId?: string
    /** The selected feature's id: drawn with a highlight. */
    selectedId?: string | number | null
    /** Click on a feature. Makes the layer interactive (pointer cursor, hover highlight). */
    onSelect?: (feature: MapGeoJSONFeature) => void
    onHover?: (feature: MapGeoJSONFeature | null) => void
    /** Fit the map to the data once it first loads (true, or padding in px). Skipped when the URL already has a view. */
    fit?: boolean | number
    /** Insert below this MapLibre layer. */
    beforeId?: string
    /** Show this property as text on each feature from `labelMinZoom` (default 7). Can change at any time. */
    label?: string
    labelMinZoom?: number
    /** Hide the whole layer without removing it. */
    hidden?: boolean
}

// Text for `label`: at the point, along the line, or at the polygon's center.
const labelLayer = (id: string, src: string, p: LayerProps, placement: 'point' | 'line' | 'center', filter?: FilterSpecification): LayerSpecification => ({
    id: `${id}-label`,
    type: 'symbol',
    source: src,
    minzoom: p.labelMinZoom ?? 7,
    ...(filter ? { filter } : {}),
    layout: {
        'text-field': p.label ? ['to-string', ['get', p.label]] : '',
        'text-font': ['Open Sans Semibold'],
        'text-size': 12,
        'symbol-placement': placement === 'line' ? 'line' : 'point',
        ...(placement === 'point' ? { 'text-offset': [0, 1.1], 'text-anchor': 'top' } : {}),
        'text-optional': true,
        visibility: p.label ? 'visible' : 'none',
    } as LayerSpecification['layout'],
    paint: { 'text-color': '#fafafa', 'text-halo-color': 'rgba(9,9,11,0.85)', 'text-halo-width': 1.5 },
}) as LayerSpecification

/** The MapLibre expression for a `ColorBy` (exported for apps drawing their own layers). */
export const colorExpr = (c: ColorBy | undefined, dflt: string): ExpressionSpecification | string => {
    if (!c) return dflt
    if (typeof c === 'string') return c
    if ('stops' in c) {
        const st = [...c.stops].sort((a, b) => a[0] - b[0])
        if (!st.length) return c.fallback ?? dflt
        if (st.length === 1 || st[0][0] === st[st.length - 1][0]) return st[0][1]
        // Numbers, or strings that read as numbers; anything else (missing, null, text) gets the fallback.
        const S = -3.4e38
        const raw = ['get', c.property]
        const value = ['to-number', raw, S]
        return [
            'case',
            ['any', ['==', ['typeof', raw], 'number'], ['all', ['==', ['typeof', raw], 'string'], ['!=', raw, ''], ['>', value, S]]],
            ['interpolate', ['linear'], value, ...st.flat()],
            c.fallback ?? dflt,
        ] as unknown as ExpressionSpecification
    }
    if (!Object.keys(c.colors).length) return c.fallback ?? dflt
    const pairs = Object.entries(c.colors).flat()
    return ['match', ['to-string', ['get', c.property]], ...pairs, c.fallback ?? dflt] as unknown as ExpressionSpecification
}

const filterExpr = (hide: LayerProps['hide'], extra: FilterSpecification | undefined, base?: FilterSpecification): FilterSpecification | undefined => {
    const parts: unknown[] = []
    if (base) parts.push(base)
    if (extra) parts.push(extra)
    if (hide?.values.length)
        parts.push(['!', ['in', ['to-string', ['get', hide.property]], ['literal', hide.values.map(String)]]])
    return parts.length ? (['all', ...parts] as FilterSpecification) : undefined
}

/** Shared plumbing: a GeoJSON source, the given layers, data/filter updates, hover, clicks and fit-to-data. */
function useGeoJsonLayers(
    p: LayerProps,
    layers: (src: string) => LayerSpecification[],
    opts: { cluster?: { radius?: number; maxZoom?: number }; clickable: string[]; baseFilter?: Record<string, FilterSpecification> },
) {
    const { map, interactive, clicks } = useMap()
    const src = p.id
    const featureId = p.featureId ?? 'id'
    const cb = useRef(p)
    cb.current = p
    const hovered = useRef<string | number | null>(null)

    // Source and layers, once.
    useEffect(() => {
        map.addSource(src, {
            type: 'geojson',
            data: p.data,
            promoteId: featureId,
            ...(opts.cluster ? { cluster: true, clusterRadius: opts.cluster.radius ?? 40, clusterMaxZoom: opts.cluster.maxZoom ?? 9 } : {}),
        })
        for (const l of layers(src)) map.addLayer(l, p.beforeId)
        const ids = opts.clickable
        const setHover = (id: string | number | null) => {
            if (hovered.current != null) map.setFeatureState({ source: src, id: hovered.current }, { hover: false })
            hovered.current = id
            if (id != null) map.setFeatureState({ source: src, id }, { hover: true })
        }
        const move = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            const f = e.features?.[0]
            map.getCanvas().style.cursor = 'pointer'
            if (f && !f.properties.cluster) {
                setHover(f.id ?? null)
                cb.current.onHover?.(f)
            }
        }
        const leave = () => {
            map.getCanvas().style.cursor = ''
            setHover(null)
            cb.current.onHover?.(null)
        }
        const click = async (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            const f = e.features?.[0]
            if (!f || clicks.off) return
            if (f.properties.cluster) {
                const zoom = await (map.getSource(src) as GeoJSONSource).getClusterExpansionZoom(f.properties.cluster_id)
                map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom })
                return
            }
            cb.current.onSelect?.(f)
        }
        for (const id of ids) {
            interactive.add(id)
            map.on('mousemove', id, move)
            map.on('mouseleave', id, leave)
            map.on('click', id, click)
        }
        return () => {
            for (const id of ids) {
                interactive.delete(id)
                map.off('mousemove', id, move)
                map.off('mouseleave', id, leave)
                map.off('click', id, click)
            }
            // The map may already be gone (MapView unmounting first).
            try {
                for (const l of layers(src)) if (map.getLayer(l.id)) map.removeLayer(l.id)
                if (map.getSource(src)) map.removeSource(src)
            } catch {}
        }
        // Layers are created once per id; data, filters and selection update below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, src])

    // New data.
    const first = useRef(true)
    useEffect(() => {
        if (first.current) {
            first.current = false
            return
        }
        ;(map.getSource(src) as GeoJSONSource | undefined)?.setData(p.data)
    }, [map, src, p.data])

    // Fit to the data once, unless the page opened on a shared view.
    const fitted = useRef(false)
    useEffect(() => {
        if (!p.fit || fitted.current || /^#[\d.]+\/[-\d.]+\/[-\d.]+$/.test(location.hash)) return
        fitted.current = true
        const pad = typeof p.fit === 'number' ? p.fit : 40
        const go = (fc: FeatureCollection) => {
            const b = bboxOf(fc.features)
            if (b) map.fitBounds(b, { padding: pad, maxZoom: 12, duration: 0 })
        }
        if (typeof p.data === 'string')
            fetch(new URL(p.data, location.href))
                .then((r) => r.json())
                .then(go)
                .catch(() => {})
        else go(p.data)
    }, [map, p.data, p.fit])

    // Filters.
    const hideKey = JSON.stringify([p.hide, p.filter])
    useEffect(() => {
        for (const l of layers(src)) {
            if (!map.getLayer(l.id) || l.id.endsWith('-hl')) continue
            map.setFilter(l.id, filterExpr(p.hide, p.filter, opts.baseFilter?.[l.id]) ?? null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, src, hideKey])

    // Selection highlight.
    useEffect(() => {
        const sel = p.selectedId ?? null
        for (const l of layers(src))
            if (l.id.endsWith('-hl') && map.getLayer(l.id))
                map.setFilter(l.id, ['all', ['!', ['has', 'point_count']], ['==', ['id'], sel ?? '__none__']] as FilterSpecification)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, src, p.selectedId])

    // Style props (colors, sizes, opacity, labels, hidden) can change at any time: re-apply paint and layout.
    const specs = layers(src)
    const styleKey = JSON.stringify([specs.map((l) => ['paint' in l ? l.paint : 0, 'layout' in l ? l.layout : 0, l.minzoom]), p.hidden])
    const styled = useRef(styleKey)
    useEffect(() => {
        if (styled.current === styleKey && !p.hidden) return
        styled.current = styleKey
        for (const l of specs) {
            if (!map.getLayer(l.id)) continue
            for (const [k, v] of Object.entries(('paint' in l && l.paint) || {})) (map.setPaintProperty as (this: unknown, id: string, k: string, v: unknown) => void).call(map, l.id, k, v)
            const layout = { ...(('layout' in l && l.layout) || {}) } as Record<string, unknown>
            if (p.hidden) layout.visibility = 'none'
            else if (!('visibility' in layout)) layout.visibility = 'visible'
            for (const [k, v] of Object.entries(layout)) (map.setLayoutProperty as (this: unknown, id: string, k: string, v: unknown) => void).call(map, l.id, k, v)
            map.setLayerZoomRange(l.id, l.minzoom ?? 0, l.maxzoom ?? 24)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, src, styleKey])
}

const hoverOr = <T,>(on: T, off: T) => ['case', ['boolean', ['feature-state', 'hover'], false], on, off] as unknown as T

export type PointLayerProps = LayerProps & {
    /** Circle radius in px (default 6). */
    radius?: number
    /** Circle opacity (default 1). */
    opacity?: number
    /** Group nearby points into counted bubbles at low zooms. */
    cluster?: boolean | { radius?: number; maxZoom?: number }
    /**
     * A small check badge (white check on a colored circle, like a verified mark) at the top right of every point
     * matching `filter`, e.g. `{ filter: ['==', ['get', 'verified'], true] }`. `color` defaults to blue (#1D9BF0).
     */
    badge?: { filter: FilterSpecification; color?: string }
}

// The badge image: drawn once per color on a canvas at 2x and added to the map's sprite.
const badgeImage = (map: MlMap, color: string) => {
    const name = `kz-check-${color}`
    if (map.hasImage(name)) return name
    const px = 32
    const c = document.createElement('canvas')
    c.width = c.height = px
    const g = c.getContext('2d')!
    g.fillStyle = color
    g.strokeStyle = '#fff'
    g.lineWidth = 3
    g.beginPath()
    g.arc(px / 2, px / 2, px / 2 - 1.5, 0, Math.PI * 2)
    g.fill()
    g.stroke()
    g.lineWidth = 4
    g.lineCap = g.lineJoin = 'round'
    g.beginPath()
    g.moveTo(9, 16.5)
    g.lineTo(14, 21.5)
    g.lineTo(23, 11.5)
    g.stroke()
    map.addImage(name, g.getImageData(0, 0, px, px), { pixelRatio: 2 })
    return name
}

/** Points as circles, colored per feature, optionally clustered. */
export function PointLayer(p: PointLayerProps) {
    const { map } = useMap()
    const r = p.radius ?? 6
    const cluster = p.cluster ? (p.cluster === true ? {} : p.cluster) : undefined
    const id = p.id
    const unclustered: FilterSpecification = ['!', ['has', 'point_count']]
    useGeoJsonLayers(
        p,
        (src) => {
            const out: LayerSpecification[] = []
            if (cluster)
                out.push(
                    {
                        id: `${id}-clusters`,
                        type: 'circle',
                        source: src,
                        filter: ['has', 'point_count'],
                        paint: {
                            'circle-color': '#fafafa',
                            'circle-opacity': 0.9,
                            'circle-radius': ['step', ['get', 'point_count'], 12, 10, 15, 50, 19],
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#18181b',
                        },
                    },
                    {
                        id: `${id}-count`,
                        type: 'symbol',
                        source: src,
                        filter: ['has', 'point_count'],
                        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Open Sans Semibold'], 'text-size': 12 },
                        paint: { 'text-color': '#18181b' },
                    },
                )
            out.push(
                {
                    id: `${id}-hl`,
                    type: 'circle',
                    source: src,
                    filter: ['==', ['id'], '__none__'],
                    paint: { 'circle-radius': r + 6, 'circle-color': '#fff', 'circle-opacity': 0.35, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' },
                },
                {
                    id,
                    type: 'circle',
                    source: src,
                    filter: unclustered,
                    paint: {
                        'circle-radius': hoverOr(r + 2, r),
                        'circle-color': colorExpr(p.color, '#fafafa'),
                        'circle-opacity': p.opacity ?? 1,
                        'circle-stroke-opacity': p.opacity ?? 1,
                        'circle-stroke-width': hoverOr(2, 1.25),
                        'circle-stroke-color': hoverOr('#fff', 'rgba(9,9,11,0.7)'),
                    },
                },
            )
            out.push(labelLayer(id, src, p, 'point', unclustered))
            if (p.badge)
                out.push({
                    id: `${id}-badge`,
                    type: 'symbol',
                    source: src,
                    filter: ['all', unclustered, p.badge.filter] as FilterSpecification,
                    layout: {
                        'icon-image': badgeImage(map, p.badge.color ?? '#1D9BF0'),
                        'icon-offset': [r + 2, -(r + 2)],
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,
                    },
                })
            return out
        },
        {
            cluster,
            clickable: p.onSelect || p.onHover ? [id, ...(cluster ? [`${id}-clusters`] : [])] : cluster ? [`${id}-clusters`] : [],
            baseFilter: { [id]: unclustered, [`${id}-label`]: unclustered, ...(p.badge ? { [`${id}-badge`]: ['all', unclustered, p.badge.filter] as FilterSpecification } : {}), [`${id}-clusters`]: ['has', 'point_count'], [`${id}-count`]: ['has', 'point_count'] },
        },
    )
    return null
}

export type LineLayerProps = LayerProps & {
    /** Line width in px at zoom 12 (scales with zoom; default 3). */
    width?: number
    opacity?: number
}

/** Lines (LineString / MultiLineString), colored per feature. */
export function LineLayer(p: LineLayerProps) {
    const w = p.width ?? 3
    const id = p.id
    useGeoJsonLayers(
        p,
        (src) => [
            {
                id: `${id}-hl`,
                type: 'line',
                source: src,
                filter: ['==', ['id'], '__none__'],
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: { 'line-color': '#fff', 'line-opacity': 0.55, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, w + 2, 12, w + 5, 16, w * 2 + 6] },
            },
            {
                id,
                type: 'line',
                source: src,
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': colorExpr(p.color, '#fafafa'),
                    'line-opacity': hoverOr(1, p.opacity ?? 0.85),
                    'line-width': ['interpolate', ['linear'], ['zoom'], 6, w * 0.5, 12, w, 16, w * 2],
                },
            },
            labelLayer(id, src, p, 'line'),
        ],
        { clickable: p.onSelect || p.onHover ? [id] : [] },
    )
    return null
}

export type PolygonLayerProps = LayerProps & {
    /** Fill opacity (default 0.3); the outline is drawn solid. */
    opacity?: number
    outlineWidth?: number
}

/** Areas (Polygon / MultiPolygon): a translucent fill with a solid outline. */
export function PolygonLayer(p: PolygonLayerProps) {
    const id = p.id
    const color = colorExpr(p.color, '#fafafa')
    useGeoJsonLayers(
        p,
        (src) => [
            { id, type: 'fill', source: src, paint: { 'fill-color': color, 'fill-opacity': hoverOr(Math.min(1, (p.opacity ?? 0.3) + 0.15), p.opacity ?? 0.3) } },
            { id: `${id}-outline`, type: 'line', source: src, paint: { 'line-color': color, 'line-width': p.outlineWidth ?? 1.5 } },
            { id: `${id}-hl`, type: 'line', source: src, filter: ['==', ['id'], '__none__'], paint: { 'line-color': '#fff', 'line-width': 3 } },
            labelLayer(id, src, p, 'center'),
        ],
        { clickable: p.onSelect || p.onHover ? [id] : [] },
    )
    return null
}

