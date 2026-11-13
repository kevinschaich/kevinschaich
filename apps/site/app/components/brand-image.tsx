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
        return new ImageResponse(render(project, dims), {
            ...dims,
            fonts: await cardFonts(project.typeset),
            headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600' },
        })
    }
}

/** The three faces the shared OG card asks for, named as it expects: body, heading and the mono address line. */
export async function cardFonts(typeset: Project['typeset'] = {}) {
    const { body, heading, mono } = faces(typeset)
    return Promise.all([
        googleFont(body, 400).then((data) => ({ name: 'body', data, weight: 400 as const })),
        googleFont(heading, 600).then((data) => ({ name: 'heading', data, weight: 600 as const })),
        googleFont(heading, 500).then((data) => ({ name: 'heading', data, weight: 500 as const })),
        googleFont(mono, 400).then((data) => ({ name: 'mono', data, weight: 400 as const })),
    ])
}
