import { advisor } from "@/data/advisor";
import { contact } from "@/data/contact";
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, RGB } from "pdf-lib";

// ── Design tokens ────────────────────────────────────────────────────────────
const BRAND_BLUE  = rgb(0.08, 0.22, 0.42);
const ACCENT_TEAL = rgb(0.13, 0.60, 0.73);
const LIGHT_BG    = rgb(0.94, 0.97, 1.00);
const TEXT_DARK   = rgb(0.10, 0.10, 0.10);
const TEXT_GRAY   = rgb(0.42, 0.42, 0.42);
const WHITE       = rgb(1, 1, 1);

const PAGE_W  = 612;
const PAGE_H  = 792;
const MARGIN  = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ── Types ────────────────────────────────────────────────────────────────────
type Fonts = { bold: PDFFont; regular: PDFFont; italic: PDFFont };
type Block =
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "callout"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullet"; text: string };

// ── Text helpers ─────────────────────────────────────────────────────────────
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function stripMarkdown(text: string): string {
  return toWinAnsi(
    text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^#+\s*/, "")
      .trim()
  );
}

/** Replace characters outside WinAnsiEncoding (>U+00FF) so pdf-lib doesn't throw. */
function toWinAnsi(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")   // curly single quotes
    .replace(/[\u201C\u201D]/g, '"')   // curly double quotes
    .replace(/\u2013/g, "-")           // en dash
    .replace(/\u2014/g, "--")          // em dash
    .replace(/\u2022/g, "-")           // bullet
    .replace(/\u2713|\u2714/g, "√")    // check marks (√ is in WinAnsi)
    .replace(/\u2715|\u2716/g, "x")    // cross marks
    .replace(/[^\x00-\xFF]/g, "");     // strip anything else
}

// ── Content parser ───────────────────────────────────────────────────────────
function parseContent(raw: string): Block[] {
  const blocks: Block[] = [];
  const lines = raw.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^##\s/.test(trimmed)) {
      blocks.push({ kind: "heading", text: stripMarkdown(trimmed) });
    } else if (/^###\s/.test(trimmed)) {
      blocks.push({ kind: "subheading", text: stripMarkdown(trimmed) });
    } else if (/^\*\*[^*]+:\*\*/.test(trimmed) || /^>\s/.test(trimmed)) {
      blocks.push({ kind: "callout", text: stripMarkdown(trimmed.replace(/^>\s*/, "")) });
    } else if (/^[-•]\s/.test(trimmed)) {
      blocks.push({ kind: "bullet", text: stripMarkdown(trimmed.replace(/^[-•]\s*/, "")) });
    } else {
      blocks.push({ kind: "paragraph", text: stripMarkdown(trimmed) });
    }
  }
  return blocks;
}

