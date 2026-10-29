import { brandImageRoute } from '@/app/components/brand-image'
import { getProjects } from '@/lib/projects'

/** Favicon: the project's emoji (or initial) on its accent. */
export const GET = brandImageRoute(
    ({ name, accent, emoji }) => (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 40,
                background: accent,
                fontFamily: 'heading',
                fontWeight: 700,
                fontSize: emoji ? 120 : 140,
                color: '#09090b',
            }}
        >
            {emoji ?? name[0]}
        </div>
    ),
    { width: 192, height: 192 },
)

export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = async () => (await getProjects()).map((p) => ({ file: `${p.slug}.png` }))
