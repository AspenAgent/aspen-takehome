import { Theme } from "./types";

/**
 * Default theme based on the sample-output.pdf design.
 * Dark green / gold / cream palette — professional wealth management aesthetic.
 *
 * In the future, this can be swapped per financial advisory firm
 * to match their brand colors, fonts, and spacing preferences.
 */
export const defaultTheme: Theme = {
  colors: {
    primary: "#2D3B2D",
    primaryLight: "#3A4A3A",
    accent: "#C4963B",
    cream: "#FAF8F3",
    white: "#FFFFFF",
    black: "#1A1A1A",
    grayLight: "#E8E4DE",
    grayMedium: "#8A8A8A",
    grayDark: "#4A4A4A",
    positive: "#4A7C59",
    negative: "#C45B4A",
  },
  fonts: {
    serif: "Playfair Display",
    sans: "Inter",
  },
  spacing: {
    pageHorizontal: 60,
    pageVertical: 50,
    sectionGap: 24,
    paragraphGap: 12,
  },
};