function extractTitle(raw: string): string {
  const match = raw.match(/^##\s+(.+)/m);
  return match ? match[1].replace(/\*\*/g, "").trim() : "Financial Planning Report";
}

function extractNextStep(raw: string): string {
  const lower = raw.toLowerCase();
  const idx = lower.indexOf("next step");
  if (idx !== -1) {
    const snippet = raw.slice(idx, idx + 300);
    const lines = snippet.split("\n").filter(Boolean);
    return stripMarkdown(lines.slice(0, 2).join(" ")).trim();
  }
  return `Schedule a call with ${advisor.name} to review your personalized strategy.`;
}

// ── Page factory ─────────────────────────────────────────────────────────────
function addContentPage(doc: PDFDocument, fonts: Fonts, pageNum: number): { page: PDFPage; y: number } {
  const page = doc.addPage([PAGE_W, PAGE_H]);

  // Header bar
  page.drawRectangle({ x: 0, y: PAGE_H - 36, width: PAGE_W, height: 36, color: BRAND_BLUE });
  page.drawText(advisor.firm, { x: MARGIN, y: PAGE_H - 24, size: 10, font: fonts.bold, color: WHITE });

  // Footer
  page.drawLine({ start: { x: MARGIN, y: 40 }, end: { x: PAGE_W - MARGIN, y: 40 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  page.drawText(`Page ${pageNum}`, { x: PAGE_W / 2 - 15, y: 24, size: 9, font: fonts.regular, color: TEXT_GRAY });
  page.drawText(`Prepared for ${contact.name}`, { x: MARGIN, y: 24, size: 9, font: fonts.italic, color: TEXT_GRAY });

  return { page, y: PAGE_H - 36 - 30 };
}

// ── Cover page ───────────────────────────────────────────────────────────────
function drawCoverPage(doc: PDFDocument, fonts: Fonts, title: string): void {
  const page = doc.addPage([PAGE_W, PAGE_H]);

  // Full-bleed header block (top 55%)
  const headerH = PAGE_H * 0.55;
  page.drawRectangle({ x: 0, y: PAGE_H - headerH, width: PAGE_W, height: headerH, color: BRAND_BLUE });

  // Decorative accent strip
  page.drawRectangle({ x: 0, y: PAGE_H - headerH, width: PAGE_W, height: 5, color: ACCENT_TEAL });

  // Logo placeholder (rounded square)
  page.drawRectangle({ x: MARGIN, y: PAGE_H - 80, width: 48, height: 48, color: ACCENT_TEAL });
  page.drawText("WW", { x: MARGIN + 10, y: PAGE_H - 61, size: 18, font: fonts.bold, color: WHITE });

  // Firm name
  page.drawText(advisor.firm.toUpperCase(), {
    x: MARGIN + 60, y: PAGE_H - 55,
    size: 11, font: fonts.bold, color: rgb(0.75, 0.88, 1.0),
  });

  // Divider
  page.drawLine({ start: { x: MARGIN, y: PAGE_H - 110 }, end: { x: PAGE_W - MARGIN, y: PAGE_H - 110 }, thickness: 0.8, color: ACCENT_TEAL });

  // Document title
  const titleLines = wrapText(title, fonts.bold, 28, CONTENT_W);
  let ty = PAGE_H - 148;
  for (const ln of titleLines) {
    page.drawText(ln, { x: MARGIN, y: ty, size: 28, font: fonts.bold, color: WHITE });
    ty -= 36;
  }

  // Subtitle tagline
  page.drawText("A personalized financial strategy prepared exclusively for you", {
    x: MARGIN, y: ty - 10,
    size: 13, font: fonts.italic, color: rgb(0.75, 0.88, 1.0),
  });

  // Prepared-for block
  const clientY = PAGE_H - headerH + 52;
  page.drawText("PREPARED FOR", { x: MARGIN, y: clientY + 28, size: 9, font: fonts.bold, color: ACCENT_TEAL });
  page.drawText(contact.name, { x: MARGIN, y: clientY, size: 20, font: fonts.bold, color: TEXT_DARK });
  page.drawText(`${contact.occupation}  ·  ${contact.state}`, {
    x: MARGIN, y: clientY - 22,
    size: 11, font: fonts.regular, color: TEXT_GRAY,
  });

  // Date
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  page.drawText(dateStr, { x: MARGIN, y: clientY - 42, size: 10, font: fonts.regular, color: TEXT_GRAY });

  // Advisor info block (bottom right)
  const ax = PAGE_W - MARGIN - 180;
  const ay = 100;
  page.drawRectangle({ x: ax - 12, y: ay - 12, width: 196, height: 100, color: LIGHT_BG });
  page.drawText(advisor.name, { x: ax, y: ay + 68, size: 11, font: fonts.bold, color: BRAND_BLUE });
  page.drawText(advisor.firm, { x: ax, y: ay + 52, size: 9, font: fonts.regular, color: TEXT_GRAY });
  page.drawText(advisor.email, { x: ax, y: ay + 36, size: 9, font: fonts.regular, color: TEXT_GRAY });
  page.drawText(advisor.phone, { x: ax, y: ay + 20, size: 9, font: fonts.regular, color: TEXT_GRAY });
}

// ── Content pages ─────────────────────────────────────────────────────────────
function drawContentPages(doc: PDFDocument, fonts: Fonts, blocks: Block[]): void {
  let pageNum = 2;
  let { page, y } = addContentPage(doc, fonts, pageNum);
  const bottomLimit = 60;

  const newPage = () => {
    pageNum++;
    const result = addContentPage(doc, fonts, pageNum);
    page = result.page;
    y = result.y;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < bottomLimit) newPage();
  };

  for (const block of blocks) {
    switch (block.kind) {
      case "heading": {
        ensureSpace(52);
        if (y < PAGE_H - 36 - 30 - 10) y -= 14; // gap before heading
        page.drawRectangle({ x: MARGIN, y: y - 28, width: CONTENT_W, height: 34, color: LIGHT_BG });
        page.drawRectangle({ x: MARGIN, y: y - 28, width: 4, height: 34, color: BRAND_BLUE });
        page.drawText(block.text, { x: MARGIN + 12, y: y - 15, size: 14, font: fonts.bold, color: BRAND_BLUE });
        y -= 44;
        break;
      }
      case "subheading": {
        ensureSpace(30);
        y -= 8;
        page.drawText(block.text, { x: MARGIN, y, size: 12, font: fonts.bold, color: TEXT_DARK });
        y -= 18;
        page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + 120, y }, thickness: 1.5, color: ACCENT_TEAL });
        y -= 10;
        break;
      }
      case "callout": {
        const lines = wrapText(block.text, fonts.italic, 10.5, CONTENT_W - 28);
        const boxH = lines.length * 15 + 20;
        ensureSpace(boxH + 10);
        y -= 8;
        page.drawRectangle({ x: MARGIN, y: y - boxH, width: CONTENT_W, height: boxH, color: LIGHT_BG });
        page.drawRectangle({ x: MARGIN, y: y - boxH, width: 4, height: boxH, color: ACCENT_TEAL });
        let ly = y - 14;
        for (const ln of lines) {
          page.drawText(ln, { x: MARGIN + 14, y: ly, size: 10.5, font: fonts.italic, color: TEXT_DARK });
          ly -= 15;
        }
        y -= boxH + 12;
        break;
      }
      case "bullet": {
        const lines = wrapText(block.text, fonts.regular, 10.5, CONTENT_W - 18);
        ensureSpace(lines.length * 15 + 6);
        page.drawText("-", { x: MARGIN, y, size: 10.5, font: fonts.bold, color: ACCENT_TEAL });
        let ly = y;
        for (const ln of lines) {
          page.drawText(ln, { x: MARGIN + 14, y: ly, size: 10.5, font: fonts.regular, color: TEXT_DARK });
          ly -= 15;
        }
        y -= lines.length * 15 + 4;
        break;
      }
      case "paragraph": {
        const lines = wrapText(block.text, fonts.regular, 10.5, CONTENT_W);
        for (const ln of lines) {
          ensureSpace(16);
          page.drawText(ln, { x: MARGIN, y, size: 10.5, font: fonts.regular, color: TEXT_DARK });
          y -= 15;
        }
        y -= 6;
        break;
      }
    }
  }
}

