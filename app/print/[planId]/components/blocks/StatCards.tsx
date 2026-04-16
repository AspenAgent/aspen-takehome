import type { StatCardsBlockSchema } from "@/lib/agent/schemas";
import type { z } from "zod";

type Props = z.infer<typeof StatCardsBlockSchema>;

export function StatCards({ cards }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cards.length}, 1fr)`,
        gap: "0.5in",
        padding: "0.35in 0",
      }}
    >
      {cards.map((card, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div
            className="display-lg"
            style={{
              color: "var(--palette-accent-primary)",
              whiteSpace: "nowrap",
              fontSize: cards.length >= 3 ? "32pt" : "38pt",
            }}
          >
            {card.value}
          </div>
          <div
            className="body-sm"
            style={{
              color: "currentColor",
              opacity: 0.72,
              maxWidth: "14rem",
              lineHeight: 1.45,
            }}
          >
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
