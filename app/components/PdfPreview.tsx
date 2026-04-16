"use client";

import { useMemo } from "react";

export function PdfPreview({
  pdfBase64,
  filename,
}: {
  pdfBase64: string;
  filename: string;
}) {
  const blobUrl = useMemo(() => {
    const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }, [pdfBase64]);

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-900">Preview</span>
        <a
          href={blobUrl}
          download={filename}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Download PDF
        </a>
      </div>
      <iframe
        src={blobUrl}
        title="PDF preview"
        className="w-full"
        style={{ height: "80vh", border: 0, background: "#e5e5e5" }}
      />
    </div>
  );
}
