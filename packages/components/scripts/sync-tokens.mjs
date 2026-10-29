// Copies shadcn's dark theme variables (src/theme.css, as shadcn generates it) into the generated block in
// src/styles.css, so no-build pages and `.ks-theme` use exactly shadcn's tokens without Tailwind.
// Runs on every build; never edit the generated block by hand.
import { readFileSync, writeFileSync } from 'node:fs'

const theme = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8')
const vars = (selector) => {
    const body = theme.match(new RegExp(`(^|\\n)${selector.replace('.', '\\.')} \\{([\\s\\S]*?)\\n\\}`))?.[2]
    if (!body) throw new Error(`No ${selector} block in theme.css`)
    return body.trim().split('\n').map((l) => l.trim()).filter((l) => l.startsWith('--'))
}
const radius = vars(':root').find((l) => l.startsWith('--radius:'))
const block = [
    '/* tokens:start (generated from theme.css by scripts/sync-tokens.mjs: shadcn zinc, dark) */',
    ':where(:root),',
    '.ks-theme {',
    ...[...vars('.dark'), radius].map((l) => `    ${l}`),
    '}',
    '/* tokens:end */',
].join('\n')

const path = new URL('../src/styles.css', import.meta.url)
const styles = readFileSync(path, 'utf8')
const next = styles.replace(/\/\* tokens:start[\s\S]*?\/\* tokens:end \*\//, block)
if (next === styles && !styles.includes('tokens:start')) throw new Error('styles.css has no tokens:start/tokens:end block')
writeFileSync(path, next)
