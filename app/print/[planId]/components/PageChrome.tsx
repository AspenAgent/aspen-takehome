import type { Advisor } from "@/lib/agent/schemas";

/**
 * Top bar on every non-cover page: advisor firm mark on the left,
 * section kicker in the middle, page number on the right — same pattern
 * as the sample PDF.
 */
export function PageChrome({
  firm,
  kicker,
  pageNumber,
  totalPages,
}: {
  firm: Advisor["firm"];
  kicker?: string;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <div className="page-chrome">
      <span className="eyebrow">{firm}</span>
      {kicker ? (
        <span className="eyebrow">
          <span className="kicker-mark">&#9662;</span>
          {kicker}
        </span>
      ) : (
        <span />
      )}
      <span className="eyebrow">
        {String(pageNumber).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </span>
    </div>
  );
}
