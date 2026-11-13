import { Dust } from "@/app/components/dust/dust";
import { Lockup, WordmarkSprite } from "@/app/components/wordmark";

/** This page's sheet number, in its own series. */
const DOCUMENT_NUMBER = "KS-LP-001";

/** The small capitals of a slate, as darkgrade.com sets them. */
const SLATE = "font-mono text-[11px] leading-[22px] tracking-[.18em] uppercase";

/** Where this page sends you: the label, and where it lands. */
const DARKGRADE_LINKS = [
  { label: "The site", detail: "darkgrade.com", href: "https://darkgrade.com" },
  {
    label: "Watch it in action",
    detail: "YouTube",
    href: "https://www.youtube.com/watch?v=tsNWxj-pmU4",
  },
  {
    label: "Read the code",
    detail: "GitHub",
    href: "https://github.com/darkgrade/darkgrade",
  },
  {
    label: "Talk to us",
    detail: "Discord",
    href: "https://discord.gg/fbDbdJv9dX",
  },
];

const PERSONAL_LINKS = [
  { label: "Everything I've built", detail: "Projects", href: "/projects" },
  {
    label: "Kevin on LinkedIn",
    detail: "LinkedIn",
    href: "https://www.linkedin.com/in/kevinschaich/",
  },
  { label: "Kevin on X", detail: "X", href: "https://x.com/kevinschaich" },
];

const ROW =
  "group flex items-baseline justify-between gap-5 border-b border-hair py-[15px] text-[1.0625rem] transition-colors duration-300 hover:text-gold";
const ROW_DETAIL =
  "font-mono text-[11px] tracking-[.18em] text-ink-52 uppercase transition-colors duration-300 group-hover:text-gold";

export default function Home() {
  return (
    <>
      <WordmarkSprite />
      <Dust />

      <main className="relative z-[2] flex min-h-dvh flex-col">
        {/* The slate line, running the width of the page rather than sitting in the column. */}
        <div
          className={`mx-auto flex w-[min(1560px,calc(100%-clamp(24px,6vw,128px)))] items-center justify-between gap-4 border-t border-hair pt-[10px] ${SLATE}`}
        >
          <span className="text-gold">kevinschaich.com</span>
          <span className="text-ink-52">{DOCUMENT_NUMBER}</span>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-5 pt-[clamp(24px,5vh,48px)] pb-[clamp(32px,6vh,64px)]">
          <header className="flex flex-col items-center text-center">
            <p className={`${SLATE} text-ink-55`}>I&rsquo;m building</p>

            <a
              href="https://darkgrade.com"
              aria-label="Darkgrade"
              className="mt-5 block text-ink"
            >
              <Lockup className="mark-glow text-[21px]" />
            </a>

            <h1 className="mt-7 font-serif text-[clamp(2rem,8vw,2.75rem)] leading-[.96] heading-weight tracking-[-.045em]">
              Shoot more. Edit <span className="glow-hot italic">less.</span>
            </h1>
          </header>

          <nav
            aria-label="Darkgrade"
            className="mt-[clamp(32px,6vh,56px)] border-t border-hair"
          >
            <ul>
              {DARKGRADE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener"
                    className={ROW}
                  >
                    <span>{link.label}</span>
                    <span className={ROW_DETAIL}>{link.detail}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Kevin Schaich" className="mt-[clamp(28px,5vh,44px)]">
            <h2
              className={`${SLATE} border-t border-hair pt-[10px] text-ink-66`}
            >
              <span className="mr-4 text-gold">Elsewhere</span>
              Kevin Schaich
            </h2>
            <ul className="mt-2">
              {PERSONAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener me" }
                      : {})}
                    className={ROW}
                  >
                    <span>{link.label}</span>
                    <span className={ROW_DETAIL}>{link.detail}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* darkgrade.com's bottom strip: the blurred panel, edge to edge */}
        <footer className="panel border-t border-hair">
          <div className="mx-auto flex w-[min(1560px,calc(100%-clamp(24px,6vw,128px)))] items-center justify-between gap-5 py-[20px] font-mono text-[11px] tracking-[.06em] whitespace-nowrap text-ink-52">
            <span>© 2026 KEVIN SCHAICH</span>
            <span className="max-[640px]:hidden">DENVER, COLORADO</span>
          </div>
        </footer>
      </main>
    </>
  );
}
