// The flowy backdrop: a 1200x630 still of darkgrade.com's scene, shipped with the package so every card generator
// draws the same one. Exported apart from the card so a consumer can use it on its own.

export const BACKDROP_SIZE = { width: 1200, height: 630 }

/** The file on disk, for a consumer that would rather copy or serve it than embed it. Node only. */
export const backdropPath = () => decodeURIComponent(new URL('./assets/backdrop.jpg', import.meta.url).pathname)

let cached: Promise<string> | null = null

/**
 * The backdrop as a `data:image/jpeg;base64,…` URI, which is what Satori (`next/og`, `@vercel/og`) needs to embed
 * it. The bytes live in their own module, pulled in on first use.
 */
export function backdropDataURI(): Promise<string> {
    cached ??= import('./backdrop-data').then(({ BACKDROP_JPEG_BASE64 }) => `data:image/jpeg;base64,${BACKDROP_JPEG_BASE64}`)
    return cached
}
