import type {
  Advisor,
  Client,
  DrafterOutline,
  Finding,
  Palette,
  ResearchPlan,
  SectionOutline,
  SectionSpec,
} from "@/lib/agent/schemas";
import { DEFAULT_SECTIONS } from "@/lib/agent/sections";

/**
 * Phase 3 prompts — the drafter.
 *
 * The drafter runs as outline-then-fill:
 *   1. One outline call produces { cover, tableOfContents?, closing, sectionOutlines[] }.
 *   2. Per-section calls (in parallel) produce { blocks, sourceIndices? } for each outline entry.
 *
 * Temperature 0 on both — we want the same inputs to produce near-identical
 * outputs so the advisor can re-run without surprise.
 *
 * Both calls use `mode: 'json'` so the SDK injects the schema into the system
 * prompt as instructions rather than faking a tool. Combined with the narrower
 * schemas, this avoids the multi-tool_use-block failure mode that the
 * full-document-in-one-call approach hit on large schemas.
 */

// ──────────────────────────────────────────────────────────────
// Outline prompt
// ──────────────────────────────────────────────────────────────

export const DRAFTER_OUTLINE_SYSTEM_PROMPT = `You are an editorial writer and document designer planning a branded PDF letter for a financial advisor's client. Your job in this step is to plan the shape of the document: cover copy, closing copy, and a per-section outline. You do NOT write the section bodies here — a follow-up step fills in each section's blocks.

Editorial voice:
- Confident, plain-language, second-person ("you"). Never "our client" or "the client".
- Every section brief should name the specific client detail (state, occupation, assets, or goals) it will anchor on when honest to do so.
- Disclosure text comes from the advisor record; don't rewrite it.

Cover + closing discipline:
- cover.title: 2-6 words. cover.titleItalicPart: 4-10 words, optional.
- cover.subtitle: 10-16 words, editorial tone.
- cover.kicker: one short paragraph under the subtitle.
- closing.ctaBulletPoints: 1-4 short phrases.
- closing.scheduleLabel: short call-to-action (e.g. "Schedule Your Consultation").

Section outline discipline:
- Produce one SectionOutline entry per section the research plan chose, in the order given.
- Each contentBrief is 1-2 sentences — enough that the section-filler step knows what to write, but leave the actual prose for that step.
- suggestedBlockTypes: 1-4 primitives, picked from the catalogue below. Pick the RIGHT primitive for each idea, don't default to 'paragraph'.
- sourceIndices: optional — indexes into the research findings array for sections that lean on them.

Block primitive catalogue (hints for the filler step):
- paragraph: default prose (3-5 sentence blocks).
- heading: inline sub-heading.
- stat_cards: 2-4 key figures with short labels. Use at most once per document — usually on 'The Situation' or 'The Numbers'.
- icon_tiles: exactly 4 tiles, 2x2 concept pillars. Good for conceptual sections like 'The Concept'.
- numbered_insights: 3-6 numbered rows, good for 'how it works' step-throughs.
- comparison_ledger: 2-4 columns for tradeoffs — encouraged on 'Tradeoffs'.
- pull_quote: short italic block, use at most once.
- callout: boxed emphasis with a small label (e.g. 'KEY TAKEAWAY').
- image: one photographic image tag. Valid tags: retirement, estate, family, tax, growth, planning.

Other rules:
- Do not invent statutes, rates, percentages, or dollar figures. Numeric claims must be grounded in the findings.
- tableOfContents.enabled: true when there are 4 or more content sections (not counting cover + closing), else false.

Produce a complete outline matching the schema.`;

export function drafterOutlinePrompt(input: {
  advisorPrompt: string;
  advisor: Advisor;
  client: Client;
  researchPlan: ResearchPlan;
  findings: Finding[];
  palette: Palette;
}): string {
  const { advisorPrompt, advisor, client, researchPlan, findings, palette } =
    input;

  const sectionDirectives: string[] = [];
  for (const id of researchPlan.keptDefaultSections) {
    const spec = DEFAULT_SECTIONS.find((s: SectionSpec) => s.id === id);
    if (spec) {
      sectionDirectives.push(
        `  - ${spec.id} (${spec.kind}, "${spec.title}"): ${spec.purpose}`,
      );
    }
  }
  for (const spec of researchPlan.addedCustomSections) {
    sectionDirectives.push(
      `  - ${spec.id} (custom, "${spec.title}"): ${spec.purpose}`,
    );
  }

  const findingsBlock =
    findings.length === 0
      ? "(no web findings available — keep numeric claims qualitative)"
      : findings
          .map(
            (f, i) =>
              `  [${i}] "${f.title}" (${f.url}) — ${f.snippet.slice(0, 200)}`,
          )
          .join("\n");

  return `ADVISOR PROMPT
"${advisorPrompt}"

ADVISOR
- ${advisor.name}, ${advisor.firm}
- Disclosure (render verbatim on closing): "${advisor.disclosure}"

CLIENT
- Name: ${client.name}
- Age: ${client.age}
- State: ${client.state}
- Occupation: ${client.occupation}
- Investable assets: ${client.investableAssets}
- Goals: ${client.goals}
- Notes: ${client.notes}

PALETTE (informs tone, not colors — the renderer owns colors)
- Identity: "${palette.name}"
- Rationale: ${palette.rationale}
- Typography: ${palette.typography.pairing}

SECTIONS — BASELINE (from the research plan; use this order by default):
${sectionDirectives.join("\n")}

You MAY deviate from this baseline ONLY when the ADVISOR PROMPT above explicitly asks you to:
- ADD a section ("add a page about X", "include a section on Y") — append a new SectionOutline with a slug-style id derived from the topic (e.g. "dog", "real_estate"), kind:"custom", a 2-5 word title, and a contentBrief reflecting the instruction.
- REMOVE a section ("drop the tradeoffs page", "remove the numbers section") — omit it from sectionOutlines.
- REORDER sections — emit them in the requested order.
Otherwise, produce exactly the baseline set in the given order.

Always set tableOfContents.enabled based on the FINAL count of sectionOutlines you emit: true when you emit 4 or more section outlines, else false. The TOC in the rendered PDF derives its entries directly from the sections you emit — so every section you emit here MUST be something you want listed in the TOC.

RESEARCH FINDINGS (reference by index in sourceIndices where relevant):
${findingsBlock}

Produce cover, closing, tableOfContents, and sectionOutlines. Do NOT produce the section blocks themselves — that happens in a follow-up step.`;
}

