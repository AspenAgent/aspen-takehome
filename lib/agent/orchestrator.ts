import { randomUUID } from "node:crypto";
import type { Advisor, Client, Palette } from "@/lib/agent/schemas";
import { clients, advisors } from "@/lib/data/repositories";
import { ensurePalette, refinePalette } from "@/lib/agent/palette";
import { planResearch, runResearch } from "@/lib/agent/research";
import { draftDocument } from "@/lib/agent/drafter";
import { renderPlanToPdf } from "@/lib/pdf/render";
import { putPlan } from "@/lib/pdf/cache";
import type { EmitFn } from "@/lib/agent/events";

/**
 * End-to-end generate pipeline. 4 phases, emitting structured events as it
 * goes so the client can show progress without polling.
 *
 *   1. Research planner  → ResearchPlan       (Claude streamObject)
 *   2a. Research exec    → Finding[]          (Tavily, parallel)
 *   2b. Palette          → Palette            (cache or Claude)
 *   3. Drafter           → DocumentPlan       (Claude streamObject)
 *   4. Renderer          → PDF bytes          (puppeteer)
 *
 * Phase 2a and 2b run in parallel via Promise.all.
 */

export async function runGenerate(input: {
  advisorPrompt: string;
  clientId: string;
  advisorId: string;
  emit: EmitFn;
}): Promise<{ planId: string; pdfBase64: string; filename: string }> {
  const { advisorPrompt, clientId, advisorId, emit } = input;
  const [client, advisor]: [Client, Advisor] = await Promise.all([
    clients.get(clientId),
    advisors.get(advisorId),
  ]);

  emit({
    type: "client_recognized",
    clientId: client.id,
    clientName: client.name,
  });

  // Phase 1 — research planner
  emit({
    type: "status",
    phase: "planning",
    message: `Planning research for ${client.name}…`,
  });
  const researchPlan = await planResearch({ advisorPrompt, advisor, client });
  emit({
    type: "plan_proposed",
    sections: [
      ...researchPlan.keptDefaultSections.map((id) => ({
        title: id,
        kind: "default" as const,
      })),
      ...researchPlan.addedCustomSections.map((s) => ({
        title: s.title,
        kind: "custom" as const,
      })),
    ],
    queries: researchPlan.researchQueries.map((q) => q.query),
  });

  // Phase 2a + 2b in parallel
  emit({
    type: "status",
    phase: "research",
    message: "Searching the web for personalization inputs…",
  });
  emit({
    type: "research_started",
    queries: researchPlan.researchQueries.map((q) => q.query),
  });

  const [findings, paletteResult] = await Promise.all([
    runResearch(researchPlan, (p) => {
      if (p.type === "result") {
        emit({
          type: "research_result",
          query: p.query,
          sourceCount: p.sourceCount ?? 0,
        });
      } else if (p.type === "failed") {
        emit({
          type: "error",
          message: `Search failed for "${p.query}": ${p.error ?? "unknown"}`,
          recoverable: true,
        });
      }
    }),
    (async () => {
      emit({
        type: "status",
        phase: "palette",
        message: `Selecting brand palette for ${advisor.firm} × ${client.name}…`,
      });
      const result = await ensurePalette({ advisor, client });
      emit({ type: "palette_selecting", fromCache: result.fromCache });
      emit({ type: "palette_ready", palette: result.palette });
      return result;
    })(),
  ]);

  // Phase 3 — drafter (outline-then-fill; events fire per section as they resolve)
  emit({
    type: "status",
    phase: "drafting",
    message: "Writing the document…",
  });
  const planId = randomUUID();
  const plan = await draftDocument({
    advisorPrompt,
    advisor,
    client,
    researchPlan,
    findings,
    palette: paletteResult.palette,
    planId,
    onSectionComplete: (section) => {
      emit({ type: "drafting_section", title: section.title });
    },
  });
  emit({ type: "plan_ready", plan });

  // Phase 4 — render
  putPlan(plan.id, plan, paletteResult.palette);
  emit({ type: "status", phase: "rendering", message: "Rendering the PDF…" });
  emit({ type: "rendering" });

  const pdf = await renderPlanToPdf(plan.id);
  const pdfBase64 = Buffer.from(pdf).toString("base64");
  const filename = `aspen-${client.name.toLowerCase().replace(/\s+/g, "-")}-${plan.id.slice(0, 8)}.pdf`;

  emit({ type: "pdf_ready", planId: plan.id, pdfBase64, filename });
  return { planId: plan.id, pdfBase64, filename };
}

/**
 * Refinement pipeline. Accepts a prior plan + palette and an advisor
 * instruction. Currently this always re-runs the drafter (and optionally
 * the palette agent) — it doesn't try to route "palette change vs document
 * change" through a tool-calling agent. That routing lives in the refine
 * API route, which decides whether to call `refinePalette` before the redraft.
 */
export async function runRefine(input: {
  advisorInstruction: string;
  refinePalette: boolean;
  refineDocument: boolean;
  previousPlanId: string;
  previousPlan: Parameters<typeof draftDocument>[0] extends infer _
    ? Parameters<typeof putPlan>[1]
    : never;
  previousPalette: Palette;
  clientId: string;
  advisorId: string;
  emit: EmitFn;
}) {
  const {
    advisorInstruction,
    refinePalette: shouldRefinePalette,
    refineDocument: shouldRefineDocument,
    previousPlanId,
    previousPlan,
    previousPalette,
    clientId,
    advisorId,
    emit,
  } = input;

  const [client, advisor] = await Promise.all([
    clients.get(clientId),
    advisors.get(advisorId),
  ]);

  let palette = previousPalette;
  if (shouldRefinePalette) {
    emit({
      type: "status",
      phase: "palette",
      message: "Revising the palette…",
    });
    palette = await refinePalette({
      advisor,
      client,
      advisorFeedback: advisorInstruction,
    });
    emit({ type: "palette_ready", palette });
  }

  let plan = previousPlan;
  if (shouldRefineDocument) {
    emit({
      type: "status",
      phase: "drafting",
      message: "Redrafting with your feedback…",
    });
    const planId = randomUUID();
    plan = await draftDocument({
      advisorPrompt: `Refinement request: ${advisorInstruction}\n\nOriginal prompt context: document for ${client.name}. Adjust the prior draft according to the refinement request.`,
      advisor,
      client,
      researchPlan: {
        keptDefaultSections: previousPlan.sections
          .filter((s) => s.kind === "default")
          .map((s) => s.id),
        addedCustomSections: previousPlan.sections
          .filter((s) => s.kind === "custom")
          .map((s) => ({
            id: s.id,
            title: s.title,
            purpose: `Custom section carried over from the prior draft: "${s.title}".`,
            required: false,
            kind: "custom",
          })),
        researchQueries: [
          {
            query: `(refinement of plan ${previousPlanId})`,
            rationale: "no new research required for refinement",
            profileFields: [],
          },
        ],
      },
      findings: previousPlan.sources,
      palette,
      planId,
      refinedFrom: previousPlanId,
      onSectionComplete: (section) => {
        emit({ type: "drafting_section", title: section.title });
      },
    });
    emit({ type: "plan_ready", plan });
  }

  putPlan(plan.id, plan, palette);
  emit({ type: "rendering" });
  const pdf = await renderPlanToPdf(plan.id);
  const pdfBase64 = Buffer.from(pdf).toString("base64");
  const filename = `aspen-${client.name.toLowerCase().replace(/\s+/g, "-")}-${plan.id.slice(0, 8)}.pdf`;
  emit({ type: "pdf_ready", planId: plan.id, pdfBase64, filename });
  return { plan, palette };
}
