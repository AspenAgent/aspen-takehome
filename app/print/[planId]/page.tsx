import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import type {
  Advisor,
  DocumentPlan,
  Palette,
  PaletteTokens,
  TypographyPairing,
} from "@/lib/agent/schemas";
import { TypographyPairingSchema } from "@/lib/agent/schemas";
import { getPairing } from "@/lib/agent/typography";
import { advisors } from "@/lib/data/repositories";
import { getPlan } from "@/lib/pdf/cache";
import { Cover } from "./components/Cover";
import { TableOfContents } from "./components/TableOfContents";
import { ContentSection } from "./components/ContentSection";
import { Closing } from "./components/Closing";
import { MOCK_PLAN, MOCK_PALETTE } from "./mock-data";
import "./print.css";

/**
 * Puppeteer-facing print route. In production it reads { plan, palette }
 * from the in-memory cache populated by the orchestrator right before
 * the render call. During dev, `/print/mock` loads a hand-written fixture
 * so we can iterate the renderer without running the full agent pipeline.
 */

// Don't attempt static generation — this route is always dynamic.
export const dynamic = "force-dynamic";

function paletteCssVars(tokens: PaletteTokens): CSSProperties {
  return {
    ["--palette-background-deep" as string]: tokens.backgroundDeep,
    ["--palette-background-surface" as string]: tokens.backgroundSurface,
    ["--palette-background-accent" as string]: tokens.backgroundAccent,
    ["--palette-text-on-deep" as string]: tokens.textOnDeep,
    ["--palette-text-on-surface" as string]: tokens.textOnSurface,
    ["--palette-text-subtle" as string]: tokens.textSubtle,
    ["--palette-accent-primary" as string]: tokens.accentPrimary,
    ["--palette-accent-secondary" as string]: tokens.accentSecondary,
    ["--palette-accent-danger" as string]: tokens.accentDanger,
  };
}

async function loadData(
  planId: string,
): Promise<{ plan: DocumentPlan; palette: Palette; advisor: Advisor } | null> {
  if (planId === "mock") {
    const advisor = await advisors.get(MOCK_PLAN.generatedFor.advisorId);
    return { plan: MOCK_PLAN, palette: MOCK_PALETTE, advisor };
  }
  const cached = getPlan(planId);
  if (!cached) return null;
  const advisor = await advisors.get(cached.plan.generatedFor.advisorId);
  return { plan: cached.plan, palette: cached.palette, advisor };
}

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: { planId: string };
  searchParams?: { pairing?: string };
}) {
  const data = await loadData(params.planId);
  if (!data) notFound();

  const { plan, palette, advisor } = data;
  // Dev affordance: `?pairing=modern|warm|classic|heritage` overrides the
  // palette's typography pairing so we can exercise all four pre-bundled
  // font combinations against the same mock plan without touching data.
  const pairingOverride: TypographyPairing | null = (() => {
    const raw = searchParams?.pairing;
    if (!raw) return null;
    const parsed = TypographyPairingSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  })();
  const pairing = getPairing(pairingOverride ?? palette.typography.pairing);

  const showToc = plan.tableOfContents?.enabled ?? false;
  const totalPages = 1 + (showToc ? 1 : 0) + plan.sections.length + 1;

  let pageNum = 1;
  const pages: JSX.Element[] = [];

  pages.push(<Cover key="cover" plan={plan} advisor={advisor} />);
  pageNum++;

  if (showToc) {
    pages.push(
      <TableOfContents
        key="toc"
        plan={plan}
        advisor={advisor}
        pageNumber={pageNum}
        totalPages={totalPages}
      />,
    );
    pageNum++;
  }

  for (const section of plan.sections) {
    pages.push(
      <ContentSection
        key={section.id}
        section={section}
        advisor={advisor}
        pageNumber={pageNum}
        totalPages={totalPages}
      />,
    );
    pageNum++;
  }

  pages.push(
    <Closing
      key="closing"
      plan={plan}
      advisor={advisor}
      pageNumber={pageNum}
      totalPages={totalPages}
    />,
  );

  return (
    <div
      className={`print-root ${pairing.variableClassName}`}
      style={paletteCssVars(palette.tokens)}
    >
      {pages}
    </div>
  );
}
