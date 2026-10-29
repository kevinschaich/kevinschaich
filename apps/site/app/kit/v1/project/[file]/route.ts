import { getProject, getProjects } from '@/lib/projects'
import { projectCSS } from '@/lib/typeset'

/** /kit/v1/project/<slug>.css: the project's typeset faces and knobs from its project.json. */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
    const { file } = await params
    const project = await getProject(file.replace(/\.css$/, ''))
    return new Response(projectCSS(project?.typeset ?? {}), {
        headers: {
            'Content-Type': 'text/css; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        },
    })
}

export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = async () => (await getProjects()).map((p) => ({ file: `${p.slug}.css` }))
