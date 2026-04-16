"use client";

import { useState, useEffect, useCallback } from "react";
import { contact } from "@/data/contact";

const PROGRESS_MESSAGES = [
  "Analyzing client profile...",
  "Researching financial strategies...",
  "Crafting personalized content...",
  "Writing section narratives...",
  "Building visual components...",
  "Designing page layouts...",
  "Assembling your document...",
  "Applying brand styling...",
  "Rendering PDF pages...",
  "Finalizing document...",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);

  // Cycle through progress messages every 3 seconds while loading
  useEffect(() => {
    if (!loading) return;
    setProgressIndex(0);
    const interval = setInterval(() => {
      setProgressIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = useCallback(async () => {
    const currentPrompt = prompt;
    setLoading(true);
    setError("");
    setSuccess(false);
    setPrompt("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      // Extract filename from Content-Disposition header or fall back to default
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+?)"/);
      const filename = filenameMatch?.[1] || "aspen-document.pdf";

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPrompt(currentPrompt);
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[72px] bg-[#0f1117] flex flex-col items-center py-5 gap-7">
        <div className="text-white font-bold text-sm tracking-widest mt-1">
          A
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#2563eb]/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-[#2563eb]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-[#f8f9fb]">
        {/* Top bar */}
        <header className="h-[68px] border-b border-gray-200 bg-white flex items-center px-8 justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#0f1117] font-semibold text-xl tracking-wide">
              aspen
            </span>
            <span className="text-gray-300 text-xl">|</span>
            <span className="text-gray-500 text-lg">Document Generator</span>
          </div>
        </header>

        {/* Workspace */}
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Client context card */}
          <div className="bg-white rounded-xl border border-gray-200 p-7 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-full bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] font-semibold text-lg" style={{ width: 52, height: 52 }}>
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-900">
                    {contact.name}
                  </div>
                  <div className="text-base text-gray-500">
                    {contact.occupation} · Age {contact.age} · {contact.state}
                  </div>
                </div>
              </div>
              <span className="text-base text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg font-medium">
                {contact.investableAssets}
              </span>
            </div>
            <div className="text-base text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-700">Goals:</span>{" "}
              {contact.goals}
            </div>
            <div className="text-base text-gray-500 leading-relaxed mt-1.5">
              <span className="font-medium text-gray-700">Notes:</span>{" "}
              {contact.notes}
            </div>
          </div>

          {/* Prompt input */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <label
              htmlFor="prompt"
              className="block text-lg font-medium text-gray-700 mb-3"
            >
              What would you like to create for {contact.name.split(" ")[0]}?
            </label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
              placeholder="e.g. Create a PDF explaining a deferred sales trust and how it could help with her recent property sale"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />

            {/* Loading state with rotating messages */}
            {loading && (
              <div className="mt-5 flex flex-col items-center py-6">
                <div className="relative w-12 h-12 mb-4">
                  <svg
                    className="animate-spin w-12 h-12 text-[#2563eb]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-20"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
                <p
                  key={progressIndex}
                  className="text-base font-medium text-gray-700 animate-fade-in"
                >
                  {PROGRESS_MESSAGES[progressIndex]}
                </p>
                <div className="flex gap-1.5 mt-3">
                  {PROGRESS_MESSAGES.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        i <= progressIndex ? "bg-[#2563eb]" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Generation failed
                    </p>
                    <p className="text-sm text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Success state */}
            {success && !loading && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      PDF generated successfully
                    </p>
                    <p className="text-sm text-green-600 mt-0.5">
                      Your document has been downloaded. Check your downloads
                      folder.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-green-400 hover:text-green-600 transition-colors flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="mt-5 w-full rounded-lg bg-[#2563eb] px-5 py-3.5 text-lg font-medium text-white hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
