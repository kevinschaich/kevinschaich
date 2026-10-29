// Runtime kit for no-build pages, served at https://kevinschaich.com/kit/v1/brand.js.
// Exposes window.kevinschaich and fills every [data-ks-byline] element with the byline.
import { bylineHTML, projectTitle, ogImageURL, iconURL } from './byline.js'

window.kevinschaich = { bylineHTML, projectTitle, ogImageURL, iconURL }

const fill = () => document.querySelectorAll('[data-ks-byline]').forEach((el) => (el.innerHTML = bylineHTML()))
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill)
else fill()
