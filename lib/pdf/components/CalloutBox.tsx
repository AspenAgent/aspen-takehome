import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { CalloutComponent, Theme } from "../types";

interface CalloutBoxProps {
  data: CalloutComponent;
  theme: Theme;
  isDark: boolean;
}

export function CalloutBox({ data, theme, isDark }: CalloutBoxProps) {
  const styles = StyleSheet.create({
    container: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent,
      backgroundColor: isDark ? theme.colors.primaryLight : theme.colors.grayLight,
      paddingLeft: 18,
      paddingRight: 18,
      paddingVertical: 16,
      marginVertical: 12,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? theme.colors.white : theme.colors.black,
      marginBottom: 8,
    },
    text: {
      fontFamily: theme.fonts.serif,
      fontSize: 11,
      fontStyle: "italic",
      color: isDark ? theme.colors.grayLight : theme.colors.grayDark,
      lineHeight: 1.6,
    },
    attribution: {
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      color: theme.colors.grayMedium,
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      {data.title && <Text style={styles.title}>{data.title}</Text>}
      <Text style={styles.text}>{data.text}</Text>
      {data.attribution && (
        <Text style={styles.attribution}>— {data.attribution}</Text>
      )}
    </View>
  );
}
