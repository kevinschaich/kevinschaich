// PostHog, shared by kevinschaich.com, darkgrade.com and every project under kevinschaich.com/projects: one
// project, reached through our own proxy. Nothing here is secret — `phc_` is a public, write-only key, which is
// what lets a static project with no build carry it inline. A `phx_` (personal) key must never appear in a repo.
//
// Next apps read NEXT_PUBLIC_POSTHOG_KEY / NEXT_PUBLIC_POSTHOG_HOST from the environment instead (Kevin sets them
// in Vercel); this is for everything that has no environment to read: Vite projects and no-build pages.

export const POSTHOG_KEY = 'phc_eOW21t5JEdgDB5lue4y9GuJhltWD5miYyLw86JkMN6g'
export const POSTHOG_HOST = 'https://ph.darkgrade.com'

/** The options every one of Kevin's sites uses: autocapture on, nothing that records a session. */
export const POSTHOG_OPTIONS = {
    defaults: '2025-11-30',
    autocapture: true,
    disable_session_recording: true,
    disable_surveys: true,
    capture_dead_clicks: false,
} as const

type PostHogWindow = Window & { posthog?: { __loaded?: boolean; init(key: string, options: object): void } }

/**
 * Loads PostHog from the proxy and starts it. Called for you by the runtime kit (kit/v1/brand.js); a React
 * project calls it once, at startup. Safe to call twice and a no-op outside a browser.
 */
export function initAnalytics({ key = POSTHOG_KEY, apiHost = POSTHOG_HOST }: { key?: string; apiHost?: string } = {}) {
    if (typeof document === 'undefined') return
    const w = window as PostHogWindow
    if (w.posthog?.__loaded) return
    const script = document.createElement('script')
    script.async = true
    script.src = `${apiHost}/static/array.js`
    script.onload = () => w.posthog?.init(key, { api_host: apiHost, ...POSTHOG_OPTIONS })
    document.head.appendChild(script)
}
