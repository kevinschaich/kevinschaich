import type { Typeset } from '@/lib/projects'

const DEFAULTS = { body: 'Public Sans', mono: 'JetBrains Mono' }

/** Google Fonts faces a project uses (body, heading, mono), defaults filled in. */
export function faces(t: Typeset) {
    const body = t.body ?? DEFAULTS.body
    return { body, heading: t.heading ?? body, mono: t.mono ?? DEFAULTS.mono }
}

/** CSS that loads a project's faces and sets the font and typeset variables. */
export function projectCSS(t: Typeset) {
    const f = faces(t)
    const families = [...new Set([f.body, f.heading, f.mono])]
        .map((name) => `family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400;500;600;700`)
        .join('&')
    const vars: [string, string | number | undefined][] = [
        ['--font-sans', `'${f.body}', ui-sans-serif, system-ui, sans-serif`],
        ['--font-heading', `'${f.heading}', var(--font-sans)`],
        ['--font-mono', `'${f.mono}', ui-monospace, monospace`],
        ['--ks-typeset-size', t.size],
        ['--ks-typeset-leading', t.leading],
        ['--ks-typeset-flow', t.flow],
        ['--ks-typeset-measure', t.measure],
    ]
    return (
        `@import url('https://fonts.googleapis.com/css2?${families}&display=swap');\n` +
        `:root, .ks-theme {\n${vars.filter(([, v]) => v !== undefined).map(([k, v]) => `    ${k}: ${v};`).join('\n')}\n}\n`
    )
}

/** TTF data for next/og, which can't read woff2. */
export async function googleFont(family: string, weight: number) {
    const css = await fetch(
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
        // An old user agent makes Google serve TTF.
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30' }, cache: 'no-store' },
    ).then((r) => r.text())
    const src = css.match(/src: url\((.+?)\)/)?.[1]
    if (!src) throw new Error(`No font file for ${family} ${weight}`)
    return fetch(src).then((r) => r.arrayBuffer())
}
