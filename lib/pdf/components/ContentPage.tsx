import React from "react";
import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Section, Theme } from "../types";
import { RichText, SectionHeading } from "./RichText";
import { StatCards } from "./StatCards";
import { CalloutBox } from "./CalloutBox";
import { NumberedList } from "./NumberedList";
import { DataTable } from "./DataTable";
import { FeatureGrid } from "./FeatureGrid";
import { Comparison } from "./Comparison";
interface ContentPageProps {
  section: Section;
  pageNumber: number;
  theme: Theme;
}

export function ContentPage({ section, pageNumber, theme }: ContentPageProps) {
  const isDark = section.theme === "dark";

  const styles = StyleSheet.create({
    page: {
      backgroundColor: isDark ? theme.colors.primary : theme.colors.cream,
      paddingHorizontal: theme.spacing.pageHorizontal,
      paddingVertical: theme.spacing.pageVertical,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    headerLabel: {
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: 2.5,
      color: theme.colors.accent,
      textTransform: "uppercase",
    },
    headerPage: {
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      color: theme.colors.grayMedium,
    },
    rule: {
      height: 2,
      backgroundColor: theme.colors.accent,
      marginBottom: 24,
    },
    bodyText: {
      marginTop: 12,
      marginBottom: 6,
    },
  });

  return (
    <Page size="LETTER" style={styles.page} wrap={false}>
      <View style={styles.header} fixed>
        <Text style={styles.headerLabel}>
          {section.number}, {section.navTitle.toUpperCase()}
        </Text>
        <Text style={styles.headerPage}>{pageNumber}</Text>
      </View>
      <View style={styles.rule} fixed />

      <SectionHeading
        heading={section.heading}
        accent={section.headingAccent}
        theme={theme}
        isDark={isDark}
      />

      <View style={styles.bodyText}>
        <RichText text={section.body} theme={theme} isDark={isDark} />
      </View>

      {section.components.map((component, i) => {
        switch (component.type) {
          case "stats":
            return (
              <StatCards key={i} data={component} theme={theme} isDark={isDark} />
            );
          case "callout":
            return (
              <CalloutBox key={i} data={component} theme={theme} isDark={isDark} />
            );
          case "numberedList":
            return (
              <NumberedList
                key={i}
                data={component}
                theme={theme}
                isDark={isDark}
              />
            );
          case "table":
            return (
              <DataTable key={i} data={component} theme={theme} isDark={isDark} />
            );
          case "featureGrid":
            return (
              <FeatureGrid
                key={i}
                data={component}
                theme={theme}
                isDark={isDark}
              />
            );
          case "comparison":
            return (
              <Comparison key={i} data={component} theme={theme} isDark={isDark} />
            );
          default:
            return null;
        }
      })}

    </Page>
  );
}
