import type { NextConfig } from 'next'
import { getProjects } from './lib/projects'

const nextConfig: NextConfig = {
    // /project/<slug>/ keeps its trailing slash so relative asset paths resolve; vercel.json adds it where missing.
    skipTrailingSlashRedirect: true,

    // Demos are proxied by Vercel's router from rewrites fixed at build time: no middleware or function
    // runs per request, so a viral project can't exhaust the site's limits.
    async rewrites() {
        const demos = (await getProjects()).filter((p) => p.url)
        return demos.flatMap((p) => [
            { source: `/project/${p.slug}/`, destination: `${p.url}/` },
            { source: `/project/${p.slug}/:path*`, destination: `${p.url}/:path*` },
        ])
    },
    async headers() {
        // Projects on other origins import the runtime kit as ES modules, which needs CORS. Short caches so a
        // kit change reaches every project within the hour.
        const cors = [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=3600' },
        ]
        return [
            { source: '/kit/:path*', headers: cors },
            { source: '/AGENTS.md', headers: [{ key: 'Content-Type', value: 'text/markdown; charset=utf-8' }] },
        ]
    },
}

export default nextConfig
