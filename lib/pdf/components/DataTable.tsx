import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableComponent, Theme } from "../types";

interface DataTableProps {
  data: TableComponent;
  theme: Theme;
  isDark: boolean;
}

export function DataTable({ data, theme, isDark }: DataTableProps) {
  const styles = StyleSheet.create({
    container: {
      marginVertical: 12,
    },
    headerRow: {
      flexDirection: "row",
      backgroundColor: isDark ? theme.colors.accent : theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    headerCell: {
      flex: 1,
      fontFamily: theme.fonts.sans,
      fontSize: 9,
      fontWeight: 600,
      color: isDark ? theme.colors.primary : theme.colors.accent,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    row: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? theme.colors.primaryLight : theme.colors.grayLight,
    },
    rowAlt: {
      backgroundColor: isDark
        ? theme.colors.primaryLight
        : "rgba(0,0,0,0.02)",
    },
    cell: {
      flex: 1,
      fontFamily: theme.fonts.sans,
      fontSize: 10.5,
      color: isDark ? theme.colors.grayLight : theme.colors.grayDark,
      lineHeight: 1.4,
    },
    cellFirst: {
      fontWeight: 600,
      color: isDark ? theme.colors.white : theme.colors.black,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {data.headers.map((header, i) => (
          <Text key={i} style={styles.headerCell}>
            {header}
          </Text>
        ))}
      </View>
      {data.rows.map((row, rowIdx) => (
        <View key={rowIdx} style={rowIdx % 2 === 1 ? [styles.row, styles.rowAlt] : styles.row}>
          {row.map((cell, cellIdx) => (
            <Text
              key={cellIdx}
              style={cellIdx === 0 ? [styles.cell, styles.cellFirst] : styles.cell}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
