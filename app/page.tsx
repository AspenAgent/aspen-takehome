"use client";

import { useState } from "react";

const EXAMPLE_PROMPTS = [
  "Create a PDF for Susie explaining a deferred sales trust",
  "Walk Susie through charitable remainder trust options",
  "Brief Susie on 529 plans for her future grandchildren",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {
          // fall through with the generic message
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "client-document.pdf";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Aspen</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate a personalized PDF for your client
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            What would you like to create?
          </label>
          <textarea
            id="prompt"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="e.g. Create a PDF for Susie explaining a deferred sales trust"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {example}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate PDF"}
          </button>

          {loading && (
            <p className="mt-3 text-xs text-gray-500 text-center">
              Drafting content and composing the PDF. This takes about 15–30 seconds.
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          PDFs are generated per request and downloaded to your device. No copies are stored.
        </p>
      </div>
    </div>
  );
}
