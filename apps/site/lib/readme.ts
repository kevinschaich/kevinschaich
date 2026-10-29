import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Element, Root, Text } from 'hast'
import type { Project } from '@/lib/projects'

/** A repo's README rendered like GitHub does: GFM, alerts, anchors, highlighting, GitHub's sanitizing. */
export async function renderReadme(project: Project) {
    const base = `https://raw.githubusercontent.com/${project.fullName}/${project.defaultBranch}/`
    let markdown: string | null = null
    for (const name of ['README.md', 'readme.md', 'Readme.md', 'README']) {
        const res = await fetch(base + name, { cache: 'no-store' })
        if (res.ok) {
            markdown = await res.text()
            break
        }
    }
    if (markdown === null) return null
    // This page is the project page, so a "Try it →" link would only point back at itself.
    markdown = markdown.replace(/^.*\[Try it[^\]]*\]\([^)]*\).*\n?/gim, '')
    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeSanitize, defaultSchema)
        .use(rehypeAlerts)
        .use(rehypeRepoLinks, project)
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['heading-anchor'] } })
        .use(rehypeHighlight, { detect: false })
        .use(rehypeStringify)
        .process(markdown)
    return String(file)
}

const ALERTS = ['note', 'tip', 'important', 'warning', 'caution']

/** > [!NOTE] … → GitHub's markdown-alert markup. */
function rehypeAlerts() {
    return (tree: Root) =>
        visit(tree, 'element', (node: Element) => {
            if (node.tagName !== 'blockquote') return
            const p = node.children.find((c): c is Element => c.type === 'element')
            const text = p?.tagName === 'p' && p.children[0]?.type === 'text' ? (p.children[0] as Text) : null
            const match = text?.value.match(/^\[!(\w+)\]\s*/)
            const kind = match?.[1].toLowerCase()
            if (!text || !match || !kind || !ALERTS.includes(kind)) return
            text.value = text.value.slice(match[0].length)
            node.properties = { className: ['markdown-alert', `markdown-alert-${kind}`] }
            node.children.unshift({
                type: 'element',
                tagName: 'p',
                properties: { className: ['markdown-alert-title'] },
                children: [{ type: 'text', value: kind[0].toUpperCase() + kind.slice(1) }],
            })
        })
}

/** Relative paths: images to raw.githubusercontent.com, other links to the GitHub blob view. */
function rehypeRepoLinks(project: Project) {
    const { fullName, defaultBranch } = project
    const raw = `https://raw.githubusercontent.com/${fullName}/${defaultBranch}/`
    const blob = `https://github.com/${fullName}/blob/${defaultBranch}/`
    const relative = (url: unknown): url is string => typeof url === 'string' && !/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url)
    const resolve = (path: string, base: string) => new URL(path.replace(/^\//, ''), base).href
    return (tree: Root) =>
        visit(tree, 'element', (node: Element) => {
            const p = node.properties
            if ((node.tagName === 'img' || node.tagName === 'source') && relative(p.src)) p.src = resolve(p.src, raw)
            if (node.tagName === 'a' && relative(p.href)) p.href = resolve(p.href, blob)
        })
}
