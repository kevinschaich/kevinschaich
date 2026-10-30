import { Info, LocateFixed, Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'cn'
import { Button } from './components/ui/button'
import { DataSources, type DataSource } from './data-sources'

/** The parts of a MapLibre `Map` the controls use, so this package needs no MapLibre dependency. */
export type MapLike = {
    getContainer(): HTMLElement
    zoomIn(): unknown
    zoomOut(): unknown
    getZoom(): number
    flyTo(options: { center: [number, number]; zoom?: number }): unknown
    project(lngLat: [number, number]): { x: number; y: number }
    on(type: 'move', listener: () => void): unknown
    off(type: 'move', listener: () => void): unknown
}

export type MapControlsProps = {
    /** The MapLibre map; the stack sits at its top right. */
    map: MapLike
    /** Credits for the (i) Data sources dialog. Leave out to hide the (i). */
    sources?: DataSource[]
    sourcesDescription?: ReactNode
    /** Zoom +/− (default true) and locate me (default true). */
    zoom?: boolean
    locate?: boolean
    /** Extra buttons at the bottom of the stack (use `<ControlButton>`). */
    children?: ReactNode
    className?: string
}

/** A square, muted icon button for the control stack. */
export function ControlButton({ className, ...props }: ComponentProps<typeof Button>) {
    return (
        <Button
            variant="ghost"
            size="icon-sm"
            className={cn('size-8 rounded-none text-muted-foreground hover:bg-foreground/8 hover:text-foreground [&_svg]:size-4', className)}
            {...props}
        />
    )
}

/**
 * The shared top-right map controls: zoom +/−, locate me, the (i) Data sources button and any extra buttons, grouped
 * in rounded glass blocks. Takes a MapLibre `Map` (anything matching `MapLike`) and renders into its container.
 */
export function MapControls({ map, sources, sourcesDescription, zoom = true, locate = true, children, className }: MapControlsProps) {
    const [me, setMe] = useState<[number, number] | null>(null)
    const [busy, setBusy] = useState(false)
    const dot = useRef<HTMLDivElement>(null)

    // Keep the "you are here" dot on the map as it moves.
    useEffect(() => {
        if (!me) return
        const place = () => {
            const p = map.project(me)
            if (dot.current) dot.current.style.transform = `translate(${p.x}px, ${p.y}px)`
        }
        place()
        map.on('move', place)
        return () => {
            map.off('move', place)
        }
    }, [map, me])

    const locateMe = () => {
        if (!navigator.geolocation) return
        setBusy(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setBusy(false)
                const at: [number, number] = [pos.coords.longitude, pos.coords.latitude]
                setMe(at)
                map.flyTo({ center: at, zoom: Math.max(map.getZoom(), 14) })
            },
            () => setBusy(false),
            { enableHighAccuracy: false, timeout: 15000 },
        )
    }

    const group = 'flex flex-col overflow-hidden rounded-lg bg-card/80 shadow-[0_0_0_1px] shadow-foreground/10 backdrop-blur-lg backdrop-saturate-150 divide-y divide-foreground/10'
    const extra = sources || children

    return createPortal(
        <>
            {me && (
                <div ref={dot} className="pointer-events-none absolute top-0 left-0 z-[1]">
                    <div className="size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow" />
                </div>
            )}
            <div className={cn('absolute top-2.5 right-2.5 z-[2] flex flex-col gap-2.5', className)}>
                {zoom && (
                    <div className={group}>
                        <ControlButton title="Zoom in" aria-label="Zoom in" onClick={() => map.zoomIn()}>
                            <Plus />
                        </ControlButton>
                        <ControlButton title="Zoom out" aria-label="Zoom out" onClick={() => map.zoomOut()}>
                            <Minus />
                        </ControlButton>
                    </div>
                )}
                {locate && (
                    <div className={group}>
                        <ControlButton title="Show my location" aria-label="Show my location" onClick={locateMe} className={cn(me && 'text-blue-500', busy && 'animate-pulse')}>
                            <LocateFixed />
                        </ControlButton>
                    </div>
                )}
                {extra && (
                    <div className={group}>
                        {sources && (
                            <DataSources
                                sources={sources}
                                description={sourcesDescription}
                                trigger={
                                    <ControlButton title="Data sources" aria-label="Data sources">
                                        <Info />
                                    </ControlButton>
                                }
                            />
                        )}
                        {children}
                    </div>
                )}
            </div>
        </>,
        map.getContainer(),
    )
}
