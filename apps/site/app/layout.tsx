import type { Metadata, Viewport } from "next";
import { Fragment_Mono, Public_Sans } from "next/font/google";
import { MUX_STREAM_ORIGIN } from "@/app/components/mux";
import "./globals.css";

// The two faces darkgrade.com is set in: Public Sans for headings and running text, Fragment Mono
// for labels. Fragment Mono has one weight, so nothing set in it may ask for a bold.
const siteSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-site-sans",
  display: "swap",
});
const siteMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-site-mono",
  display: "swap",
});

const TITLE = "Kevin Schaich | Darkgrade";
const DESCRIPTION = "Building Darkgrade: local-first AI for creative pros.";
const OG_IMAGE = "https://kevinschaich.com/opengraph.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://kevinschaich.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: TITLE,
    siteName: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Kevin Schaich" }],
    type: "website",
    url: "https://kevinschaich.com",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@kevinschaich",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${siteSans.variable} ${siteMono.variable}`}>
      <head>
        <link rel="preconnect" href={MUX_STREAM_ORIGIN} />
      </head>
      <body>{children}</body>
    </html>
  );
}
