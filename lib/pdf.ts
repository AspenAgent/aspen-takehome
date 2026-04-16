/**
 * Scaffold compatibility shim.
 *
 * The real renderer lives at `lib/pdf/render.ts` and takes a planId because
 * rendering round-trips through a React /print route. The original stub took
 * a content string; callers in this codebase go through the orchestrator and
 * never call this directly. Kept only so the scaffold import path doesn't
 * break for anything reading the README verbatim.
 */
export { renderPlanToPdf as generatePDF } from "@/lib/pdf/render";
