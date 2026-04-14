import path from "path";
import fs from "fs";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { advisor } from "@/data/advisor";
import { contact } from "@/data/contact";
import type { DocumentContent, Section } from "./types";

const fontPath = (file: string) =>
  path.join(process.cwd(), "public/fonts", file);

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "Playfair Display",
    fonts: [
      { src: fontPath("PlayfairDisplay-Regular.ttf"), fontWeight: 400 },
      { src: fontPath("PlayfairDisplay-Bold.ttf"), fontWeight: 700 },
      { src: fontPath("PlayfairDisplay-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: fontPath("PlayfairDisplay-BoldItalic.ttf"), fontWeight: 700, fontStyle: "italic" },
    ],
  });
  Font.register({
    family: "Inter",
    fonts: [
      { src: fontPath("Inter-Regular.ttf"), fontWeight: 400 },
      { src: fontPath("Inter-Medium.ttf"), fontWeight: 500 },
      { src: fontPath("Inter-SemiBold.ttf"), fontWeight: 600 },
      { src: fontPath("Inter-Bold.ttf"), fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}

const theme = {
  dark: {
    bg: "#0F1B16",
    text: "#E8E2D2",
    muted: "#8B9B90",
    rule: "#2A3B34",
  },
  light: {
    bg: "#F7F3EC",
    text: "#1F2A24",
    muted: "#6B7C72",
    rule: "#D8D1BF",
  },
  accent: "#C9A24A",
  accentSoft: "#E7D4A2",
} as const;

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: "Inter",
    fontSize: 10.5,
    lineHeight: 1.55,
  },
  pageDark: { backgroundColor: theme.dark.bg, color: theme.dark.text },
  pageLight: { backgroundColor: theme.light.bg, color: theme.light.text },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  brandMark: {
    fontFamily: "Inter",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  eyebrow: {
    fontFamily: "Inter",
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  pageNumber: {
    fontFamily: "Inter",
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: 0.5,
  },
  rule: { height: 1, width: "100%", marginTop: 6, marginBottom: 28 },
  accentBar: { width: 36, height: 2, backgroundColor: theme.accent, marginVertical: 14 },

  heroTitle: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 46,
    lineHeight: 1.08,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontFamily: "Playfair Display",
    fontStyle: "italic",
    fontSize: 19,
    lineHeight: 1.3,
    marginBottom: 18,
  },
  coverTagline: {
    fontFamily: "Inter",
    fontSize: 11,
    lineHeight: 1.6,
    maxWidth: 380,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
  },
  footerMeta: {
    fontFamily: "Inter",
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  sectionHeadline: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 30,
    lineHeight: 1.12,
    marginBottom: 8,
  },
  sectionHeadlineAccent: { color: theme.accent },
  body: {
    fontFamily: "Inter",
    fontSize: 10.5,
    lineHeight: 1.65,
    marginTop: 8,
  },

  calloutBox: {
    marginTop: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderLeftWidth: 3,
    borderLeftColor: theme.accent,
  },
  calloutLabel: {
    fontFamily: "Inter",
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
    color: theme.accent,
  },
  calloutText: {
    fontFamily: "Playfair Display",
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 1.45,
  },

  keyPointsWrap: { marginTop: 22 },
  keyPointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  keyPointNumber: {
    fontFamily: "Playfair Display",
    fontSize: 16,
    fontWeight: 700,
    color: theme.accent,
    width: 28,
  },
  keyPointText: {
    flex: 1,
    fontFamily: "Inter",
    fontSize: 10.5,
    lineHeight: 1.55,
    paddingTop: 2,
  },

  nextStepBox: {
    marginTop: 28,
    padding: 26,
    borderWidth: 1,
    borderColor: theme.accent,
  },
  nextStepCta: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: theme.accent,
    marginBottom: 14,
    textAlign: "center",
  },
  nextStepContactName: {
    fontFamily: "Playfair Display",
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 4,
  },
  nextStepContactFirm: {
    fontFamily: "Inter",
    fontSize: 10,
    textAlign: "center",
    marginBottom: 12,
  },
  nextStepContactLine: {
    fontFamily: "Inter",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 3,
  },

  backCoverCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },

  tocIntro: {
    fontFamily: "Inter",
    fontSize: 11,
    lineHeight: 1.55,
    marginTop: 10,
    marginBottom: 28,
    maxWidth: 420,
  },
  tocRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderTopWidth: 0.6,
  },
  tocNumber: {
    fontFamily: "Playfair Display",
    fontSize: 18,
    fontWeight: 700,
    color: theme.accent,
    width: 44,
    paddingTop: 2,
  },
  tocBody: { flex: 1 },
  tocTitle: {
    fontFamily: "Playfair Display",
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 2,
  },
  tocSubtitle: {
    fontFamily: "Inter",
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  tocPageNum: {
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: 500,
    paddingTop: 4,
    width: 36,
    textAlign: "right",
  },

  nextStepDisclosure: {
    fontFamily: "Inter",
    fontSize: 7.5,
    lineHeight: 1.55,
    marginTop: 24,
  },
  disclosure: {
    fontFamily: "Inter",
    fontSize: 7.5,
    lineHeight: 1.55,
    marginTop: "auto",
  },
  logoMark: { width: 22, height: 22 },
  logoMarkLarge: { width: 52, height: 52, marginBottom: 14 },
});

