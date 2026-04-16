import { NextResponse } from "next/server";
import { PdfRenderError, renderPlanToPdf } from "@/lib/pdf/render";
import { getPlan } from "@/lib/pdf/cache";

/**
 * GET /api/pdf/[planId]
 *
 * Renders the matching /print/[planId] page to PDF and streams the bytes back.
 * Called by the orchestrator at the end of the generate pipeline; also handy
 * for direct links during dev (e.g. /api/pdf/mock).
 */

export const runtime = "nodejs"; // puppeteer requires node, not edge
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { planId: string } },
) {
  const planId = params.planId;

  // Guard: the print route also gates on cache presence, but checking here
  // saves a puppeteer launch for a known-404 plan.
  if (planId !== "mock" && !getPlan(planId)) {
    return NextResponse.json(
      { error: `No plan in cache for id "${planId}"` },
      { status: 404 },
    );
  }

  try {
    const pdf = await renderPlanToPdf(planId);
    const body = new Uint8Array(pdf);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(body.byteLength),
        "Content-Disposition": `inline; filename="aspen-plan-${planId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof PdfRenderError
        ? err.message
        : err instanceof Error
          ? err.message
          : "PDF render failed";
    console.error("[api/pdf] render failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
