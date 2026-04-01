/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from "next/server";
import { generateContent } from "@/lib/claude";
import { generatePDF } from "@/lib/pdf";

export async function POST(request: NextRequest) {
  // TODO: Call generateContent and generatePDF, return the PDF
  // - Parse the prompt from the request body
  // - Validate the input
  // - Call generateContent with the prompt
  // - Pass the result to generatePDF
  // - Return the PDF as a Response with appropriate headers
  // - Handle errors gracefully with user-friendly messages
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
