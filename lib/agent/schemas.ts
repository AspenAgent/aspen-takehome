import { z } from "zod";

// ──────────────────────────────────────────────────────────────
// Domain entities
// ──────────────────────────────────────────────────────────────

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int().nonnegative(),
  state: z.string(),
  occupation: z.string(),
  investableAssets: z.string(), // formatted string, e.g. "$1,200,000"
  goals: z.string(),
  notes: z.string(),
});
export type Client = z.infer<typeof ClientSchema>;

export const AdvisorSchema = z.object({
  id: z.string(),
  name: z.string(),
  firm: z.string(),
  email: z.string().email(),
  phone: z.string(),
  disclosure: z.string(),
});
export type Advisor = z.infer<typeof AdvisorSchema>;

// ──────────────────────────────────────────────────────────────
// Section skeleton (planner-facing)
// ──────────────────────────────────────────────────────────────

export const SectionSpecSchema = z.object({
  id: z.string(),
  title: z.string(),
  purpose: z.string(),
  required: z.boolean(),
  kind: z.enum(["default", "custom"]),
});
export type SectionSpec = z.infer<typeof SectionSpecSchema>;

// ──────────────────────────────────────────────────────────────
// Phase 1 output: ResearchPlan
// ──────────────────────────────────────────────────────────────

export const ResearchQuerySchema = z.object({
  query: z.string().min(3),
  rationale: z.string(),
  profileFields: z
    .array(
      z.enum(["state", "age", "occupation", "investableAssets", "goals", "notes"]),
    )
    .min(0),
});
export type ResearchQuery = z.infer<typeof ResearchQuerySchema>;

export const ResearchPlanSchema = z.object({
  keptDefaultSections: z.array(z.string()),
  addedCustomSections: z.array(SectionSpecSchema),
  researchQueries: z.array(ResearchQuerySchema).min(1).max(5),
});
export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

// ──────────────────────────────────────────────────────────────
// Research findings
// ──────────────────────────────────────────────────────────────

export const FindingSchema = z.object({
  query: z.string(),
  url: z.string().url(),
  title: z.string(),
  snippet: z.string(),
});
export type Finding = z.infer<typeof FindingSchema>;

// ──────────────────────────────────────────────────────────────
// Content blocks — discriminated union for the renderer
// ──────────────────────────────────────────────────────────────

export const ImageTagSchema = z.enum([
  "retirement",
  "estate",
  "family",
  "tax",
  "growth",
  "planning",
]);
export type ImageTag = z.infer<typeof ImageTagSchema>;

export const IconNameSchema = z.enum([
  "shield",
  "wallet",
  "calendar",
  "users",
  "home",
  "briefcase",
  "alert-triangle",
  "check-circle",
  "x-circle",
  "trending-up",
  "trending-down",
  "landmark",
  "heart",
  "book-open",
  "scale",
  "chart-bar",
  "piggy-bank",
  "handshake",
]);
export type IconName = z.infer<typeof IconNameSchema>;

export const ParagraphBlockSchema = z.object({
  type: z.literal("paragraph").describe("default prose block — 3-5 sentences"),
  text: z
    .string()
    .describe(
      "paragraph body, plain text, no markdown. 40-90 words; do not exceed 90 words",
    ),
});

export const StatCardsBlockSchema = z.object({
  type: z
    .literal("stat_cards")
    .describe("2-4 key figures with short labels — use at most once per document"),
  cards: z
    .array(
      z.object({
        value: z
          .string()
          .describe(
            "the headline number or phrase, e.g. '$1.2M' or '30%'. Keep under 8 characters so it fits the card",
          ),
        label: z
          .string()
          .describe("short caption under the value; 2-4 words, do not exceed 4 words"),
      }),
    )
    .min(2)
    .max(4),
});

