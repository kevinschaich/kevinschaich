import { OgCard } from "@kevinschaich/components/og";
import { brandImageRoute } from "@/app/components/brand-image";
import { getProjects } from "@/lib/projects";

/** Every project's card, in the one shared layout: the project's name and tagline over a screenshot of the app in
 *  use when the project has one. No mark — the address at the foot says whose it is. */
/** Where the project actually lives, as its tile on /projects names it: its own host and path for a
 *  project that has one, this site otherwise. */
const addressOf = (link: string | undefined, slug: string) => {
  if (!link) return `kevinschaich.com/project/${slug}`;
  const url = new URL(link);
  return (url.host.replace(/^www\./, "") + url.pathname).replace(/\/$/, "");
};

export const GET = brandImageRoute(
  ({ name, tagline, screenshot, link, slug }) => (
    <OgCard
      main={name}
      sub={tagline}
      address={addressOf(link, slug)}
      background={screenshot}
    />
  ),
  { width: 1200, height: 630 },
);
export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = async () =>
  (await getProjects()).map((p) => ({ file: `${p.slug}.png` }));
