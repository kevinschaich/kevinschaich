// The two brand marks, bare: transparent SVGs with no tile, border or background behind them. Both are inlined
// here rather than read from disk so a card generator can use them without touching the filesystem.

export type Mark = {
    /** The mark as an SVG data URI, ready for an <img> in a Satori/next-og card. */
    src: string
    /** Intrinsic width ÷ height, so a card can size the mark from its height alone. */
    aspect: number
    /** The raw SVG, for pages that want to inline it. */
    svg: string
}

const dataURI = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`

const mark = (svg: string, aspect: number): Mark => ({ src: dataURI(svg), aspect, svg })

const DARKGRADE = (fill: string) =>
    `<svg width="80" height="56" viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M16 56H8V48H16V56ZM8 48H0V8H8V48ZM16 8H8V0H16V8Z" fill="${fill}"/>` +
    `<path d="M44 24H56V32H44V44H36V32H24V24H36V12H44V24Z" fill="${fill}"/>` +
    `<path d="M72 56H64V48H72V56ZM80 48H72V8H80V48ZM72 8H64V0H72V8Z" fill="${fill}"/>` +
    `</svg>`

const KEVINSCHAICH = (fill: string) =>
    `<svg width="80" height="45" viewBox="0 0 80 45" fill="none" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M53.3335 8.86528V2.67029e-05H79.9293V8.86528H53.3335ZM71.064 35.461V26.5958H53.3335V17.7305H44.4683V8.86528H53.3335V17.7305H71.064V26.5958H79.9293V35.461H71.064ZM44.4683 44.3263V35.461H71.064V44.3263H44.4683Z" fill="${fill}"/>` +
    `<path d="M0 44.3262V0H8.86525V17.7305H17.7305V26.5957H26.5957V35.461H35.461V44.3262H26.5957V35.461H17.7305V26.5957H8.86525V44.3262H0ZM26.5957 8.86525V0H35.461V8.86525H26.5957ZM17.7305 17.7305V8.86525H26.5957V17.7305H17.7305Z" fill="${fill}"/>` +
    `</svg>`

/** The Darkgrade mark. `dark` is the white one, for a dark card; `light` is the black one. */
export const darkgradeMark = { dark: mark(DARKGRADE('white'), 80 / 56), light: mark(DARKGRADE('black'), 80 / 56) }

/** Kevin's own mark, same pair. */
export const kevinschaichMark = { dark: mark(KEVINSCHAICH('white'), 80 / 45), light: mark(KEVINSCHAICH('black'), 80 / 45) }
