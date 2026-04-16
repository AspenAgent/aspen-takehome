import type { NumberedInsightsBlockSchema } from "@/lib/agent/schemas";
import type { z } from "zod";

type Props = z.infer<typeof NumberedInsightsBlockSchema>;

export function NumberedInsights({ rows }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "0.65in 1fr",
            gap: "0.3in",
            padding: "0.2in 0",
            borderTop:
              i === 0
                ? "1px solid color-mix(in srgb, currentColor 18%, transparent)"
                : "none",
            borderBottom:
              "1px solid color-mix(in srgb, currentColor 18%, transparent)",
          }}
        >
          <div
            className="display-md"
            style={{
              color: "var(--palette-accent-primary)",
              fontVariantNumeric: "tabular-nums",
              fontStyle: "italic",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
          <div>
            <div
              className="display-md"
              style={{ marginBottom: "0.35rem", color: "currentColor" }}
            >
              {row.title}
            </div>
            <div
              className="body-md"
              style={{ color: "currentColor", opacity: 0.82 }}
            >
              {row.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
