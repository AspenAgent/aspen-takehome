import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  DocumentPlanSchema,
  DrafterOutlineSchema,
  DrafterSectionOutputSchema,
  type Advisor,
  type Client,
  type DocumentPlan,
  type DrafterOutline,
  type Finding,
  type Palette,
  type ResearchPlan,
  type Section,
  type SectionOutline,
} from "@/lib/agent/schemas";
import {
  DRAFTER_OUTLINE_SYSTEM_PROMPT,
  DRAFTER_SECTION_SYSTEM_PROMPT,
  drafterOutlinePrompt,
  drafterSectionPrompt,
} from "@/lib/agent/prompts/drafter";

const MODEL = "claude-sonnet-4-5-20250929" as const;
const TEMPERATURE = 0;
const MAX_RETRIES = 2;

/**
 * Phase 3 — outline-then-fill drafter.
 *
 * 1. draftOutline  → one generateObject producing cover/closing/TOC + per-section outlines.
 * 2. draftSection  → one generateObject per section, run in parallel, producing that section's blocks.
 * 3. draftDocument → composes the two, parses against DocumentPlanSchema.
 *
 * Anthropic's AI-SDK provider only supports tool-mode object generation
 * (no JSON mode), so both calls default to tool-use. The reliability win
 * comes from narrower per-call schemas: the outline is flat with no
 * discriminated union, and each section call emits only ~1-6 blocks —
 * small enough that Anthropic tool-use handles it without splitting across
 * multiple tool_use blocks. `maxRetries: 2` gives us a feedback retry loop
 * if validation fails anyway (the SDK re-prompts with the Zod error).
 */

async function draftOutline(input: {
  advisorPrompt: string;
  advisor: Advisor;
  client: Client;
  researchPlan: ResearchPlan;
  findings: Finding[];
  palette: Palette;
}): Promise<DrafterOutline> {
  const { object } = await generateObject({
    model: anthropic(MODEL),
    schema: DrafterOutlineSchema,
    system: DRAFTER_OUTLINE_SYSTEM_PROMPT,
    prompt: drafterOutlinePrompt(input),
    temperature: TEMPERATURE,
    maxRetries: MAX_RETRIES,
    maxTokens: 2048,
  });
  return object;
}

async function draftSection(input: {
  advisor: Advisor;
  client: Client;
  palette: Palette;
  findings: Finding[];
  outline: DrafterOutline;
  sectionOutline: SectionOutline;
}): Promise<Section> {
  const { object } = await generateObject({
    model: anthropic(MODEL),
    schema: DrafterSectionOutputSchema,
    system: DRAFTER_SECTION_SYSTEM_PROMPT,
    prompt: drafterSectionPrompt(input),
    temperature: TEMPERATURE,
    maxRetries: MAX_RETRIES,
    maxTokens: 2048,
  });

  return {
    id: input.sectionOutline.id,
    title: input.sectionOutline.title,
    ...(input.sectionOutline.kicker ? { kicker: input.sectionOutline.kicker } : {}),
    kind: input.sectionOutline.kind,
    blocks: object.blocks,
    ...(object.sourceIndices
      ? { sourceIndices: object.sourceIndices }
      : input.sectionOutline.sourceIndices
        ? { sourceIndices: input.sectionOutline.sourceIndices }
        : {}),
  };
}

export async function draftDocument(input: {
  advisorPrompt: string;
  advisor: Advisor;
  client: Client;
  researchPlan: ResearchPlan;
  findings: Finding[];
  palette: Palette;
  planId: string;
  refinedFrom?: string;
  onSectionStart?: (sectionOutline: SectionOutline) => void;
  onSectionComplete?: (section: Section) => void;
}): Promise<DocumentPlan> {
  // Stage 1 — outline pass
  const outline = await draftOutline({
    advisorPrompt: input.advisorPrompt,
    advisor: input.advisor,
    client: input.client,
    researchPlan: input.researchPlan,
    findings: input.findings,
    palette: input.palette,
  });

  // Stage 2 — fill each section in parallel. Events fire as sections resolve.
  const sections = await Promise.all(
    outline.sectionOutlines.map(async (sectionOutline) => {
      input.onSectionStart?.(sectionOutline);
      const section = await draftSection({
        advisor: input.advisor,
        client: input.client,
        palette: input.palette,
        findings: input.findings,
        outline,
        sectionOutline,
      });
      input.onSectionComplete?.(section);
      return section;
    }),
  );

  // Stage 3 — assemble. DocumentPlanSchema.parse validates the canonical shape.
  const plan: DocumentPlan = DocumentPlanSchema.parse({
    id: input.planId,
    cover: outline.cover,
    ...(outline.tableOfContents ? { tableOfContents: outline.tableOfContents } : {}),
    sections,
    closing: outline.closing,
    sources: input.findings,
    generatedFor: {
      clientId: input.client.id,
      advisorId: input.advisor.id,
    },
    createdAt: new Date().toISOString(),
    ...(input.refinedFrom ? { refinedFrom: input.refinedFrom } : {}),
  });

  return plan;
}
