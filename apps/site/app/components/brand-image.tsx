import { ImageResponse } from 'next/og'
import { getProject, type Project } from '@/lib/projects'
import { faces, googleFont } from '@/lib/typeset'

type Size = { width: number; height: number }

/** Shared handler for /og/<slug>.png and /icon/<slug>.png, set in the project's typeset faces.
    `variants` maps a filename suffix (e.g. `-180` for /icon/<slug>-180.png) to another size. */
export function brandImageRoute(render: (p: Project, size: Size) => React.ReactElement, size: Size, variants: Record<string, Size> = {}) {
    return async (_: Request, { params }: { params: Promise<{ file: string }> }) => {
        let slug = (await params).file.replace(/\.png$/, '')
        const suffix = Object.keys(variants).find((s) => slug.endsWith(s))
        if (suffix) slug = slug.slice(0, -suffix.length)
        const dims = suffix ? variants[suffix] : size
        const project = await getProject(slug)
        if (!project) return new Response('Not found', { status: 404 })
        const { body, heading } = faces(project.typeset)
        const fonts = await Promise.all([
            googleFont(body, 400).then((data) => ({ name: 'body', data, weight: 400 as const })),
            googleFont(heading, 700).then((data) => ({ name: 'heading', data, weight: 700 as const })),
        ])
        return new ImageResponse(render(project, dims), {
            ...dims,
            fonts,
            headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
        })
    }
}
