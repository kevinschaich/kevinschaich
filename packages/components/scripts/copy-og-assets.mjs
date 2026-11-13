// Copies the OG card's assets (the flowy backdrop, which backdrop.ts reads relative to its own file) into dist,
// so an installed package can find them next to dist/og/index.js. Runs on every build.
import { cpSync, mkdirSync } from 'node:fs'

mkdirSync('dist/og/assets', { recursive: true })
cpSync('src/og/assets', 'dist/og/assets', { recursive: true })
