export const SITE_URL = 'https://kevinschaich.com'
export const PROJECTS_URL = `${SITE_URL}/projects`

/** The byline as an HTML string, for pages without a framework. */
export function bylineHTML() {
    return (
        `<span class="ks-byline"><a href="${SITE_URL}" target="_blank" rel="noopener">by kevinschaich</a>` +
        ` · <a href="${PROJECTS_URL}" target="_blank" rel="noopener">view all projects</a></span>`
    )
}

/** Title in the shared format: "<Name> | by kevinschaich". */
export const projectTitle = (name) => `${name} | by kevinschaich`
export const ogImageURL = (slug) => `${SITE_URL}/og/${slug}.png`
export const iconURL = (slug) => `${SITE_URL}/icon/${slug}.png`
