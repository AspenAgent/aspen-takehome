import type { ParagraphBlockSchema, HeadingBlockSchema } from "@/lib/agent/schemas";
import type { z } from "zod";

type ParaProps = z.infer<typeof ParagraphBlockSchema>;
type HeadingProps = z.infer<typeof HeadingBlockSchema>;

export function Paragraph({ text }: ParaProps) {
  return (
    <p
      className="body-lg"
      style={{
        margin: "0.12in 0",
        color: "currentColor",
        maxWidth: "6.2in",
      }}
    >
      {text}
    </p>
  );
}

export function Heading({ text, level }: HeadingProps) {
  const Tag = level === 2 ? "h2" : "h3";
  const className = level === 2 ? "display-md" : "display-md";
  return (
    <Tag
      className={className}
      style={{
        margin: level === 2 ? "0.15in 0 0.08in" : "0.12in 0 0.06in",
        color: "currentColor",
        fontStyle: level === 2 ? "italic" : "normal",
        opacity: level === 2 ? 0.9 : 1,
      }}
    >
      {text}
    </Tag>
  );
}
