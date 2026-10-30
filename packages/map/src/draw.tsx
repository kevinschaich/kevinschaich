import { Button, Card } from '@kevinschaich/components'
import type { Geometry, Position } from 'geojson'
import type { GeoJSONSource, MapMouseEvent } from 'maplibre-gl'
import { Check, Undo2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMap } from './MapView'

export type DrawMode = 'point' | 'line' | 'polygon'

export type DrawToolProps = {
    /** What to draw; `null` turns drawing off. */
    mode: DrawMode | null
    /** A finished shape. Drawing stays on for the next one until `mode` goes back to null. */
    onCreate: (geometry: Geometry) => void
    /** Escape or the cancel button. */
    onCancel?: () => void
    /** Sketch color (default white). */
    color?: string
    /** Show the floating bar with hints and Finish / Undo / Cancel (default true; needed on touch screens). */
    toolbar?: boolean
}

const SRC = 'ks-draw'
const empty = { type: 'FeatureCollection' as const, features: [] }

/**
 * Click (or tap) to draw a point, line or polygon on the map. Lines finish on double-click, Enter, a click on the last
 * vertex or the Finish button; polygons also finish by clicking the first vertex. Backspace removes the last vertex,
 * Escape cancels. While it's on, clicks don't reach other layers' `onSelect` (they still do when it's off).
 */
export function DrawTool({ mode, onCreate, onCancel, color = '#ffffff', toolbar = true }: DrawToolProps) {
    const { map, clicks } = useMap()
    const [pts, setPts] = useState<Position[]>([])
    const cursor = useRef<Position | null>(null)
    const cb = useRef({ onCreate, onCancel })
    cb.current = { onCreate, onCancel }
    const ptsRef = useRef(pts)
    ptsRef.current = pts

    // Sketch source and layers, once.
    useEffect(() => {
        map.addSource(SRC, { type: 'geojson', data: empty })
        map.addLayer({ id: `${SRC}-fill`, type: 'fill', source: SRC, filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': color, 'fill-opacity': 0.15 } })
        map.addLayer({
            id: `${SRC}-line`,
            type: 'line',
            source: SRC,
            filter: ['!=', ['geometry-type'], 'Point'],
            paint: { 'line-color': color, 'line-width': 2, 'line-dasharray': [2, 1.5] },
        })
        map.addLayer({
            id: `${SRC}-pts`,
            type: 'circle',
            source: SRC,
            filter: ['==', ['geometry-type'], 'Point'],
            paint: { 'circle-radius': 4.5, 'circle-color': '#09090b', 'circle-stroke-color': color, 'circle-stroke-width': 2 },
        })
        return () => {
            try {
                for (const l of ['pts', 'line', 'fill']) if (map.getLayer(`${SRC}-${l}`)) map.removeLayer(`${SRC}-${l}`)
                if (map.getSource(SRC)) map.removeSource(SRC)
            } catch {}
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map])

    const render = (p: Position[], hover: Position | null) => {
        const src = map.getSource(SRC) as GeoJSONSource | undefined
        if (!src) return
        const live = hover && mode !== 'point' ? [...p, hover] : p
        const features: GeoJSON.Feature[] = p.map((c) => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: c } }))
        if (mode === 'polygon' && live.length >= 3)
            features.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...live, live[0]]] } })
        else if (live.length >= 2) features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: live } })
        src.setData({ type: 'FeatureCollection', features })
    }

    const finish = (p = ptsRef.current) => {
        if (mode === 'line' && p.length >= 2) cb.current.onCreate({ type: 'LineString', coordinates: p })
        else if (mode === 'polygon' && p.length >= 3) cb.current.onCreate({ type: 'Polygon', coordinates: [[...p, p[0]]] })
        else return false
        setPts([])
        return true
    }
    const cancel = () => {
        setPts([])
        cb.current.onCancel?.()
    }

    useEffect(() => render(pts, cursor.current))

    // Map input while a mode is on.
    useEffect(() => {
        if (!mode) {
            setPts([])
            return
        }
        // Keep feature clicks and MapView's background click from firing while drawing.
        clicks.off = true
        const dbl = map.doubleClickZoom.isEnabled()
        map.doubleClickZoom.disable()
        const canvas = map.getCanvas()
        canvas.style.cursor = 'crosshair'
        const near = (a: Position, e: MapMouseEvent) => {
            const s = map.project(a as [number, number])
            return Math.hypot(s.x - e.point.x, s.y - e.point.y) < 12
        }
        const click = (e: MapMouseEvent) => {
            const c: Position = [e.lngLat.lng, e.lngLat.lat]
            const p = ptsRef.current
            if (mode === 'point') return cb.current.onCreate({ type: 'Point', coordinates: c })
            if (p.length && near(p[p.length - 1], e)) return void finish()
            if (mode === 'polygon' && p.length >= 3 && near(p[0], e)) return void finish()
            setPts([...p, c])
        }
        const dblclick = (e: MapMouseEvent) => {
            e.preventDefault()
            finish()
        }
        const move = (e: MapMouseEvent) => {
            cursor.current = [e.lngLat.lng, e.lngLat.lat]
            canvas.style.cursor = 'crosshair'
            render(ptsRef.current, cursor.current)
        }
        const key = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement | null
            if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
            if (e.key === 'Escape') cancel()
            else if (e.key === 'Enter') finish()
            else if (e.key === 'Backspace' && ptsRef.current.length) {
                e.preventDefault()
                setPts(ptsRef.current.slice(0, -1))
            }
        }
        map.on('click', click)
        map.on('dblclick', dblclick)
        map.on('mousemove', move)
        window.addEventListener('keydown', key)
        return () => {
            map.off('click', click)
            map.off('dblclick', dblclick)
            map.off('mousemove', move)
            window.removeEventListener('keydown', key)
            if (dbl) map.doubleClickZoom.enable()
            canvas.style.cursor = ''
            clicks.off = false
            cursor.current = null
            setPts([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, mode])

    if (!mode || !toolbar) return null
    const need = mode === 'line' ? 2 : 3
    const hint =
        mode === 'point'
            ? 'Click the map to drop a point'
            : pts.length === 0
              ? `Click the map to start the ${mode === 'line' ? 'line' : 'area'}`
              : pts.length < need
                ? 'Keep clicking to add points'
                : `Double-click or press Finish to end the ${mode === 'line' ? 'line' : 'area'}`
    return (
        <Card
            glass
            size="sm"
            className="fixed top-3 left-1/2 z-30 w-max max-w-[calc(100%-120px)] -translate-x-1/2 flex-row items-center gap-1 px-3 py-1.5 max-sm:top-[calc(8px+env(safe-area-inset-top))]"
        >
            <span className="mr-1 text-sm text-muted-foreground">{hint}</span>
            {mode !== 'point' && (
                <>
                    <Button variant="ghost" size="icon-sm" aria-label="Undo last point" title="Undo last point" disabled={!pts.length} onClick={() => setPts(pts.slice(0, -1))}>
                        <Undo2 />
                    </Button>
                    <Button size="sm" disabled={pts.length < need} onClick={() => finish()}>
                        <Check /> Finish
                    </Button>
                </>
            )}
            <Button variant="ghost" size="icon-sm" aria-label="Stop drawing" title="Stop drawing" onClick={cancel}>
                <X />
            </Button>
        </Card>
    )
}
