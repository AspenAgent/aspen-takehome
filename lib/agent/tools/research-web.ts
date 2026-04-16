import { z } from "zod";
import { FindingSchema } from "@/lib/agent/schemas";
import { tavilySearch } from "@/lib/tavily";
import { registerTool, type ToolDefinition } from "./registry";

const Input = z.object({
  query: z.string().min(3).describe("search query"),
  maxResults: z.number().int().min(1).max(8).optional(),
});

const Output = z.object({
  findings: z.array(FindingSchema),
});

export const researchWebTool: ToolDefinition<
  z.infer<typeof Input>,
  z.infer<typeof Output>
> = {
  name: "research_web",
  description:
    "Run a web search via Tavily and return a list of findings (url + title + snippet) scoped to the query.",
  inputSchema: Input,
  outputSchema: Output,
  handler: async (input, ctx) => {
    const findings = await tavilySearch(input.query, {
      maxResults: input.maxResults ?? 4,
      signal: ctx.signal,
    });
    return { findings };
  },
};

registerTool(researchWebTool);
