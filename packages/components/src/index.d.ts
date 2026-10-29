export declare const SITE_URL: string
export declare const PROJECTS_URL: string
/** `owner/name` or a full URL → the GitHub URL; null when no repo is given. */
export declare function repoURL(repo?: string | null): string | null
export declare function bylineLinks(repo?: string | null): { href: string; text: string }[]
export declare function bylineHTML(repo?: string | null, options?: { newTab?: boolean }): string
export declare function projectTitle(name: string): string
export declare function ogImageURL(slug: string): string
export declare function iconURL(slug: string): string
/** "by kevinschaich · code on github · all projects"; pass the current project\x27s repo. */
export declare function Byline(props: { repo?: string | null; newTab?: boolean; className?: string }): import("react").ReactElement
