import { promises as fs } from "node:fs";
import path from "node:path";
import type { ImageTag } from "@/lib/agent/schemas";

/**
 * Image resolver for the renderer.
 *
 * The drafter picks a tag; `resolveImage(tag)` looks up the manifest and
 * returns the URL relative to /public plus alt text. If the file doesn't
 * exist on disk yet (take-home hasn't dropped real photos in), we return
 * null so the caller can fall back to the gradient placeholder — the PDF
 * still renders beautifully without images.
 */

type ManifestEntry = { file: string; alt: string; credit: string };
type Manifest = { images: Record<ImageTag, ManifestEntry> };

let cached: Manifest | null = null;

async function loadManifest(): Promise<Manifest> {
  if (cached) return cached;
  const raw = await fs.readFile(
    path.join(process.cwd(), "public", "imagery", "manifest.json"),
    "utf8",
  );
  cached = JSON.parse(raw) as Manifest;
  return cached;
}

export async function resolveImage(
  tag: ImageTag,
): Promise<{ src: string; alt: string } | null> {
  const manifest = await loadManifest();
  const entry = manifest.images[tag];
  if (!entry) return null;
  const absPath = path.join(process.cwd(), "public", "imagery", entry.file);
  try {
    await fs.access(absPath);
    return { src: `/imagery/${entry.file}`, alt: entry.alt };
  } catch {
    // File doesn't exist (yet) — caller should use the gradient placeholder.
    return null;
  }
}
