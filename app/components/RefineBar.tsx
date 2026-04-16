"use client";

import { useState } from "react";

export function RefineBar({
  disabled,
  onRefine,
}: {
  disabled: boolean;
  onRefine: (instruction: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Refine: e.g. 'shorter tradeoffs section', 'try warmer colors'"
          disabled={disabled}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled && text.trim()) {
              onRefine(text.trim());
              setText("");
            }
          }}
        />
        <button
          onClick={() => {
            if (text.trim()) {
              onRefine(text.trim());
              setText("");
            }
          }}
          disabled={disabled || !text.trim()}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Refine
        </button>
      </div>
    </div>
  );
}
