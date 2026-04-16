import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { FeatureGridComponent, Theme } from "../types";
import { Icon } from "./Icons";

interface FeatureGridProps {
  data: FeatureGridComponent;
  theme: Theme;
  isDark: boolean;
}

export function FeatureGrid({ data, theme, isDark }: FeatureGridProps) {
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginVertical: 12,
    },
    card: {
      width: "48%",
      padding: 16,
      marginBottom: 10,
      marginRight: "2%",
      borderWidth: isDark ? 0 : 1,
      borderColor: theme.colors.grayLight,
      backgroundColor: isDark ? theme.colors.primaryLight : theme.colors.white,
      borderRadius: 4,
    },
    cardEven: {
      marginRight: 0,
    },
    iconWrap: {
      marginBottom: 10,
    },
    title: {
      fontFamily: theme.fonts.sans,
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? theme.colors.white : theme.colors.black,
      marginBottom: 5,
    },
    text: {
      fontFamily: theme.fonts.sans,
      fontSize: 9.5,
      color: isDark ? theme.colors.grayLight : theme.colors.grayDark,
      lineHeight: 1.5,
    },
  });

  return (
    <View style={styles.container}>
      {data.items.map((item, i) => (
        <View key={i} style={i % 2 === 1 ? [styles.card, styles.cardEven] : styles.card}>
          <View style={styles.iconWrap}>
            <Icon name={item.icon} size={32} color={theme.colors.accent} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}
