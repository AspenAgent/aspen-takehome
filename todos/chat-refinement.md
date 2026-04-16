# Threaded chat refinement

## Problem

The current refinement bar takes a single instruction, generates a new plan,
and replaces the one on screen. There is no notion of history — the
advisor can't compare "before" and "after", can't step back one revision,
and can't branch ("what would this look like with a warmer palette AND a
different tradeoffs framing?").

Advisors coming from tools like Jasper, Copy.ai, and Grammarly expect a
thread: say something, see the change, respond, iterate.

## Why not MVP

- The single-shot refinement already exercises the same code path a
  threaded chat would; the only new work is UI and persistence.
- The eval story ("did refinement work?") is clearer with a single turn.
- A chat UI is deceptively expensive: diff view, per-turn loading, branch
  selection, keyboard shortcuts — real polish takes days, not hours.

## Sketch

Data model:
- `Conversation { id, clientId, advisorId, createdAt }`
- `Turn { id, conversationId, planId, paletteId, promptOrInstruction, createdAt }`
- `DocumentPlan.refinedFrom` already exists — use it to walk back the chain.

API:
- `POST /api/conversations` → seeds a conversation, delegates first turn to
  `runGenerate`.
- `POST /api/conversations/:id/turns` → runs `runRefine`, appends a Turn.
- Both use the existing SSE stream shape.

UI:
- Left sidebar: list of turns with small thumbnail of the PDF cover.
- Right pane: current PDF preview + refine bar.
- "Compare with" dropdown: pick any prior turn, renders a side-by-side
  with highlighted section diffs (use the Zod schema to traverse).

## Existing seams that make it small

- `DocumentPlan.refinedFrom` already threads the chain.
- `Palette.revisions[]` already has the prompt history at the palette level.
- `useAgentStream` already handles SSE — it just needs to be instanceable
  per conversation tab.
- The `/print/[planId]` route doesn't care whether a plan was generated
  fresh or refined; rendering is the same.
