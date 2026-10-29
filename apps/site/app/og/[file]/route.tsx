import { brandImageRoute } from '@/app/components/brand-image'
import { OgCard } from '@/app/components/og-card'
import { iconDataURI } from '@/lib/icon'
import { getProjects } from '@/lib/projects'

/**
 * Every project's card: its icon (a Lucide icon, white on black, unless it brings its own), name and tagline, over a
 * screenshot of the app in use when the project has one.
 */
export const GET = brandImageRoute(
    ({ name, tagline, icon, iconImage, screenshot }) => (
        <OgCard name={name} tagline={tagline} background={screenshot} {...(iconImage ? { iconImage } : { iconImage: iconDataURI(icon), iconSize: 52 })} />
    ),
    { width: 1200, height: 630 },
)
export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = async () => (await getProjects()).map((p) => ({ file: `${p.slug}.png` }))
