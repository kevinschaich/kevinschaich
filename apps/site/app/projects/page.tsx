import type { Metadata } from 'next'
import { getProjects } from '@/lib/projects'

export const dynamic = 'force-static'

export const metadata: Metadata = {
    title: 'Projects | by kevinschaich',
    description: 'Things Kevin Schaich built for fun.',
    alternates: { canonical: '/projects' },
}

export default async function Projects() {
    const projects = await getProjects()
    return (
        <main className="relative z-[2] mx-auto flex min-h-dvh w-full max-w-[640px] flex-col px-4 py-[clamp(40px,7vh,80px)]">
            <a href="/" className="text-label tracking-meta text-ink-55 uppercase hover:text-ink">
                ← kevinschaich
            </a>
            <h1 className="mt-10 font-serif text-[clamp(2rem,8vw,2.75rem)] leading-[.94] tracking-[-.015em]">Projects</h1>

            <ul className="mt-10 flex flex-col gap-[14px]">
                {projects.map((p) => (
                    <li key={p.slug}>
                        <a
                            href={`/project/${p.slug}/`}
                            className="panel flex items-center gap-4 rounded-2xl border border-hair p-5 transition-colors duration-300 hover:border-gold"
                        >
                            <img src={`/icon/${p.slug}.png`} alt="" width={40} height={40} className="rounded-lg" />
                            <span className="flex flex-col">
                                <span className="text-lede" style={{ color: p.accent }}>
                                    {p.name}
                                </span>
                                <span className="text-label text-ink-55">{p.tagline}</span>
                            </span>
                        </a>
                    </li>
                ))}
                {projects.length === 0 && <li className="text-ink-55">Nothing here yet.</li>}
            </ul>
        </main>
    )
}
