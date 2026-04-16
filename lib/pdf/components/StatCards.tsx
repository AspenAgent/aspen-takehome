import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { StatsComponent, Theme } from "../types";

interface StatCardsProps {
  data: StatsComponent;
  theme: Theme;
  isDark: boolean;
}

export function StatCards({ data, theme, isDark }: StatCardsProps) {
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      marginVertical: 12,
    },
    card: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.primaryLight : theme.colors.primary,
      paddingVertical: 22,
      paddingHorizontal: 14,
      alignItems: "center",
      marginRight: 10,
    },
    cardLast: {
      marginRight: 0,
    },
    value: {
      fontFamily: theme.fonts.serif,
      fontSize: 34,
      fontWeight: 700,
      color: theme.colors.accent,
      marginBottom: 8,
    },
    label: {
      fontFamily: theme.fonts.sans,
      fontSize: 9.5,
      color: theme.colors.grayLight,
      textAlign: "center",
      lineHeight: 1.4,
    },
  });

  return (
    <View style={styles.container}>
      {data.items.map((item, i) => (
        <View
          key={i}
          style={i === data.items.length - 1 ? [styles.card, styles.cardLast] : styles.card}
        >
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