export const IconTilesBlockSchema = z.object({
  type: z
    .literal("icon_tiles")
    .describe("exactly 4 concept pillars in a 2x2 grid — use on conceptual sections"),
  tiles: z
    .array(
      z.object({
        icon: IconNameSchema,
        title: z.string().describe("2-4 word tile heading, do not exceed 4 words"),
        body: z
          .string()
          .describe("one-sentence explanation; 10-14 words, do not exceed 14 words"),
      }),
    )
    .length(4),
});

export const NumberedInsightsBlockSchema = z.object({
  type: z
    .literal("numbered_insights")
    .describe("3-5 numbered rows — good for 'how it works' step-throughs"),
  rows: z
    .array(
      z.object({
        title: z
          .string()
          .describe("row heading; 3-6 words, do not exceed 6 words"),
        body: z
          .string()
          .describe("one-sentence explanation; 12-20 words, do not exceed 20 words"),
      }),
    )
    .min(3)
    .max(5),
});

export const ComparisonLedgerBlockSchema = z.object({
  type: z
    .literal("comparison_ledger")
    .describe("side-by-side tradeoff table, 2-3 columns, 3-4 rows"),
  columns: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe(
      "column headers, first is the row-label column, e.g. ['Factor','Option A','Option B']. Max 3 columns",
    ),
  rows: z
    .array(
      z.object({
        label: z
          .string()
          .describe("row label, matches first column; ≤ 4 words"),
        values: z
          .array(
            z
              .string()
              .describe("cell value; ≤ 12 words per cell, do not exceed 12 words"),
          )
          .describe("cell values, length = columns.length - 1"),
        highlight: z
          .enum(["positive", "negative", "neutral"])
          .optional()
          .describe("optional row emphasis for renderer"),
      }),
    )
    .min(2)
    .max(4),
  footnote: z
    .string()
    .optional()
    .describe("optional footnote; ≤ 14 words"),
});

export const PullQuoteBlockSchema = z.object({
  type: z.literal("pull_quote").describe("short italic emphasis block — use at most once"),
  text: z
    .string()
    .describe("the quoted sentence; 10-22 words, do not exceed 22 words"),
  attribution: z.string().optional(),
});

export const CalloutBlockSchema = z.object({
  type: z.literal("callout").describe("boxed emphasis — good for warnings or single takeaways"),
  label: z
    .string()
    .describe("small header label, e.g. 'KEY TAKEAWAY'; ≤ 4 words"),
  body: z
    .string()
    .describe(
      "callout body — required, never empty. One or two sentences, 20-35 words, do not exceed 35 words",
    ),
});

export const ImageBlockSchema = z.object({
  type: z.literal("image").describe("photographic image tile — cover-style visual"),
  tag: ImageTagSchema,
  caption: z.string().optional(),
});

export const HeadingBlockSchema = z.object({
  type: z.literal("heading").describe("inline sub-heading — use sparingly"),
  text: z.string(),
  level: z.union([z.literal(2), z.literal(3)]),
});

export const BlockSchema = z.discriminatedUnion("type", [
  ParagraphBlockSchema,
  StatCardsBlockSchema,
  IconTilesBlockSchema,
  NumberedInsightsBlockSchema,
  ComparisonLedgerBlockSchema,
  PullQuoteBlockSchema,
  CalloutBlockSchema,
  ImageBlockSchema,
  HeadingBlockSchema,
]);
export type Block = z.infer<typeof BlockSchema>;

// ──────────────────────────────────────────────────────────────
// DocumentPlan — the drafter's output, the renderer's input
// ──────────────────────────────────────────────────────────────

export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  kicker: z.string().optional(), // top-bar label, e.g. "03. THE NUMBERS"
  kind: z.enum(["default", "custom"]),
  blocks: z.array(BlockSchema).min(1),
  sourceIndices: z.array(z.number().int().nonnegative()).optional(),
  backgroundTone: z.enum(["deep", "surface"]).optional(), // alternates per page if absent
});
export type Section = z.infer<typeof SectionSchema>;

