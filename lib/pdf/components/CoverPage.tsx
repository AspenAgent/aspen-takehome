import React from "react";
import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Theme } from "../types";
import { advisor } from "@/data/advisor";
import { contact } from "@/data/contact";
import path from "path";
import fs from "fs";

interface CoverPageProps {
  title: string;
  subtitle: string;
  tagline: string;
  theme: Theme;
}

export function CoverPage({ title, subtitle, tagline, theme }: CoverPageProps) {
  const logoPath = path.join(process.cwd(), "public/placeholder-logo.png");
  const logoExists = fs.existsSync(logoPath);
  const bgPath = path.join(process.cwd(), "lib/pdf/assets/cover-mountains.jpg");
  const bgExists = fs.existsSync(bgPath);

  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.colors.primary,
      justifyContent: "space-between",
    },
    bgImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: 0.06,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.primary,
      opacity: 0.7,
    },
    content: {
      paddingHorizontal: theme.spacing.pageHorizontal,
      paddingVertical: theme.spacing.pageVertical,
      flex: 1,
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    firmNameRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    accentLine: {
      width: 30,
      height: 2,
      backgroundColor: theme.colors.accent,
      marginRight: 12,
    },
    firmName: {
      fontFamily: theme.fonts.sans,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 3,
      color: theme.colors.accent,
      textTransform: "uppercase",
    },
    logo: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    body: {
      marginTop: 60,
    },
    titleLine: {
      width: 45,
      height: 3,
      backgroundColor: theme.colors.accent,
      marginBottom: 24,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 44,
      fontWeight: 700,
      color: theme.colors.white,
      lineHeight: 1.1,
      marginBottom: 10,
    },
    subtitle: {
      fontFamily: theme.fonts.serif,
      fontSize: 20,
      fontStyle: "italic",
      color: theme.colors.accent,
      lineHeight: 1.3,
      marginBottom: 28,
    },
    divider: {
      width: 45,
      height: 2,
      backgroundColor: theme.colors.accent,
      marginBottom: 18,
    },
    tagline: {
      fontFamily: theme.fonts.sans,
      fontSize: 11.5,
      color: theme.colors.grayLight,
      lineHeight: 1.6,
      maxWidth: 380,
    },
    preparedFor: {
      fontFamily: theme.fonts.sans,
      fontSize: 10,
      color: theme.colors.grayMedium,
      marginTop: 28,
    },
    clientName: {
      fontFamily: theme.fonts.serif,
      fontSize: 16,
      fontStyle: "italic",
      color: theme.colors.white,
      marginTop: 4,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerText: {
      fontFamily: theme.fonts.sans,
      fontSize: 8,
      letterSpacing: 2,
      color: theme.colors.grayMedium,
      textTransform: "uppercase",
    },
    footerRight: {
      fontFamily: theme.fonts.sans,
      fontSize: 8,
      color: theme.colors.grayMedium,
    },
  });

  return (
    <Page size="LETTER" style={styles.page}>
      {/* Background image with dark overlay */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {bgExists && <Image src={bgPath} style={styles.bgImage} />}

      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <View style={styles.firmNameRow}>
              <View style={styles.accentLine} />
              <Text style={styles.firmName}>{advisor.firm}</Text>
            </View>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logoExists && <Image src={logoPath} style={styles.logo} />}
          </View>

          <View style={styles.body}>
            <View style={styles.titleLine} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.divider} />
            <Text style={styles.tagline}>{tagline}</Text>
            <Text style={styles.preparedFor}>Prepared exclusively for</Text>
            <Text style={styles.clientName}>{contact.name}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A Guide by {advisor.firm}
          </Text>
          <Text style={styles.footerRight}>{advisor.email}</Text>
        </View>
      </View>
    </Page>
  );
}
