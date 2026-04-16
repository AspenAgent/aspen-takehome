import type { ImageTag } from "@/lib/agent/schemas";
import { resolveImage } from "@/lib/imagery";

/**
 * Imagery block. If a real stock photo exists at /public/imagery/<tag>.jpg
 * (per manifest.json), render the <img>. Otherwise fall back to a tasteful
 * palette-keyed gradient with a subtle tag label so the document stays
 * beautiful even before real photos are dropped in.
 *
 * Future: a curated-imagery agent (see todos/curated-imagery-agent.md)
 * could pre-generate or select per-document imagery and write it to the
 * manifest programmatically.
 */
const TAG_LABEL: Record<ImageTag, string> = {
  retirement: "Quiet horizons",
  estate: "What endures",
  family: "Generations",
  tax: "The long table",
  growth: "Compounding",
  planning: "Room to think",
};

export async function ImagePlaceholder({
  tag,
  caption,
  aspect = "wide",
}: {
  tag: ImageTag;
  caption?: string;
  aspect?: "wide" | "square" | "tall";
}) {
  const ratio =
    aspect === "wide" ? "16 / 7" : aspect === "tall" ? "3 / 4" : "1 / 1";

  const resolved = await resolveImage(tag);

  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          aspectRatio: ratio,
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background: resolved
            ? undefined
            : `
            radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--palette-accent-primary) 25%, var(--palette-background-accent)) 0%, transparent 55%),
            radial-gradient(circle at 78% 72%, color-mix(in srgb, var(--palette-accent-secondary) 18%, transparent) 0%, transparent 50%),
            linear-gradient(135deg, var(--palette-background-accent) 0%, var(--palette-background-deep) 100%)
          `,
        }}
      >
        {resolved ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolved.src}
            alt={resolved.alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 6px)",
              }}
            />
            <span
              className="eyebrow"
              style={{
                position: "absolute",
                left: "1.25rem",
                bottom: "1rem",
                color:
                  "color-mix(in srgb, var(--palette-text-on-deep) 60%, transparent)",
              }}
            >
              {TAG_LABEL[tag]}
            </span>
          </>
        )}
      </div>
      {caption ? (
        <figcaption
          className="body-sm"
          style={{
            marginTop: "0.45rem",
            color: "var(--palette-text-subtle)",
            fontStyle: "italic",
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
