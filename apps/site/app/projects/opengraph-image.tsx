import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { OgCard } from '@/app/components/og-card'
import { googleFont } from '@/lib/typeset'

export const dynamic = 'force-static'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Projects by Kevin Schaich'

/** The /projects card: the KS mark, the page's name and description, in the default faces. */
export default async function Image() {
    const icon = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), 'public/favicon.svg')).toString('base64')}`
    const fonts = await Promise.all([
        googleFont('Public Sans', 400).then((data) => ({ name: 'body', data, weight: 400 as const })),
        googleFont('Public Sans', 600).then((data) => ({ name: 'heading', data, weight: 600 as const })),
    ])
    return new ImageResponse(<OgCard name="Projects" tagline="Things Kevin Schaich built for fun." iconImage={icon} footer="kevinschaich.com" />, {
        ...size,
        fonts,
    })
}
