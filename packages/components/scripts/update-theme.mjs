// Refreshes the :root (light) and .dark blocks in src/theme.css from shadcn's zinc registry, keeping everything
// else (imports, @theme mapping, fonts) as is. Run by .github/workflows/shadcn.yml; safe to run by hand.
import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/theme.css', import.meta.url)
const { cssVarsV4 } = await (await fetch('https://ui.shadcn.com/r/colors/zinc.json')).json()
let css = readFileSync(path, 'utf8')
const radius = css.match(/--radius:\s*([^;]+);/)?.[1]
const block = (selector, vars, extra = []) =>
    `${selector} {\n${[...Object.entries(vars).map(([k, v]) => `    --${k}: ${v};`), ...extra].join('\n')}\n}`
css = css.replace(/(^|\n):root \{[\s\S]*?\n\}/, `$1${block(':root', cssVarsV4.light, cssVarsV4.light.radius || !radius ? [] : [`    --radius: ${radius};`])}`)
css = css.replace(/(^|\n)\.dark \{[\s\S]*?\n\}/, `$1${block('.dark', cssVarsV4.dark)}`)
writeFileSync(path, css)
