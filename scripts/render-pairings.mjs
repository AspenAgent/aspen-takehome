/**
 * Render page 1 (cover) in each of the 4 typography pairings so we can prove
 * font swapping works end-to-end through the print route's ?pairing override.
 */
import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";

const OUT = "/tmp/aspen-snapshots";
mkdirSync(OUT, { recursive: true });

const PAIRINGS = ["heritage", "modern", "warm", "classic"];

const browser = await puppeteer.launch({ headless: true });
for (const p of PAIRINGS) {
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:3000/print/mock?pairing=${p}`, {
    waitUntil: "networkidle0",
  });
  await page.evaluate(() => document.fonts.ready);
  const cover = await page.$(".letter-page");
  if (cover) {
    await cover.screenshot({ path: `${OUT}/pairing-${p}.png` });
    console.log(`  → pairing-${p}.png`);
  }
  await page.close();
}
await browser.close();