// ── Closing page ──────────────────────────────────────────────────────────────
function drawClosingPage(doc: PDFDocument, fonts: Fonts, nextStep: string): void {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const totalPages = doc.getPageCount();

  // Header bar
  page.drawRectangle({ x: 0, y: PAGE_H - 36, width: PAGE_W, height: 36, color: BRAND_BLUE });
  page.drawText(advisor.firm, { x: MARGIN, y: PAGE_H - 24, size: 10, font: fonts.bold, color: WHITE });

  let y = PAGE_H - 36 - 48;

  // Next Steps heading
  page.drawText("Next Steps", { x: MARGIN, y, size: 20, font: fonts.bold, color: BRAND_BLUE });
  y -= 10;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + 180, y }, thickness: 2, color: ACCENT_TEAL });
  y -= 22;

  // CTA box
  const ctaLines = wrapText(nextStep, fonts.regular, 11, CONTENT_W - 24);
  const ctaH = ctaLines.length * 17 + 24;
  page.drawRectangle({ x: MARGIN, y: y - ctaH, width: CONTENT_W, height: ctaH, color: LIGHT_BG });
  page.drawRectangle({ x: MARGIN, y: y - ctaH, width: 4, height: ctaH, color: BRAND_BLUE });
  let cy = y - 16;
  for (const ln of ctaLines) {
    page.drawText(ln, { x: MARGIN + 14, y: cy, size: 11, font: fonts.regular, color: TEXT_DARK });
    cy -= 17;
  }
  y -= ctaH + 32;

  // Advisor contact card
  page.drawText("YOUR ADVISOR", { x: MARGIN, y, size: 9, font: fonts.bold, color: ACCENT_TEAL });
  y -= 18;
  page.drawRectangle({ x: MARGIN, y: y - 74, width: CONTENT_W, height: 84, color: BRAND_BLUE });
  page.drawText(advisor.name, { x: MARGIN + 16, y: y - 18, size: 14, font: fonts.bold, color: WHITE });
  page.drawText(advisor.firm, { x: MARGIN + 16, y: y - 36, size: 10, font: fonts.regular, color: rgb(0.75, 0.88, 1.0) });
  page.drawText(`Email: ${advisor.email}`, { x: MARGIN + 16, y: y - 54, size: 10, font: fonts.regular, color: WHITE });
  page.drawText(`Phone: ${advisor.phone}`, { x: MARGIN + 220, y: y - 54, size: 10, font: fonts.regular, color: WHITE });
  y -= 74 + 40;

  // Disclosure
  page.drawLine({ start: { x: MARGIN, y: y + 10 }, end: { x: PAGE_W - MARGIN, y: y + 10 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  y -= 4;
  page.drawText("DISCLOSURE", { x: MARGIN, y, size: 8, font: fonts.bold, color: TEXT_GRAY });
  y -= 14;
  const discLines = wrapText(advisor.disclosure, fonts.italic, 8.5, CONTENT_W);
  for (const ln of discLines) {
    page.drawText(ln, { x: MARGIN, y, size: 8.5, font: fonts.italic, color: TEXT_GRAY });
    y -= 13;
  }

  // Footer
  page.drawLine({ start: { x: MARGIN, y: 40 }, end: { x: PAGE_W - MARGIN, y: 40 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  page.drawText(`Page ${totalPages}`, { x: PAGE_W / 2 - 15, y: 24, size: 9, font: fonts.regular, color: TEXT_GRAY });
  page.drawText(`Prepared for ${contact.name}`, { x: MARGIN, y: 24, size: 9, font: fonts.italic, color: TEXT_GRAY });
}

// ── Entry point ───────────────────────────────────────────────────────────────
export async function generatePDF(content: string): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    bold:    await doc.embedFont(StandardFonts.HelveticaBold),
    regular: await doc.embedFont(StandardFonts.Helvetica),
    italic:  await doc.embedFont(StandardFonts.HelveticaOblique),
  };

  const title    = extractTitle(content);
  const blocks   = parseContent(content);
  const nextStep = extractNextStep(content);

  drawCoverPage(doc, fonts, title);
  drawContentPages(doc, fonts, blocks);
  drawClosingPage(doc, fonts, nextStep);

  const bytes = await doc.save();

  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
