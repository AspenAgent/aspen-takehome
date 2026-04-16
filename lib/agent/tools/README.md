# Tool registry

Tools are the extension seam for the agent. A "tool" is a typed I/O contract
plus an optional handler — either a real function (`research_web`) or a
schema-only declaration consumed by `streamObject` / `generateText`
(`propose_brand_palette`, `render_document`).

## Shape

Every tool exports a `ToolDefinition<I, O>` from its own file:

```ts
export type ToolDefinition<I, O> = {
  name: string;
  description: string;
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  handler?: (input: I, ctx: ToolContext) => Promise<O>;
};
```

- `name` — the string the LLM sees when picking a tool. Snake case.
- `description` — one-sentence purpose. Read by the LLM, so be specific.
- `inputSchema` — Zod schema for args. Every field `.describe(...)`d.
- `outputSchema` — Zod schema for the result. Enforces the audit contract.
- `handler` — omit for schema-only tools (the "tool" is really a typed-output
  shape for `streamObject`). Include for side-effecting tools (HTTP, DB, etc).

## Adding a new tool

1. **Create** `lib/agent/tools/your-tool.ts`:
   ```ts
   import { z } from "zod";
   import type { ToolDefinition } from "./registry";

   const Input = z.object({ query: z.string().describe("search string") });
   const Output = z.object({ hits: z.array(z.string()) });

   export const yourTool: ToolDefinition<
     z.infer<typeof Input>,
     z.infer<typeof Output>
   > = {
     name: "your_tool",
     description: "One-sentence purpose.",
     inputSchema: Input,
     outputSchema: Output,
     handler: async (input) => { /* ... */ },
   };
   ```

2. **Register** it in `registry.ts` by adding the import + entry.
3. **Wire** it into whichever phase calls it. Most tools get called in the
   orchestrator or passed to `generateText({ tools })` for agent-picked flows.

## Conventions

- Tools only fail by throwing. Error payloads are the caller's job.
- Tools are **pure w.r.t. the agent state** — they don't mutate `DocumentPlan`
  or `Palette` directly. Callers merge results into state.
- Handler-bearing tools should be idempotent or explicitly document that
  they're not (e.g. `save_palette` isn't — it writes to disk).
