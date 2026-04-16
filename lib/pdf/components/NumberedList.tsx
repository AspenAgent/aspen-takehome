import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { NumberedListComponent, Theme } from "../types";

interface NumberedListProps {
  data: NumberedListComponent;
  theme: Theme;
  isDark: boolean;
}

export function NumberedList({ data, theme, isDark }: NumberedListProps) {
  const styles = StyleSheet.create({
    container: {
      marginVertical: 12,
    },
    item: {
      flexDirection: "row",
      backgroundColor: isDark ? theme.colors.primaryLight : theme.colors.primary,
      padding: 16,
      marginBottom: 8,
      borderRadius: 4,
    },
    badge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    badgeText: {
      fontFamily: theme.fonts.sans,
      fontSize: 14,
      fontWeight: 700,
      color: theme.colors.white,
    },
    content: {
      flex: 1,
      justifyContent: "center",
    },
    title: {
      fontFamily: theme.fonts.sans,
      fontSize: 12.5,
      fontWeight: 700,
      color: isDark ? theme.colors.white : theme.colors.grayLight,
      marginBottom: 3,
    },
    text: {
      fontFamily: theme.fonts.sans,
      fontSize: 10,
      color: theme.colors.grayLight,
      lineHeight: 1.5,
    },
  });

  return (
    <View style={styles.container}>
      {data.items.map((item, i) => (
        <View key={i} style={styles.item}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{i + 1}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
