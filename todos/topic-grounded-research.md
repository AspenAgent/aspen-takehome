# Topic-grounded research

## Problem

Today's research planner writes queries scoped to the *client's* profile:
"capital gains rental property Texas 2025". That's the right shape for
personalization but it leaves the *topic* ungrounded — the drafter still
invents some statute names and numeric thresholds. Our prompt says "don't
invent numbers," but the model fights that rule without an authoritative
source to anchor on.

What we need: a second research pass that gets the advisor-requested topic
right. For "deferred sales trust", that means IRC §453 text, current DST
provider terms, and recent rulings. For "Roth conversion ladder", that
means SECURE Act 2.0 §107 and the current bracket schedule.

## Why not MVP

- Tavily is already wired and our findings are reasonable enough for the
  demo document. The drafter's conservative voice ("the long-term capital
  gains rate, currently in the 20% range") is safe if imprecise.
- A topic-grounded research pipeline needs source quality guardrails
  (IRS.gov > random blog) to not make things worse.
- Compliance review of AI-generated tax content is a real question, not a
  weekend extension.

## Sketch

Two new tools:
- `research_primary_source(topic, jurisdiction)` — searches IRS.gov,
  treasury.gov, state comptrollers, SEC EDGAR with allowlisted domains.
- `research_authoritative(topic)` — Anthropic web_search tool with a
  system prompt that prioritizes .gov and major-law-firm sources.

Phase 1 planner gets a second question: "what's the topic-level research
we need in addition to the personalization research?"

Phase 3 drafter's prompt is restructured: "For every numeric claim in the
final document, cite a source index. If no source supports the number,
replace the claim with a qualitative phrase."

## Existing seams that make it small

- Tool registry pattern already isolates the research-tool shape.
- `Finding[]` is already the drafter's input — we just pass a bigger set.
- `Section.sourceIndices` already exists on the schema; the drafter just
  needs to actually populate it.
- `generateObject`'s Zod output-shape forcing makes the citation
  requirement enforceable via `sourceIndices: z.array(...).min(1)`.
