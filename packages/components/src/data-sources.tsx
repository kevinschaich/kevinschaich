import { Info } from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'

export type DataSource = {
    /** What it is used for, e.g. "Buildings". */
    what: string
    /** Who it comes from, e.g. "Overture Maps Foundation". */
    from: string
    href: string
    license: string
}

/**
 * The "Data sources" dialog every project shows (see AGENTS.md): what each outside source is used for, where it's
 * from (linked) and its license. Opens from a muted (i) by default; pass `trigger` to open it from something else
 * that suits the page, e.g. a button styled for the app's own controls.
 */
export function DataSources({ sources, description, trigger }: { sources: DataSource[]; description?: ReactNode; trigger?: ReactElement }) {
    return (
        <Dialog>
            <DialogTrigger
                render={
                    trigger ?? (
                        <Button variant="ghost" size="icon" className="text-muted-foreground" title="Data sources" aria-label="Data sources">
                            <Info />
                        </Button>
                    )
                }
            />
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Data sources</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <dl className="grid grid-cols-[1fr_auto] border-t text-sm">
                    {sources.map((s) => (
                        <div key={s.what} className="contents">
                            <dt className="border-b py-2 pr-3">
                                {s.what}
                                <a
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener"
                                    className="block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                    {s.from}
                                </a>
                            </dt>
                            <dd className="border-b py-2 text-right text-xs text-muted-foreground">{s.license}</dd>
                        </div>
                    ))}
                </dl>
            </DialogContent>
        </Dialog>
    )
}
