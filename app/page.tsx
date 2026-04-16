"use client";

import { useState } from "react";
import { useAgentStream } from "./components/useAgentStream";
import { StreamLog } from "./components/StreamLog";
import { PaletteChips } from "./components/PaletteChips";
import { PdfPreview } from "./components/PdfPreview";
import { RefineBar } from "./components/RefineBar";
import { ClientPicker } from "./components/ClientPicker";
import type { Client } from "@/lib/agent/schemas";

const EXAMPLE_PROMPT =
  "Create a personalized investment document for Susie about deferred sales trusts. Include a section about how capital gains deferral applies to her recent rental sale.";

type IntakeResponse =
  | { kind: "resolved"; clientId: string; clientName: string; reason: string }
  | { kind: "needs_choice"; candidates: Client[]; reason: string }
  | { error: string };

type IntakeState =
  | { kind: "idle" }
  | { kind: "resolving" }
  | { kind: "asking"; candidates: Client[]; reason: string; prompt: string };

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [intakeState, setIntakeState] = useState<IntakeState>({ kind: "idle" });
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const agent = useAgentStream();

  async function runGenerateWithClient(
    advisorPrompt: string,
    clientId: string,
  ) {
    await agent.start("/api/generate", { prompt: advisorPrompt, clientId });
  }

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setIntakeError(null);
    setIntakeState({ kind: "resolving" });

    let data: IntakeResponse;
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      data = (await res.json()) as IntakeResponse;
      if (!res.ok) {
        throw new Error(
          "error" in data ? data.error : `intake failed (${res.status})`,
        );
      }
    } catch (err) {
      setIntakeState({ kind: "idle" });
      setIntakeError(err instanceof Error ? err.message : "intake failed");
      return;
    }

    if ("error" in data) {
      setIntakeState({ kind: "idle" });
      setIntakeError(data.error);
      return;
    }

    if (data.kind === "resolved") {
      setIntakeState({ kind: "idle" });
      await runGenerateWithClient(trimmed, data.clientId);
      return;
    }

    setIntakeState({
      kind: "asking",
      candidates: data.candidates,
      reason: data.reason,
      prompt: trimmed,
    });
  }

  async function handlePickClient(clientId: string) {
    if (intakeState.kind !== "asking") return;
    const { prompt: pinnedPrompt } = intakeState;
    setIntakeState({ kind: "idle" });
    await runGenerateWithClient(pinnedPrompt, clientId);
  }

  function handleCancelPicker() {
    setIntakeState({ kind: "idle" });
  }

  async function handleRefine(instruction: string) {
    if (!agent.plan || !agent.palette) return;
    await agent.start("/api/refine", {
      instruction,
      previousPlan: agent.plan,
      previousPalette: agent.palette,
    });
  }

  const submitDisabled =
    agent.loading ||
    intakeState.kind === "resolving" ||
    intakeState.kind === "asking" ||
    !prompt.trim();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Aspen</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate a personalized, branded PDF for your client
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            What would you like to create?
          </label>
          <textarea
            id="prompt"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={EXAMPLE_PROMPT}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={agent.loading || intakeState.kind !== "idle"}
          />

          {(agent.error || intakeError) && (
            <p className="mt-3 text-sm text-red-600">
              {agent.error ?? intakeError}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={submitDisabled}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {intakeState.kind === "resolving"
                ? "Identifying client…"
                : agent.loading
                  ? "Generating…"
                  : "Generate PDF"}
            </button>
            {!agent.loading &&
              intakeState.kind === "idle" &&
              prompt.trim().length === 0 && (
                <button
                  onClick={() => setPrompt(EXAMPLE_PROMPT)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Use example prompt
                </button>
              )}
          </div>
        </div>

        {intakeState.kind === "asking" && (
          <ClientPicker
            reason={intakeState.reason}
            candidates={intakeState.candidates}
            disabled={agent.loading}
            onPick={handlePickClient}
            onCancel={handleCancelPicker}
          />
        )}

        <StreamLog events={agent.events} loading={agent.loading} />

        {agent.palette && <PaletteChips palette={agent.palette} />}

        {agent.pdfBase64 && agent.pdfFilename && (
          <>
            <PdfPreview
              pdfBase64={agent.pdfBase64}
              filename={agent.pdfFilename}
            />
            <RefineBar disabled={agent.loading} onRefine={handleRefine} />
          </>
        )}
      </div>
    </div>
  );
}
