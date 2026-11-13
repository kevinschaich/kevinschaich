import { backdropDataURI, OgCard } from '@kevinschaich/components/og'
import { ImageResponse } from 'next/og'
import { cardFonts } from '@/app/components/brand-image'

/** kevinschaich.com's own card, in the same layout as every project's, over the flowy backdrop. */
export async function GET() {
    const [fonts, background] = await Promise.all([cardFonts(), backdropDataURI()])
    return new ImageResponse(
        <OgCard
            main="Kevin Schaich"
            sub="Building Darkgrade: local-first AI for creative pros."
            address="kevinschaich.com"
            background={background}
        />,
        { width: 1200, height: 630, fonts },
    )
}

export const dynamic = 'force-static'
