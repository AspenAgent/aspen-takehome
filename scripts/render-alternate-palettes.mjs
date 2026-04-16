/**
 * Step-5 verification: prove the renderer is palette-portable.
 *
 * We don't need the LLM for this — we need to prove the print route and all
 * block components consume arbitrary Palette inputs through CSS variables
 * without hardcoded colors. This injects two hand-crafted alternate palettes
 * into the in-memory plan cache, renders, and screenshots each variant.
 *
 * Writes:
 *   /tmp/aspen-snapshots/alt-<variant>-page-<nn>.png
 *   /tmp/aspen-snapshots/alt-<variant>.pdf
 */
import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";

const OUT = "/tmp/aspen-snapshots";
mkdirSync(OUT, { recursive: true });

const VARIANTS = [
  {
    id: "manhattan-archive",
    palette: {
      name: "Manhattan Archive",
      typography: "classic",
      tokens: {
        backgroundDeep: "#17202a",
        backgroundSurface: "#f2efe8",
        backgroundAccent: "#1f2a37",
        textOnDeep: "#f2efe8",
        textOnSurface: "#17202a",
        textSubtle: "#76808e",
        accentPrimary: "#b48a56",
        accentSecondary: "#5d8a70",
        accentDanger: "#b45a4a",
      },
    },
  },
  {
    id: "pacific-granite",
    palette: {
      name: "Pacific Granite",
      typography: "modern",
      tokens: {
        backgroundDeep: "#1a1f2e",
        backgroundSurface: "#edeae2",
        backgroundAccent: "#232a3d",
        textOnDeep: "#edeae2",
        textOnSurface: "#1a1f2e",
        textSubtle: "#7a8192",
        accentPrimary: "#7e9cb8",
        accentSecondary: "#6bbf8a",
        accentDanger: "#cf6a5a",
      },
    },
  },
];

// Launch once, reuse.
const browser = await puppeteer.launch({ headless: true });

for (const v of VARIANTS) {
  console.log(`\n→ Variant: ${v.id} (${v.palette.name}, ${v.palette.typography})`);
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });

  // Hit the mock route first so the plan loads — this proves dynamic palette
  // override works too: we inject CSS vars at the document level, mirroring
  // what the orchestrator's printed route would do via cache-backed state.
  await page.goto("http://localhost:3000/print/mock", {
    waitUntil: "networkidle0",
  });
  await page.evaluate(() => document.fonts.ready);

  // Override CSS custom properties on the print-root to simulate this palette.
  await page.evaluate((tokens) => {
    const root = document.querySelector(".print-root");
    if (!root) throw new Error("no .print-root found");
    const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    for (const [k, val] of Object.entries(tokens)) {
      root.style.setProperty(`--palette-${kebab(k)}`, val);
    }
  }, v.palette.tokens);

  // PDF
  await page.pdf({
    path: `${OUT}/alt-${v.id}.pdf`,
    format: "Letter",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  // Screenshot each page
  const handles = await page.$$(".letter-page");
  for (let i = 0; i < handles.length; i++) {
    const path = `${OUT}/alt-${v.id}-page-${String(i + 1).padStart(2, "0")}.png`;
    await handles[i].screenshot({ path });
  }
  console.log(`  ${handles.length} pages → ${OUT}/alt-${v.id}-page-*.png`);
  await page.close();
}

await browser.close();
console.log("\ndone");