function formattedDate(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function logoSrc(): string | undefined {
  const p = path.join(process.cwd(), "public/placeholder-logo.png");
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return p;
  } catch {
    return undefined;
  }
}

const PageHeader: React.FC<{ palette: "dark" | "light"; eyebrow: string; pageNum: number }> = ({
  palette,
  eyebrow,
  pageNum,
}) => {
  const p = theme[palette];
  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.eyebrow, { color: p.muted }]}>{eyebrow}</Text>
        <Text style={[styles.pageNumber, { color: p.muted }]}>{String(pageNum).padStart(2, "0")}</Text>
      </View>
      <View style={[styles.rule, { backgroundColor: p.rule }]} />
    </View>
  );
};

const CoverPage: React.FC<{ content: DocumentContent; logo?: string }> = ({ content, logo }) => (
  <Page size="LETTER" style={[styles.page, styles.pageDark]}>
    <View style={styles.headerRow}>
      <Text style={[styles.brandMark, { color: theme.accent }]}>
        {advisor.firm.toUpperCase()}
      </Text>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {logo ? <Image src={logo} style={styles.logoMark} /> : null}
    </View>
    <View style={[styles.rule, { backgroundColor: theme.dark.rule, width: 40, marginBottom: 0 }]} />

    <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 12 }}>
      <View style={[styles.accentBar, { marginTop: 0 }]} />
      <Text style={[styles.heroTitle, { color: theme.dark.text }]}>{content.title}</Text>
      <Text style={[styles.heroSubtitle, { color: theme.accentSoft }]}>{content.subtitle}</Text>
      <View style={[styles.accentBar, { marginTop: 4, marginBottom: 16 }]} />
      <Text style={[styles.coverTagline, { color: theme.dark.muted }]}>{content.coverTagline}</Text>
    </View>

    <View style={styles.footerRow}>
      <Text style={[styles.footerMeta, { color: theme.dark.muted }]}>
        Prepared for {contact.name.first} {contact.name.last}
      </Text>
      <Text style={[styles.footerMeta, { color: theme.dark.muted }]}>{formattedDate()}</Text>
    </View>
  </Page>
);

