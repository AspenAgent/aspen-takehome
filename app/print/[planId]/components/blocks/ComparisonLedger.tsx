import type { ComparisonLedgerBlockSchema } from "@/lib/agent/schemas";
import type { z } from "zod";

type Props = z.infer<typeof ComparisonLedgerBlockSchema>;

const highlightColor = {
  positive: "var(--palette-accent-secondary)",
  negative: "var(--palette-accent-danger)",
  neutral: "currentColor",
} as const;

export function ComparisonLedger({ columns, rows, footnote }: Props) {
  // columns[0] is the label column header; columns[1..] are value columns
  return (
    <div style={{ padding: "0.25in 0" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-body-stack)",
        }}
      >
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="eyebrow"
                style={{
                  textAlign: i === 0 ? "left" : "right",
                  padding: "0.18in 0.1in",
                  color: "currentColor",
                  opacity: 0.55,
                  borderBottom:
                    "1px solid color-mix(in srgb, currentColor 22%, transparent)",
                  fontWeight: 600,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => {
            const h = row.highlight ?? "neutral";
            const last = rIdx === rows.length - 1;
            return (
              <tr key={rIdx}>
                <td
                  className="body-md"
                  style={{
                    padding: "0.18in 0.1in",
                    fontWeight: last ? 600 : 400,
                    borderBottom: last
                      ? "none"
                      : "1px solid color-mix(in srgb, currentColor 10%, transparent)",
                  }}
                >
                  {row.label}
                </td>
                {row.values.map((v, cIdx) => {
                  const isLastCol = cIdx === row.values.length - 1;
                  return (
                    <td
                      key={cIdx}
                      className={last ? "display-md" : "body-md"}
                      style={{
                        padding: "0.18in 0.1in",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: last || isLastCol ? 600 : 400,
                        color:
                          last && isLastCol
                            ? highlightColor[h]
                            : "currentColor",
                        borderBottom: last
                          ? "none"
                          : "1px solid color-mix(in srgb, currentColor 10%, transparent)",
                      }}
                    >
                      {v}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {footnote ? (
        <div
          className="body-sm"
          style={{
            marginTop: "0.2in",
            color: "var(--palette-text-subtle)",
            fontStyle: "italic",
            maxWidth: "5.5in",
          }}
        >
          {footnote}
        </div>
      ) : null}
    </div>
  );
}
