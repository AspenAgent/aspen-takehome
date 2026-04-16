import { z } from "zod";

// --- Component Schemas ---

const statsComponentSchema = z.object({
  type: z.literal("stats"),
  items: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1)
    .max(4),
});

const calloutComponentSchema = z.object({
  type: z.literal("callout"),
  title: z.string().optional(),
  text: z.string(),
  attribution: z.string().optional(),
});

const numberedListComponentSchema = z.object({
  type: z.literal("numberedList"),
  items: z
    .array(z.object({ title: z.string(), text: z.string() }))
    .min(1)
    .max(8),
});

const featureGridComponentSchema = z.object({
  type: z.literal("featureGrid"),
  items: z
    .array(
      z.object({
        icon: z.enum([
          "shield",
          "clock",
          "dollar",
          "chart",
          "lock",
          "heart",
          "home",
          "star",
        ]),
        title: z.string(),
        text: z.string(),
      })
    )
    .min(2)
    .max(6),
});

const tableComponentSchema = z.object({
  type: z.literal("table"),
  headers: z.array(z.string()).min(2),
  rows: z.array(z.array(z.string())).min(1),
});

const comparisonComponentSchema = z.object({
  type: z.literal("comparison"),
  before: z.object({
    label: z.string(),
    items: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  after: z.object({
    label: z.string(),
    items: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
});

const componentBlockSchema = z.discriminatedUnion("type", [
  statsComponentSchema,
  calloutComponentSchema,
  numberedListComponentSchema,
  featureGridComponentSchema,
  tableComponentSchema,
  comparisonComponentSchema,
]);

// --- Section Schema ---

const sectionSchema = z.object({
  number: z.string(),
  navTitle: z.string(),
  navSubtitle: z.string(),
  heading: z.string(),
  headingAccent: z.string(),
  theme: z.enum(["dark", "light"]),
  body: z.string(),
  components: z.array(componentBlockSchema).min(1),
});

// --- Top-Level PDF Content Schema ---

export const pdfContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  tagline: z.string(),
  sections: z.array(sectionSchema).min(1).max(10),
  closingCTA: z.object({
    heading: z.string(),
    headingAccent: z.string(),
    body: z.string(),
    nextStep: z.string(),
  }),
});

// --- Inferred Types ---

export type PDFContent = z.infer<typeof pdfContentSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type ComponentBlock = z.infer<typeof componentBlockSchema>;
export type StatsComponent = z.infer<typeof statsComponentSchema>;
export type CalloutComponent = z.infer<typeof calloutComponentSchema>;
export type NumberedListComponent = z.infer<typeof numberedListComponentSchema>;
export type FeatureGridComponent = z.infer<typeof featureGridComponentSchema>;
export type TableComponent = z.infer<typeof tableComponentSchema>;
export type ComparisonComponent = z.infer<typeof comparisonComponentSchema>;

// --- Theme Type (for future per-firm customization) ---

export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    accent: string;
    cream: string;
    white: string;
    black: string;
    grayLight: string;
    grayMedium: string;
    grayDark: string;
    positive: string;
    negative: string;
  };
  fonts: {
    serif: string;
    sans: string;
  };
  spacing: {
    pageHorizontal: number;
    pageVertical: number;
    sectionGap: number;
    paragraphGap: number;
  };
}
