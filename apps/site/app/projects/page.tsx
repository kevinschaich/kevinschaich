import type { Metadata } from 'next'
import { getProjects } from '@/lib/projects'
import { Byline } from '@kevinschaich/components'
import '@kevinschaich/components/styles.css'

export const dynamic = 'force-static'

export const metadata: Metadata = {
    title: 'Projects | by kevinschaich',
    description: 'Things Kevin Schaich built for fun.',
    alternates: { canonical: '/projects' },
}

/** Every project as its OG card: the image carries the name, byline and tagline. */
export default async function Projects() {
    const projects = await getProjects()
    return (
        <div className="ks-theme relative z-[2] min-h-dvh">
            <main className="mx-auto w-full max-w-6xl px-4 py-[clamp(32px,6vh,64px)]">
                <nav className="mb-8 text-sm">
                    <Byline newTab={false} />
                </nav>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((p) => (
                        <li key={p.slug}>
                            <a
                                href={`/project/${p.slug}/`}
                                className="block overflow-hidden rounded-[var(--radius)] border border-[var(--border)] transition-colors hover:border-[var(--ring)]"
                            >
                                <img src={`/og/${p.slug}.png`} alt={`${p.name}: ${p.tagline}`} width={1200} height={630} className="block aspect-[1200/630] w-full" />
                            </a>
                        </li>
                    ))}
                </ul>
                {projects.length === 0 && <p className="text-[var(--muted-foreground)]">Nothing here yet.</p>}
            </main>
        </div>
    )
}