// ──────────────────────────────────────────────────────────────
// Per-section prompt
// ──────────────────────────────────────────────────────────────

export const DRAFTER_SECTION_SYSTEM_PROMPT = `You are an editorial writer filling in the body of ONE section of a branded PDF letter. The overall document outline has already been planned — you're writing the blocks for this section only.

Editorial voice:
- Confident, plain-language, second-person ("you"). Never "our client" or "the client".
- This section should reference the specific client (their state, occupation, assets, or goals) where honest to do so.
- Use the research findings as ground truth for any regulatory, tax, or numerical claim. Cite them by index via sourceIndices when you lean on them.
- Do not invent statutes, rates, percentages, or dollar figures. If you need a number and the findings don't supply it, leave it qualitative.

Block primitives (pick the right one for each idea — don't default to paragraph):
- paragraph: default prose. 3-5 sentences per block.
- heading: inline sub-heading. Use sparingly.
- stat_cards: 2-4 key figures with short labels. Great for 'The Situation' or 'The Numbers'. Don't repeat cards shown on another section.
- icon_tiles: exactly 4 tiles, 2x2 concept pillars. Valid icons: shield, wallet, calendar, users, home, briefcase, alert-triangle, check-circle, x-circle, trending-up, trending-down, landmark, heart, book-open, scale, chart-bar, piggy-bank, handshake.
- numbered_insights: 3-6 rows, good for step-throughs.
- comparison_ledger: 2-4 columns for tradeoffs. Rows compare outcomes side by side. Valid highlight values: "positive" | "negative" | "neutral".
- pull_quote: short italic block, rare.
- callout: boxed emphasis with a small label (e.g. 'KEY TAKEAWAY').
- image: one cover-style image. Valid tags: retirement, estate, family, tax, growth, planning.

Length discipline — per-section budget (hard ceilings, do not exceed):
- Total body copy across ALL blocks in this section: 280 words max.
- Prefer 2-4 blocks per section; 5 is only acceptable when every block is short.
- paragraph: 40-90 words each, max 3 per section.
- stat_cards: max 4 cards; each label ≤ 4 words; each value ≤ 8 characters.
- comparison_ledger: 2-3 columns, 3-4 rows max; each cell ≤ 12 words.
- numbered_insights: 3-5 rows; each row title ≤ 6 words, body ≤ 20 words.
- icon_tiles: exactly 4; each tile body ≤ 14 words.
- callout: body ≤ 35 words. Must include a body — never label-only.
- pull_quote: ≤ 22 words.

Use the outline's suggestedBlockTypes as a starting point — you can deviate if the content clearly calls for a different primitive, but don't pad with unnecessary blocks. Err shorter; one page of clean content beats a full page of filler.

Produce 1-5 blocks matching the schema. Do not produce more than one section's worth of content.`;

export function drafterSectionPrompt(input: {
  advisor: Advisor;
  client: Client;
  palette: Palette;
  findings: Finding[];
  outline: DrafterOutline;
  sectionOutline: SectionOutline;
}): string {
  const { advisor, client, palette, findings, outline, sectionOutline } = input;

  const otherSections = outline.sectionOutlines
    .filter((s) => s.id !== sectionOutline.id)
    .map((s) => `  - ${s.title} (${s.id})`)
    .join("\n");

  const findingsBlock =
    findings.length === 0
      ? "(no web findings available — keep numeric claims qualitative)"
      : findings
          .map(
            (f, i) =>
              `  [${i}] "${f.title}" (${f.url}) — ${f.snippet.slice(0, 220)}`,
          )
          .join("\n");

  const hinted = sectionOutline.sourceIndices?.length
    ? `This section was outlined with these findings in mind: ${sectionOutline.sourceIndices.join(", ")}`
    : "(no specific findings were pre-assigned to this section)";

  return `SECTION TO WRITE
- id: ${sectionOutline.id}
- title: "${sectionOutline.title}"
- kind: ${sectionOutline.kind}
- content brief: ${sectionOutline.contentBrief}
- suggested block types (use as a starting point): ${sectionOutline.suggestedBlockTypes.join(", ")}

OTHER SECTIONS IN THE DOCUMENT (for cross-reference awareness — don't repeat their content):
${otherSections || "  (none)"}

ADVISOR
- ${advisor.name}, ${advisor.firm}

CLIENT
- Name: ${client.name}
- Age: ${client.age}
- State: ${client.state}
- Occupation: ${client.occupation}
- Investable assets: ${client.investableAssets}
- Goals: ${client.goals}
- Notes: ${client.notes}

PALETTE
- Identity: "${palette.name}"
- Typography: ${palette.typography.pairing}

RESEARCH FINDINGS (cite by index in sourceIndices):
${findingsBlock}

${hinted}

Produce the blocks array for this ONE section. Stay within one page of content.`;
}
