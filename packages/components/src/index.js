import { createElement as h } from 'react'
import { bylineLinks } from './byline.js'

export * from './byline.js'

/**
 * "by kevinschaich · code on github · all projects". `repo` is the current project's `owner/name`; without it
 * the GitHub link is left out. Pair with `@kevinschaich/components/styles.css`.
 */
export function Byline({ repo, newTab = true, className = '' }) {
    const children = bylineLinks(repo).flatMap(({ href, text }, i) => [
        ...(i ? [' · '] : []),
        h('a', { key: href, href, ...(newTab ? { target: '_blank', rel: 'noopener' } : {}) }, text),
    ])
    return h('span', { className: `ks-byline ${className}`.trim() }, ...children)
}
