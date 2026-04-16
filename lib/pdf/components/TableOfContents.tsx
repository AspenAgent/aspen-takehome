import React from "react";
import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Section, Theme } from "../types";
import { advisor } from "@/data/advisor";

interface TableOfContentsProps {
  sections: Section[];
  startPage: number;
  theme: Theme;
}

export function TableOfContents({
  sections,
  startPage,
  theme,
}: TableOfContentsProps) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.colors.cream,
      paddingHorizontal: theme.spacing.pageHorizontal,
      paddingVertical: theme.spacing.pageVertical,
    },
    firmName: {
      fontFamily: theme.fonts.sans,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: 2.5,
      color: theme.colors.grayMedium,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    accentLine: {
      width: 30,
      height: 3,
      backgroundColor: theme.colors.accent,
      marginBottom: 20,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 36,
      fontWeight: 700,
      color: theme.colors.black,
      marginBottom: 6,
    },
    subtitle: {
      fontFamily: theme.fonts.sans,
      fontSize: 11,
      color: theme.colors.grayMedium,
      marginBottom: 30,
    },
    entries: {
      marginBottom: 40,
    },
    entry: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.grayLight,
    },
    entryNumber: {
      fontFamily: theme.fonts.serif,
      fontSize: 20,
      fontWeight: 700,
      color: theme.colors.accent,
      width: 50,
      marginRight: 12,
    },
    entryContent: {
      flex: 1,
    },
    entryTitle: {
      fontFamily: theme.fonts.serif,
      fontSize: 15,
      fontWeight: 700,
      color: theme.colors.black,
      marginBottom: 2,
    },
    entrySubtitle: {
      fontFamily: theme.fonts.sans,
      fontSize: 10,
      color: theme.colors.grayMedium,
    },
    entryPage: {
      fontFamily: theme.fonts.sans,
      fontSize: 11,
      color: theme.colors.grayMedium,
      width: 30,
      textAlign: "right",
    },
    quoteBox: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent,
      backgroundColor: theme.colors.grayLight,
      paddingLeft: 18,
      paddingRight: 18,
      paddingVertical: 16,
      marginTop: "auto",
    },
    quoteText: {
      fontFamily: theme.fonts.serif,
      fontSize: 11,
      fontStyle: "italic",
      color: theme.colors.grayDark,
      lineHeight: 1.5,
    },
  });

  return (
    <Page size="LETTER" style={styles.page}>
      <View>
        <Text style={styles.firmName}>{advisor.firm}</Text>
        <View style={styles.accentLine} />
        <Text style={styles.title}>What&apos;s Inside</Text>
        <Text style={styles.subtitle}>
          Your personalized guide from {advisor.firm}.
        </Text>
      </View>

      <View style={styles.entries}>
        {sections.map((section, i) => (
          <View key={i} style={styles.entry}>
            <Text style={styles.entryNumber}>{section.number}</Text>
            <View style={styles.entryContent}>
              <Text style={styles.entryTitle}>{section.navTitle}</Text>
              <Text style={styles.entrySubtitle}>{section.navSubtitle}</Text>
            </View>
            <Text style={styles.entryPage}>{startPage + i}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quoteBox}>
        <Text style={styles.quoteText}>
          &quot;The best financial plans aren&apos;t built in a day — they&apos;re
          built with intention, one conversation at a time.&quot;
        </Text>
      </View>
    </Page>
  );
}
