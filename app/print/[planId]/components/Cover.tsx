import type { Advisor, DocumentPlan } from "@/lib/agent/schemas";
import { Monogram } from "./Monogram";

/**
 * Full-bleed cover page — atmospheric background, monogram top-left,
 * display title (with optional italic clause), subtitle, kicker paragraph.
 */
export function Cover({
  plan,
  advisor,
}: {
  plan: DocumentPlan;
  advisor: Advisor;
}) {
  const { cover } = plan;
  return (
    <section
      className="letter-page tone-deep"
      style={{ position: "relative", padding: 0 }}
    >
      {/* Background atmospheric layer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 30% 110%, color-mix(in srgb, var(--palette-accent-primary) 20%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 10%, color-mix(in srgb, var(--palette-background-accent) 80%, transparent) 0%, transparent 45%),
            linear-gradient(180deg, var(--palette-background-deep) 0%, color-mix(in srgb, var(--palette-background-accent) 60%, var(--palette-background-deep)) 100%)
          `,
        }}
      />
      {/* Faint texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0 1px, transparent 1px 5px)",
        }}
      />

      {/* Top chrome: firm eyebrow left, monogram right */}
      <div
        style={{
          position: "absolute",
          top: "0.6in",
          left: "0.75in",
          right: "0.75in",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          className="eyebrow"
          style={{ color: "var(--palette-accent-primary)" }}
        >
          <span style={{ marginRight: "0.4em" }}>&#9662;</span>
          {advisor.firm}
        </span>
        <Monogram advisor={advisor} size={56} variant="onDeep" />
      </div>

      {/* Main title block — offset to lower-middle for editorial feel */}
      <div
        style={{
          position: "absolute",
          left: "0.75in",
          right: "0.75in",
          bottom: "1.85in",
          maxWidth: "6.5in",
        }}
      >
        <div
          className="display-xl"
          style={{
            color: "var(--palette-text-on-deep)",
            marginBottom: "0.35in",
          }}
        >
          {cover.title}
          {cover.titleItalicPart ? (
            <>
              <br />
              <span className="display-italic">{cover.titleItalicPart}</span>
            </>
          ) : null}
        </div>

        <hr
          className="accent-rule"
          style={{ width: "1.4in", marginBottom: "0.28in", opacity: 0.9 }}
        />

        <div
          className="body-lg"
          style={{
            color: "var(--palette-text-on-deep)",
            opacity: 0.85,
            fontStyle: "italic",
            maxWidth: "5.5in",
            marginBottom: "0.3in",
          }}
        >
          {cover.subtitle}
        </div>

        <div
          className="body-md"
          style={{
            color: "var(--palette-text-on-deep)",
            opacity: 0.7,
            maxWidth: "5.2in",
          }}
        >
          {cover.kicker}
        </div>
      </div>

      {/* Bottom rule */}
      <div
        style={{
          position: "absolute",
          bottom: "0.55in",
          left: "0.75in",
          right: "0.75in",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--palette-text-on-deep)",
          opacity: 0.6,
        }}
      >
        <span className="eyebrow">
          A Personalized Guide by {advisor.firm}
        </span>
        <span className="eyebrow">{advisor.email}</span>
      </div>
    </section>
  );
}
