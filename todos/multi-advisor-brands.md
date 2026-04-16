# Multi-advisor brands

## Problem

The app hard-codes one advisor (James Whitfield, Whitfield Wealth Advisors).
In reality we'd onboard dozens of advisors, each with their own firm name,
phone, disclosure text — and, importantly, their own *brand defaults*
(logo, accent color preferences, typography lean).

Today every palette is generated fresh from client + advisor context. A
firm with a strong existing brand would want its generated palettes to
inherit from "our house style" before riffing for the client.

## Why not MVP

- The evaluation happens against a single advisor; more wouldn't change
  the "does the document look good?" bar.
- Logo upload + image processing is real work (transparent backgrounds,
  monogram fallback, aspect ratio constraints).
- Advisor authentication is a prerequisite — and we have none.

## Sketch

Data model additions:
- `AdvisorBrand { advisorId, logoUrl, monogramText, preferredPairing,
  paletteAnchors: { deep?, surface?, accent? }, seedRationale }`
- `JsonAdvisorBrandRepository` reads from `data/advisor-brands.json`.

Palette prompt change:
- If `AdvisorBrand` exists, prepend it to the system prompt as
  "house style". The agent is told to "anchor on these when plausible,
  depart when the client clearly calls for it."

Cover/closing updates:
- `Cover`, `Closing`, `PageChrome`, `Monogram` all read from `advisor.firm`
  today. Switch to `advisorBrand.logoUrl` with `Monogram` as the fallback.

Auth:
- Either bolt on NextAuth with Google/Microsoft, or make `advisorId` a URL
  path param `/advisor/:id/generate`. The second is probably right for
  demos.

## Existing seams that make it small

- `AdvisorRepository` already abstracts the storage shape.
- `Palette.id = advisorId:clientId` — palettes already scope per-advisor.
- `paletteUserPrompt` already takes the full advisor object — injecting
  brand anchors is a 5-line change to the prompt builder.
- `Monogram` already exists and takes an Advisor — logo is a trivial
  addition.
