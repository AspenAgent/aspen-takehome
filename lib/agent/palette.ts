import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  PaletteProposalSchema,
  PaletteSchema,
  type Advisor,
  type Client,
  type Palette,
} from "@/lib/agent/schemas";
import {
  PALETTE_SYSTEM_PROMPT,
  paletteRefinePrompt,
  paletteUserPrompt,
} from "@/lib/agent/prompts/palette";
import { palettes, paletteIdFor } from "@/lib/data/repositories";

/**
 * Palette agent — owns the creation and refinement of a per-(advisor, client)
 * brand palette.
 *
 * Why its own module (not the orchestrator):
 *   - Called from two places: Phase 2 of generate (cache-first), and the
 *     refine route (always regenerate).
 *   - Palette is the smallest, cleanest "agent" in the system — single Zod
 *     schema, no tool use, no chained calls — so it's a good reference
 *     implementation for how a phase is shaped.
 *
 * Determinism knob: temperature 0.7. Colors need creativity, but the rationale
 * still has to be grounded in the client's profile — this setting consistently
 * produces distinct palettes across invocations without going off-brief.
 */

const MODEL = "claude-sonnet-4-5-20250929" as const;
const TEMPERATURE = 0.7;

export async function proposePalette(input: {
  advisor: Advisor;
  client: Client;
}): Promise<Palette> {
  const { object: proposal } = await generateObject({
    model: anthropic(MODEL),
    schema: PaletteProposalSchema,
    system: PALETTE_SYSTEM_PROMPT,
    prompt: paletteUserPrompt(input),
    temperature: TEMPERATURE,
  });

  const palette: Palette = PaletteSchema.parse({
    id: paletteIdFor(input.advisor.id, input.client.id),
    name: proposal.name,
    rationale: proposal.rationale,
    tokens: proposal.tokens,
    typography: proposal.typography,
    createdAt: new Date().toISOString(),
    revisions: [],
  });

  return palette;
}

/**
 * Load-or-propose. Returns an existing palette from the repo if present
 * (brand identity should be stable across documents); otherwise proposes a
 * fresh one and persists it. `fromCache` flag lets callers emit a status event.
 */
export async function ensurePalette(input: {
  advisor: Advisor;
  client: Client;
}): Promise<{ palette: Palette; fromCache: boolean }> {
  const id = paletteIdFor(input.advisor.id, input.client.id);
  const existing = await palettes.get(id);
  if (existing) return { palette: existing, fromCache: true };

  const fresh = await proposePalette(input);
  const saved = await palettes.save(fresh);
  return { palette: saved, fromCache: false };
}

/**
 * Refinement path — advisor types a change request, we revise in place.
 * Records the prompt in `revisions` so the audit trail shows what the advisor
 * asked for and when.
 */
export async function refinePalette(input: {
  advisor: Advisor;
  client: Client;
  advisorFeedback: string;
}): Promise<Palette> {
  const id = paletteIdFor(input.advisor.id, input.client.id);
  const previous = await palettes.get(id);
  if (!previous) {
    // First time: treat feedback as a seed instruction, not a revision.
    const palette = await proposePalette(input);
    const saved = await palettes.save(palette);
    return palettes.recordRevision(saved.id, input.advisorFeedback);
  }

  const { object: proposal } = await generateObject({
    model: anthropic(MODEL),
    schema: PaletteProposalSchema,
    system: PALETTE_SYSTEM_PROMPT,
    prompt: paletteRefinePrompt({
      advisor: input.advisor,
      client: input.client,
      previous,
      advisorFeedback: input.advisorFeedback,
    }),
    temperature: TEMPERATURE,
  });

  const updated: Palette = PaletteSchema.parse({
    ...previous,
    name: proposal.name,
    rationale: proposal.rationale,
    tokens: proposal.tokens,
    typography: proposal.typography,
  });

  await palettes.save(updated);
  return palettes.recordRevision(id, input.advisorFeedback);
}
