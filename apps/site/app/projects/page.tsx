import { Dust } from "@/app/components/dust/dust";
import { getProjects } from "@/lib/projects";
import type { Metadata } from "next";

export const dynamic = "force-static";

const TITLE = "Projects | by kevinschaich";
const DESCRIPTION = "Open-source passion projects I've shipped";

/** This page's sheet number, in the same series as the landing page. */
const DOCUMENT_NUMBER = "KS-PR-002";

/** The small capitals of a slate, as darkgrade.com sets them. */
const SLATE = "font-mono text-[11px] leading-[22px] tracking-[.18em] uppercase";

/** The page's gutter, the same measure the rest of the family uses. */
const SHELL = "mx-auto w-[min(1560px,calc(100%-clamp(24px,6vw,128px)))]";

// Its own card and titles, so link previews don't fall back to the home page's
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/projects" },
  openGraph: {
    title: TITLE,
    siteName: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "https://kevinschaich.com/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@kevinschaich",
  },
};

/**
 * Every project as a tile cut to the shape of its own link preview card: the screenshot behind,
 * near-black fading off to the right, the name set large with the tagline under it and where it
 * lands in gold mono caps at the foot.
 */
export default async function Projects() {
  const projects = await getProjects();
  return (
    <>
      <Dust />

      <main className="relative z-[2] flex min-h-dvh flex-col">
        {/* The slate line, running the width of the page. */}
        <div
          className={`${SHELL} flex items-center justify-between gap-4 border-t border-hair pt-[10px] ${SLATE}`}
        >
          <span className="flex items-center gap-4">
            <span className="text-gold">Projects</span>
            <span className="text-ink-66 max-[700px]:hidden">
              Everything I&rsquo;ve shipped
            </span>
          </span>
          <span className="text-ink-52">{DOCUMENT_NUMBER}</span>
        </div>

        <div className={`${SHELL} flex-1 pb-[clamp(48px,9vh,96px)]`}>
          <header className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-end gap-x-[clamp(32px,6vw,110px)] gap-y-8 pt-[clamp(48px,11vh,120px)] max-[900px]:grid-cols-1">
            <h1 className="ml-[-.04em] font-serif text-[clamp(2.25rem,5.5vw,5rem)] leading-[.96] heading-weight tracking-[-.05em]">
              Open source, <span className="glow-hot italic">shipped.</span>
            </h1>
            <p className="max-w-[46ch] pb-[.6em] text-[clamp(1rem,1.15vw,1.1875rem)] leading-[1.6] text-ink-66">
              Passion projects I&rsquo;ve built and put out in the open. Most
              have a demo you can try; all of them have the code.
            </p>
          </header>

          <ul className="mt-[clamp(40px,8vh,88px)] grid grid-cols-2 gap-[clamp(16px,2vw,28px)] max-[900px]:grid-cols-1">
            {projects.map((project) => (
              <li key={project.slug}>
                <a
                  href={project.link ?? `/project/${project.slug}/`}
                  className="group relative flex aspect-[1200/630] flex-col justify-center overflow-hidden border border-hair bg-obsidian px-[clamp(22px,3.4vw,52px)] transition-colors duration-300 hover:border-[rgba(245,205,138,.5)]"
                >
                  {project.screenshot && (
                    <img
                      src={project.screenshot}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-[600ms] ease-lamp group-hover:scale-[1.02]"
                    />
                  )}
                  {project.screenshot && (
                    /* The card's own fade: near-black holding the left, falling away to the right. */
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.82) 38%, rgba(10,10,11,0.5) 62%, rgba(10,10,11,0.12) 86%, rgba(10,10,11,0) 100%)",
                      }}
                    />
                  )}

                  <div className="relative flex flex-col">
                    <h2 className="font-serif text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.1] heading-weight tracking-[-.045em] text-ink">
                      {project.name}
                    </h2>
                    <p className="mt-[.6em] max-w-[36ch] text-[clamp(.875rem,1.05vw,1.0625rem)] leading-[1.45] text-ink-55">
                      {project.tagline}
                    </p>
                    <span className="mt-[1.1em] font-mono text-[11px] tracking-[.18em] text-gold uppercase">
                      {project.link
                        ? (
                            new URL(project.link).host.replace(/^www\./, "") +
                            new URL(project.link).pathname
                          ).replace(/\/$/, "")
                        : `kevinschaich.com/project/${project.slug}`}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          {projects.length === 0 && (
            <p className="mt-10 text-ink-55">Nothing here yet.</p>
          )}
        </div>

        {/* darkgrade.com's bottom strip: the blurred panel, edge to edge */}
        <footer className="panel border-t border-hair">
          <div
            className={`${SHELL} flex items-center justify-between gap-5 py-[20px] font-mono text-[11px] tracking-[.06em] whitespace-nowrap text-ink-52`}
          >
            <a
              href="/"
              className="transition-colors duration-300 hover:text-gold"
            >
              © 2026 KEVIN SCHAICH
            </a>
            <a
              href="https://github.com/kevinschaich"
              target="_blank"
              rel="noopener me"
              className="transition-colors duration-300 hover:text-gold"
            >
              GITHUB
            </a>
            <span className="max-[640px]:hidden">DENVER, COLORADO</span>
          </div>
        </footer>
      </main>
    </>
  );
}
