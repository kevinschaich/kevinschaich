'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from 'cn'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'

/**
 * One column of a leaderboard. A column with `value` can be sorted: clicking its header ranks rows by it,
 * best first, where `better` says which way is best ("lower" for error rates and latency).
 */
export interface LeaderboardColumn<Row> {
    key: string
    label: ReactNode
    /** The number this column sorts and ranks by; null sorts last. Omit for a text-only column. */
    value?: (row: Row) => number | null
    better?: 'lower' | 'higher'
    /** What the cell shows. Defaults to the value. */
    render?: (row: Row) => ReactNode
    align?: 'start' | 'end'
    /** Short note shown under the label. */
    hint?: ReactNode
    className?: string
}

/**
 * A ranked, sortable table for benchmark results. Rows are numbered by the active sort, numeric columns align
 * to the right in tabular figures, and the best value in each sortable column is emphasised.
 */
export function Leaderboard<Row>({
    rows,
    columns,
    rowKey,
    defaultSort,
    className,
}: {
    rows: Row[]
    columns: LeaderboardColumn<Row>[]
    rowKey: (row: Row) => string
    /** Key of the column to rank by first. */
    defaultSort: string
    className?: string
}) {
    const [sortKey, setSortKey] = useState(defaultSort)
    const [reversed, setReversed] = useState(false)
    const sortColumn = columns.find((column) => column.key === sortKey && column.value)

    const sorted = useMemo(() => {
        if (!sortColumn?.value) return rows
        const read = sortColumn.value
        const direction = (sortColumn.better === 'higher' ? -1 : 1) * (reversed ? -1 : 1)
        return [...rows].sort((first, second) => {
            const a = read(first)
            const b = read(second)
            if (a === null) return 1
            if (b === null) return -1
            return (a - b) * direction
        })
    }, [rows, sortColumn, reversed])

    const best = useMemo(() => {
        const values: Record<string, number> = {}
        for (const column of columns) {
            if (!column.value) continue
            const numbers = rows.map(column.value).filter((value): value is number => value !== null)
            if (numbers.length) values[column.key] = column.better === 'higher' ? Math.max(...numbers) : Math.min(...numbers)
        }
        return values
    }, [rows, columns])

    function choose(column: LeaderboardColumn<Row>) {
        if (!column.value) return
        if (column.key === sortKey) setReversed(!reversed)
        else {
            setSortKey(column.key)
            setReversed(false)
        }
    }

    return (
        <Table data-slot="leaderboard" className={className}>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-10 text-right tabular-nums">#</TableHead>
                    {columns.map((column) => {
                        const active = column.key === sortKey && column.value
                        const Arrow = (column.better === 'higher') !== reversed ? ArrowDown : ArrowUp
                        return (
                            <TableHead
                                key={column.key}
                                aria-sort={active ? (reversed ? 'descending' : 'ascending') : undefined}
                                className={cn(column.align === 'end' && 'text-right', column.className)}
                            >
                                {column.value ? (
                                    <button
                                        type="button"
                                        onClick={() => choose(column)}
                                        className={cn(
                                            'inline-flex items-center gap-1 hover:text-foreground',
                                            active ? 'text-foreground' : 'text-muted-foreground',
                                        )}
                                    >
                                        {column.label}
                                        {active && <Arrow className="size-3" />}
                                    </button>
                                ) : (
                                    column.label
                                )}
                                {column.hint && <div className="text-xs font-normal text-muted-foreground">{column.hint}</div>}
                            </TableHead>
                        )
                    })}
                </TableRow>
            </TableHeader>
            <TableBody>
                {sorted.map((row, index) => (
                    <TableRow key={rowKey(row)}>
                        <TableCell className="text-right text-muted-foreground tabular-nums">{index + 1}</TableCell>
                        {columns.map((column) => {
                            const value = column.value?.(row) ?? null
                            const isBest = value !== null && best[column.key] === value
                            return (
                                <TableCell
                                    key={column.key}
                                    className={cn(
                                        (column.align === 'end' || column.value) && 'text-right tabular-nums',
                                        isBest && 'font-semibold text-foreground',
                                        column.className,
                                    )}
                                >
                                    {column.render ? column.render(row) : value ?? '–'}
                                </TableCell>
                            )
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
