import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  ResearchPlanSchema,
  type Advisor,
  type Client,
  type Finding,
  type ResearchPlan,
} from "@/lib/agent/schemas";
import {
  RESEARCH_PLANNER_SYSTEM_PROMPT,
  researchPlannerUserPrompt,
} from "@/lib/agent/prompts/research-planner";
import { tavilySearch, TavilyError } from "@/lib/tavily";

const MODEL = "claude-haiku-4-5-20251001" as const;
const PLANNER_TEMPERATURE = 0.2;
const PARALLEL_SEARCH_LIMIT = 4;

export async function planResearch(input: {
  advisorPrompt: string;
  advisor: Advisor;
  client: Client;
}): Promise<ResearchPlan> {
  const { object } = await generateObject({
    model: anthropic(MODEL),
    schema: ResearchPlanSchema,
    system: RESEARCH_PLANNER_SYSTEM_PROMPT,
    prompt: researchPlannerUserPrompt(input),
    temperature: PLANNER_TEMPERATURE,
  });
  return object;
}

export type ResearchProgress = (event: {
  type: "started" | "result" | "failed";
  query: string;
  sourceCount?: number;
  error?: string;
}) => void;

/**
 * Run every planner-chosen query in parallel (bounded by PARALLEL_SEARCH_LIMIT).
 * On individual query failure we emit a `failed` event but continue — research
 * is best-effort enrichment, not a hard dependency.
 */
export async function runResearch(
  plan: ResearchPlan,
  progress?: ResearchProgress,
): Promise<Finding[]> {
  const queries = plan.researchQueries.map((q) => q.query);

  const out: Finding[] = [];
  for (let i = 0; i < queries.length; i += PARALLEL_SEARCH_LIMIT) {
    const batch = queries.slice(i, i + PARALLEL_SEARCH_LIMIT);
    const results = await Promise.all(
      batch.map(async (query) => {
        progress?.({ type: "started", query });
        try {
          const findings = await tavilySearch(query);
          progress?.({
            type: "result",
            query,
            sourceCount: findings.length,
          });
          return findings;
        } catch (err) {
          const message =
            err instanceof TavilyError
              ? err.message
              : err instanceof Error
                ? err.message
                : "unknown search error";
          progress?.({ type: "failed", query, error: message });
          return [];
        }
      }),
    );
    for (const list of results) out.push(...list);
  }
  return out;
}
