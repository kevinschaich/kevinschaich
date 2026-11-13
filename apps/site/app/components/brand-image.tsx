import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { getProject, type Project } from "@/lib/projects";
import { faces, googleFont } from "@/lib/typeset";

const MEDIA_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

/**
 * Satori will not take a relative source, so a picture served out of `public` is read off disk and
 * inlined. Anything already absolute is left as it is.
 */
async function inlineLocalPicture(
  source: string | undefined,
): Promise<string | undefined> {
  if (!source || !source.startsWith("/")) return source;
  const type = MEDIA_TYPES[extname(source).toLowerCase()];
  if (!type) return undefined;
  const bytes = await readFile(join(process.cwd(), "public", source)).catch(
    () => null,
  );
  return bytes ? `data:${type};base64,${bytes.toString("base64")}` : undefined;
}

type Size = { width: number; height: number };

/** Shared handler for /og/<slug>.png and /icon/<slug>.png, set in the project's typeset faces.
    `variants` maps a filename suffix (e.g. `-180` for /icon/<slug>-180.png) to another size. */
export function brandImageRoute(
  render: (p: Project, size: Size) => React.ReactElement,
  size: Size,
  variants: Record<string, Size> = {},
) {
  return async (
    _: Request,
    { params }: { params: Promise<{ file: string }> },
  ) => {
    let slug = (await params).file.replace(/\.png$/, "");
    const suffix = Object.keys(variants).find((s) => slug.endsWith(s));
    if (suffix) slug = slug.slice(0, -suffix.length);
    const dims = suffix ? variants[suffix] : size;
    const found = await getProject(slug);
    if (!found) return new Response("Not found", { status: 404 });
    const project = {
      ...found,
      screenshot: await inlineLocalPicture(found.screenshot),
    };
    return new ImageResponse(render(project, dims), {
      ...dims,
      fonts: await cardFonts(project.typeset),
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  };
}

/** The three faces the shared OG card asks for, named as it expects: body, heading and the mono address line. */
export async function cardFonts(typeset: Project["typeset"] = {}) {
  const { body, heading, mono } = faces(typeset);
  return Promise.all([
    googleFont(body, 400).then((data) => ({
      name: "body",
      data,
      weight: 400 as const,
    })),
    googleFont(heading, 600).then((data) => ({
      name: "heading",
      data,
      weight: 600 as const,
    })),
    googleFont(heading, 500).then((data) => ({
      name: "heading",
      data,
      weight: 500 as const,
    })),
    googleFont(mono, 400).then((data) => ({
      name: "mono",
      data,
      weight: 400 as const,
    })),
  ]);
}
