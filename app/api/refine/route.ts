import { z } from "zod";
import {
  DocumentPlanSchema,
  PaletteSchema,
} from "@/lib/agent/schemas";
import { createSseStream } from "@/lib/agent/events";
import { runRefine } from "@/lib/agent/orchestrator";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Refinement route.
 *
 * Uses a small tool-calling step to classify the advisor's instruction into
 * { refinePalette, refineDocument } flags. Temperature 0 so the routing is
 * stable. Then hands off to the orchestrator's refine pipeline, which re-runs
 * the palette agent and/or the drafter as needed.
 *
 * Why not let the agent loop over the actual refinement tools? The tools in
 * this codebase (render_document, propose_brand_palette) are schema-only —
 * invoking them means calling streamObject with the right prompt, which is
 * cleaner to do directly from the orchestrator than via generateText's tool
 * loop. The classifier agent is doing intent-routing, nothing more.
 */

const Body = z.object({
  instruction: z.string().min(2),
  previousPlan: DocumentPlanSchema,
  previousPalette: PaletteSchema,
  clientId: z.string().default("susie"),
  advisorId: z.string().default("whitfield"),
});

const ROUTING_SYSTEM_PROMPT = `You are a router that decides whether a refinement instruction from a financial advisor affects the document content, the brand palette, or both.

- refinePalette=true means the instruction is about colors, fonts, or the brand feel ("warmer tones", "try a navy scheme", "less gold", "more modern typography").
- refineDocument=true means the instruction is about the writing — sections, tone, length, content, emphasis ("shorter tradeoffs section", "add more numbers", "less formal").
- Both can be true. At least one must be true.

Output JSON only, shape: { "refinePalette": boolean, "refineDocument": boolean, "reason": "one sentence" }`;

const RouteSchema = z.object({
  refinePalette: z.boolean(),
  refineDocument: z.boolean(),
  reason: z.string(),
});

async function routeRefinement(instruction: string) {
  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: ROUTING_SYSTEM_PROMPT,
    prompt: `Instruction: "${instruction}"\n\nReturn JSON only.`,
    temperature: 0,
  });

  try {
    const parsed = JSON.parse(text);
    const route = RouteSchema.parse(parsed);
    // Safety: if the router says neither, default to document refinement.
    if (!route.refinePalette && !route.refineDocument) {
      return { ...route, refineDocument: true };
    }
    return route;
  } catch {
    // Fallback heuristic if the router returns malformed JSON.
    const lower = instruction.toLowerCase();
    const paletteWords = ["color", "palette", "gold", "tone", "warmer", "cooler", "navy", "brand", "font", "typography"];
    const hitsPalette = paletteWords.some((w) => lower.includes(w));
    return {
      refinePalette: hitsPalette,
      refineDocument: !hitsPalette || hitsPalette, // always true; palette can co-occur
      reason: "fallback heuristic",
    };
  }
}

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    return Response.json(
      {
        error: err instanceof Error ? err.message : "invalid request body",
      },
      { status: 400 },
    );
  }

  const { stream, emit, close, fail } = createSseStream();

  (async () => {
    try {
      emit({
        type: "status",
        phase: "planning",
        message: "Classifying refinement intent…",
      });
      const route = await routeRefinement(parsed.instruction);
      emit({
        type: "status",
        phase: "planning",
        message: `Routing decision: palette=${route.refinePalette}, document=${route.refineDocument}. ${route.reason}`,
      });

      await runRefine({
        advisorInstruction: parsed.instruction,
        refinePalette: route.refinePalette,
        refineDocument: route.refineDocument,
        previousPlanId: parsed.previousPlan.id,
        previousPlan: parsed.previousPlan,
        previousPalette: parsed.previousPalette,
        clientId: parsed.clientId,
        advisorId: parsed.advisorId,
        emit,
      });
      close();
    } catch (err) {
      console.error("[api/refine] pipeline failed", err);
      fail(err);
    }
  })();

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
