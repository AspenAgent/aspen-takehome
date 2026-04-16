import React from "react";
import { Text, StyleSheet } from "@react-pdf/renderer";
import { Theme } from "../types";

interface RichTextProps {
  text: string;
  theme: Theme;
  isDark: boolean;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  color?: string;
}

/**
 * Parses markdown-style **bold**, *italic*, and {{gold}} markers into styled <Text> segments.
 */
export function RichText({ text, theme, isDark, fontSize = 11, textAlign, color }: RichTextProps) {
  const baseColor = color || (isDark ? theme.colors.white : theme.colors.grayDark);

  const styles = StyleSheet.create({
    base: {
      fontFamily: theme.fonts.sans,
      fontSize,
      color: baseColor,
      lineHeight: 1.65,
      ...(textAlign ? { textAlign } : {}),
    },
    bold: {
      fontWeight: 700,
    },
    italic: {
      fontStyle: "italic",
    },
    gold: {
      color: theme.colors.accent,
      fontWeight: 700,
    },
  });

  const segments = parseMarkdown(text);

  return (
    <Text style={styles.base}>
      {segments.map((seg, i) => {
        if (seg.gold) {
          return <Text key={i} style={styles.gold}>{seg.text}</Text>;
        }
        if (seg.bold && seg.italic) {
          return <Text key={i} style={[styles.bold, styles.italic]}>{seg.text}</Text>;
        }
        if (seg.bold) {
          return <Text key={i} style={styles.bold}>{seg.text}</Text>;
        }
        if (seg.italic) {
          return <Text key={i} style={styles.italic}>{seg.text}</Text>;
        }
        return <Text key={i}>{seg.text}</Text>;
      })}
    </Text>
  );
}

interface Segment {
  text: string;
  bold: boolean;
  italic: boolean;
  gold: boolean;
}

function parseMarkdown(text: string): Segment[] {
  const segments: Segment[] = [];
  // Match {{gold}}, **bold**, *italic*, or plain text
  const regex = /(\{\{(.+?)\}\}|\*\*(.+?)\*\*|\*(.+?)\*|([^*{]+|\{(?!\{)[^*{]*))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      segments.push({ text: match[2], bold: false, italic: false, gold: true });
    } else if (match[3]) {
      segments.push({ text: match[3], bold: true, italic: false, gold: false });
    } else if (match[4]) {
      segments.push({ text: match[4], bold: false, italic: true, gold: false });
    } else if (match[5]) {
      segments.push({ text: match[5], bold: false, italic: false, gold: false });
    }
  }

  return segments.length > 0 ? segments : [{ text, bold: false, italic: false, gold: false }];
}

interface SectionHeadingProps {
  heading: string;
  accent: string;
  theme: Theme;
  isDark: boolean;
}

export function SectionHeading({
  heading,
  accent,
  theme,
  isDark,
}: SectionHeadingProps) {
  const headingColor = isDark ? theme.colors.white : theme.colors.black;

  return (
    <Text
      style={{
        fontFamily: theme.fonts.serif,
        fontSize: 32,
        fontWeight: 700,
        color: headingColor,
        marginBottom: 6,
        lineHeight: 1.2,
      }}
    >
      {heading}
      {"\n"}
      <Text style={{ color: theme.colors.accent }}>{accent}</Text>
    </Text>
  );
}
