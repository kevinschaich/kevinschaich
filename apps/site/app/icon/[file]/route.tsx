import { brandImageRoute } from '@/app/components/brand-image'
import { iconDataURI } from '@/lib/icon'
import { getProjects } from '@/lib/projects'

/** Favicon (192px) and apple-touch icon (/icon/<slug>-180.png): the project's Lucide icon, white on black. */
export const GET = brandImageRoute(
    ({ icon }, { width }) => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <img src={iconDataURI(icon)} width={width * 0.6} height={width * 0.6} alt="" />
        </div>
    ),
    { width: 192, height: 192 },
    { '-180': { width: 180, height: 180 } },
)

export const dynamic = 'force-static'
export const dynamicParams = false
export const generateStaticParams = async () =>
    (await getProjects()).flatMap((p) => [{ file: `${p.slug}.png` }, { file: `${p.slug}-180.png` }])
