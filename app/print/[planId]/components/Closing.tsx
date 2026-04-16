import type { Advisor, DocumentPlan } from "@/lib/agent/schemas";
import { Monogram } from "./Monogram";
import { PageChrome } from "./PageChrome";

/**
 * Closing page — CTA frame, advisor contact block, disclosure.
 * Uses deep background to echo the cover (book-ends).
 */
export function Closing({
  plan,
  advisor,
  pageNumber,
  totalPages,
}: {
  plan: DocumentPlan;
  advisor: Advisor;
  pageNumber: number;
  totalPages: number;
}) {
  const c = plan.closing;
  return (
    <section
      className="letter-page tone-deep"
      style={{ position: "relative" }}
    >
      <PageChrome
        firm={advisor.firm}
        kicker="NEXT STEP"
        pageNumber={pageNumber}
        totalPages={totalPages}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 50% 120%, color-mix(in srgb, var(--palette-accent-primary) 15%, transparent) 0%, transparent 55%)
          `,
          pointerEvents: "none",
        }}
      />

      <div
        className="page-body"
        style={{
          position: "relative",
          zIndex: 1,
          alignItems: "center",
          textAlign: "center",
          bottom: "1.2in",
        }}
      >
        <Monogram advisor={advisor} size={56} variant="onDeep" />

        <h1
          className="display-xl"
          style={{
            color: "var(--palette-text-on-deep)",
            marginTop: "0.25in",
            marginBottom: "0.08in",
          }}
        >
          {c.title}
        </h1>
        {c.titleItalicPart ? (
          <div
            className="display-lg display-italic"
            style={{
              color: "var(--palette-text-on-deep)",
              maxWidth: "6.2in",
              marginBottom: "0.05in",
              lineHeight: 1.15,
            }}
          >
            {c.titleItalicPart}
          </div>
        ) : null}

        <hr
          className="accent-rule"
          style={{
            width: "1.4in",
            margin: "0.2in 0",
            opacity: 0.9,
          }}
        />

        <div
          className="body-md"
          style={{
            color: "var(--palette-text-on-deep)",
            opacity: 0.82,
            fontStyle: "italic",
            maxWidth: "4.8in",
            marginBottom: "0.28in",
          }}
        >
          {c.subtitle}
        </div>

        {/* CTA box */}
        <div
          style={{
            border: "1px solid var(--palette-accent-primary)",
            padding: "0.35in 0.5in",
            maxWidth: "5.6in",
            marginBottom: "0.28in",
            textAlign: "left",
            background:
              "color-mix(in srgb, var(--palette-background-accent) 70%, transparent)",
          }}
        >
          <div
            className="display-md"
            style={{
              color: "var(--palette-accent-primary)",
              marginBottom: "0.18in",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {c.ctaBoxTitle}
          </div>
          <div
            className="body-md"
            style={{
              color: "var(--palette-text-on-deep)",
              opacity: 0.88,
              marginBottom: "0.22in",
            }}
          >
            {c.ctaBoxBody}
          </div>
          <ul
            className="body-sm"
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              color: "var(--palette-text-on-deep)",
              opacity: 0.82,
              display: "flex",
              flexDirection: "column",
              gap: "0.08in",
            }}
          >
            {c.ctaBulletPoints.map((pt, i) => (
              <li key={i} style={{ display: "flex", gap: "0.5em" }}>
                <span style={{ color: "var(--palette-accent-primary)" }}>&mdash;</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="eyebrow"
          style={{
            color: "var(--palette-accent-primary)",
            marginBottom: "0.1in",
          }}
        >
          {c.scheduleLabel}
        </div>

        <div
          className="display-md"
          style={{
            color: "var(--palette-text-on-deep)",
            marginBottom: "0.04in",
          }}
        >
          {advisor.phone}
        </div>
        <div
          className="body-md"
          style={{
            color: "var(--palette-text-on-deep)",
            opacity: 0.8,
          }}
        >
          {advisor.email}
        </div>
      </div>

      {/* Disclosure — small, pinned near bottom, outside flex-flow */}
      <div
        className="body-sm"
        style={{
          position: "absolute",
          bottom: "0.55in",
          left: "0.9in",
          right: "0.9in",
          color: "var(--palette-text-on-deep)",
          opacity: 0.5,
          fontSize: "7pt",
          lineHeight: 1.5,
          textAlign: "center",
          fontStyle: "italic",
          zIndex: 2,
        }}
      >
        {advisor.disclosure}
      </div>
    </section>
  );
}
