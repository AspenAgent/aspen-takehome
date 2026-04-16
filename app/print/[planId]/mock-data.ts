import type { DocumentPlan, Palette } from "@/lib/agent/schemas";

/**
 * Development-only fixture. The live agent produces DocumentPlans that
 * conform to the same Zod schema; this one is hand-written so we can
 * iterate the renderer without the full agent pipeline online.
 *
 * Swap content freely while building — this file is never imported from
 * anything other than the /print/[planId] route's dev fallback.
 */

export const MOCK_PALETTE: Palette = {
  id: "whitfield:susie",
  name: "Texan Heritage",
  rationale:
    "Forest greens evoke the live oaks and patient wealth of Texas — established, enduring, generational. Paired with warm ivory for editorial warmth and a muted brass accent for emphasis.",
  tokens: {
    backgroundDeep: "#1b2b24",
    backgroundSurface: "#f4ede0",
    backgroundAccent: "#24372f",
    textOnDeep: "#f4ede0",
    textOnSurface: "#1b2b24",
    textSubtle: "#8a8574",
    accentPrimary: "#c9a961",
    accentSecondary: "#6b8f6b",
    accentDanger: "#a85a3e",
  },
  typography: { pairing: "heritage" },
  createdAt: "2026-04-14T12:00:00.000Z",
  revisions: [],
};

