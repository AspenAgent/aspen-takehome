import type { CalloutBlockSchema } from "@/lib/agent/schemas";
import type { z } from "zod";

type Props = z.infer<typeof CalloutBlockSchema>;

export function Callout({ label, body }: Props) {
  return (
    <div
      style={{
        background: "var(--palette-background-accent)",
        color: "var(--palette-text-on-deep)",
        padding: "0.38in 0.42in",
        margin: "0.3in 0",
        position: "relative",
        borderLeft: "3px solid var(--palette-accent-primary)",
      }}
    >
      <div
        className="eyebrow"
        style={{
          color: "var(--palette-accent-primary)",
          marginBottom: "0.15in",
          letterSpacing: "0.22em",
        }}
      >
        {label}
      </div>
      <div className="body-lg" style={{ color: "currentColor", lineHeight: 1.5 }}>
        {body}
      </div>
    </div>
  );
}
