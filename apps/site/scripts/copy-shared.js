// Copies the shared AGENTS.md and the runtime kit (built by packages/components first) into public/ so they
// always match the repo.
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const root = new URL('../../../', import.meta.url)
const pub = new URL('../public/', import.meta.url)
const kit = new URL('kit/v1/', pub)

mkdirSync(kit, { recursive: true })
cpSync(new URL('AGENTS.md', root), new URL('AGENTS.md', pub))
// The kit loads fonts from Google Fonts; @import has to be the file's first rule to work.
const fonts = "@import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');\n"
writeFileSync(new URL('brand.css', kit), fonts + readFileSync(new URL('packages/components/src/styles.css', root), 'utf8'))
cpSync(new URL('packages/components/dist/kit/brand.js', root), new URL('brand.js', kit))
cpSync(new URL('packages/components/dist/kit/byline.js', root), new URL('byline.js', kit))
cpSync(new URL('packages/components/src/typeset.css', root), new URL('typeset.css', kit))
