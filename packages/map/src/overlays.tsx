import {
    Button,
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Checkbox,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    Label,
} from '@kevinschaich/components'
import { MapPin, X } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useMap } from './MapView'
import { searchPlaces, type Place } from './util'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

/** The app's main glass panel: top left on wide screens, a bottom sheet on phones. */
export function MapPanel({ title, description, children, className }: { title?: ReactNode; description?: ReactNode; children?: ReactNode; className?: string }) {
    return (
        <Card
            glass
            size="sm"
            className={cx(
                'fixed z-10 max-h-[46%] gap-0 overflow-auto py-0 max-sm:inset-x-2 max-sm:bottom-[calc(8px+env(safe-area-inset-bottom))] sm:top-3 sm:left-3 sm:max-h-[calc(100%-24px)] sm:w-80',
                className,
            )}
        >
            {(title || description) && (
                <CardHeader className="gap-1 pt-4">
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent className="flex flex-col gap-4 pt-3 pb-4">{children}</CardContent>
        </Card>
    )
}

/**
 * A card for the selected feature: top right (left of the controls) on wide screens, a bottom sheet over the panel on
 * phones. Put a policy/category Badge in `badge` and links in `footer`.
 */
export function FeatureCard({
    title,
    subtitle,
    badge,
    onClose,
    children,
    footer,
    className,
}: {
    title: ReactNode
    subtitle?: ReactNode
    badge?: ReactNode
    onClose?: () => void
    children?: ReactNode
    footer?: ReactNode
    className?: string
}) {
    return (
        <Card
            glass
            size="sm"
            role="dialog"
            aria-live="polite"
            className={cx(
                'fixed z-20 max-h-[60%] gap-3 overflow-auto max-sm:inset-x-2 max-sm:bottom-[calc(8px+env(safe-area-inset-bottom))] sm:top-3 sm:right-14 sm:max-h-[calc(100%-24px)] sm:w-80',
                className,
            )}
        >
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                {subtitle && <CardDescription>{subtitle}</CardDescription>}
                {onClose && (
                    <CardAction>
                        <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
                            <X />
                        </Button>
                    </CardAction>
                )}
            </CardHeader>
            {(badge || children || footer) && (
                <CardContent className="flex flex-col gap-3">
                    {badge && <div className="flex flex-wrap items-center gap-2">{badge}</div>}
                    {children}
                    {footer}
                </CardContent>
            )}
        </Card>
    )
}

export type LegendItem = { value: string; label: ReactNode; color?: string; hint?: ReactNode; extra?: ReactNode }

/** Categories with their colors (leave `color` out for a plain filter), each with a checkbox to show or hide it. `hidden` holds the values switched off. */
export function Legend({
    items,
    hidden = [],
    onHiddenChange,
    swatch = 'dot',
}: {
    items: LegendItem[]
    hidden?: string[]
    onHiddenChange?: (hidden: string[]) => void
    swatch?: 'dot' | 'line' | 'square'
}) {
    const shape = swatch === 'line' ? 'h-1.5 w-5 rounded-full' : swatch === 'square' ? 'size-3 rounded-sm' : 'size-3 rounded-full'
    return (
        <div className="flex flex-col gap-2.5">
            {items.map((it) => (
                <Label key={it.value} className={cx('gap-2.5 font-normal select-none', onHiddenChange && 'cursor-pointer')}>
                    {onHiddenChange && (
                        <Checkbox
                            checked={!hidden.includes(it.value)}
                            onCheckedChange={(on) => onHiddenChange(on ? hidden.filter((h) => h !== it.value) : [...hidden, it.value])}
                        />
                    )}
                    {it.color && <span className={cx('shrink-0', shape)} style={{ background: it.color }} />}
                    <span className="min-w-0 flex-1">
                        <span className="font-medium">{it.label}</span>
                        {it.hint && <span className="block text-xs text-muted-foreground">{it.hint}</span>}
                    </span>
                    {it.extra}
                </Label>
            ))}
        </div>
    )
}

/** A match from the app's own data, listed above places. */
export type SearchHit = { key: string; label: ReactNode; detail?: ReactNode; icon?: ReactNode; onSelect: () => void }

/**
 * Search-as-you-type: the app's own matches first (`searchFeatures`), then places from Photon biased to the view.
 * Choosing a place flies there unless `onPlace` is given.
 */
export function PlaceSearch({
    searchFeatures,
    featuresHeading = 'On the map',
    placeholder = 'Search a town, address or ZIP',
    onPlace,
    places = true,
}: {
    searchFeatures?: (query: string) => SearchHit[]
    featuresHeading?: string
    placeholder?: string
    onPlace?: (place: Place) => void
    /** Also search places (default true). */
    places?: boolean
}) {
    const { map } = useMap()
    const [text, setText] = useState('')
    const [hits, setHits] = useState<SearchHit[]>([])
    const [found, setFound] = useState<Place[]>([])
    const [message, setMessage] = useState<string | null>(null)
    const [focused, setFocused] = useState(false)
    const ctrl = useRef<AbortController | null>(null)
    const timer = useRef<number | undefined>(undefined)

    const reset = () => {
        setText('')
        setHits([])
        setFound([])
        setMessage(null)
        ;(document.activeElement as HTMLElement | null)?.blur()
    }
    const go = (p: Place) => {
        if (onPlace) return onPlace(p)
        if (p.extent) map.fitBounds(p.extent, { padding: 40, maxZoom: 13 })
        else map.flyTo({ center: [p.lon, p.lat], zoom: 12 })
    }
    const onChange = (value: string) => {
        setText(value)
        clearTimeout(timer.current)
        const q = value.trim()
        setHits(q && searchFeatures ? searchFeatures(q) : [])
        if (!places || q.length < 3) {
            ctrl.current?.abort()
            setFound([])
            setMessage(null)
            return
        }
        timer.current = window.setTimeout(async () => {
            ctrl.current?.abort()
            ctrl.current = new AbortController()
            try {
                setFound(await searchPlaces(q, { near: map.getCenter(), signal: ctrl.current.signal }))
                setMessage(null)
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    setFound([])
                    setMessage("Place search isn't available right now")
                }
            }
        }, 250)
    }
    const open = focused && text.trim().length > 0

    return (
        <Command shouldFilter={false} className="h-auto overflow-visible bg-transparent p-0" onKeyDown={(e) => e.key === 'Escape' && reset()}>
            <CommandInput
                value={text}
                onValueChange={onChange}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
            />
            {open && (
                <CommandList className="mt-1.5 rounded-lg border bg-popover shadow-md">
                    <CommandEmpty>{message ?? 'No matches yet'}</CommandEmpty>
                    {hits.length > 0 && (
                        <CommandGroup heading={featuresHeading}>
                            {hits.map((h) => (
                                <CommandItem key={`f-${h.key}`} value={`f-${h.key}`} onSelect={() => (reset(), h.onSelect())}>
                                    {h.icon ?? <MapPin />}
                                    <span className="flex min-w-0 flex-col">
                                        <span>{h.label}</span>
                                        {h.detail && <span className="text-xs text-muted-foreground">{h.detail}</span>}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {found.length > 0 && (
                        <CommandGroup heading="Places">
                            {found.map((p, i) => (
                                <CommandItem key={`p-${i}`} value={`p-${i}`} onSelect={() => (reset(), go(p))}>
                                    <MapPin />
                                    <span className="flex min-w-0 flex-col">
                                        <span>{p.name}</span>
                                        {p.detail && <span className="text-xs text-muted-foreground">{p.detail}</span>}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            )}
        </Command>
    )
}