export const DocumentPlanSchema = z.object({
  id: z.string(),
  cover: z.object({
    title: z.string(),
    titleItalicPart: z.string().optional(), // e.g. "is a 'Non-Plan'" in italic
    subtitle: z.string(),
    kicker: z.string(), // short intro paragraph under subtitle
    imageTag: ImageTagSchema,
  }),
  tableOfContents: z
    .object({
      enabled: z.boolean(),
      quote: z.string().optional(), // small quote at the bottom of the TOC page
    })
    .optional(),
  sections: z.array(SectionSchema).min(2),
  closing: z.object({
    title: z.string(),
    titleItalicPart: z.string().optional(),
    subtitle: z.string(),
    ctaBoxTitle: z.string(), // e.g. "Get Your AI-Driven ... Snapshot"
    ctaBoxBody: z.string(),
    ctaBulletPoints: z.array(z.string()).min(1).max(4),
    scheduleLabel: z.string(), // e.g. "Schedule Your Consultation"
  }),
  sources: z.array(FindingSchema),
  generatedFor: z.object({
    clientId: z.string(),
    advisorId: z.string(),
  }),
  createdAt: z.string(), // ISO
  refinedFrom: z.string().optional(),
});
export type DocumentPlan = z.infer<typeof DocumentPlanSchema>;

// ──────────────────────────────────────────────────────────────
// Drafter sub-schemas (outline-then-fill pattern)
// ──────────────────────────────────────────────────────────────
//
// The drafter used to emit a whole DocumentPlan in one generateObject call.
// At the scale of a real document (6 sections × 9 block variants × prose)
// that blew up Anthropic's tool-use protocol — the model would split output
// across multiple tool_use blocks and the SDK would keep only the last.
//
// We now run it as outline-then-fill: one call to plan the shape, then a
// parallel call per section for the blocks. Each call has a narrower, flatter
// schema that generateObject handles reliably in JSON mode.

export const BlockTypeSchema = z.enum([
  "paragraph",
  "heading",
  "stat_cards",
  "icon_tiles",
  "numbered_insights",
  "comparison_ledger",
  "pull_quote",
  "callout",
  "image",
]);
export type BlockType = z.infer<typeof BlockTypeSchema>;

export const SectionOutlineSchema = z.object({
  id: z
    .string()
    .describe(
      "stable slug matching a default section id ('situation', 'concept', 'tradeoffs', 'numbers', 'case_study', 'next_step') or a custom id from the research plan",
    ),
  title: z.string().describe("2-5 word section title shown at the top of the page"),
  kicker: z
    .string()
    .optional()
    .describe("short top-bar label, e.g. '03. THE NUMBERS' — optional"),
  kind: z.enum(["default", "custom"]),
  contentBrief: z
    .string()
    .describe(
      "1-2 sentence brief describing what this section should say — the per-section drafter uses this as its north star",
    ),
  suggestedBlockTypes: z
    .array(BlockTypeSchema)
    .min(1)
    .max(4)
    .describe(
      "1-4 block primitives this section should use, in order. Pick the right primitives per the block catalogue.",
    ),
  sourceIndices: z
    .array(z.number().int().nonnegative())
    .optional()
    .describe("indexes into the research findings array that this section should cite"),
});
export type SectionOutline = z.infer<typeof SectionOutlineSchema>;

// Outline call output: cover + closing + TOC + per-section outlines.
// Flat, no discriminated union — trivial for JSON mode.
export const DrafterOutlineSchema = z.object({
  cover: DocumentPlanSchema.shape.cover,
  tableOfContents: DocumentPlanSchema.shape.tableOfContents,
  closing: DocumentPlanSchema.shape.closing,
  sectionOutlines: z.array(SectionOutlineSchema).min(2),
});
export type DrafterOutline = z.infer<typeof DrafterOutlineSchema>;

// Per-section call output: just the blocks for one section.
// Max 5 blocks (was 6) — keeps each section within a ~280-word body budget
// so a section fits on one printed page under the new flow layout.
export const DrafterSectionOutputSchema = z.object({
  blocks: z
    .array(BlockSchema)
    .min(1)
    .max(5)
    .describe(
      "1-5 blocks; prefer 2-4. Total body copy across blocks must stay under 280 words so the section fits on one page",
    ),
  sourceIndices: z
    .array(z.number().int().nonnegative())
    .optional()
    .describe("indexes into the research findings array this section cites"),
});
export type DrafterSectionOutput = z.infer<typeof DrafterSectionOutputSchema>;

