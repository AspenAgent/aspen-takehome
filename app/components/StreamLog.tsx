"use client";

import type { AgentEvent } from "@/lib/agent/schemas";

/**
 * Timeline of agent events, grouped by phase. Structured so the advisor can
 * see *what* the agent did, not just a spinner.
 */
export function StreamLog({
  events,
  loading,
}: {
  events: AgentEvent[];
  loading: boolean;
}) {
  if (events.length === 0 && !loading) return null;

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        Agent timeline
      </h3>
      <ol className="space-y-2 text-sm">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
            <EventLine event={e} />
          </li>
        ))}
        {loading && (
          <li className="flex gap-3 items-start text-gray-400 italic">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 animate-pulse" />
            working…
          </li>
        )}
      </ol>
    </div>
  );
}

function EventLine({ event }: { event: AgentEvent }) {
  switch (event.type) {
    case "status":
      return (
        <span className="text-gray-700">
          <span className="font-mono text-xs uppercase tracking-wider text-gray-400 mr-2">
            {event.phase}
          </span>
          {event.message}
        </span>
      );
    case "plan_proposed":
      return (
        <span className="text-gray-700">
          <span className="font-medium">Planned {event.sections.length} sections</span>
          <span className="text-gray-500">
            {" "}
            · {event.queries.length} research{" "}
            {event.queries.length === 1 ? "query" : "queries"}
          </span>
        </span>
      );
    case "research_started":
      return (
        <span className="text-gray-600">
          Searching: {event.queries.map((q) => `"${q}"`).join(" · ")}
        </span>
      );
    case "research_result":
      return (
        <span className="text-gray-700">
          <span className="text-emerald-600">✓</span> &ldquo;{event.query}&rdquo; →{" "}
          {event.sourceCount} {event.sourceCount === 1 ? "source" : "sources"}
        </span>
      );
    case "palette_selecting":
      return (
        <span className="text-gray-600">
          {event.fromCache
            ? "Loaded palette from cache"
            : "Composing new palette…"}
        </span>
      );
    case "palette_ready":
      return (
        <span className="text-gray-700">
          Palette: <span className="font-medium">&ldquo;{event.palette.name}&rdquo;</span>{" "}
          <span className="text-gray-500">
            ({event.palette.typography.pairing} typography)
          </span>
        </span>
      );
    case "drafting_section":
      return <span className="text-gray-700">Drafting: {event.title}</span>;
    case "client_recognized":
      return (
        <span className="text-gray-700">
          Generating for{" "}
          <span className="font-medium">{event.clientName}</span>
        </span>
      );
    case "plan_ready":
      return (
        <span className="text-gray-700">
          Document ready · {event.plan.sections.length} sections
        </span>
      );
    case "rendering":
      return <span className="text-gray-600">Rendering PDF…</span>;
    case "pdf_ready":
      return (
        <span className="text-emerald-700 font-medium">PDF ready</span>
      );
    case "error":
      return (
        <span className={event.recoverable ? "text-amber-700" : "text-red-700"}>
          {event.recoverable ? "Warning: " : "Error: "}
          {event.message}
        </span>
      );
  }
}
