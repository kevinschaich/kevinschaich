/** Registry of Kevin's projects: public repos tagged `kevinschaich-project` with a `project.json`,
    Read at build time only: the site is rebuilt on a schedule
    (.github/workflows/site.yml), so tokens never reach a runtime. GITHUB_TOKEN is optional: it only raises
    the search rate limit. */

/** typeset knobs a project may override; faces are Google Fonts family names. */
export type Typeset = { body?: string; heading?: string; mono?: string; size?: string; leading?: number | string; flow?: string; measure?: string }

export type Project = {
    slug: string
    name: string
    tagline: string
    /** Lucide icon name (lucide.dev); unknown or missing renders as `box`. */
    icon?: string
    /** Where the project's tile and /project/<slug>/ go instead of the demo or README. Pinned projects only. */
    link?: string
    /** A ready-made square icon (already white on black) as a data URI, used instead of `icon`. Pinned projects only. */
    iconImage?: string
    repo: string
    fullName: string
    repoId: number
    defaultBranch: string
    /** Deployed demo (project.json `url`, e.g. its vercel.app URL); null for README-only projects. */
    url: string | null
    /** Live demo (proxied) rather than the rendered README. */
    demo: boolean
    /** A screenshot of the app in use (project.json `screenshot`, a path in the repo), drawn behind its OG card. */
    screenshot?: string
    typeset: Typeset
}

/**
 * Projects listed first, in this order, ahead of everything discovered. Their name, tagline and icon override
 * the repo's own; `iconURL` is a square SVG or PNG that's already white on black, fetched at build time.
 * `link` sends the tile and /project/<slug>/ to the project's own site instead of its demo or README.
 */
const PINNED: { slug: string; name: string; tagline: string; iconURL: string; fullName: string; link?: string; screenshot?: string }[] = [
    {
        slug: 'darkgrade',
        name: 'Darkgrade',
        tagline: 'Local-first AI for creative pros',
        iconURL: 'https://darkgrade.com/darkgrade_favicon_dark.svg',
        fullName: 'darkgrade/darkgrade',
        link: 'https://darkgrade.com',
        // the Darkgrade film behind kevinschaich.com at 0:09: Kevin in his own studio (Mux thumbnail, 3840 wide)
        screenshot: 'https://raw.githubusercontent.com/kevinschaich/kevinschaich/main/apps/site/public/darkgrade-studio.jpg',
    },
]

/** Accounts whose repos can be listed: Kevin's own, plus orgs he runs. Only add owners Kevin controls. */
const OWNERS = ['kevinschaich', 'darkgrade']
const TOPIC = 'kevinschaich-project'
const TTL_MS = 5 * 60 * 1000

let cache: { at: number; projects: Promise<Project[]> } | null = null

export function getProjects(): Promise<Project[]> {
    if (!cache || Date.now() - cache.at > TTL_MS) {
        // A failed lookup (e.g. GitHub's search rate limit) fails the build rather than publishing an empty
        // registry, so Vercel keeps serving the last good deploy.
        const projects = load().catch((error) => {
            cache = null
            throw new Error(`Project registry failed to load: ${error.message}`)
        })
        cache = { at: Date.now(), projects }
    }
    return cache.projects
}

export async function getProject(slug: string) {
    return (await getProjects()).find((p) => p.slug === slug)
}

async function load(): Promise<Project[]> {
    const gh = { Accept: 'application/vnd.github+json', ...auth(process.env.GITHUB_TOKEN) }
    const search = await json(`https://api.github.com/search/repositories?q=topic:${TOPIC}+${OWNERS.map((o) => `user:${o}`).join('+')}&per_page=100`, gh)
    const projects = await Promise.all(
        search.items.map(async (repo: any) => {
            // Listed projects are public, so raw files need no token and don't count against API limits.
            // Without project.json the topic alone lists the repo as README-only.
            const meta = (await json(`${raw(repo)}project.json`).catch(() => null)) ?? { slug: repo.name, name: repo.name, demo: false }
            if (!meta.slug || !meta.name) return null
            const url: string | null = meta.demo === false ? null : (meta.url?.replace(/\/$/, '') ?? null)
            return {
                slug: meta.slug,
                name: meta.name,
                tagline: meta.tagline ?? repo.description ?? '',
                icon: meta.icon,
                repo: repo.html_url,
                fullName: repo.full_name,
                repoId: repo.id,
                defaultBranch: repo.default_branch,
                url,
                demo: url !== null,
                screenshot: typeof meta.screenshot === 'string' ? `${raw(repo)}${meta.screenshot.replace(/^\.?\//, '')}` : undefined,
                typeset: meta.typeset ?? {},
            } satisfies Project
        }),
    )
    const discovered = projects.filter((p): p is Project => p !== null)
    const pinned = await Promise.all(PINNED.map((pin) => pinnedProject(pin, discovered, gh)))
    const pinnedSlugs = new Set(pinned.map((p) => p.slug))
    const pinnedRepos = new Set(PINNED.map((p) => p.fullName))
    const rest = discovered.filter((p) => !pinnedSlugs.has(p.slug) && !pinnedRepos.has(p.fullName))
    return [...pinned, ...rest.sort((a, b) => a.name.localeCompare(b.name))]
}

/** A pinned project: its repo as discovered (or looked up, if it lacks the topic) with the pinned fields on top. */
async function pinnedProject(pin: (typeof PINNED)[number], discovered: Project[], gh: Record<string, string>): Promise<Project> {
    let base = discovered.find((p) => p.fullName === pin.fullName || p.slug === pin.slug)
    if (!base) {
        const repo = await json(`https://api.github.com/repos/${pin.fullName}`, gh)
        base = { slug: pin.slug, name: pin.name, tagline: '', repo: repo.html_url, fullName: repo.full_name, repoId: repo.id, defaultBranch: repo.default_branch, url: null, demo: false, typeset: {} }
    }
    const res = await fetch(pin.iconURL, { cache: 'no-store' })
    if (!res.ok) throw new Error(`${res.status} ${pin.iconURL}`)
    const type = res.headers.get('content-type')?.split(';')[0] || (pin.iconURL.endsWith('.svg') ? 'image/svg+xml' : 'image/png')
    const iconImage = `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
    return { ...base, slug: pin.slug, name: pin.name, tagline: pin.tagline, iconImage, link: pin.link, screenshot: pin.screenshot ?? base.screenshot }
}

export const raw = (repo: { full_name: string; default_branch: string }) =>
    `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/`

const auth = (token?: string): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {})

async function json(url: string, headers: Record<string, string> = {}) {
    const res = await fetch(url, { headers, cache: 'no-store' })
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return res.json()
}