// ──────────────────────────────────────────────────────────────
// Palette — per (advisor, client) brand theme
// ──────────────────────────────────────────────────────────────

const HexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "must be 6-digit hex, e.g. #1b2b24");

export const PaletteTokensSchema = z.object({
  backgroundDeep: HexColor, // cover / closing dominant bg
  backgroundSurface: HexColor, // body page bg
  backgroundAccent: HexColor, // callout boxes
  textOnDeep: HexColor,
  textOnSurface: HexColor,
  textSubtle: HexColor, // captions, footnotes
  accentPrimary: HexColor, // gold-equivalent — rules, emphasis
  accentSecondary: HexColor, // positive deltas
  accentDanger: HexColor, // negative deltas
});
export type PaletteTokens = z.infer<typeof PaletteTokensSchema>;

export const TypographyPairingSchema = z.enum([
  "heritage", // Fraunces + Inter
  "modern", // Geist + Inter
  "warm", // Cormorant Garamond + Work Sans
  "classic", // Playfair Display + Source Sans 3
]);
export type TypographyPairing = z.infer<typeof TypographyPairingSchema>;

export const PaletteSchema = z.object({
  id: z.string(), // `${advisorId}:${clientId}`
  name: z.string(), // e.g. "Texan Heritage"
  rationale: z.string(), // one-paragraph explanation, shown in UI
  tokens: PaletteTokensSchema,
  typography: z.object({
    pairing: TypographyPairingSchema,
  }),
  createdAt: z.string(), // ISO
  revisions: z
    .array(
      z.object({
        prompt: z.string(),
        at: z.string(),
      }),
    )
    .default([]),
});
export type Palette = z.infer<typeof PaletteSchema>;

// Subset schema used by the LLM (doesn't need id/createdAt/revisions)
export const PaletteProposalSchema = z.object({
  name: z.string(),
  rationale: z.string(),
  tokens: PaletteTokensSchema,
  typography: z.object({
    pairing: TypographyPairingSchema,
  }),
});
export type PaletteProposal = z.infer<typeof PaletteProposalSchema>;

// ──────────────────────────────────────────────────────────────
// Streaming event schema (for the client log)
// ──────────────────────────────────────────────────────────────

export const PhaseSchema = z.enum([
  "planning",
  "research",
  "palette",
  "drafting",
  "rendering",
]);
export type Phase = z.infer<typeof PhaseSchema>;

export const AgentEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("status"),
    phase: PhaseSchema,
    message: z.string(),
  }),
  z.object({
    type: z.literal("plan_proposed"),
    sections: z.array(
      z.object({
        title: z.string(),
        kind: z.enum(["default", "custom"]),
      }),
    ),
    queries: z.array(z.string()),
  }),
  z.object({
    type: z.literal("research_started"),
    queries: z.array(z.string()),
  }),
  z.object({
    type: z.literal("research_result"),
    query: z.string(),
    sourceCount: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal("palette_selecting"),
    fromCache: z.boolean(),
  }),
  z.object({
    type: z.literal("palette_ready"),
    palette: PaletteSchema,
  }),
  z.object({
    type: z.literal("drafting_section"),
    title: z.string(),
  }),
  z.object({
    type: z.literal("client_recognized"),
    clientId: z.string(),
    clientName: z.string(),
  }),
  z.object({
    type: z.literal("plan_ready"),
    plan: DocumentPlanSchema,
  }),
  z.object({
    type: z.literal("rendering"),
  }),
  z.object({
    type: z.literal("pdf_ready"),
    planId: z.string(),
    pdfBase64: z.string(),
    filename: z.string(),
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
    recoverable: z.boolean(),
  }),
]);
export type AgentEvent = z.infer<typeof AgentEventSchema>;
