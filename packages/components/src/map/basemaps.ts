import type { DataSource } from '../data-sources'

export type Basemap = 'dark' | 'streets' | 'satellite' | 'none'

export type BasemapStyle = {
    label: string
    tiles?: string[]
    maxzoom?: number
    /** Map background behind (or instead of) the tiles. */
    bg: string
    paint?: Record<string, number>
    /** True when the basemap is light, so dark UI can switch to the light theme over it. */
    light?: boolean
}

const OSM = ['https://tile.openstreetmap.org/{z}/{x}/{y}.png']

export const BASEMAPS: Record<Basemap, BasemapStyle> = {
    // OSM tiles inverted and desaturated (keyless dark tiles are hard to find).
    dark: {
        label: 'Dark',
        tiles: OSM,
        maxzoom: 19,
        bg: '#18181b',
        paint: { 'raster-brightness-min': 0.9, 'raster-brightness-max': 0.08, 'raster-saturation': -0.85, 'raster-contrast': 0.1 },
    },
    streets: { label: 'Streets', tiles: OSM, maxzoom: 19, bg: '#f2efe9', paint: { 'raster-opacity': 0.9 }, light: true },
    satellite: {
        label: 'Satellite',
        tiles: ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}'],
        maxzoom: 16,
        bg: '#111',
        paint: { 'raster-opacity': 0.9 },
    },
    none: { label: 'None', bg: '#18181b' },
}

/** Credits for the built-in basemaps, ready to spread into an app's `sources`. */
export const BASEMAP_SOURCES: DataSource[] = [
    { what: 'Dark and Streets basemaps', from: 'OpenStreetMap contributors', href: 'https://www.openstreetmap.org/copyright', license: 'ODbL' },
    {
        what: 'Satellite basemap',
        from: 'USGS The National Map',
        href: 'https://www.usgs.gov/programs/national-geospatial-program/national-map',
        license: 'Public domain',
    },
]

/** Credit for `PlaceSearch`. */
export const PHOTON_SOURCE: DataSource = { what: 'Place search', from: 'Photon by Komoot', href: 'https://photon.komoot.io', license: 'OSM data, ODbL' }
