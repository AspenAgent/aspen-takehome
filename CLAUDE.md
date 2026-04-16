# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — run built app
- `npm run lint` — Next.js ESLint

No test framework. Required env in `.env.local` (copy from `.env.local.example`):
- `ANTHROPIC_API_KEY` — required, drives all `generateObject` calls
- `TAVILY_API_KEY` — optional; missing key makes research a no-op but the pipeline still completes
- `DATA_BACKEND` — `json` (default) or `supabase` (unwired)

## Architecture

Next.js 14 App Router + TypeScript + Tailwind. `@/*` resolves to the repo root. Puppeteer renders PDFs by loading a live `/print/[planId]` route in Chromium — there is no PDF library.

### Request flow

```
POST /api/generate { prompt, clientId, advisorId }
  → runGenerate() (lib/agent/orchestrator.ts)
      Phase 1: planResearch()   → ResearchPlan        (temp 0.2)
      Phase 2: Promise.all([
                 runResearch()  → Finding[]           (Tavily)
                 ensurePalette()→ Palette             (temp 0.7, cached by advisorId:clientId)
               ])
      Phase 3: draftDocument()  → DocumentPlan        (temp 0)
      Phase 4: putPlan(); renderPlanToPdf()
  → SSE stream of AgentEvent frames, terminal `pdf_ready` carries base64 PDF
```

`POST /api/refine` routes the instruction through a small LLM classifier (temp 0) into `{refinePalette, refineDocument}`, with a keyword heuristic fallback. It re-uses the same event schema and emits a new plan whose `refinedFrom` chains to the prior plan.

`GET /api/pdf/[planId]` is a bypass for the cached plan → puppeteer path; the UI normally consumes the base64 blob from the stream.

### Key seams

- **Zod schemas are the contract** (`lib/agent/schemas.ts`). Every `generateObject` call validates output against one of `ResearchPlanSchema`, `DocumentPlanSchema`, `PaletteSchema`. Validation failure = hard error.
- **Tool registry** (`lib/agent/tools/`) holds `ToolDefinition<I, O>` entries. Schema-only tools (palette, render-document) are invoked via `generateObject`; handler-bearing tools (research-web) are called directly. See `lib/agent/tools/README.md` for the 3-step recipe.
- **Repository pattern** (`lib/data/repositories/`) has JSON impls active and Supabase impls that throw. Switch via `DATA_BACKEND`. Palette cache lives at `data/palettes.json` keyed on `advisorId:clientId`.
- **Prompts are isolated** in `lib/agent/prompts/*.ts` — one file per phase. Temperature and model live with the caller, not the prompt.
- **Plan cache** (`lib/pdf/cache.ts`) is an in-memory `Map` with a 5-minute TTL. The orchestrator `putPlan`s before calling puppeteer; `/print/[planId]` reads it server-side.
- **Palette as CSS vars + next/font pairings** drives the whole print route. `app/print/[planId]/page.tsx` injects the 9 palette tokens as CSS variables on `<html>` and selects one of 4 `next/font/google` pairings (`heritage`/`modern`/`warm`/`classic`). A `?pairing=` query param overrides for comparison renders.
- **SSE without `EventSource`** — `app/components/useAgentStream.ts` POSTs JSON and reads the `ReadableStream`, splitting on `\n\n`. `lib/agent/events.ts` provides `createSseStream()` on the server side.

### Domain data

- `data/advisor.ts` — advisor identity + required disclosure (surface on closing page).
- `data/contact.ts` — Susie Hartman's profile. Personalization is an evaluation criterion; draft content must reference state/age/assets/goals/notes specifically.
- `data/palettes.json` — grows on first generation per `(advisor, client)` pair.

### Print route primitives

`app/print/[planId]/components/` has `Cover`, `TableOfContents`, `Section`, `Closing`, `PageChrome`, plus block-level components under `blocks/` (`Paragraph`, `StatCards`, `IconTileGrid`, `NumberedInsights`, `ComparisonLedger`, `PullQuote`, `Callout`, `ImagePlaceholder`). The drafter picks block types per section; adding a new block requires a schema variant in `Section.blocks` discriminated union plus a React component.

Imagery is optional: `public/imagery/manifest.json` lists 6 tags. `lib/imagery.ts::resolveImage()` checks file existence at request time; missing files fall back to a gradient placeholder.

## Design bar

`public/sample-output.pdf` is the reference. Before claiming a render task done, load `/print/mock-plan-id` (mock plan seeded in `app/print/[planId]/mock-data.ts`) and compare against the sample. The layout must survive palette and pairing swaps without hardcoded colors or fonts leaking into components.

## Future work

See `todos/` — each file follows Problem / Why not MVP / Sketch / Existing seams, and describes an extension the current architecture was designed to accommodate (curated imagery agent, threaded chat refinement, topic-grounded research, multi-advisor brands, Supabase backend).
