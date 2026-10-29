// Copies the shared AGENTS.md and the runtime kit into public/ so they always match the repo.
import { cpSync, mkdirSync } from 'node:fs'

const root = new URL('../../../', import.meta.url)
const pub = new URL('../public/', import.meta.url)
const kit = new URL('kit/v1/', pub)

mkdirSync(kit, { recursive: true })
cpSync(new URL('AGENTS.md', root), new URL('AGENTS.md', pub))
cpSync(new URL('packages/components/src/styles.css', root), new URL('brand.css', kit))
cpSync(new URL('packages/components/src/brand.js', root), new URL('brand.js', kit))
cpSync(new URL('packages/components/src/byline.js', root), new URL('byline.js', kit))
cpSync(new URL('packages/components/src/typeset.css', root), new URL('typeset.css', kit))
