# Curated imagery agent

## Problem

The document renderer supports photographic imagery (`image` block, 6 tags).
Today those tags resolve to static files under `public/imagery/` via a
manifest — someone has to pre-curate a stock library that matches the
palette of every document we generate.

That's wrong for two reasons:
- A generic "retirement" stock photo next to a "Manhattan Archive" palette
  with didone serifs looks incoherent.
- The current 6 tags are a lowest-common-denominator set; the drafter often
  wants imagery for a specific moment ("Susie sitting on her porch after the
  sale") that no static library covers.

## Why not MVP

- The pipeline already produces beautiful documents with gradient
  placeholders — imagery is additive, not load-bearing for the "does it
  look like the sample PDF?" bar.
- Image generation adds 3-10s of latency per image + real per-document cost.
- Stock library licensing is a distraction from the agent story.

## Sketch

Mirror the palette agent pattern exactly:

```
lib/agent/imagery.ts
  proposeImagery({ plan, palette, advisor, client }) → ImageryBundle
  ensureImagery(planId) → { bundle, fromCache }
```

`ImageryBundle` is a record of `{ tag → { src, alt, credit, providerJobId } }`.
Call it in Phase 2 alongside the palette agent (parallel, same cache-or-
propose logic). Add a `JsonImageryRepository` next to the palette one —
it writes to `data/imagery/<planId>.json` plus `public/imagery/<planId>/<tag>.jpg`.

The handler inside the "generate image" tool calls whichever provider we
pick (Flux, SDXL via Replicate, Google Imagen). Each prompt is built from
`(tag, palette.rationale, client.state, client.occupation)` so the imagery
inherits the palette's mood.

`resolveImage(tag, planId?)` gains a `planId` parameter and checks the
per-plan directory first, then falls back to the generic manifest.

## Existing seams that make it small

- `ImageTag` enum already fixes the vocabulary.
- `ImagePlaceholder` already handles the fallback case — if generation fails
  or times out, the document still renders cleanly.
- `PaletteRepository` + `paletteIdFor()` is a direct template for `ImageryRepository`.
- The orchestrator's Phase 2 is already structured as parallel sub-agents.
