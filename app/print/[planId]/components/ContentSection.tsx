import type { Advisor, Section } from "@/lib/agent/schemas";
import { BlockRenderer } from "./blocks";
import { PageChrome } from "./PageChrome";

/**
 * A single content page: page chrome, display title, optional italic clause,
 * accent rule, stacked blocks.
 */
export function ContentSection({
  section,
  advisor,
  pageNumber,
  totalPages,
}: {
  section: Section;
  advisor: Advisor;
  pageNumber: number;
  totalPages: number;
}) {
  const tone = section.backgroundTone ?? "surface";
  return (
    <section className={`letter-page tone-${tone}`}>
      <PageChrome
        firm={advisor.firm}
        kicker={section.kicker}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />

      <div className="page-body">
        <h1
          className="display-lg"
          style={{
            color: "currentColor",
            marginBottom: "0.08in",
          }}
        >
          {section.title}
        </h1>
        <hr
          className="accent-rule"
          style={{ width: "1.2in", marginBottom: "0.25in", opacity: 0.8 }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.02in" }}>
          {section.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>
      </div>
    </section>
  );
}
