import type { DocumentPlan, Palette } from "@/lib/agent/schemas";

/**
 * In-memory plan cache.
 *
 * The orchestrator writes the freshly-generated { plan, palette } pair here
 * right before calling the puppeteer render, then reads it back in the
 * /print/[planId] route. Entries auto-expire after PLAN_TTL_MS so long-running
 * dev servers don't leak memory.
 *
 * This is intentionally process-local: it works because puppeteer runs in the
 * same Next.js server process as the print route. If we ever move rendering
 * to a separate worker, we'd swap this for a durable store (file, Redis, etc.).
 */

type Entry = { plan: DocumentPlan; palette: Palette; expiresAt: number };
type PlanStore = Map<string, Entry>;

// Pin the Map on globalThis so it survives Next.js dev-mode module
// re-evaluation. In dev, the same module can be evaluated more than once
// (once for route-handler bundles, once for server-component bundles, or
// again after HMR) — without this guard, the orchestrator's putPlan writes
// to one Map instance and the /print page's getPlan reads from a different
// empty one. Production (next build/start) has a single module graph, so
// the global is just unused there. Same pattern Prisma's Next docs recommend.
const globalForPlanStore = globalThis as unknown as { __planStore?: PlanStore };
const store: PlanStore = globalForPlanStore.__planStore ?? new Map();
if (!globalForPlanStore.__planStore) globalForPlanStore.__planStore = store;

const PLAN_TTL_MS = 5 * 60 * 1000; // 5 minutes is plenty — puppeteer renders in seconds

function sweep() {
  const now = Date.now();
  store.forEach((entry, id) => {
    if (entry.expiresAt < now) store.delete(id);
  });
}

export function putPlan(id: string, plan: DocumentPlan, palette: Palette): void {
  sweep();
  store.set(id, { plan, palette, expiresAt: Date.now() + PLAN_TTL_MS });
}

export function getPlan(
  id: string,
): { plan: DocumentPlan; palette: Palette } | null {
  sweep();
  const entry = store.get(id);
  if (!entry) return null;
  return { plan: entry.plan, palette: entry.palette };
}

export function deletePlan(id: string): void {
  store.delete(id);
}
