/* eslint-disable @typescript-eslint/no-unused-vars */
import Anthropic from "@anthropic-ai/sdk";
import { contact } from "@/data/contact";
import { advisor } from "@/data/advisor";

export async function generateContent(prompt: string): Promise<string> {
  console.log("Generating content with prompt:", prompt);
  const client = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"]
});
console.log("Initialized Anthropic client");
console.log('Using API key:', process.env["ANTHROPIC_API_KEY"] ? "Yes" : "No");
const contactString = Object.entries(contact)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n");

const advisorString = Object.entries(advisor)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n");

const standardMessage = `${prompt}\n\nClient information:\n${contactString}\n\nAdvisor information:\n${advisorString}\n\nUse the above information to generate a detailed financial report for the client.`;
const message = await client.messages.create({
  max_tokens: 1000,
  messages: [{ role: "user", content: standardMessage }],
  model: "claude-sonnet-4-6"
});

const block = message.content.find((b): b is Anthropic.Messages.TextBlock => b.type === "text");
return block?.text ?? "";
}
