import type { Metadata } from 'next'
import { getProjects } from '@/lib/projects'
import { Byline } from '@kevinschaich/components'
import '@fontsource-variable/public-sans'
import '@kevinschaich/components/styles.css'

export const dynamic = 'force-static'

export const metadata: Metadata = {
    title: 'Projects | by kevinschaich',
    description: 'Things Kevin Schaich built for fun.',
    alternates: { canonical: '/projects' },
}

/** Every project as a full-width tile: its screenshot, faded from the left under its icon, name and tagline. */
export default async function Projects() {
    const projects = await getProjects()
    return (
        <div className="ks-theme relative z-[2] min-h-dvh">
            <main className="mx-auto w-full max-w-6xl px-4 py-[clamp(32px,6vh,64px)]">
                <nav className="mb-8 text-sm">
                    <Byline newTab={false} />
                </nav>
                <ul className="flex flex-col gap-4">
                    {projects.map((p) => (
                        <li key={p.slug}>
                            <a
                                href={p.link ?? `/project/${p.slug}/`}
                                className="group relative flex h-[33vh] min-h-56 items-center overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] transition-colors hover:border-[var(--ring)]"
                            >
                                {p.screenshot && (
                                    <img
                                        src={p.screenshot}
                                        alt=""
                                        loading="lazy"
                                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                )}
                                {p.screenshot && (
                                    <div
                                        className="absolute inset-0"
                                        // zinc-950 fading out to the right, as on the OG card
                                        style={{ backgroundImage: 'linear-gradient(90deg, rgba(9,9,11,0.94) 0%, rgba(9,9,11,0.82) 30%, rgba(9,9,11,0.4) 58%, rgba(9,9,11,0) 82%)' }}
                                    />
                                )}
                                <div className="relative flex max-w-xl flex-col gap-3 px-[clamp(20px,5vw,56px)]">
                                    <img src={`/icon/${p.slug}.png`} alt="" width={48} height={48} className="size-12 rounded-xl border border-[var(--border)]" />
                                    <h2 className="font-heading text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold text-[var(--foreground)]">{p.name}</h2>
                                    <p className="text-[clamp(1rem,1.6vw,1.25rem)] text-[var(--foreground)]/80">{p.tagline}</p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
                {projects.length === 0 && <p className="text-[var(--muted-foreground)]">Nothing here yet.</p>}
            </main>
        </div>
    )
}
