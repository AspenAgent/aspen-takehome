import type { Advisor, Client, Palette } from "@/lib/agent/schemas";

/**
 * Prompt for the palette agent.
 *
 * Design intent: the palette is a brand identity for the (advisor, client)
 * pair — it should feel like it was commissioned, not generated. We let the
 * model reason about signals in the client's state, occupation, life stage,
 * and the advisor's firm positioning, then asks it to pick one of four
 * pre-vetted typography pairings and a coherent 9-token color system.
 *
 * We hold the structure (token set, typography enum) as hard constraints so
 * the renderer can consume the output without per-palette branching. The
 * creative room is in the color choices and the rationale.
 */

export const PALETTE_SYSTEM_PROMPT = `You are a senior brand designer working inside a financial advisory firm's document generator. Your job is to propose a coherent, editorial-grade color + typography identity for one specific advisor/client pair.

Principles:
- Every palette is a brand — not a mood board. Think of a named identity that could sit on a letterhead, not a color-theory exercise.
- Restraint over variety. Nine tokens total — they should feel inevitable, not eclectic.
- The deep background is dominant on the cover and closing pages. Pick something with enough pigment that large type reads as confident (not flat black, not dim gray). Dark greens, navies, deep oxbloods, graphite-warm browns are all fair.
- The surface background is used on body pages. It should be warm, slightly off-white, and legible under serif display type. Think ivory, bone, parchment, soft stone.
- Accent primary is the "gold" of the palette — used for rules, numerals, small eyebrows. It must be saturated enough to read as an accent but quiet enough to sit next to serif body copy without competing. One accent, used sparingly.
- Accent secondary / danger are for financial deltas (positive / negative). They don't appear on every page.
- Text colors must have AA contrast against their backgrounds. Don't pick a text color that's within 3 LCH points of its paired background.

Typography pairings (you MUST pick exactly one of these four):
- "heritage" — Fraunces + Inter. Serif with optical sizing + humanist italic. Best for traditional/multi-generational clients, legal/trust work, longer gravitas.
- "modern" — Manrope + Inter. Crisp geometric display with calm sans body. Best for younger clients, tech wealth, direct positioning.
- "warm" — Cormorant Garamond + Work Sans. Book-like serif with warm, open body. Best for family office, estate, relational topics.
- "classic" — Playfair Display + Source Sans 3. High-contrast didone serif with clean sans. Best for formal concepts, capital markets, institutional feel.

Return JSON matching the requested schema. All hex values lowercase, 6 digits, leading hash. Do not comment the JSON.`;

export function paletteUserPrompt(input: {
  advisor: Advisor;
  client: Client;
}): string {
  const { advisor, client } = input;
  return `Propose a brand palette for this pairing:

ADVISOR
- Firm: ${advisor.firm}
- Advisor: ${advisor.name}
- Disclosure footer (reveals regulatory footprint, state): ${advisor.disclosure}

CLIENT
- Name: ${client.name}
- Age: ${client.age}
- State: ${client.state}
- Occupation: ${client.occupation}
- Investable assets: ${client.investableAssets}
- Goals: ${client.goals}
- Notes: ${client.notes}

Consider: regional sensibility (${client.state}), life stage (age ${client.age}, ${client.occupation}), the emotional temperature of their goals, and the firm's implied positioning. Give the palette a named identity (2–3 words, e.g. "Texan Heritage", "Hudson Library", "Pacific Granite") and a one-paragraph rationale (under 40 words) explaining the creative choice. Then produce the nine tokens and the typography pairing.`;
}

export function paletteRefinePrompt(input: {
  advisor: Advisor;
  client: Client;
  previous: Palette;
  advisorFeedback: string;
}): string {
  const { advisor, client, previous, advisorFeedback } = input;
  return `You previously proposed this palette for ${advisor.firm} / ${client.name}:

Name: ${previous.name}
Rationale: ${previous.rationale}
Typography: ${previous.typography.pairing}
Tokens:
${Object.entries(previous.tokens)
  .map(([k, v]) => `  - ${k}: ${v}`)
  .join("\n")}

The advisor has asked for this change:
"${advisorFeedback}"

Revise the palette. Preserve what the advisor liked; change what they asked to change. If the request is a small tweak (e.g. "warmer gold"), keep the rest stable. If it's a full reset (e.g. "try something more modern"), feel free to reconsider the typography pairing too. Produce the nine tokens and the typography pairing again.`;
}
