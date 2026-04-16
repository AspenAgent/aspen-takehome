/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from "next/server";
import { generateContent } from "@/lib/claude";
import { generatePDF } from "@/lib/pdf";

export async function POST(request: NextRequest) {
  console.log("Received request to /api/generate",request.body);
  //First call generateContent to get the content for the PDF, then pass that content to generatePDF to get the PDF as an ArrayBuffer. Finally, return the PDF in the response with appropriate headers for downloading.
  const { prompt } = await request.json();
  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }
  try {
    const content = await generateContent(prompt);

    const pdf = await generatePDF(content);
    console.log("Generated PDF of size:", pdf.byteLength);
    return new Response(pdf, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="report.pdf"',
  },
});
  } catch (error) {
    return Response.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}