export const MOCK_PLAN: DocumentPlan = {
  id: "mock",
  cover: {
    title: "The Quiet Pivot",
    titleItalicPart: "that can save $300,000 on your rental sale",
    subtitle: "A tax-deferred strategy for reinvesting after a Texas property sale.",
    kicker:
      "A prepared guide for Susie Hartman on deferred sales trusts — how they work, who they suit, and the decisions you'll face in the 180-day window after closing.",
    imageTag: "planning",
  },
  tableOfContents: {
    enabled: true,
    quote:
      "\u201CThe moment of sale is the moment of decision. Every day after narrows what's possible.\u201D",
  },
  sections: [
    {
      id: "situation",
      title: "Your Situation",
      kicker: "01. THE SITUATION",
      kind: "default",
      backgroundTone: "surface",
      blocks: [
        {
          type: "paragraph",
          text: "You've just completed the sale of a rental property you held for more than two decades. That single transaction has reshaped the tax picture for the remainder of this calendar year — and the two months that follow it are the only window in which the IRS lets you rewrite the outcome.",
        },
        {
          type: "stat_cards",
          cards: [
            { value: "$1.2M", label: "Investable assets under your direction" },
            { value: "23.8%", label: "Combined federal capital gains exposure" },
            { value: "180 days", label: "IRS reinvestment window remaining" },
          ],
        },
        {
          type: "paragraph",
          text: "At 58, recently retired from a 30-year career as a Texas school principal, your stated priorities are clear: preserve what you've built, minimize unnecessary taxation, and leave a meaningful inheritance for your two adult children. The strategy that follows was selected with those three goals in mind — and with your openness to trust-based structures as a starting point.",
        },
        {
          type: "callout",
          label: "WHY THIS MATTERS NOW",
          body: "A straight sale leaves roughly one-quarter of your gain on the table in federal and state liability. The structure described on the following pages defers that liability for decades — potentially your lifetime — while keeping the principal productive.",
        },
      ],
    },
    {
      id: "concept",
      title: "The Deferred Sales Trust",
      kicker: "02. THE CONCEPT",
      kind: "default",
      backgroundTone: "deep",
      blocks: [
        {
          type: "paragraph",
          text: "A deferred sales trust (DST) is an irrevocable trust structure, codified under Internal Revenue Code \u00a7453, that allows the seller of an appreciated asset to defer recognition of capital gains by exchanging the asset for an installment note issued by the trust.",
        },
        {
          type: "icon_tiles",
          tiles: [
            {
              icon: "shield",
              title: "Deferral, Not Avoidance",
              body: "Capital gains tax is postponed until principal is distributed from the trust — you control the timing.",
            },
            {
              icon: "chart-bar",
              title: "Productive Principal",
              body: "Pre-tax dollars remain invested. Over 20 years, that compounding gap can exceed the original gain.",
            },
            {
              icon: "scale",
              title: "Asset Diversification",
              body: "You exit concentrated real estate risk and enter a professionally managed, diversified portfolio.",
            },
            {
              icon: "heart",
              title: "Estate Continuity",
              body: "Remaining note balance passes to beneficiaries at your direction — your children inherit structure, not liability.",
            },
          ],
        },
      ],
    },
    {
      id: "mechanics",
      title: "How the Installment Sale Works",
      kicker: "03. MECHANICS",
      kind: "custom",
      backgroundTone: "surface",
      blocks: [
        {
          type: "numbered_insights",
          rows: [
            {
              title: "You sell the property to the trust — not to the buyer",
              body: "Before closing, you transfer ownership to the DST in exchange for an installment note. The trust then sells to the end buyer. The IRS treats your transaction as a seller-financed installment sale.",
            },
            {
              title: "The trust receives the cash, you receive a note",
              body: "Sale proceeds land inside the trust, which is now your counterparty on a multi-year promissory note. The note's terms — rate, payment schedule, term length — are set up front, within IRS arms-length standards.",
            },
            {
              title: "Trust assets are professionally invested",
              body: "A named third-party trustee, not you, directs investment of the principal. This independence is what earns the deferral — the IRS will not recognize a DST where the seller retains direct control.",
            },
            {
              title: "You draw income, not principal",
              body: "Interest payments to you are ordinary income. Capital gains tax is triggered only on payments classified as principal return — which you can schedule thinly, or defer entirely through your lifetime.",
            },
            {
              title: "Remaining balance flows to your estate plan",
              body: "At your death, any unpaid note balance is an asset of your estate. Paired with a step-up in basis for your heirs on non-trust assets, the total family outcome can meaningfully exceed the after-tax alternatives.",
            },
          ],
        },
        {
          type: "pull_quote",
          text: "The deferral isn't the point. The point is keeping pre-tax principal productive for long enough that the deferred liability becomes, in practice, an inheritance-planning decision rather than a tax bill.",
          attribution: "Whitfield Wealth research memo, 2026",
        },
      ],
    },
    {
      id: "tradeoffs",
      title: "How This Compares",
      kicker: "04. TRADEOFFS",
      kind: "default",
      backgroundTone: "surface",
      blocks: [
        {
          type: "paragraph",
          text: "A DST is one of three structural options available in your 180-day window. The others — a straight sale with reinvestment, or a §1031 exchange into replacement property — each carry distinct tradeoffs for a client in your position.",
        },
        {
          type: "comparison_ledger",
          columns: ["Outcome", "Straight Sale", "1031 Exchange", "Deferred Sales Trust"],
          rows: [
            {
              label: "Immediate tax liability",
              values: ["~$285,600", "$0", "$0"],
              highlight: "negative",
            },
            {
              label: "Ongoing landlord obligations",
              values: ["None", "Yes — required", "None"],
              highlight: "neutral",
            },
            {
              label: "Asset diversification",
              values: ["Full", "None — must re-enter real estate", "Full"],
              highlight: "neutral",
            },
            {
              label: "Liquidity for heirs",
              values: ["High", "Low", "Moderate — scheduled"],
              highlight: "neutral",
            },
            {
              label: "Estimated 20-year family outcome",
              values: ["$1.84M", "$2.12M", "$2.47M"],
              highlight: "positive",
            },
          ],
          footnote:
            "Projections assume a 6.2% blended return on post-tax and trust principal, 2.4% inflation, and current federal and Texas state tax schedules. Actual outcomes will vary.",
        },
        {
          type: "callout",
          label: "THE HONEST CAVEAT",
          body: "A DST is not a fit for every seller. It requires irrevocable commitment, qualified trustee selection, and ongoing compliance overhead. We recommend it when deferral value meaningfully exceeds those frictions — which, for the gain size you are facing, is clearly the case.",
        },
      ],
    },
    {
      id: "case_study",
      title: "A Client in Similar Waters",
      kicker: "05. CASE STUDY",
      kind: "default",
      backgroundTone: "deep",
      blocks: [
        {
          type: "heading",
          level: 2,
          text: "Margaret & Tom, Fredericksburg",
        },
        {
          type: "paragraph",
          text: "In the spring of 2022, longtime Whitfield clients Margaret and Tom sold a small commercial building they had acquired in the late 1990s. Their gain on the sale was $860,000. Like you, they were newly retired, and like you, they wanted to preserve optionality for their three grown children without tying themselves to replacement real estate.",
        },
        {
          type: "numbered_insights",
          rows: [
            {
              title: "They chose a DST structured over a 20-year note",
              body: "Interest-only distributions for the first ten years, with flexibility to accelerate principal later if circumstances required it.",
            },
            {
              title: "Deferred gains remained invested alongside their other assets",
              body: "The trust's diversified portfolio performed in line with a 60/40 benchmark, net of trustee fees.",
            },
            {
              title: "As of this writing, zero principal has been drawn",
              body: "Their existing income needs are covered by Social Security, pension, and non-trust dividends. Principal will pass to their estate plan intact.",
            },
          ],
        },
        {
          type: "callout",
          label: "THE OUTCOME",
          body: "Relative to a straight-sale baseline, Margaret and Tom's family is projected to retain approximately $220,000 of otherwise-taxable value — enough to fund two of their grandchildren's college costs.",
        },
      ],
    },
  ],
  closing: {
    title: "Your Next Step",
    titleItalicPart: "is a 90-minute review, not a commitment.",
    subtitle:
      "The 180-day window doesn't wait. The earlier we walk the numbers, the more structural options remain on the table.",
    ctaBoxTitle: "Schedule Your DST Feasibility Review",
    ctaBoxBody:
      "We'll model the straight-sale, 1031, and DST outcomes side-by-side against your actual numbers, your actual goals, and Texas's actual tax environment. You'll leave with a written recommendation — and no obligation to act on it.",
    ctaBulletPoints: [
      "Review of your settlement statement and basis history",
      "Side-by-side 20-year projection across all three structures",
      "Introduction to two vetted trustee firms (if DST is the recommended path)",
      "Written summary delivered within three business days",
    ],
    scheduleLabel: "Schedule Your Consultation",
  },
  sources: [
    {
      query: "deferred sales trust IRC 453 installment sale rules 2026",
      url: "https://www.irs.gov/publications/p537",
      title: "Publication 537 (Installment Sales) — Internal Revenue Service",
      snippet:
        "An installment sale is a sale of property where you receive at least one payment after the tax year of the sale.",
    },
    {
      query: "Texas capital gains tax rental property sale",
      url: "https://comptroller.texas.gov/taxes/",
      title: "Texas Comptroller — Tax Information",
      snippet:
        "Texas does not impose a personal income tax; capital gains are taxed at the federal level only.",
    },
  ],
  generatedFor: {
    clientId: "susie",
    advisorId: "whitfield",
  },
  createdAt: "2026-04-14T12:00:00.000Z",
};
