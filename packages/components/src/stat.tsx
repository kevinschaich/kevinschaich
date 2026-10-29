import type { ReactNode } from 'react'
import { cn } from 'cn'

/**
 * A labelled reading: a small muted label over a value with an optional unit and note, e.g. "Carry / 87.0 yd".
 * `boxed` gives it a bordered tile (for grids of headline numbers); `size` scales the value.
 */
export function Stat({
    label,
    value,
    unit,
    sub,
    boxed = false,
    size = 'default',
    align = 'start',
    className,
}: {
    label: ReactNode
    value: ReactNode
    unit?: ReactNode
    sub?: ReactNode
    boxed?: boolean
    size?: 'sm' | 'default' | 'lg'
    align?: 'start' | 'end'
    className?: string
}) {
    const empty = value == null || value === ''
    return (
        <div
            data-slot="stat"
            className={cn(
                'flex min-w-0 flex-col gap-0.5',
                boxed && 'rounded-lg border bg-card/50 px-3 py-2',
                align === 'end' && 'items-end text-right',
                className,
            )}
        >
            <div className="text-[0.625rem] font-medium tracking-wider text-muted-foreground uppercase">{label}</div>
            <div
                className={cn(
                    'font-semibold tabular-nums',
                    size === 'sm' && 'text-sm',
                    size === 'default' && 'text-base',
                    size === 'lg' && 'text-2xl',
                    empty && 'text-muted-foreground',
                )}
            >
                {empty ? '—' : value}
                {!empty && unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>}
            </div>
            {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
    )
}
