import { icons } from 'lucide'

type Node = [string, Record<string, string | number | undefined>]

const FALLBACK = 'box'

const pascal = (name: string) => name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase())

/** Whether `name` is a Lucide icon (kebab-case, as on lucide.dev). */
export const isIcon = (name?: string) => !!name && pascal(name) in icons

/** The project's Lucide icon as a white-stroked SVG; unknown or missing names fall back to `box`. */
export function iconSVG(name?: string) {
    const nodes = icons[pascal(isIcon(name) ? name! : FALLBACK) as keyof typeof icons] as unknown as Node[]
    const children = nodes
        .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`)
        .join('')
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`
}

export const iconDataURI = (name?: string) => `data:image/svg+xml;base64,${Buffer.from(iconSVG(name)).toString('base64')}`
