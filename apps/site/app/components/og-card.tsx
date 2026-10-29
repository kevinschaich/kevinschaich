// The one OG layout shared by every project card and kevinschaich.com's own.
// typeset's proportions (packages/components/src/typeset.css) at card scale: h1 is 1.75em at weight 600 and
// line-height 1.3, body text 1.75 leading, 1em under a heading, --typeset-flow (1.25em) between blocks.
const BODY = 40
const FLOW = BODY * 1.25
// shadcn zinc (dark): --background, --foreground, --muted-foreground, --border.
const ZINC = { background: '#09090b', foreground: '#fafafa', muted: '#a1a1aa', border: '#27272a' }

/**
 * Icon, name, tagline, then a muted footer ("by kevinschaich"), set like a README. With `background` (a screenshot of
 * the app in use), the screenshot fills the card and the text sits on a dark fade from the left.
 */
export function OgCard({
    name,
    tagline,
    iconImage,
    iconSize = 84,
    footer = 'by kevinschaich',
    background,
}: {
    name: string
    tagline?: string
    iconImage: string
    iconSize?: number
    footer?: string
    background?: string
}) {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: background ? '48px 72px' : '48px 96px',
                backgroundColor: ZINC.background,
                fontFamily: 'body',
                fontSize: BODY,
                lineHeight: 1.75,
                color: ZINC.foreground,
            }}
        >
            {background && <img src={background} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }} />}
            {background && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1200,
                        height: 630,
                        // zinc-950 (#09090b) fading out to the right
                        backgroundImage: 'linear-gradient(90deg, rgba(9,9,11,0.94) 0%, rgba(9,9,11,0.86) 38%, rgba(9,9,11,0.45) 62%, rgba(9,9,11,0) 82%)',
                    }}
                />
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 88, height: 88, flexShrink: 0, marginBottom: FLOW, background: '#000', borderRadius: 16, border: `2px solid ${ZINC.border}`, overflow: 'hidden' }}>
                <img src={iconImage} width={iconSize} height={iconSize} alt="" />
            </div>
            <div style={{ fontFamily: 'heading', fontSize: BODY * 1.75, fontWeight: 600, lineHeight: 1.3, flexShrink: 0 }}>{name}</div>
            {tagline && <div style={{ marginTop: BODY, flexShrink: 0, ...(background ? { maxWidth: 560 } : {}) }}>{tagline}</div>}
            <div style={{ marginTop: FLOW, flexShrink: 0, color: ZINC.muted }}>{footer}</div>
        </div>
    )
}
