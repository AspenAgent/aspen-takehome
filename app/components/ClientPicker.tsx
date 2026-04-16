"use client";

import type { Client } from "@/lib/agent/schemas";

/**
 * Shown when intake can't confidently resolve the advisor's prompt to a
 * single client — either nothing matched, or two roster clients share the
 * signal (e.g. same first name). The advisor picks one and generation
 * proceeds with the chosen id pinned.
 */
export function ClientPicker({
  reason,
  candidates,
  disabled,
  onPick,
  onCancel,
}: {
  reason: string;
  candidates: Client[];
  disabled: boolean;
  onPick: (clientId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
      <h3 className="text-sm font-semibold text-amber-900">
        Which client is this for?
      </h3>
      <p className="mt-1 text-sm text-amber-800">{reason}</p>

      <ul className="mt-4 space-y-2">
        {candidates.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onPick(c.id)}
              disabled={disabled}
              className="w-full rounded-md border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-gray-900">
                  {c.name}
                </span>
                <span className="text-xs text-gray-500">
                  {c.age} · {c.state}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-600">{c.occupation}</div>
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={onCancel}
        disabled={disabled}
        className="mt-4 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
