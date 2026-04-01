# Aspen — AI-Powered Client Document Generator

Aspen is an AI agent for financial advisors. Advisors prompt the system to get things done for their clients — the same way they would ask an assistant. This feature lets an advisor type a natural language prompt and receive a personalized, branded PDF they can send directly to a client. This is a simplified version of how Aspen actually works.

## Design bar

Open [`/public/sample-output.pdf`](public/sample-output.pdf) before you start. This is the quality and design standard we expect. Your output does not need to match it exactly but should feel equally polished and professional. A financial advisor should be proud to send this to a client. Susie should feel like her advisor spent hours creating something custom just for her.

## Setup

1. Clone this repo
2. Run `npm install`
3. Copy `.env.local.example` to `.env.local`
4. Add your `ANTHROPIC_API_KEY` to `.env.local`
5. Run `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

## Your task

The scaffolding is set up. Your job is to complete the feature so that:

- An advisor can type a natural language prompt
- The app calls the Claude API with Susie's full profile as context
- A personalized, branded PDF is returned that includes a cover page, structured content sections, and a closing page with advisor contact info and disclosures
- The PDF should look like a professionally designed client deliverable
- The implementation works for any financial topic — not just the example prompt

Submit a PR against this repo when you're done. Include a short description in your PR explaining any decisions you made and anything you'd do differently with more time.

## What we're looking for

- **Personalization** — does the PDF actually use Susie's specific data?
- **Prompt engineering** — does Claude produce professional, accurate content?
- **PDF design quality** — does it look like something a client would actually be proud to receive?
- **Cover page, content sections, and closing page** all present
- **Code quality** — is it readable, well-typed, and cleanly structured?
- **Stability** — does it handle edge cases and errors without breaking?
- **Product instincts** — did you make good decisions about what to build and what to leave out?

## Time expectation

Plan for 3–4 hours. We care about thinking and craft, not polish. Use whatever tools you want including AI coding assistants — that is how we work at Aspen.

## Questions

If something is unclear, make a decision and document it in your PR description. We want to see how you think, not just what you build.
