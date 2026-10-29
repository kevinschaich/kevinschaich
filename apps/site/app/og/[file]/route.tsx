import { brandImageRoute } from '@/app/components/brand-image'
import { iconDataURI } from '@/lib/icon'
import { getProjects } from '@/lib/projects'

/** The one OG layout every project shares: icon, "<Name> by kevinschaich" and the tagline, in white. */
export const GET = brandImageRoute(
    ({ name, tagline, icon }) => (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 96,
                backgroundColor: '#09090b',
                fontFamily: 'body',
                color: '#fafafa',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 112, height: 112, marginBottom: 40, background: '#000', borderRadius: 16, border: '2px solid #27272a' }}>
                <img src={iconDataURI(icon)} width={68} height={68} alt="" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'heading', fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1, marginRight: 28 }}>{name}</span>
                <span style={{ fontSize: 40, color: '#a1a1aa' }}>by kevinschaich</span>
            </div>
            {tagline && <div style={{ fontSize: 48, marginTop: 36, color: '#d4d4d8', lineHeight: 1.25 }}>{tagline}</div>}
        </div>
    ),
    { width: 1200, height: 630 },
)

export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = async () => (await getProjects()).map((p) => ({ file: `${p.slug}.png` }))
