/**
 * Scaffold compatibility shim.
 *
 * The real Claude work lives in `lib/agent/*`. This file exists only so the
 * scaffold's imports don't break. Nothing in the app calls `generateContent`
 * — everything goes through the orchestrator at `lib/agent/orchestrator.ts`.
 */
export async function generateContent(_prompt: string): Promise<string> {
  throw new Error(
    "generateContent is a scaffold stub — call runGenerate from lib/agent/orchestrator.ts instead.",
  );
}
