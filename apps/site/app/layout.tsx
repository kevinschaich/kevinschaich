import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { MUX_STREAM_ORIGIN } from '@/app/components/mux'
import './globals.css'

const tayFlapjack = localFont({
    src: [{ path: './fonts/tay-flapjack.woff2', weight: '400', style: 'normal' }],
    variable: '--font-tay-flapjack',
    display: 'swap',
    preload: true,
    fallback: ['Georgia', 'serif'],
})

const tayRoadRunner = localFont({
    src: [{ path: './fonts/tay-road-runner-regular.woff2', weight: '400', style: 'normal' }],
    variable: '--font-tay-road-runner',
    display: 'swap',
    preload: true,
    fallback: ['system-ui', 'sans-serif'],
})

const TITLE = 'Kevin Schaich | Darkgrade'
const DESCRIPTION = 'Building Darkgrade: local-first AI for creative pros.'
const OG_IMAGE = 'https://kevinschaich.com/opengraph.png'

export const metadata: Metadata = {
    metadataBase: new URL('https://kevinschaich.com'),
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/' },
    icons: {
        icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    },
    openGraph: {
        title: TITLE,
        siteName: TITLE,
        description: DESCRIPTION,
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Kevin Schaich' }],
        type: 'website',
        url: 'https://kevinschaich.com',
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: [OG_IMAGE],
        creator: '@kevinschaich',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0A0A0B',
    colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${tayRoadRunner.variable} ${tayFlapjack.variable}`}>
            <head>
                <link rel="preconnect" href={MUX_STREAM_ORIGIN} />
            </head>
            <body>{children}</body>
        </html>
    )
}
