import { kevinschaichMark, OgCard } from '@kevinschaich/components/og'
import { brandImageRoute } from '@/app/components/brand-image'
import { getProjects } from '@/lib/projects'

/** Every project's card, in the one shared layout: the Kevinschaich mark, the project's name and tagline, over a
 *  screenshot of the app in use when the project has one. */
export const GET = brandImageRoute(
    ({ name, tagline, screenshot }) => (
        <OgCard
            logo={{ mark: kevinschaichMark.dark, name: 'Kevinschaich' }}
            main={name}
            sub={tagline}
            address="kevinschaich.com"
            background={screenshot}
        />
    ),
    { width: 1200, height: 630 },
)
export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = async () => (await getProjects()).map((p) => ({ file: `${p.slug}.png` }))
