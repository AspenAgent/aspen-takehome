import type { AgentEvent } from "@/lib/agent/schemas";

/**
 * Tiny SSE helper. `emit(event)` writes one `data: ...\n\n` frame to the
 * ReadableStreamDefaultController, JSON-encoding the payload.
 *
 * We keep this deliberately dumb: no queue, no backpressure signal, no
 * heartbeat. Next.js/Node handles the transport and the client reader is a
 * simple fetch() -> ReadableStream loop. If a frame is dropped, the pipeline
 * still completes end-to-end (the final pdf_ready event carries everything
 * the UI needs to render).
 */

export type EmitFn = (event: AgentEvent) => void;

export function createSseStream(): {
  stream: ReadableStream<Uint8Array>;
  emit: EmitFn;
  close: () => void;
  fail: (err: unknown) => void;
} {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });

  const emit: EmitFn = (event) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };
  const close = () => {
    try {
      controller.close();
    } catch {
      /* already closed */
    }
  };
  const fail = (err: unknown) => {
    const message = err instanceof Error ? err.message : "unknown error";
    emit({ type: "error", message, recoverable: false });
    close();
  };

  return { stream, emit, close, fail };
}
