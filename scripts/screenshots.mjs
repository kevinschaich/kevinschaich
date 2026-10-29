// 4K screenshots for the projects' OG cards and /projects tiles: each app opened at its kevinschaich.com address,
// used the way a person would, and captured at 3840×2160 into the project repo's screenshot.jpg (wired up by its
// project.json `screenshot`). Runs locally in a real Chromium with a GPU (WebGPU apps need one); audio is muted.
//   bun scripts/screenshots.mjs [slug ...]
import { chromium } from 'playwright-core'
import { homedir } from 'node:os'
import { join } from 'node:path'

const REPOS = join(homedir(), 'repositories')
// Any Chromium-based browser; set CHROMIUM to its binary.
const CHROMIUM = process.env.CHROMIUM
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const SCENES = {
    // Golden, Colorado: Lookout Mountain's switchbacks against the plains, with a road's card pinned.
    backroads: {
        repo: 'backroads',
        url: 'https://kevinschaich.com/project/backroads/#13.4/39.7300/-105.2350',
        async run(page) {
            await sleep(30000)
            const input = page.getByPlaceholder('Search a road, town, address or ZIP')
            await input.click()
            await input.pressSequentially('Lookout Mountain', { delay: 60 })
            await sleep(1200)
            await page.locator('[cmdk-item]').first().click()
            await sleep(4000)
        },
    },
    // A mid-game factory: computers and modular frames from the player's own iron, copper and oil nodes.
    pioneer: {
        repo: 'satisfactory',
        url: 'https://kevinschaich.com/project/pioneer/',
        async before(context) {
            const plan = {
                miner: 3, belt: 3, pipe: 1, shards: 0, burnFuel: true,
                nodes: [
                    { id: 'n1', res: 'Desc_OreIron_C', purity: 'pure', count: 2 },
                    { id: 'n2', res: 'Desc_OreCopper_C', purity: 'normal', count: 2 },
                    { id: 'n3', res: 'Desc_LiquidOil_C', purity: 'normal', count: 1 },
                ],
                parts: [],
                targets: [
                    { id: 't1', item: 'Desc_Computer_C', amount: 1 },
                    { id: 't2', item: 'Desc_ModularFrame_C', amount: 1 },
                ],
                mode: 'max', choice: {}, showAlts: true,
                map: { hidden: [], purities: ['impure', 'normal', 'pure'], wells: true, geysers: false, hideUsed: false },
                used: [], basePull: 1,
            }
            await context.addInitScript((p) => {
                localStorage.setItem('sf-planner-v2', JSON.stringify(p))
                localStorage.setItem('sf-view', 'planner')
            }, plan)
        },
        async run(page) {
            await sleep(4000)
            await page.getByRole('button', { name: /Tidy up/ }).click()
            await sleep(1500)
            await page.getByRole('button', { name: /^Fit$/ }).click()
            await sleep(2000)
        },
    },
    // Pebble Beach's 7th at golden hour, mid-flight over the Pacific.
    'fairway-atlas': {
        repo: 'fairway-atlas',
        url: 'https://kevinschaich.com/project/fairway-atlas/?course=pebble&hole=7&time=17.4&clouds=0.3',
        async before(context) {
            await context.addInitScript(() => {
                localStorage.setItem('fairway-audio-v1', JSON.stringify({ volume: 0, muted: true }))
                localStorage.setItem('fairway-commentary-v1', JSON.stringify({ enabled: false, volume: 0 }))
            })
        },
        async run(page) {
            await page.waitForFunction(() => document.querySelector('button')?.textContent, null, { timeout: 60000 })
            await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => /Take your shot/.test(b.textContent) && !b.disabled), null, { timeout: 120000 })
            await sleep(8000)
            await page.getByRole('button', { name: 'Play at set power' }).click()
            await sleep(Number(process.env.FA_AFTER ?? 1800))
        },
    },
}

const only = process.argv.slice(2)
const browser = await chromium.launch({
    executablePath: CHROMIUM,
    // Headless with a persistent profile: no window, no first-run screens on the desktop.
    headless: true,
    args: ['--mute-audio', '--enable-unsafe-webgpu', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--headless=new', '--use-angle=metal', '--window-size=1920,1080'],
})
for (const [slug, scene] of Object.entries(SCENES)) {
    if (only.length && !only.includes(slug)) continue
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, colorScheme: 'dark' })
    await scene.before?.(context)
    const page = await context.newPage()
    await page.goto(scene.url, { waitUntil: 'domcontentloaded' })
    await scene.run(page)
    const out = join(REPOS, scene.repo, 'screenshot.jpg')
    await page.screenshot({ path: out, type: 'jpeg', quality: 90 })
    console.log(slug, '→', out)
    await context.close()
}
await browser.close()
