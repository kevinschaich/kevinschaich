export const SITE_URL = 'https://kevinschaich.com'
export const PROJECTS_URL = `${SITE_URL}/projects`

/** `owner/name` (or a full URL) → the repo's GitHub URL; nothing in, nothing out. */
export const repoURL = (repo?: string | null): string | null => (!repo ? null : /^https?:\/\//.test(repo) ? repo : `https://github.com/${repo}`)

/**
 * The byline's links in order: "by kevinschaich · code on github · all projects". Pass the current
 * project's repo to get the middle link; without one (e.g. the hub's own pages) it's left out.
 */
export function bylineLinks(repo?: string | null): { href: string; text: string }[] {
    const code = repoURL(repo)
    return [
        { href: SITE_URL, text: 'by kevinschaich' },
        ...(code ? [{ href: code, text: 'code on github' }] : []),
        { href: PROJECTS_URL, text: 'all projects' },
    ]
}

/** The byline as an HTML string, for pages without a framework. Links open in a new tab unless `newTab` is false. */
export function bylineHTML(repo?: string | null, { newTab = true }: { newTab?: boolean } = {}): string {
    const target = newTab ? ' target="_blank" rel="noopener"' : ''
    const links = bylineLinks(repo).map(({ href, text }) => `<a href="${href}"${target}>${text}</a>`)
    return `<span class="ks-byline">${links.join(' · ')}</span>`
}

/** Title in the shared format: "<Name> | by kevinschaich". */
export const projectTitle = (name: string) => `${name} | by kevinschaich`
export const ogImageURL = (slug: string) => `${SITE_URL}/og/${slug}.png`
export const iconURL = (slug: string) => `${SITE_URL}/icon/${slug}.png`
