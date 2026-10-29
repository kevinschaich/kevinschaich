import { ImageResponse } from 'next/og'
import { getProject, type Project } from '@/lib/projects'
import { faces, googleFont } from '@/lib/typeset'

/** Shared handler for /og/<slug>.png and /icon/<slug>.png, set in the project's typeset faces. */
export function brandImageRoute(render: (p: Project) => React.ReactElement, size: { width: number; height: number }) {
    return async (_: Request, { params }: { params: Promise<{ file: string }> }) => {
        const { file } = await params
        const project = await getProject(file.replace(/\.png$/, ''))
        if (!project) return new Response('Not found', { status: 404 })
        const { body, heading } = faces(project.typeset)
        const fonts = await Promise.all([
            googleFont(body, 400).then((data) => ({ name: 'body', data, weight: 400 as const })),
            googleFont(heading, 700).then((data) => ({ name: 'heading', data, weight: 700 as const })),
        ])
        return new ImageResponse(render(project), {
            ...size,
            fonts,
            headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
        })
    }
}
