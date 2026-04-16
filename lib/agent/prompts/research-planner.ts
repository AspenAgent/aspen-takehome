import type { Advisor, Client, SectionSpec } from "@/lib/agent/schemas";
import { DEFAULT_SECTIONS } from "@/lib/agent/sections";

/**
 * Phase 1 prompt — the research planner.
 *
 * The planner makes two decisions in one shot:
 *   1. Which of the DEFAULT_SECTIONS to keep, and whether to invent any custom
 *      ones (e.g. a "Texas homestead exemption" section because the client
 *      lives in TX).
 *   2. Which 1-5 web queries to run. Each query must declare which client
 *      profile fields it draws from so the research is auditable.
 *
 * We keep temperature low (0.2) because the output should feel deliberate,
 * not creative — two runs with the same inputs should produce very similar
 * plans.
 */

export const RESEARCH_PLANNER_SYSTEM_PROMPT = `You are a research planner inside a financial advisor's document generator. Given an advisor's prompt and a client profile, your job is to propose (a) which sections the final document should contain, and (b) a short, auditable list of web queries that will ground the content in facts relevant to THIS client.

Principles for sections:
- Keep every "required: true" default section.
- Keep optional default sections only when the topic clearly benefits from them.
- Invent custom sections when the advisor's prompt or the client's profile introduces a topic not covered by the defaults. Custom section ids should be kebab-case, e.g. "texas-homestead" or "concentrated-position".

Principles for research queries:
- 1 to 5 queries total. Quality over quantity.
- Each query must be grounded in at least one client profile field. Declare which fields in profileFields. Allowed values: "state", "age", "occupation", "investableAssets", "goals", "notes".
- Queries should be specific enough that Tavily returns useful hits. Avoid generic queries like "retirement planning". Prefer "capital gains on rental property sale Texas 2025 rules".
- The rationale field is for the advisor: a one-sentence explanation of why this query improves the personalization of the final document.

Return JSON matching the requested schema.`;

export function researchPlannerUserPrompt(input: {
  advisorPrompt: string;
  advisor: Advisor;
  client: Client;
}): string {
  const { advisorPrompt, advisor, client } = input;
  const defaults = DEFAULT_SECTIONS.map(
    (s: SectionSpec) =>
      `  - ${s.id}${s.required ? " (required)" : ""}: ${s.purpose}`,
  ).join("\n");

  return `ADVISOR PROMPT
"${advisorPrompt}"

ADVISOR CONTEXT
- ${advisor.name} at ${advisor.firm}

CLIENT
- Name: ${client.name}
- Age: ${client.age}
- State: ${client.state}
- Occupation: ${client.occupation}
- Investable assets: ${client.investableAssets}
- Goals: ${client.goals}
- Notes: ${client.notes}

DEFAULT SECTIONS (pick which to keep; skip the optionals that don't apply)
${defaults}

Produce a ResearchPlan: keptDefaultSections (by id), addedCustomSections (full SectionSpec for each), and researchQueries (1-5).`;
}
