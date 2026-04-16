import { z } from "zod";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { Client } from "@/lib/agent/schemas";

/**
 * Intake classifier — resolves the advisor's natural-language prompt to a
 * specific client id from the seeded list.
 *
 * Returns a discriminated result: either `resolved` (one confident match)
 * or `needs_choice` (ambiguous or no match — the caller should surface a
 * picker to the advisor). We deliberately do NOT silently fall back to a
 * default client; the advisor must pick explicitly.
 *
 * Pattern mirrors the router in `app/api/refine/route.ts` — Haiku + temp 0,
 * generateText + manual JSON parse + Zod validation.
 */

const MODEL = "claude-haiku-4-5-20251001" as const;
const TEMPERATURE = 0;

const IntakeDecisionSchema = z.object({
  decision: z.enum(["match", "no_match", "multiple_matches"]),
  clientId: z.string().optional(),
  candidateIds: z.array(z.string()).optional(),
  reason: z.string().min(1),
});

/**
 * Haiku at temp 0 sometimes wraps JSON in ```json fences or prepends a short
 * preamble, which breaks strict JSON.parse. Pull out the first balanced
 * top-level object instead.
 */
function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  if (start < 0) return body.trim();
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < body.length; i++) {
    const ch = body[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return body.slice(start, i + 1);
    }
  }
  return body.slice(start).trim();
}

export type IntakeResult =
  | {
      kind: "resolved";
      clientId: string;
      clientName: string;
      reason: string;
    }
  | {
      kind: "needs_choice";
      candidates: Client[];
      reason: string;
    };

function systemPrompt(clients: Client[]): string {
  const roster = clients
    .map(
      (c) =>
        `  - id: "${c.id}" | ${c.name}, ${c.age}, ${c.state}, ${c.occupation}. Notes: ${c.notes}`,
    )
    .join("\n");

  const ids = clients.map((c) => `"${c.id}"`).join(" | ");

  return `You are an intake router for a financial advisor's document tool. Given a free-text advisor prompt, decide which seeded client (if any) the advisor is talking about.

Roster:
${roster}

Valid ids: ${ids}.

Return JSON only, matching this shape:
{ "decision": "match" | "no_match" | "multiple_matches",
  "clientId": string,           // required when decision === "match"
  "candidateIds": string[],     // required when decision === "multiple_matches"; 2+ ids from the roster
  "reason": string }            // one short sentence explaining your call

Rules:
- "match": exactly one client in the roster clearly fits the prompt. Set clientId to that id.
- "multiple_matches": two or more roster clients plausibly fit (e.g. the prompt says "Matt" and the roster has two Matts with no other disambiguating signal). Set candidateIds to the tied roster ids.
- "no_match": the prompt names a person who is not in the roster, or gives no usable signal at all. Omit clientId and candidateIds.
- Only use ids from the roster above. Never invent an id.
- Topics of the document (what to write about) are NOT client names — a prompt like "a plan for Matt about Charlotte" is asking about a client named Matt, with Charlotte as the topic.`;
}

export async function resolveClient(input: {
  prompt: string;
  availableClients: Client[];
}): Promise<IntakeResult> {
  const { prompt, availableClients } = input;
  if (availableClients.length === 0) {
    throw new Error("resolveClient: no clients available");
  }
  if (availableClients.length === 1) {
    const only = availableClients[0];
    return {
      kind: "resolved",
      clientId: only.id,
      clientName: only.name,
      reason: "only one client in roster",
    };
  }

  const byId = new Map(availableClients.map((c) => [c.id, c]));

  const unresolvable = (reason: string): IntakeResult => ({
    kind: "needs_choice",
    candidates: availableClients,
    reason,
  });

  try {
    const { text } = await generateText({
      model: anthropic(MODEL),
      system: systemPrompt(availableClients),
      prompt: `Advisor prompt: "${prompt}"\n\nReturn JSON only.`,
      temperature: TEMPERATURE,
    });

    const parsed = IntakeDecisionSchema.parse(
      JSON.parse(extractJsonObject(text)),
    );

    if (parsed.decision === "match" && parsed.clientId) {
      const client = byId.get(parsed.clientId);
      if (client) {
        return {
          kind: "resolved",
          clientId: client.id,
          clientName: client.name,
          reason: parsed.reason,
        };
      }
      // Model returned an id not in the roster — treat as unresolved.
      return unresolvable(
        `classifier returned an unknown id (${parsed.clientId}); please pick`,
      );
    }

    if (parsed.decision === "multiple_matches" && parsed.candidateIds) {
      const candidates = parsed.candidateIds
        .map((id) => byId.get(id))
        .filter((c): c is Client => Boolean(c));
      if (candidates.length >= 2) {
        return {
          kind: "needs_choice",
          candidates,
          reason: parsed.reason,
        };
      }
      // Fewer than 2 valid candidates — degrade to full-roster pick.
      return unresolvable(parsed.reason);
    }

    // decision === "no_match"
    return unresolvable(parsed.reason);
  } catch (err) {
    console.warn("[intake] classifier failed, falling back to picker:", err);
    return unresolvable(
      "could not confidently resolve the client from your prompt; please pick",
    );
  }
}
