import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFContent } from "@/lib/pdf/types";
import { AspenDocument } from "@/lib/pdf/document";

export async function generatePDF(content: PDFContent): Promise<Buffer> {
  const document = React.createElement(AspenDocument, { content });
  // @react-pdf/renderer's renderToBuffer types are stricter than necessary —
  // it expects ReactElement<DocumentProps> but any valid Document-wrapping component works at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(document as any);
  return buffer;
}
