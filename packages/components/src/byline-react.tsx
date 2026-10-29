import { bylineLinks } from './byline'

/**
 * "by kevinschaich · code on github · all projects". `repo` is the current project's `owner/name`; without it
 * the GitHub link is left out. Pair with `@kevinschaich/components/styles.css`.
 */
export function Byline({ repo, newTab = true, className = '' }: { repo?: string | null; newTab?: boolean; className?: string }) {
    return (
        <span className={`ks-byline ${className}`.trim()}>
            {bylineLinks(repo).map(({ href, text }, i) => (
                <span key={href}>
                    {i > 0 && ' · '}
                    <a href={href} {...(newTab ? { target: '_blank', rel: 'noopener' } : {})}>
                        {text}
                    </a>
                </span>
            ))}
        </span>
    )
}
