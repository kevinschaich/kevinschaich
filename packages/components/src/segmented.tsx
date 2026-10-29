import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import { cn } from 'cn'
import type { ReactNode } from 'react'

/**
 * A segmented switch: one choice out of a few, as a muted pill with the chosen segment raised. No border on the
 * chosen segment (shadcn's Tabs draws one in dark mode). Use it for every one-of-a-few switch, so they all match.
 */
export function Segmented<T extends string>({
    value,
    onValueChange,
    className,
    children,
    ...props
}: { value: T; onValueChange: (value: T) => void; className?: string; children: ReactNode; 'aria-label'?: string }) {
    return (
        <ToggleGroup
            data-slot="segmented"
            value={[value]}
            onValueChange={(v) => v[0] != null && onValueChange(v[0] as T)}
            className={cn('inline-flex h-8 w-full items-center rounded-lg bg-muted p-[3px] text-muted-foreground', className)}
            {...props}
        >
            {children}
        </ToggleGroup>
    )
}

export function SegmentedItem({ value, className, children, ...props }: { value: string; className?: string; children?: ReactNode; 'aria-label'?: string; title?: string }) {
    return (
        <Toggle
            data-slot="segmented-item"
            value={value}
            className={cn(
                'inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all outline-none',
                'hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
                'data-[pressed]:bg-background data-[pressed]:text-foreground data-[pressed]:shadow-sm dark:text-muted-foreground dark:hover:text-foreground dark:data-[pressed]:bg-input/50 dark:data-[pressed]:text-foreground',
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            {children}
        </Toggle>
    )
}
