import React from "react";
import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Theme } from "../types";
import { advisor } from "@/data/advisor";
import path from "path";
import fs from "fs";

interface BackPageProps {
  theme: Theme;
}

export function BackPage({ theme }: BackPageProps) {
  const logoPath = path.join(process.cwd(), "public/placeholder-logo.png");
  const logoExists = fs.existsSync(logoPath);

  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.pageHorizontal,
      paddingVertical: theme.spacing.pageVertical,
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: 64,
      height: 64,
      borderRadius: 32,
      marginBottom: 16,
    },
    firmName: {
      fontFamily: theme.fonts.sans,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 3,
      color: theme.colors.accent,
      textTransform: "uppercase",
      marginBottom: 24,
    },
    tagline: {
      fontFamily: theme.fonts.serif,
      fontSize: 22,
      fontWeight: 700,
      color: theme.colors.white,
      textAlign: "center",
      lineHeight: 1.3,
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: theme.fonts.sans,
      fontSize: 10,
      color: theme.colors.grayLight,
      textAlign: "center",
      lineHeight: 1.6,
      maxWidth: 360,
      marginBottom: 40,
    },
    divider: {
      width: 40,
      height: 2,
      backgroundColor: theme.colors.accent,
      marginBottom: 24,
    },
    contactName: {
      fontFamily: theme.fonts.sans,
      fontSize: 10,
      fontWeight: 600,
      color: theme.colors.white,
      marginBottom: 6,
    },
    contactDetail: {
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      color: theme.colors.grayLight,
      marginBottom: 3,
    },
    contactAccent: {
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      color: theme.colors.accent,
      fontWeight: 600,
    },
    disclosureWrap: {
      position: "absolute",
      bottom: theme.spacing.pageVertical,
      left: theme.spacing.pageHorizontal,
      right: theme.spacing.pageHorizontal,
    },
    disclosure: {
      fontFamily: theme.fonts.sans,
      fontSize: 6.5,
      color: theme.colors.grayMedium,
      lineHeight: 1.5,
      textAlign: "center",
    },
  });

  return (
    <Page size="LETTER" style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {logoExists && <Image src={logoPath} style={styles.logo} />}
      <Text style={styles.firmName}>{advisor.firm}</Text>
      <Text style={styles.tagline}>Navigate Life&apos;s{"\n"}Financial Peaks</Text>
      <Text style={styles.subtitle}>
        Achieve lasting financial security with strategies that balance
        cutting-edge technology and timeless expertise.
      </Text>
      <View style={styles.divider} />
      <Text style={styles.contactName}>{advisor.name}</Text>
      <Text style={styles.contactDetail}>{advisor.phone}</Text>
      <Text style={styles.contactDetail}>{advisor.email}</Text>
      <Text style={styles.contactAccent}>{advisor.firm}</Text>

      <View style={styles.disclosureWrap}>
        <Text style={styles.disclosure}>{advisor.disclosure}</Text>
      </View>
    </Page>
  );
}
