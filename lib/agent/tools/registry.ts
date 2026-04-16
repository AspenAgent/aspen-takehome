import type { z } from "zod";

/**
 * Typed tool shape. See `lib/agent/tools/README.md` for the DX recipe.
 *
 * A tool is either a side-effecting function (handler present — e.g.
 * `research_web` wraps Tavily) or a schema-only declaration used as the
 * structured-output shape for `streamObject` / `generateText`
 * (no handler — e.g. `propose_brand_palette`, `render_document`).
 */
export type ToolContext = {
  signal?: AbortSignal;
};

export type ToolDefinition<I, O> = {
  name: string;
  description: string;
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  handler?: (input: I, ctx: ToolContext) => Promise<O>;
};

// Future tools register here. Kept as a plain record so the exhaustive list
// is a single grep target; no dynamic loading, no side-effectful registration.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toolRegistry: Record<string, ToolDefinition<any, any>> = {};

export function registerTool<I, O>(tool: ToolDefinition<I, O>): void {
  toolRegistry[tool.name] = tool;
}
