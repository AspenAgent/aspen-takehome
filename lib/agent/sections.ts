import type { SectionSpec } from "./schemas";

/**
 * Canonical section skeleton for a personalized client document.
 *
 * The research planner (Phase 1) receives this list and decides:
 *   - which `required: true` sections to keep (all of them, by contract)
 *   - which `required: false` sections to include
 *   - whether to add any custom sections beyond this list
 *
 * Adding a new default section? Add it here and make sure the drafter
 * prompt mentions it. That's the only change needed — the orchestrator
 * and renderer pick it up automatically.
 */
export const DEFAULT_SECTIONS: SectionSpec[] = [
  {
    id: "cover",
    title: "Cover",
    purpose: "Hero page with title, personalized subtitle, and kicker paragraph.",
    required: true,
    kind: "default",
  },
  {
    id: "toc",
    title: "What's Inside",
    purpose: "Table of contents — skip for short documents (<5 content sections).",
    required: false,
    kind: "default",
  },
  {
    id: "situation",
    title: "The Situation",
    purpose:
      "Why this topic matters to THIS specific client — weave in their state, age, occupation, assets, goals, and notes. This is the personalization anchor.",
    required: true,
    kind: "default",
  },
  {
    id: "concept",
    title: "The Concept",
    purpose:
      "Core explanation of the topic the advisor requested. Plain-language, compliance-aware.",
    required: true,
    kind: "default",
  },
  {
    id: "tradeoffs",
    title: "Tradeoffs",
    purpose:
      "Alternatives, downsides, and risks. A comparison_ledger block is encouraged.",
    required: false,
    kind: "default",
  },
  {
    id: "numbers",
    title: "The Numbers",
    purpose:
      "Worked example using the client's actual figures. Skip if the topic is purely conceptual.",
    required: false,
    kind: "default",
  },
  {
    id: "case_study",
    title: "Case Study",
    purpose: "Narrative illustration — 'someone like the client'.",
    required: false,
    kind: "default",
  },
  {
    id: "next_step",
    title: "Your Next Step",
    purpose: "Call to action, advisor contact, disclosure.",
    required: true,
    kind: "default",
  },
];

export const REQUIRED_SECTION_IDS = DEFAULT_SECTIONS.filter((s) => s.required).map(
  (s) => s.id,
);

export function getSectionSpec(id: string): SectionSpec | undefined {
  return DEFAULT_SECTIONS.find((s) => s.id === id);
}
