export function validatePrompt(prompt: unknown): string | null {
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return "Please provide a prompt describing the document you'd like to create.";
  }
  if (prompt.trim().length < 10) {
    return "Please provide a more descriptive prompt (at least 10 characters) so we can generate a high-quality document.";
  }
  return null;
}
