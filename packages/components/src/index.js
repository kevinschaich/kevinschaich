import { createElement as h } from 'react'
import { SITE_URL, PROJECTS_URL } from './byline.js'

export * from './byline.js'

/** "by kevinschaich · view all projects". Pair with `@kevinschaich/components/styles.css`. */
export function Byline({ className = '' }) {
    const link = (href, text) => h('a', { href, target: '_blank', rel: 'noopener' }, text)
    return h(
        'span',
        { className: `ks-byline ${className}`.trim() },
        link(SITE_URL, 'by kevinschaich'),
        ' · ',
        link(PROJECTS_URL, 'view all projects'),
    )
}
