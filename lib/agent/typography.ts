import {
  Fraunces,
  Inter,
  Cormorant_Garamond,
  Work_Sans,
  Playfair_Display,
  Source_Sans_3,
  Manrope,
} from "next/font/google";
import type { TypographyPairing } from "./schemas";

/**
 * Four pre-bundled font pairings the palette agent can choose from.
 *
 * The agent picks a pairing by *intent* (not arbitrary Google Font names)
 * so fonts are always locally self-hosted via next/font and there's no
 * FOUT, no runtime stylesheet fetches, no surprises in puppeteer.
 *
 * Adding a new pairing:
 *  1. Add the font imports above
 *  2. Add a case to PAIRINGS
 *  3. Add the pairing name to TypographyPairingSchema in schemas.ts
 */

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const interModernBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export type PairingFonts = {
  displayClassName: string;
  bodyClassName: string;
  variableClassName: string; // combined className to apply on <html>
  description: string;
  displayFont: string;
  bodyFont: string;
};

export const PAIRINGS: Record<TypographyPairing, PairingFonts> = {
  heritage: {
    displayClassName: fraunces.className,
    bodyClassName: inter.className,
    variableClassName: `${fraunces.variable} ${inter.variable}`,
    description:
      "Editorial serif (Fraunces) paired with a neutral sans (Inter). Evokes legacy wealth, trust, long time horizons.",
    displayFont: "Fraunces",
    bodyFont: "Inter",
  },
  modern: {
    displayClassName: manrope.className,
    bodyClassName: interModernBody.className,
    variableClassName: `${manrope.variable} ${interModernBody.variable}`,
    description:
      "Contemporary geometric sans (Manrope) paired with Inter. Evokes fintech, data-driven, forward-looking.",
    displayFont: "Manrope",
    bodyFont: "Inter",
  },
  warm: {
    displayClassName: cormorant.className,
    bodyClassName: workSans.className,
    variableClassName: `${cormorant.variable} ${workSans.variable}`,
    description:
      "Old-style serif (Cormorant Garamond) paired with a humanist sans (Work Sans). Warm, personal, family-oriented.",
    displayFont: "Cormorant Garamond",
    bodyFont: "Work Sans",
  },
  classic: {
    displayClassName: playfair.className,
    bodyClassName: sourceSans.className,
    variableClassName: `${playfair.variable} ${sourceSans.variable}`,
    description:
      "Didone serif (Playfair Display) paired with a clean humanist sans (Source Sans 3). Elegant, editorial, confident.",
    displayFont: "Playfair Display",
    bodyFont: "Source Sans 3",
  },
};

export function getPairing(name: TypographyPairing): PairingFonts {
  return PAIRINGS[name];
}

export const PAIRING_CHOICES_FOR_PROMPT = Object.entries(PAIRINGS)
  .map(([key, info]) => `- "${key}": ${info.description}`)
  .join("\n");
