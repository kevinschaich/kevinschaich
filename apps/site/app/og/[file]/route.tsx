import { brandImageRoute } from '@/app/components/brand-image'
import { iconDataURI } from '@/lib/icon'
import { getProjects } from '@/lib/projects'

// typeset's proportions (packages/components/src/typeset.css) at card scale: h1 is 1.75em at weight 600 and
// line-height 1.3, body text 1.75 leading, 1em under a heading, --typeset-flow (1.25em) between blocks.
const BODY = 40
const FLOW = BODY * 1.25
// shadcn zinc (dark): --background, --foreground, --muted-foreground, --border.
const ZINC = { background: '#09090b', foreground: '#fafafa', muted: '#a1a1aa', border: '#27272a' }

/** The one OG layout every project shares: icon, name, tagline, then "by kevinschaich", set like a README. */
export const GET = brandImageRoute(
    ({ name, tagline, icon, iconImage }) => (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '48px 96px',
                backgroundColor: ZINC.background,
                fontFamily: 'body',
                fontSize: BODY,
                lineHeight: 1.75,
                color: ZINC.foreground,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 88, height: 88, flexShrink: 0, marginBottom: FLOW, background: '#000', borderRadius: 16, border: `2px solid ${ZINC.border}`, overflow: 'hidden' }}>
                {iconImage ? <img src={iconImage} width={84} height={84} alt="" /> : <img src={iconDataURI(icon)} width={52} height={52} alt="" />}
            </div>
            <div style={{ fontFamily: 'heading', fontSize: BODY * 1.75, fontWeight: 600, lineHeight: 1.3, flexShrink: 0 }}>{name}</div>
            {tagline && <div style={{ marginTop: BODY, flexShrink: 0 }}>{tagline}</div>}
            <div style={{ marginTop: FLOW, flexShrink: 0, color: ZINC.muted }}>by kevinschaich</div>
        </div>
    ),
    { width: 1200, height: 630 },
)

export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = async () => (await getProjects()).map((p) => ({ file: `${p.slug}.png` }))
