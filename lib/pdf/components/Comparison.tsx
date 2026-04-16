import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ComparisonComponent, Theme } from "../types";

interface ComparisonProps {
  data: ComparisonComponent;
  theme: Theme;
  isDark: boolean;
}

export function Comparison({ data, theme, isDark }: ComparisonProps) {
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      marginVertical: 12,
    },
    side: {
      flex: 1,
      padding: 18,
      borderRadius: 4,
    },
    beforeSide: {
      backgroundColor: isDark ? theme.colors.primaryLight : theme.colors.grayLight,
      marginRight: 10,
    },
    afterSide: {
      backgroundColor: isDark ? theme.colors.primaryLight : theme.colors.grayLight,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.accent,
    },
    label: {
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: isDark ? theme.colors.grayMedium : theme.colors.grayMedium,
      marginBottom: 14,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      paddingBottom: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? theme.colors.primary : theme.colors.grayMedium,
    },
    itemLabel: {
      fontFamily: theme.fonts.sans,
      fontSize: 10.5,
      color: isDark ? theme.colors.grayLight : theme.colors.grayDark,
    },
    itemValue: {
      fontFamily: theme.fonts.sans,
      fontSize: 10.5,
      fontWeight: 700,
      color: isDark ? theme.colors.white : theme.colors.black,
    },
    afterValue: {
      color: theme.colors.accent,
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.side, styles.beforeSide]}>
        <Text style={styles.label}>{data.before.label}</Text>
        {data.before.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemValue}>{item.value}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.side, styles.afterSide]}>
        <Text style={styles.label}>{data.after.label}</Text>
        {data.after.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={[styles.itemValue, styles.afterValue]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
