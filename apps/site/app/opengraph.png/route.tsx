import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { OgCard } from '@/app/components/og-card'
import { faces, googleFont } from '@/lib/typeset'

/** kevinschaich.com's own card, in the same layout as every project's. */
export async function GET() {
    const { body, heading } = faces({})
    const [fonts, mark] = await Promise.all([
        Promise.all([
            googleFont(body, 400).then((data) => ({ name: 'body', data, weight: 400 as const })),
            googleFont(heading, 600).then((data) => ({ name: 'heading', data, weight: 600 as const })),
        ]),
        readFile(join(process.cwd(), 'public/favicon.svg')),
    ])
    return new ImageResponse(
        <OgCard
            name="Kevin Schaich"
            tagline="Building Darkgrade: local-first AI for creative pros."
            iconImage={`data:image/svg+xml;base64,${mark.toString('base64')}`}
            footer="kevinschaich.com"
        />,
        { width: 1200, height: 630, fonts },
    )
}

export const dynamic = 'force-static'
