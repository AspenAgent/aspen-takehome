import type { PullQuoteBlockSchema } from "@/lib/agent/schemas";
import type { z } from "zod";

type Props = z.infer<typeof PullQuoteBlockSchema>;

export function PullQuote({ text, attribution }: Props) {
  return (
    <blockquote
      style={{
        margin: "0.35in 0",
        padding: "0.2in 0 0.2in 0.32in",
        borderLeft: "2px solid var(--palette-accent-primary)",
        maxWidth: "5.6in",
      }}
    >
      <div
        className="display-md"
        style={{
          fontStyle: "italic",
          lineHeight: 1.35,
          color: "currentColor",
        }}
      >
        &ldquo;{text}&rdquo;
      </div>
      {attribution ? (
        <div
          className="eyebrow"
          style={{
            marginTop: "0.2in",
            color: "var(--palette-text-subtle)",
            letterSpacing: "0.2em",
          }}
        >
          &mdash; {attribution}
        </div>
      ) : null}
    </blockquote>
  );
}
