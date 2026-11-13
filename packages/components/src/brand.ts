// Runtime kit for no-build pages, served at https://kevinschaich.com/kit/v1/brand.js.
// Exposes window.kevinschaich, fills every [data-ks-byline] element with the byline, and starts PostHog, so a
// page with no build still reports to the one analytics project.
import { bylineHTML, projectTitle, ogImageURL, iconURL } from './byline'
import { initAnalytics } from './analytics'

const kit = { bylineHTML, projectTitle, ogImageURL, iconURL, initAnalytics }
declare global {
    interface Window {
        kevinschaich: typeof kit
    }
}
window.kevinschaich = kit

// The attribute's value is the project's repo: <span data-ks-byline="kevinschaich/backroads"></span>.
const fill = () => document.querySelectorAll<HTMLElement>('[data-ks-byline]').forEach((el) => (el.innerHTML = bylineHTML(el.dataset.ksByline)))
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill)
else fill()

initAnalytics()
