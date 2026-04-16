/**
 * Tavily search wrapper. Thin — no SDK dependency, just fetch.
 *
 * Free tier gives 1,000 req/mo which is more than enough for this take-home.
 * On failure we don't throw: research is an enrichment, not a hard dep, and
 * the orchestrator is designed to continue with an empty findings set.
 */
import type { Finding } from "@/lib/agent/schemas";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";

type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

type TavilyResponse = {
  results?: TavilyResult[];
};

export class TavilyError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "TavilyError";
  }
}

export async function tavilySearch(
  query: string,
  opts?: { maxResults?: number; signal?: AbortSignal },
): Promise<Finding[]> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) {
    throw new TavilyError(
      "TAVILY_API_KEY is not set. Research queries require a Tavily API key.",
    );
  }

  const res = await fetch(TAVILY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: opts?.maxResults ?? 4,
      include_answer: false,
    }),
    signal: opts?.signal,
  });

  if (!res.ok) {
    throw new TavilyError(
      `Tavily search failed: ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  const data = (await res.json()) as TavilyResponse;
  const findings: Finding[] = (data.results ?? []).map((r) => ({
    query,
    url: r.url,
    title: r.title ?? "(untitled)",
    snippet: (r.content ?? "").slice(0, 500),
  }));
  return findings;
}
