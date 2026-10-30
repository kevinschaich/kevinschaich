import type { DataSource } from '../data-sources'
import { MapControls } from '../map-controls'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import * as maplibregl from 'maplibre-gl'
// MapLibre 5+/6 loads its worker relative to its own module, which bundlers don't pick up; bundle it explicitly.
// The app's Vite resolves this (see kevinschaichMap() in ./vite.ts).
import maplibreWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { createContext, useContext, useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from 'react'
import { BASEMAPS, type Basemap } from './basemaps'

maplibregl.setWorkerUrl(maplibreWorker)

export type LngLat = [number, number]
export type Bounds = [number, number, number, number] // west, south, east, north

type MapContextValue = {
    map: maplibregl.Map
    basemap: Basemap
    setBasemap: (b: Basemap) => void
    /** Layers that take clicks; MapView fires onBackgroundClick only when none is hit. */
    interactive: Set<string>
    /** While `off` is true (e.g. drawing), feature clicks and the background click are ignored. */
    clicks: { off: boolean }
}
const MapContext = createContext<MapContextValue | null>(null)

/** The map and basemap state, for components rendered inside `<MapView>`. */
export function useMap(): MapContextValue {
    const ctx = useContext(MapContext)
    if (!ctx) throw new Error('useMap() must be used inside <MapView>')
    return ctx
}

export type MapViewProps = {
    /** Where the map starts when the URL hash and `bounds` don't say otherwise. */
    center?: LngLat
    zoom?: number
    /** Start fitted to these bounds instead of center/zoom (a URL hash still wins). */
    bounds?: Bounds
    /** Controlled basemap. Leave out to let the map keep its own (remembered per browser under `storageKey`). */
    basemap?: Basemap
    defaultBasemap?: Basemap
    onBasemapChange?: (b: Basemap) => void
    /** Keep the view in the URL as #zoom/lat/lon so links reopen it. Default true. */
    hash?: boolean
    /** Remember basemap and last view in localStorage under this prefix. Leave out to remember nothing. */
    storageKey?: string
    /** Credits for the (i) Data sources dialog in the control stack. Leave out to hide the (i). */
    sources?: DataSource[]
    sourcesDescription?: ReactNode
    /** Show zoom buttons (default true) and the locate-me button (default true). */
    zoomControl?: boolean
    locateControl?: boolean
    /** Extra buttons at the bottom of the control stack (use `ControlButton` from @kevinschaich/components). */
    controls?: ReactNode
    /** Drop the html `dark` class while a light basemap (Streets) shows, so panels match it. Default false. */
    lightUiOnLightBasemap?: boolean
    /** Fires for a click that hits no feature of an interactive layer (e.g. to close a card). */
    onBackgroundClick?: (e: maplibregl.MapMouseEvent) => void
    /** Extra MapLibre options. */
    options?: Partial<maplibregl.MapOptions>
    className?: string
    /** Overlays (panels, cards) and layers. Rendered once the map has loaded. */
    children?: ReactNode
    ref?: Ref<maplibregl.Map | null>
}

// Text for cluster counts and labels; the empty base style needs a glyph source.
const GLYPHS = 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'

const read = <T,>(k: string | undefined): T | null => {
    if (!k) return null
    try {
        return JSON.parse(localStorage.getItem(k) ?? 'null')
    } catch {
        return null
    }
}
const write = (k: string | undefined, v: unknown) => {
    if (!k) return
    try {
        localStorage.setItem(k, JSON.stringify(v))
    } catch {}
}
const parseHash = () => {
    const [z, lat, lon] = location.hash.slice(1).split('/').map(Number)
    return [z, lat, lon].every(Number.isFinite) ? { center: [lon, lat] as LngLat, zoom: z } : null
}

/** A full-bleed MapLibre map with the shared control stack. Children render over it once it has loaded. */
export function MapView({
    center = [-98.5, 39.8],
    zoom = 3,
    bounds,
    basemap: controlled,
    defaultBasemap = 'dark',
    onBasemapChange,
    hash = true,
    storageKey,
    sources,
    sourcesDescription,
    zoomControl = true,
    locateControl = true,
    controls,
    lightUiOnLightBasemap = false,
    onBackgroundClick,
    options,
    className,
    children,
    ref,
}: MapViewProps) {
    const container = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<maplibregl.Map | null>(null)
    const [own, setOwn] = useState<Basemap>(() => {
        const saved = read<Basemap>(storageKey && `${storageKey}:basemap`)
        return saved && saved in BASEMAPS ? saved : defaultBasemap
    })
    const basemap = controlled ?? own
    const interactive = useRef(new Set<string>()).current
    const clicks = useRef({ off: false }).current
    const bgClick = useRef(onBackgroundClick)
    bgClick.current = onBackgroundClick

    useImperativeHandle(ref, () => map as maplibregl.Map, [map])

    useEffect(() => {
        const fromHash = hash ? parseHash() : null
        const saved = read<{ center: LngLat; zoom: number }>(storageKey && `${storageKey}:view`)
        const start = fromHash ?? (bounds ? null : saved)
        const m = new maplibregl.Map({
            container: container.current!,
            ...(start ? { center: start.center, zoom: start.zoom } : bounds ? { bounds, fitBoundsOptions: { padding: 40 } } : { center, zoom }),
            dragRotate: false,
            pitchWithRotate: false,
            // Sources are credited in the Data sources dialog behind the (i) in the controls.
            attributionControl: false,
            style: {
                version: 8,
                glyphs: GLYPHS,
                sources: {},
                layers: [{ id: 'ks-bg', type: 'background', paint: { 'background-color': BASEMAPS[basemap].bg } }],
            },
            ...options,
        })
        m.touchZoomRotate.disableRotation()
        m.on('error', (e) => console.warn('map error', e.error || e))
        m.on('moveend', () => {
            const c = m.getCenter()
            const z = m.getZoom()
            write(storageKey && `${storageKey}:view`, { center: [c.lng, c.lat], zoom: z })
            if (hash) history.replaceState(history.state, '', `#${z.toFixed(2)}/${c.lat.toFixed(4)}/${c.lng.toFixed(4)}`)
        })
        m.on('click', (e) => {
            if (clicks.off) return
            const ids = [...interactive].filter((id) => m.getLayer(id))
            if (!ids.length || !m.queryRenderedFeatures(e.point, { layers: ids }).length) bgClick.current?.(e)
        })
        m.once('style.load', () => setMap(m))
        // A #zoom/lat/lon pasted into an open tab moves the map (replaceState above doesn't fire this)
        const onHash = () => {
            const h = parseHash()
            if (h) m.jumpTo(h)
        }
        if (hash) addEventListener('hashchange', onHash)
        return () => {
            removeEventListener('hashchange', onHash)
            setMap(null)
            m.remove()
        }
        // The map is created once; later prop changes are applied by the effects below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // The basemap is a raster layer kept at the bottom, under every layer the app adds.
    useEffect(() => {
        if (!map) return
        const B = BASEMAPS[basemap]
        if (map.getLayer('ks-base')) map.removeLayer('ks-base')
        if (map.getSource('ks-base')) map.removeSource('ks-base')
        map.setPaintProperty('ks-bg', 'background-color', B.bg)
        if (B.tiles) {
            map.addSource('ks-base', { type: 'raster', tiles: B.tiles, tileSize: 256, maxzoom: B.maxzoom })
            const above = map.getStyle().layers.find((l) => l.id !== 'ks-bg')?.id
            map.addLayer({ id: 'ks-base', type: 'raster', source: 'ks-base', paint: B.paint ?? {} }, above)
        }
        if (lightUiOnLightBasemap) document.documentElement.classList.toggle('dark', !B.light)
    }, [map, basemap, lightUiOnLightBasemap])

    const setBasemap = (b: Basemap) => {
        write(storageKey && `${storageKey}:basemap`, b)
        if (controlled === undefined) setOwn(b)
        onBasemapChange?.(b)
    }

    return (
        <>
            {/* MapLibre sets position: relative on its container, so a wrapper does the positioning. */}
            <div className={className ?? 'fixed inset-0'}>
                <div ref={container} className="ks-map h-full w-full" />
            </div>
            {map && (
                <MapContext.Provider value={{ map, basemap, setBasemap, interactive, clicks }}>
                    <MapControls map={map} sources={sources} sourcesDescription={sourcesDescription} zoom={zoomControl} locate={locateControl}>
                        {controls}
                    </MapControls>
                    {children}
                </MapContext.Provider>
            )}
        </>
    )
}

/** The basemap switch (Tabs) for the app's panel. Must be inside `<MapView>`. */
export function BasemapTabs({ choices = Object.keys(BASEMAPS) as Basemap[], className }: { choices?: Basemap[]; className?: string }) {
    const { basemap, setBasemap } = useMap()
    return (
        <Tabs value={basemap} onValueChange={(v) => setBasemap(v as Basemap)} className={className}>
            <TabsList className="w-full">
                {choices.map((b) => (
                    <TabsTrigger key={b} value={b}>
                        {BASEMAPS[b].label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
