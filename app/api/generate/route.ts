import { z } from "zod";
import { createSseStream } from "@/lib/agent/events";
import { runGenerate } from "@/lib/agent/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Generate endpoint — runs the 4-phase pipeline and streams events.
 * `clientId` is required: the UI must resolve it via POST /api/intake first.
 * This keeps the long pipeline strictly client-pinned and means we never
 * burn compute on a guess the advisor would have rejected.
 */

const Body = z.object({
  prompt: z.string().min(4),
  clientId: z.string().min(1),
  advisorId: z.string().default("whitfield"),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "invalid request body",
      },
      { status: 400 },
    );
  }

  const { stream, emit, close, fail } = createSseStream();

  (async () => {
    try {
      await runGenerate({
        advisorPrompt: parsed.prompt,
        clientId: parsed.clientId,
        advisorId: parsed.advisorId,
        emit,
      });
      close();
    } catch (err) {
      console.error("[api/generate] pipeline failed", err);
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
