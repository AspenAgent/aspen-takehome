import { NextRequest } from "next/server";
import { generateContent } from "@/lib/claude";
import { generatePDF } from "@/lib/pdf";
import { contact } from "@/data/contact";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 2000;

function sanitizeFilename(raw: string): string {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const client = `${contact.name.first}-${contact.name.last}`.toLowerCase();
  return `${client}-${slug || "document"}.pdf`;
}

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const prompt = (body as { prompt?: unknown })?.prompt;
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return jsonError("Missing or empty 'prompt' field.", 400);
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonError(`Prompt exceeds ${MAX_PROMPT_LENGTH} characters.`, 400);
  }

  let contentJson: string;
  try {
    contentJson = await generateContent(prompt);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Content generation failed.";
    const status = /API key|ANTHROPIC_API_KEY/i.test(message) ? 500 : 502;
    return jsonError(message, status);
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generatePDF(contentJson);
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generation failed.";
    return jsonError(message, 500);
  }

  const title = (() => {
    try {
      const parsed = JSON.parse(contentJson) as { title?: string };
      return parsed.title ?? prompt;
    } catch {
      return prompt;
    }
  })();

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdfBuffer.length),
      "Content-Disposition": `attachment; filename="${sanitizeFilename(title)}"`,
      "Cache-Control": "no-store",
    },
  });
}
