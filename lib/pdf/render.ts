import puppeteer, { type Browser } from "puppeteer";

/**
 * Renders /print/[planId] to a PDF buffer via headless Chrome.
 *
 * Why puppeteer: the sample output was produced by Chrome → PDF (Skia/PDF
 * producer in its metadata). React-PDF / pdfkit can't match the editorial
 * typography + CSS features (color-mix, radial-gradient, next/font) we use
 * in the print route. Puppeteer renders the same HTML/CSS the developer sees
 * in their browser, which keeps the iteration loop tight.
 *
 * Lifecycle: we launch a fresh browser per request. A shared singleton would
 * be faster but risks zombie processes on hot-reload; for a take-home the
 * extra 800ms on launch is acceptable and the code stays obvious.
 */

const LETTER_PDF_OPTIONS = {
  format: "Letter" as const,
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: true,
};

export class PdfRenderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "PdfRenderError";
  }
}

function resolveBaseUrl(): string {
  // PRINT_BASE_URL is optional; set it when running behind a proxy or in
  // production. Locally the dev server answers on 3000 by default.
  const envUrl = process.env.PRINT_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

export async function renderPlanToPdf(planId: string): Promise<Buffer> {
  const url = `${resolveBaseUrl()}/print/${encodeURIComponent(planId)}`;

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Letter at 96 dpi. Matches the CSS @page rule exactly so Chrome doesn't
    // rescale content when producing the PDF.
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });

    const response = await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30_000,
    });
    if (!response || response.status() >= 400) {
      throw new PdfRenderError(
        `Print route returned ${response?.status() ?? "no response"} for ${url}`,
      );
    }

    // next/font resolves asynchronously. Without this, the first render can
    // snapshot system-font fallbacks and the typography breaks.
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf(LETTER_PDF_OPTIONS);
    return Buffer.from(pdf);
  } catch (err) {
    if (err instanceof PdfRenderError) throw err;
    throw new PdfRenderError(
      err instanceof Error ? err.message : "Unknown puppeteer failure",
      err,
    );
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
