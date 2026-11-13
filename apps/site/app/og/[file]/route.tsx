import { OgCard } from '@kevinschaich/components/og'
import { brandImageRoute } from '@/app/components/brand-image'
import { getProjects } from '@/lib/projects'

/** Every project's card, in the one shared layout: the project's name and tagline over a screenshot of the app in
 *  use when the project has one. No mark — the address at the foot says whose it is. */
export const GET = brandImageRoute(
    ({ name, tagline, screenshot }) => (
        <OgCard
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
