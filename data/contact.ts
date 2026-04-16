/**
 * Seed clients used by the JSON repository.
 *
 * Keep these distinct enough that the intake classifier (lib/agent/intake.ts)
 * has real signals to work with — different states, occupations, ages, and
 * life stages. The two "Matt" entries are intentional: they exercise the
 * same-first-name disambiguation path in the picker.
 */

export const contact = {
  name: "Susie Hartman",
  age: 58,
  state: "Texas",
  occupation: "Retired school principal",
  investableAssets: "$1,200,000",
  goals: "Preserve wealth, minimize taxes, leave an inheritance for her two adult children",
  notes: "Recently sold a rental property. Concerned about capital gains. Open to alternative strategies including trusts and tax-deferred vehicles.",
};

export const marcus = {
  name: "Marcus Okafor",
  age: 34,
  state: "California",
  occupation: "Senior software engineer",
  investableAssets: "$650,000",
  goals: "Accelerate early retirement, diversify out of concentrated company stock, buy a first home in the next three years",
  notes: "Holds a large RSU position that vests on an annual cliff. Interested in 10b5-1 plans, direct indexing for tax loss harvesting, and backdoor Roth mechanics.",
};

export const mattSterling = {
  name: "Matt Sterling",
  age: 47,
  state: "Colorado",
  occupation: "Small-business owner (post-exit)",
  investableAssets: "$4,800,000",
  goals: "Deploy liquidity from a recent company sale, manage a concentrated windfall, and fund a family foundation over the next decade",
  notes: "Closed the sale of his manufacturing business last quarter. Evaluating QSBS eligibility on a portion of the proceeds, plus charitable remainder trusts and exchange funds to diversify without a single-year tax hit.",
};

export const mattDelacroix = {
  name: "Matt Delacroix",
  age: 39,
  state: "New York",
  occupation: "Hedge-fund analyst",
  investableAssets: "$2,100,000",
  goals: "Diversify out of firm deferred comp, put two young children through private school, and build a tax-efficient giving plan",
  notes: "Significant portion of compensation is in multi-year deferred comp and carried interest. Interested in donor-advised funds, 529 superfunding, and how a move to Connecticut would affect state tax drag.",
};

export const CLIENTS = [contact, marcus, mattSterling, mattDelacroix] as const;
