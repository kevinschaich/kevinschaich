import { BackgroundVideo } from '@/app/components/background-video'
import { Wordmark, WordmarkSprite } from '@/app/components/wordmark'

const DARKGRADE_LINKS = [
    { label: 'Visit darkgrade.com', href: 'https://darkgrade.com', primary: true },
    { label: 'Watch it in action', href: 'https://www.youtube.com/watch?v=tsNWxj-pmU4' },
    { label: 'Star on GitHub', href: 'https://github.com/darkgrade/darkgrade' },
    { label: 'Join the Discord', href: 'https://discord.gg/fbDbdJv9dX' },
    { label: 'Read the docs', href: 'https://darkgrade.com/docs/link' },
]

const PERSONAL_LINKS = [
    { label: 'Projects', href: '/projects' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kevinschaich/' },
    { label: 'X', href: 'https://x.com/kevinschaich' },
]

const LABEL = 'text-label tracking-meta text-ink-55 uppercase'

const BUTTON =
    'flex w-full items-center justify-center rounded-full px-8 py-[17px] text-label tracking-[.04em] transition-[background,border-color,color,box-shadow] duration-[350ms] hover:shadow-[0_0_26px_rgba(244,198,110,.16)]'
const BUTTON_SOLID = `${BUTTON} bg-ink text-obsidian hover:bg-gold`
const BUTTON_GHOST = `${BUTTON} panel border border-hair text-ink hover:border-gold hover:text-gold`

/** darkgrade.com's nav link: muted, warming to ink with a gold underline drawn in from the left. */
const TEXT_LINK =
    'relative text-label tracking-[.06em] text-ink-55 uppercase transition-[color,text-shadow] duration-300 hover:text-ink hover:[text-shadow:0_0_12px_rgba(244,198,110,.35)] ' +
    "after:absolute after:-bottom-[5px] after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-gold after:shadow-[0_0_9px_rgba(244,198,110,.55)] after:transition-transform after:duration-[450ms] after:ease-lamp after:content-[''] " +
    'hover:after:origin-left hover:after:scale-x-100'

export default function Home() {
    return (
        <>
            <WordmarkSprite />
            <BackgroundVideo />

            <main className="relative z-[2] flex min-h-dvh flex-col">
                <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-center px-4 py-[clamp(40px,7vh,80px)]">
                    <header className="flex flex-col items-center text-center">
                        <p className={`mb-12 ${LABEL}`}>I&rsquo;m building:</p>

                        <a href="https://darkgrade.com" aria-label="Darkgrade" className="block text-ink">
                            <Wordmark className="mark-glow block h-[15px] w-auto" />
                        </a>

                        <h1 className="mt-6 font-serif text-[clamp(2rem,8vw,2.75rem)] leading-[.94] font-normal tracking-[-.015em]">
                            Shoot more. Edit <span className="glow-hot tracking-normal italic">less.</span>
                        </h1>

                        <p className={`mt-3 ${LABEL}`}>
                            Local-first AI
                            <br />
                            for creative pros
                        </p>
                    </header>

                    <nav aria-label="Darkgrade" className="mt-9 flex w-full flex-col gap-[14px]">
                        {DARKGRADE_LINKS.map(({ label, href, primary }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener"
                                className={primary ? BUTTON_SOLID : BUTTON_GHOST}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>

                    <nav aria-label="Kevin Schaich elsewhere" className="mt-12 flex flex-wrap justify-center gap-x-7 gap-y-3">
                        {PERSONAL_LINKS.map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                {...(href.startsWith('/') ? {} : { target: '_blank', rel: 'noopener me' })}
                                className={TEXT_LINK}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>
                </div>
            </main>
        </>
    )
}
