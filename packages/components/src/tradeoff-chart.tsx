'use client'

import { CartesianGrid, LabelList, Scatter, ScatterChart, XAxis, YAxis } from 'recharts'
import { cn } from 'cn'
import { ChartContainer, ChartTooltip, type ChartConfig } from './components/ui/chart'

export interface TradeoffPoint {
    id: string
    label: string
    x: number
    y: number
}

const CONFIG = { points: { label: 'Models', color: 'var(--chart-2)' } } satisfies ChartConfig

/**
 * Two measures plotted against each other, one dot per entry, labelled, e.g. error rate against latency for
 * benchmark results. Both axes are "lower is better" by default, so the best entries sit nearest the origin.
 * `highlight` emphasises one entry; `onSelect` makes dots clickable. A log scale suits values that span
 * orders of magnitude (latency from 50 ms to 5 s).
 */
export function TradeoffChart({
    points,
    xLabel,
    yLabel,
    formatX = (value) => String(value),
    formatY = (value) => String(value),
    xScale = 'linear',
    highlight,
    onSelect,
    className,
}: {
    points: TradeoffPoint[]
    xLabel: string
    yLabel: string
    formatX?: (value: number) => string
    formatY?: (value: number) => string
    xScale?: 'linear' | 'log'
    highlight?: string
    onSelect?: (id: string) => void
    className?: string
}) {
    return (
        <ChartContainer config={CONFIG} className={cn('aspect-[16/9] w-full', className)}>
            <ScatterChart margin={{ top: 16, right: 24, bottom: 24, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    type="number"
                    dataKey="x"
                    scale={xScale}
                    domain={['auto', 'auto']}
                    tickFormatter={formatX}
                    label={{ value: xLabel, position: 'insideBottom', offset: -12, className: 'fill-muted-foreground text-xs' }}
                />
                <YAxis
                    type="number"
                    dataKey="y"
                    domain={[0, 'auto']}
                    tickFormatter={formatY}
                    label={{ value: yLabel, angle: -90, position: 'insideLeft', className: 'fill-muted-foreground text-xs' }}
                />
                <ChartTooltip
                    cursor={false}
                    content={({ payload }) => {
                        const point = payload?.[0]?.payload as TradeoffPoint | undefined
                        if (!point) return null
                        return (
                            <div className="rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl">
                                <div className="font-medium">{point.label}</div>
                                <div className="text-muted-foreground tabular-nums">
                                    {yLabel}: {formatY(point.y)} · {xLabel}: {formatX(point.x)}
                                </div>
                            </div>
                        )
                    }}
                />
                <Scatter
                    data={points}
                    fill="var(--color-points)"
                    className={onSelect ? 'cursor-pointer' : undefined}
                    onClick={(entry) => onSelect?.((entry as unknown as TradeoffPoint).id)}
                    shape={(props: { cx?: number; cy?: number; payload?: TradeoffPoint }) => {
                        const active = props.payload?.id === highlight
                        return (
                            <circle
                                cx={props.cx}
                                cy={props.cy}
                                r={active ? 7 : 5}
                                fill={active ? 'var(--foreground)' : 'var(--color-points)'}
                                stroke="var(--background)"
                                strokeWidth={1.5}
                            />
                        )
                    }}
                >
                    <LabelList dataKey="label" position="right" className="fill-muted-foreground text-[0.625rem]" />
                </Scatter>
            </ScatterChart>
        </ChartContainer>
    )
}
