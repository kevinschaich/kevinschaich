// The bundler drops module-level directives, so re-add "use client" to every component file after the build.
// Next.js needs it to import these from server components; other bundlers ignore it. The runtime kit is skipped.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name === 'kit' ? [] : walk(join(dir, e.name))) : e.name.endsWith('.js') ? [join(dir, e.name)] : [])
for (const file of walk('dist')) {
    const src = readFileSync(file, 'utf8')
    if (!src.startsWith('"use client"')) writeFileSync(file, `"use client";\n${src}`)
}
