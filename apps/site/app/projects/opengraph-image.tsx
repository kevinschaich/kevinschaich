import { backdropDataURI, OgCard } from '@kevinschaich/components/og'
import { ImageResponse } from 'next/og'
import { cardFonts } from '@/app/components/brand-image'

export const dynamic = 'force-static'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Projects by Kevin Schaich'

/** The /projects card: the shared layout over the flowy backdrop. */
export default async function Image() {
    const [fonts, background] = await Promise.all([cardFonts(), backdropDataURI()])
    return new ImageResponse(
        <OgCard
            main="Projects"
            sub="Open-source passion projects I've shipped"
            address="kevinschaich.com/projects"
            background={background}
        />,
        { ...size, fonts },
    )
}
