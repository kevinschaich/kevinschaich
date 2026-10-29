// Runtime kit for no-build pages, served at https://kevinschaich.com/kit/v1/brand.js.
// Exposes window.kevinschaich and fills every [data-ks-byline] element with the byline.
import { bylineHTML, projectTitle, ogImageURL, iconURL } from './byline.js'

window.kevinschaich = { bylineHTML, projectTitle, ogImageURL, iconURL }

// The attribute's value is the project's repo: <span data-ks-byline="kevinschaich/backroads"></span>.
const fill = () => document.querySelectorAll('[data-ks-byline]').forEach((el) => (el.innerHTML = bylineHTML(el.dataset.ksByline)))
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill)
else fill()
