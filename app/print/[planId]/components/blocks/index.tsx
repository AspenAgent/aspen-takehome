import type { Block } from "@/lib/agent/schemas";
import { Heading, Paragraph } from "./Paragraph";
import { StatCards } from "./StatCards";
import { IconTiles } from "./IconTiles";
import { NumberedInsights } from "./NumberedInsights";
import { ComparisonLedger } from "./ComparisonLedger";
import { PullQuote } from "./PullQuote";
import { Callout } from "./Callout";
import { ImagePlaceholder } from "../ImagePlaceholder";

/**
 * Renders one block from the DocumentPlan based on its discriminated type.
 * New block kinds: add a Zod variant in schemas.ts, add a component file,
 * add a case here. Nothing else changes.
 */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <Paragraph {...block} />;
    case "heading":
      return <Heading {...block} />;
    case "stat_cards":
      return <StatCards {...block} />;
    case "icon_tiles":
      return <IconTiles {...block} />;
    case "numbered_insights":
      return <NumberedInsights {...block} />;
    case "comparison_ledger":
      return <ComparisonLedger {...block} />;
    case "pull_quote":
      return <PullQuote {...block} />;
    case "callout":
      return <Callout {...block} />;
    case "image":
      return <ImagePlaceholder tag={block.tag} caption={block.caption} />;
    default: {
      // exhaustiveness check — TS will error here if a block kind is missed
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
