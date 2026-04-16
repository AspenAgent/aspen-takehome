import { pdfContentSchema } from "@/lib/pdf/types";

// Test the Zod schema validation — the core contract between Claude's output and our PDF renderer

describe("pdfContentSchema", () => {
  const validContent = {
    title: "Protecting Your Legacy",
    subtitle: "A personalized guide for Susie Hartman",
    tagline:
      "How a deferred sales trust could help preserve your wealth after your recent property sale.",
    sections: [
      {
        number: "01",
        navTitle: "The Challenge",
        navSubtitle: "Understanding capital gains exposure",
        heading: "The Capital Gains",
        headingAccent: "Challenge You're Facing",
        theme: "dark" as const,
        body: "When you sell a property, the IRS expects its share. For **Susie**, with a recently sold rental property and **$1,200,000** in investable assets, the tax implications are significant.",
        components: [
          {
            type: "stats" as const,
            items: [
              { value: "20%", label: "Federal capital gains tax rate" },
              { value: "$1.2M", label: "Susie's investable assets" },
              {
                value: "$0",
                label: "Tax owed with proper DST structuring",
              },
            ],
          },
        ],
      },
    ],
    closingCTA: {
      heading: "Take the Next Step",
      headingAccent: "Toward Tax-Free Growth",
      body: "Schedule a consultation to explore how a deferred sales trust could work for your situation.",
      nextStep:
        "Schedule your complimentary portfolio review with James to explore DST options.",
    },
  };

  it("accepts valid content", () => {
    const result = pdfContentSchema.safeParse(validContent);
    expect(result.success).toBe(true);
  });

  it("rejects content without sections", () => {
    const invalid = { ...validContent, sections: [] };
    const result = pdfContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects sections without components", () => {
    const invalid = {
      ...validContent,
      sections: [
        {
          ...validContent.sections[0],
          components: [],
        },
      ],
    };
    const result = pdfContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects invalid component types", () => {
    const invalid = {
      ...validContent,
      sections: [
        {
          ...validContent.sections[0],
          components: [{ type: "nonexistent", data: "bad" }],
        },
      ],
    };
    const result = pdfContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects invalid theme values", () => {
    const invalid = {
      ...validContent,
      sections: [{ ...validContent.sections[0], theme: "blue" }],
    };
    const result = pdfContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates all component types", () => {
    const allComponents = {
      ...validContent,
      sections: [
        {
          ...validContent.sections[0],
          components: [
            {
              type: "stats" as const,
              items: [
                { value: "70%", label: "stat" },
                { value: "4x", label: "stat" },
                { value: "$0", label: "stat" },
              ],
            },
          ],
        },
        {
          ...validContent.sections[0],
          number: "02",
          components: [
            {
              type: "callout" as const,
              title: "Key Insight",
              text: "This is important.",
            },
          ],
        },
        {
          ...validContent.sections[0],
          number: "03",
          components: [
            {
              type: "numberedList" as const,
              items: [
                { title: "Step 1", text: "Do this" },
                { title: "Step 2", text: "Then this" },
              ],
            },
          ],
        },
        {
          ...validContent.sections[0],
          number: "04",
          components: [
            {
              type: "featureGrid" as const,
              items: [
                { icon: "shield" as const, title: "Safe", text: "Protected" },
                { icon: "dollar" as const, title: "Value", text: "Affordable" },
              ],
            },
          ],
        },
        {
          ...validContent.sections[0],
          number: "05",
          components: [
            {
              type: "table" as const,
              headers: ["Strategy", "Tax Impact"],
              rows: [["DST", "$0"], ["Direct Sale", "$200,000"]],
            },
          ],
        },
        {
          ...validContent.sections[0],
          number: "06",
          components: [
            {
              type: "comparison" as const,
              before: {
                label: "Without DST",
                items: [{ label: "Tax Owed", value: "$200,000" }],
              },
              after: {
                label: "With DST",
                items: [{ label: "Tax Owed", value: "$0" }],
              },
            },
          ],
        },
      ],
    };
    const result = pdfContentSchema.safeParse(allComponents);
    expect(result.success).toBe(true);
  });

  it("rejects missing required top-level fields", () => {
    const missing = { title: "test" };
    const result = pdfContentSchema.safeParse(missing);
    expect(result.success).toBe(false);
  });

  it("rejects invalid featureGrid icon names", () => {
    const invalid = {
      ...validContent,
      sections: [
        {
          ...validContent.sections[0],
          components: [
            {
              type: "featureGrid" as const,
              items: [
                { icon: "invalid_icon", title: "Bad", text: "Icon" },
                { icon: "shield", title: "Good", text: "Icon" },
              ],
            },
          ],
        },
      ],
    };
    const result = pdfContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
