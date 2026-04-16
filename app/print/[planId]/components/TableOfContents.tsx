import type { Advisor, DocumentPlan } from "@/lib/agent/schemas";
import { PageChrome } from "./PageChrome";

export function TableOfContents({
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
  const entries = plan.sections.map((s, i) => ({
    number: String(i + 1).padStart(2, "0"),
    title: s.title,
    subtitle: s.blocks
      .find((b) => b.type === "paragraph")
      ?.type === "paragraph"
      ? ""
      : "",
    pageRef: pageNumber + 1 + i, // approximate
  }));

  return (
    <section className="letter-page tone-surface">
      <PageChrome
        firm={advisor.firm}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />

      <div className="page-body">
        <span
          className="eyebrow"
          style={{
            color: "var(--palette-text-subtle)",
            marginBottom: "0.18in",
          }}
        >
          Contents
        </span>
        <h1
          className="display-xl"
          style={{
            marginBottom: "0.1in",
            color: "var(--palette-text-on-surface)",
          }}
        >
          What&rsquo;s Inside
        </h1>
        <div
          className="body-lg"
          style={{
            color: "var(--palette-text-subtle)",
            fontStyle: "italic",
            marginBottom: "0.5in",
          }}
        >
          A guided walk through the decision in front of you.
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {entries.map((e) => (
            <div
              key={e.number}
              style={{
                display: "grid",
                gridTemplateColumns: "0.7in 1fr auto",
                gap: "0.3in",
                alignItems: "baseline",
                padding: "0.18in 0",
                borderBottom:
                  "1px solid color-mix(in srgb, var(--palette-text-on-surface) 12%, transparent)",
              }}
            >
              <div
                className="display-lg"
                style={{
                  color: "var(--palette-accent-primary)",
                  fontStyle: "italic",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {e.number}
              </div>
              <div className="display-md" style={{ color: "currentColor" }}>
                {e.title}
              </div>
              <div
                className="body-md"
                style={{
                  color: "var(--palette-text-subtle)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {e.pageRef}
              </div>
            </div>
          ))}
        </div>

        {plan.tableOfContents?.quote ? (
          <div
            className="body-md"
            style={{
              marginTop: "0.6in",
              padding: "0.3in 0.35in",
              background:
                "color-mix(in srgb, var(--palette-accent-primary) 12%, transparent)",
              borderLeft: "2px solid var(--palette-accent-primary)",
              fontStyle: "italic",
              maxWidth: "5.6in",
              alignSelf: "flex-start",
              color: "var(--palette-text-on-surface)",
            }}
          >
            {plan.tableOfContents.quote}
          </div>
        ) : null}
      </div>
    </section>
  );
}
