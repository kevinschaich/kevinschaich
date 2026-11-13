// The one OpenGraph card, for both brands: Darkgrade's sites and benches, kevinschaich.com and every project.
// Rendered with Satori (`next/og`, `@vercel/og`), so it only uses what Satori understands: flex layout, no classes.

import type { Mark } from "./marks";

/** Darkgrade's palette, which both brands' cards use. */
export const CARD_COLORS = {
  /** near-black */
  background: "#0a0a0b",
  gold: "#f5cd8a",
  bone: "#eae6dc",
  mutedBone: "rgba(234,230,220,0.55)",
  hairline: "rgba(234,230,220,0.13)",
};

export const CARD_SIZE = { width: 1200, height: 630 };

const NAME = 38;
const MAIN = 76;
const SUB = 32;
const ADDRESS = 22;

export type OgCardProps = {
  /** An image URL or data URI filling the card behind the words. Pass the flowy backdrop for a brand card, or a
        screenshot of the app for a project. Without one the card is plain near-black. */
  background?: string;
  /** The mark, drawn bare — no tile, no border, nothing behind it — beside the brand name. */
  logo: { mark: string | Mark; name: string };
  /** The big line: a bench name, a project name, a page name. */
  main: string;
  /** One line under it. */
  sub?: string;
  /** The address line at the bottom, in mono caps: `darkgrade.com/toolbench`, `kevinschaich.com`. */
  address?: string;
  /** Satori font names, as registered with the ImageResponse. */
  fonts?: { body?: string; heading?: string; mono?: string };
};

/**
 * Logo, headline, description, address — left-aligned, the block centred in the card's height. 1200x630.
 */
export function OgCard({
  background,
  logo,
  main,
  sub,
  address,
  fonts,
}: OgCardProps) {
  const body = fonts?.body ?? "body";
  const heading = fonts?.heading ?? "heading";
  const mono = fonts?.mono ?? "mono";
  const mark =
    typeof logo.mark === "string"
      ? { src: logo.mark, aspect: 80 / 56 }
      : logo.mark;
  // A touch taller than the name's capitals, so the mark reads as part of the wordmark rather than an icon.
  const markHeight = Math.round(NAME * 0.82);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 88px",
        backgroundColor: CARD_COLORS.background,
        fontFamily: body,
        color: CARD_COLORS.bone,
      }}
    >
      {background && (
        <img
          src={background}
          alt=""
          width={CARD_SIZE.width}
          height={CARD_SIZE.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CARD_SIZE.width,
            height: CARD_SIZE.height,
            objectFit: "cover",
          }}
        />
      )}
      {background && (
        // Near-black fading out to the right, so the words stay readable over anything.
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CARD_SIZE.width,
            height: CARD_SIZE.height,
            backgroundImage:
              "linear-gradient(90deg, rgba(10,10,11,0.97) 0%, rgba(10,10,11,0.94) 42%, rgba(10,10,11,0.72) 62%, rgba(10,10,11,0.2) 84%, rgba(10,10,11,0.05) 100%)",
          }}
        />
      )}

      {/* The backdrop and its fade are positioned; these words are not, and some renderers paint a
                positioned sibling over a static one whatever the order. Relative puts them above it explicitly. */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <img
            src={mark.src}
            width={Math.round(markHeight * mark.aspect)}
            height={markHeight}
            alt=""
          />
          <div
            style={{
              marginLeft: 18,
              fontFamily: heading,
              fontSize: NAME,
              fontWeight: 500,
              letterSpacing: NAME * -0.035,
              lineHeight: 1,
              color: CARD_COLORS.bone,
            }}
          >
            {logo.name}
          </div>
        </div>

        <div
          style={{
            marginTop: 54,
            fontFamily: heading,
            fontSize: MAIN,
            fontWeight: 600,
            letterSpacing: MAIN * -0.045,
            lineHeight: 1.15,
            flexShrink: 0,
            ...(background ? { maxWidth: 720 } : {}),
          }}
        >
          {main}
        </div>

        {sub && (
          <div
            style={{
              marginTop: 22,
              fontSize: SUB,
              lineHeight: 1.4,
              color: CARD_COLORS.mutedBone,
              flexShrink: 0,
              maxWidth: background ? 640 : 840,
            }}
          >
            {sub}
          </div>
        )}

        {address && (
          <div
            style={{
              marginTop: 40,
              fontFamily: mono,
              fontSize: ADDRESS,
              letterSpacing: ADDRESS * 0.16,
              textTransform: "uppercase",
              color: CARD_COLORS.gold,
              flexShrink: 0,
            }}
          >
            {address}
          </div>
        )}
      </div>
    </div>
  );
}
