/* eslint-disable @typescript-eslint/no-unused-vars */
import Anthropic from "@anthropic-ai/sdk";
import { contact } from "@/data/contact";
import { advisor } from "@/data/advisor";

export async function generateContent(prompt: string): Promise<string> {
  // TODO: Call the Anthropic Claude API here
  // - Use the claude-sonnet-4-20250514 model with max_tokens: 1000
  // - Build a system prompt that instructs Claude to act as a financial content assistant
  // - Include the advisor's prompt, Susie's full contact profile, and personalization instructions
  // - Instruct Claude to return structured content with clear section headers, key callouts,
  //   and a recommended next step — formatted so it maps cleanly to a multi-page PDF layout
  //   (cover page, content sections, closing page)
  // - Return the generated text content
  throw new Error("Not implemented");
}
