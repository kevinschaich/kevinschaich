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
    repo: string
    fullName: string
    repoId: number
    defaultBranch: string
    /** Deployed demo (project.json `url`, e.g. its vercel.app URL); null for README-only projects. */
    url: string | null
    /** Live demo (proxied) rather than the rendered README. */
    demo: boolean
    typeset: Typeset
}

const OWNER = 'kevinschaich'
const TOPIC = 'kevinschaich-project'
const TTL_MS = 5 * 60 * 1000

let cache: { at: number; projects: Promise<Project[]> } | null = null

export function getProjects(): Promise<Project[]> {
    if (!cache || Date.now() - cache.at > TTL_MS) {
        const projects = load().catch((error) => {
            console.error('Project registry failed to load', error)
            cache = null
            return []
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
    const search = await json(`https://api.github.com/search/repositories?q=topic:${TOPIC}+user:${OWNER}&per_page=100`, gh)
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
                typeset: meta.typeset ?? {},
            } satisfies Project
        }),
    )
    return projects.filter((p): p is Project => p !== null).sort((a, b) => a.name.localeCompare(b.name))
}

export const raw = (repo: { full_name: string; default_branch: string }) =>
    `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/`

const auth = (token?: string): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {})

async function json(url: string, headers: Record<string, string> = {}) {
    const res = await fetch(url, { headers, cache: 'no-store' })
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return res.json()
}
