import { brandImageRoute } from '@/app/components/brand-image'
import { getProjects } from '@/lib/projects'

/** The one OG layout every project shares: "<Name> by kevinschaich" in the project's accent. */
export const GET = brandImageRoute(
    ({ name, accent, emoji }) => (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 96,
                backgroundColor: '#09090b',
                backgroundImage: `radial-gradient(circle at 85% 15%, ${accent}33, transparent 55%)`,
                fontFamily: 'body',
                color: '#fafafa',
            }}
        >
            {emoji && <div style={{ fontSize: 96, marginBottom: 24 }}>{emoji}</div>}
            <div style={{ fontFamily: 'heading', fontSize: 120, fontWeight: 700, letterSpacing: -4, color: accent, lineHeight: 1 }}>{name}</div>
            <div style={{ fontSize: 44, marginTop: 28, color: '#a1a1aa' }}>by kevinschaich</div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 12, background: accent }} />
        </div>
    ),
    { width: 1200, height: 630 },
)

export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = async () => (await getProjects()).map((p) => ({ file: `${p.slug}.png` }))
