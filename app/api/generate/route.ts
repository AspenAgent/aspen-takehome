import { NextRequest } from "next/server";
import { generateContent } from "@/lib/claude";
import { generatePDF } from "@/lib/pdf";
import { contact } from "@/data/contact";
import { validatePrompt } from "@/lib/validation";

function buildFilename(title: string): string {
  const clientName = contact.name.replace(/\s+/g, "-");
  const docTitle = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 40);
  return `${clientName}-${docTitle}.pdf`.toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body?.prompt;

    const validationError = validatePrompt(prompt);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const content = await generateContent(prompt.trim());
    const pdfBuffer = await generatePDF(content);
    const filename = buildFilename(content.title);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Document-Title": content.title,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
