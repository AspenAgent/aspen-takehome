"use client";

import { useCallback, useRef, useState } from "react";
import type { AgentEvent, DocumentPlan, Palette } from "@/lib/agent/schemas";

/**
 * Hook for running the generate or refine pipeline and collecting events.
 *
 * The API responds with `text/event-stream`; we read it as a plain fetch()
 * + ReadableStream.getReader() loop (not EventSource) so we can POST a JSON
 * body. Each `data: ...\n\n` frame is parsed into an AgentEvent; we fan the
 * events out to callers via `events` state and surface the terminal plan,
 * palette, and pdfBase64 as their own states for easy UI binding.
 */

export type UseAgentStreamResult = {
  events: AgentEvent[];
  plan: DocumentPlan | null;
  palette: Palette | null;
  pdfBase64: string | null;
  pdfFilename: string | null;
  planId: string | null;
  loading: boolean;
  error: string | null;
  start: (endpoint: string, body: unknown) => Promise<void>;
  reset: () => void;
};

export function useAgentStream(): UseAgentStreamResult {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [plan, setPlan] = useState<DocumentPlan | null>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setEvents([]);
    setPlan(null);
    setPalette(null);
    setPdfBase64(null);
    setPdfFilename(null);
    setPlanId(null);
    setError(null);
    setLoading(false);
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const start = useCallback(async (endpoint: string, body: unknown) => {
    reset();
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `${endpoint} failed with ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Frames are separated by a blank line.
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const line = frame.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const payload = line.slice(6); // strip "data: "
          try {
            const event = JSON.parse(payload) as AgentEvent;
            setEvents((prev) => [...prev, event]);
            switch (event.type) {
              case "palette_ready":
                setPalette(event.palette);
                break;
              case "plan_ready":
                setPlan(event.plan);
                break;
              case "pdf_ready":
                setPdfBase64(event.pdfBase64);
                setPdfFilename(event.filename);
                setPlanId(event.planId);
                break;
              case "error":
                if (!event.recoverable) setError(event.message);
                break;
            }
          } catch (e) {
            console.error("bad SSE frame", payload, e);
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [reset]);

  return {
    events,
    plan,
    palette,
    pdfBase64,
    pdfFilename,
    planId,
    loading,
    error,
    start,
    reset,
  };
}
