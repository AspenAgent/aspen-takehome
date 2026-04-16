import React from "react";
import { Document } from "@react-pdf/renderer";
import { PDFContent, Theme } from "./types";
import { defaultTheme } from "./theme";
import { CoverPage } from "./components/CoverPage";
import { TableOfContents } from "./components/TableOfContents";
import { ContentPage } from "./components/ContentPage";
import { ClosingPage } from "./components/ClosingPage";
import { BackPage } from "./components/BackPage";

// Ensure fonts are registered
import "./fonts";

interface AspenDocumentProps {
  content: PDFContent;
  theme?: Theme;
}

export function AspenDocument({
  content,
  theme = defaultTheme,
}: AspenDocumentProps) {
  // Cover = page 1, TOC = page 2, content starts at page 3
  const contentStartPage = 3;

  return (
    <Document
      title={content.title}
      author="Whitfield Wealth Advisors"
      subject={content.subtitle}
    >
      <CoverPage
        title={content.title}
        subtitle={content.subtitle}
        tagline={content.tagline}
        theme={theme}
      />

      <TableOfContents
        sections={content.sections}
        startPage={contentStartPage}
        theme={theme}
      />

      {content.sections.map((section, i) => (
        <ContentPage
          key={i}
          section={section}
          pageNumber={contentStartPage + i}
          theme={theme}
        />
      ))}

      <ClosingPage cta={content.closingCTA} theme={theme} />

      <BackPage theme={theme} />
    </Document>
  );
}
