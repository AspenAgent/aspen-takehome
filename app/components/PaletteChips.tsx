"use client";

import type { Palette } from "@/lib/agent/schemas";

export function PaletteChips({ palette }: { palette: Palette }) {
  const order: Array<{ key: keyof Palette["tokens"]; label: string }> = [
    { key: "backgroundDeep", label: "Deep" },
    { key: "backgroundSurface", label: "Surface" },
    { key: "backgroundAccent", label: "Accent bg" },
    { key: "accentPrimary", label: "Primary" },
    { key: "accentSecondary", label: "Secondary" },
    { key: "accentDanger", label: "Danger" },
    { key: "textOnDeep", label: "Text/deep" },
    { key: "textOnSurface", label: "Text/surface" },
    { key: "textSubtle", label: "Text subtle" },
  ];

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {palette.name}
        </h3>
        <span className="text-xs text-gray-500">
          {palette.typography.pairing} typography
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-600 italic">
        {palette.rationale}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {order.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded border border-gray-200 shrink-0"
              style={{ background: palette.tokens[key] }}
              title={palette.tokens[key]}
            />
            <div className="text-xs text-gray-600 truncate">
              {label}
              <div className="font-mono text-[10px] text-gray-400">
                {palette.tokens[key]}
              </div>
            </div>
          </div>
        ))}
      </div>
      {palette.revisions.length > 0 && (
        <div className="mt-3 text-[11px] text-gray-500">
          {palette.revisions.length} revision
          {palette.revisions.length === 1 ? "" : "s"}:{" "}
          {palette.revisions.slice(-1)[0]?.prompt}
        </div>
      )}
    </div>
  );
}