const TableOfContents: React.FC<{ content: DocumentContent; pageNum: number }> = ({
  content,
  pageNum,
}) => {
  const p = theme.light;
  const entries = [
    ...content.sections.map((s, i) => ({
      number: s.number,
      title: s.title,
      subtitle: s.eyebrow,
      page: String(i + 3).padStart(2, "0"),
    })),
    {
      number: String(content.sections.length + 1).padStart(2, "0"),
      title: content.nextStep.title,
      subtitle: "Next Step",
      page: String(content.sections.length + 3).padStart(2, "0"),
    },
  ];
  return (
    <Page size="LETTER" style={[styles.page, styles.pageLight]}>
      <PageHeader palette="light" eyebrow="Contents" pageNum={pageNum} />
      <Text style={[styles.sectionHeadline, { color: p.text, marginTop: 4 }]}>
        What&apos;s Inside
      </Text>
      <View style={[styles.accentBar, { marginTop: 10, marginBottom: 6 }]} />
      <Text style={[styles.tocIntro, { color: p.muted }]}>
        {content.subtitle}
      </Text>
      <View>
        {entries.map((e, i) => (
          <View
            key={e.number}
            style={[
              styles.tocRow,
              {
                borderTopColor: p.rule,
                borderBottomWidth: i === entries.length - 1 ? 0.6 : 0,
                borderBottomColor: p.rule,
              },
            ]}
          >
            <Text style={styles.tocNumber}>{e.number}</Text>
            <View style={styles.tocBody}>
              <Text style={[styles.tocTitle, { color: p.text }]}>{e.title}</Text>
              <Text style={[styles.tocSubtitle, { color: p.muted }]}>
                {e.subtitle}
              </Text>
            </View>
            <Text style={[styles.tocPageNum, { color: p.muted }]}>{e.page}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.footerMeta, { color: p.muted }]}>{advisor.firm}</Text>
        <Text style={[styles.footerMeta, { color: p.muted }]}>
          {contact.name.first} {contact.name.last}
        </Text>
      </View>
    </Page>
  );
};

const Callout: React.FC<{ palette: "dark" | "light"; label: string; text: string }> = ({
  palette,
  label,
  text,
}) => {
  const p = theme[palette];
  return (
    <View
      style={[
        styles.calloutBox,
        { backgroundColor: palette === "dark" ? "#17271F" : "#EFE8D6" },
      ]}
    >
      <Text style={styles.calloutLabel}>{label}</Text>
      <Text style={[styles.calloutText, { color: p.text }]}>{text}</Text>
    </View>
  );
};

const KeyPoints: React.FC<{ points: string[] }> = ({ points }) => (
  <View style={styles.keyPointsWrap}>
    {points.map((pt, i) => (
      <View key={i} style={styles.keyPointRow}>
        <Text style={styles.keyPointNumber}>{String(i + 1).padStart(2, "0")}</Text>
        <Text style={styles.keyPointText}>{pt}</Text>
      </View>
    ))}
  </View>
);

const ContentPage: React.FC<{ section: Section; palette: "dark" | "light"; pageNum: number }> = ({
  section,
  palette,
  pageNum,
}) => {
  const isDark = palette === "dark";
  const p = theme[palette];
  return (
    <Page size="LETTER" style={[styles.page, isDark ? styles.pageDark : styles.pageLight]}>
      <PageHeader
        palette={palette}
        eyebrow={`${section.number},  ${section.eyebrow}`}
        pageNum={pageNum}
      />
      <Text style={[styles.sectionHeadline, { color: p.text }]}>
        {section.title}
      </Text>
      <View style={[styles.accentBar, { marginTop: 10, marginBottom: 6 }]} />
      <Text style={[styles.body, { color: p.text }]}>{section.body}</Text>
      {section.callout ? (
        <Callout palette={palette} label={section.callout.label} text={section.callout.text} />
      ) : null}
      {section.keyPoints && section.keyPoints.length > 0 ? (
        <KeyPoints points={section.keyPoints} />
      ) : null}
      <View style={styles.footerRow}>
        <Text style={[styles.footerMeta, { color: p.muted }]}>
          {advisor.firm}
        </Text>
        <Text style={[styles.footerMeta, { color: p.muted }]}>
          {contact.name.first} {contact.name.last}
        </Text>
      </View>
    </Page>
  );
};

const NextStepPage: React.FC<{ content: DocumentContent; pageNum: number }> = ({
  content,
  pageNum,
}) => (
  <Page size="LETTER" style={[styles.page, styles.pageDark]}>
    <PageHeader palette="dark" eyebrow="Next Step" pageNum={pageNum} />
    <View style={[styles.accentBar, { marginTop: 30 }]} />
    <Text style={[styles.sectionHeadline, { color: theme.dark.text }]}>
      {content.nextStep.title}
    </Text>
    <Text style={[styles.body, { color: theme.dark.text, marginTop: 14, maxWidth: 440 }]}>
      {content.nextStep.description}
    </Text>
    <View style={styles.nextStepBox}>
      <Text style={styles.nextStepCta}>{content.nextStep.cta}</Text>
      <Text style={[styles.nextStepContactName, { color: theme.dark.text }]}>
        {advisor.name}
      </Text>
      <Text style={[styles.nextStepContactFirm, { color: theme.accentSoft }]}>
        {advisor.firm}
      </Text>
      <Text style={[styles.nextStepContactLine, { color: theme.dark.text }]}>
        {advisor.phone}
      </Text>
      <Text style={[styles.nextStepContactLine, { color: theme.dark.text }]}>
        {advisor.email}
      </Text>
    </View>
    <Text style={[styles.nextStepDisclosure, { color: theme.dark.muted }]}>
      {advisor.disclosure}
    </Text>
    <View style={styles.footerRow}>
      <Text style={[styles.footerMeta, { color: theme.dark.muted }]}>
        Prepared for {contact.name.first} {contact.name.last}
      </Text>
      <Text style={[styles.footerMeta, { color: theme.dark.muted }]}>{formattedDate()}</Text>
    </View>
  </Page>
);

const BackCover: React.FC<{ logo?: string }> = ({ logo }) => (
  <Page size="LETTER" style={[styles.page, styles.pageLight]}>
    <View style={styles.backCoverCenter}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {logo ? <Image src={logo} style={styles.logoMarkLarge} /> : null}
      <Text style={[styles.brandMark, { color: theme.accent, marginBottom: 14 }]}>
        {advisor.firm.toUpperCase()}
      </Text>
      <Text style={[styles.heroSubtitle, { color: theme.light.text, textAlign: "center", maxWidth: 400 }]}>
        Thoughtful, personalized planning for the life you&apos;re building.
      </Text>
      <View style={[styles.accentBar, { marginTop: 22, marginBottom: 22 }]} />
      <Text style={[styles.nextStepContactLine, { color: theme.light.text }]}>
        {advisor.phone}
      </Text>
      <Text style={[styles.nextStepContactLine, { color: theme.light.text }]}>
        {advisor.email}
      </Text>
    </View>
    <Text style={[styles.disclosure, { color: theme.light.muted }]}>
      {advisor.disclosure}
    </Text>
  </Page>
);

export async function generatePDF(content: string): Promise<Buffer> {
  registerFonts();
  let parsed: DocumentContent;
  try {
    parsed = JSON.parse(content) as DocumentContent;
  } catch {
    throw new Error("generatePDF received invalid content JSON.");
  }

  const logo = logoSrc();
  const palettes: Array<"dark" | "light"> = ["light", "dark", "light"];

  const doc = (
    <Document
      title={`${parsed.title} — ${contact.name.first} ${contact.name.last}`}
      author={advisor.firm}
    >
      <CoverPage content={parsed} logo={logo} />
      <TableOfContents content={parsed} pageNum={2} />
      {parsed.sections.map((section, i) => (
        <ContentPage
          key={section.number || i}
          section={section}
          palette={palettes[i % palettes.length]}
          pageNum={i + 3}
        />
      ))}
      <NextStepPage content={parsed} pageNum={parsed.sections.length + 3} />
      <BackCover logo={logo} />
    </Document>
  );

  const stream = await pdf(doc).toBuffer();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks);
}
