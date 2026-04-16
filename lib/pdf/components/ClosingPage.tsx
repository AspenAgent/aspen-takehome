import React from "react";
import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Theme } from "../types";
import { advisor } from "@/data/advisor";
import { RichText } from "./RichText";

interface ClosingPageProps {
  cta: {
    heading: string;
    headingAccent: string;
    body: string;
    nextStep: string;
  };
  theme: Theme;
}

export function ClosingPage({ cta, theme }: ClosingPageProps) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.pageHorizontal,
      paddingVertical: theme.spacing.pageVertical,
      justifyContent: "space-between",
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
    rule: {
      height: 2,
      backgroundColor: theme.colors.accent,
      marginBottom: 40,
    },
    content: {
      alignItems: "center",
    },
    topLine: {
      width: 40,
      height: 3,
      backgroundColor: theme.colors.accent,
      marginBottom: 20,
    },
    heading: {
      fontFamily: theme.fonts.serif,
      fontSize: 34,
      fontWeight: 700,
      color: theme.colors.white,
      textAlign: "center",
      lineHeight: 1.2,
      marginBottom: 4,
    },
    headingAccent: {
      fontFamily: theme.fonts.serif,
      fontSize: 34,
      fontWeight: 700,
      color: theme.colors.accent,
      textAlign: "center",
      lineHeight: 1.2,
      marginBottom: 16,
    },
    body: {
      maxWidth: 420,
      marginBottom: 30,
    },
    ctaBox: {
      borderWidth: 1,
      borderColor: theme.colors.accent,
      paddingHorizontal: 40,
      paddingVertical: 30,
      alignItems: "center",
      maxWidth: 420,
      width: "100%",
    },
    ctaTitle: {
      fontFamily: theme.fonts.serif,
      fontSize: 16,
      fontStyle: "italic",
      color: theme.colors.accent,
      textAlign: "center",
      marginBottom: 16,
    },
    nextStep: {
      marginBottom: 20,
    },
    divider: {
      width: 40,
      height: 2,
      backgroundColor: theme.colors.accent,
      marginBottom: 16,
    },
    contactLabel: {
      fontFamily: theme.fonts.sans,
      fontSize: 8,
      fontWeight: 600,
      letterSpacing: 1.5,
      color: theme.colors.accent,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    contactName: {
      fontFamily: theme.fonts.sans,
      fontSize: 11,
      fontWeight: 700,
      color: theme.colors.white,
      marginBottom: 4,
    },
    contactDetail: {
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      color: theme.colors.grayLight,
      marginBottom: 2,
    },
    contactEmail: {
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      color: theme.colors.accent,
    },
    footer: {
      marginTop: "auto",
    },
    disclosure: {
      fontFamily: theme.fonts.sans,
      fontSize: 7,
      color: theme.colors.grayMedium,
      lineHeight: 1.5,
    },
  });

  return (
    <Page size="LETTER" style={styles.page}>
      <View>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Your Next Step</Text>
        </View>
        <View style={styles.rule} />

        <View style={styles.content}>
          <View style={styles.topLine} />
          <Text style={styles.heading}>{cta.heading}</Text>
          <Text style={styles.headingAccent}>{cta.headingAccent}</Text>
          <View style={styles.body}>
            <RichText
              text={cta.body}
              theme={theme}
              isDark={true}
              fontSize={11}
              textAlign="center"
              color={theme.colors.grayLight}
            />
          </View>

          <View style={styles.ctaBox}>
            <View style={styles.nextStep}>
              <RichText
                text={cta.nextStep}
                theme={theme}
                isDark={true}
                fontSize={11}
                textAlign="center"
                color={theme.colors.grayLight}
              />
            </View>
            <View style={styles.divider} />
            <Text style={styles.contactLabel}>Schedule Your Consultation</Text>
            <Text style={styles.contactName}>{advisor.name}</Text>
            <Text style={styles.contactDetail}>{advisor.phone}</Text>
            <Text style={styles.contactDetail}>{advisor.email}</Text>
            <Text style={styles.contactEmail}>{advisor.firm}</Text>
          </View>
        </View>
      </View>

    </Page>
  );
}
