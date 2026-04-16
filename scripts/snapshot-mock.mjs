import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";

const OUT = "/tmp/aspen-snapshots";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
// 96 dpi, letter = 816x1056 css px
await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });

await page.goto("http://localhost:3000/print/mock", { waitUntil: "networkidle0" });

// Also emit a combined PDF for a real print preview
await page.pdf({
  path: `${OUT}/mock.pdf`,
  format: "Letter",
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: true,
});

// Screenshot each .letter-page element individually
const handles = await page.$$(".letter-page");
console.log(`Found ${handles.length} pages`);
for (let i = 0; i < handles.length; i++) {
  const path = `${OUT}/page-${String(i + 1).padStart(2, "0")}.png`;
  await handles[i].screenshot({ path });
  console.log(`  → ${path}`);
}

await browser.close();
