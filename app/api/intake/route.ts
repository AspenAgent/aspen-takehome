import { z } from "zod";
import { resolveClient } from "@/lib/agent/intake";
import { clients } from "@/lib/data/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Intake endpoint — resolves the advisor's free-text prompt to a seeded
 * client before the long generate pipeline runs. Either returns a single
 * confident match or a list of candidates for the UI to pick from. This is
 * intentionally non-streaming: it's a cheap classifier call, and the UI
 * needs the full result before deciding whether to POST /api/generate.
 */

const Body = z.object({
  prompt: z.string().min(4),
});

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

  const available = await clients.list();
  const result = await resolveClient({
    prompt: parsed.prompt,
    availableClients: available,
  });

  return Response.json(result);
}
