import { z } from "zod";
import {
  AdvisorSchema,
  ClientSchema,
  PaletteProposalSchema,
} from "@/lib/agent/schemas";
import { registerTool, type ToolDefinition } from "./registry";

/**
 * Schema-only tool. No handler — the palette agent is invoked via
 * `streamObject({ schema: PaletteProposalSchema })` directly in
 * `lib/agent/palette.ts`. This entry exists so:
 *   (1) refinement (`generateText` with tools) can reach it by name
 *   (2) the tool registry contains the contract
 */
export const ProposeBrandPaletteInput = z.object({
  advisor: AdvisorSchema,
  client: ClientSchema,
  instruction: z
    .string()
    .optional()
    .describe(
      "Optional advisor instruction, e.g. 'warmer gold' or 'try a navy scheme'.",
    ),
});

export const proposeBrandPaletteTool: ToolDefinition<
  z.infer<typeof ProposeBrandPaletteInput>,
  z.infer<typeof PaletteProposalSchema>
> = {
  name: "propose_brand_palette",
  description:
    "Propose a brand palette (9 color tokens + typography pairing) for a specific advisor/client pair, with a named identity and one-paragraph rationale.",
  inputSchema: ProposeBrandPaletteInput,
  outputSchema: PaletteProposalSchema,
  // No handler: this tool is invoked by the palette phase via streamObject.
};

registerTool(proposeBrandPaletteTool);
