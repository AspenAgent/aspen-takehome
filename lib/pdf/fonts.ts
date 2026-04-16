import { Font } from "@react-pdf/renderer";
import path from "path";

const fontsDir = path.join(process.cwd(), "lib/pdf/fonts");

Font.register({
  family: "Playfair Display",
  fonts: [
    { src: path.join(fontsDir, "PlayfairDisplay-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontsDir, "PlayfairDisplay-Bold.ttf"), fontWeight: 700 },
    {
      src: path.join(fontsDir, "PlayfairDisplay-Italic.ttf"),
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: path.join(fontsDir, "PlayfairDisplay-BoldItalic.ttf"),
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontsDir, "Inter-Regular.ttf"), fontWeight: 400 },
    // Inter has no static italic files — register regular as italic fallback
    // so react-pdf doesn't crash. Italic body text uses Playfair Display instead.
    { src: path.join(fontsDir, "Inter-Regular.ttf"), fontWeight: 400, fontStyle: "italic" },
    { src: path.join(fontsDir, "Inter-Medium.ttf"), fontWeight: 500 },
    { src: path.join(fontsDir, "Inter-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(fontsDir, "Inter-Bold.ttf"), fontWeight: 700 },
  ],
});

// Disable hyphenation — financial documents should not hyphenate words
Font.registerHyphenationCallback((word) => [word]);
