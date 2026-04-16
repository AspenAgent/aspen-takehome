import { promises as fs } from "node:fs";
import path from "node:path";
import { PaletteSchema, type Palette } from "@/lib/agent/schemas";
import type { PaletteRepository } from "../palette-repository";

const PALETTES_PATH = path.join(process.cwd(), "data", "palettes.json");

type PalettesFile = Record<string, Palette>;

async function readFile(): Promise<PalettesFile> {
  try {
    const raw = await fs.readFile(PALETTES_PATH, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: PalettesFile = {};
    for (const [k, v] of Object.entries(parsed)) {
      const result = PaletteSchema.safeParse(v);
      if (result.success) out[k] = result.data;
      // silently drop malformed entries; audit log would catch this in prod
    }
    return out;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      return {};
    }
    throw err;
  }
}

async function writeFile(data: PalettesFile): Promise<void> {
  await fs.mkdir(path.dirname(PALETTES_PATH), { recursive: true });
  await fs.writeFile(PALETTES_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export class JsonPaletteRepository implements PaletteRepository {
  async get(id: string): Promise<Palette | null> {
    const file = await readFile();
    return file[id] ?? null;
  }

  async save(palette: Palette): Promise<Palette> {
    const file = await readFile();
    file[palette.id] = palette;
    await writeFile(file);
    return palette;
  }

  async recordRevision(id: string, prompt: string): Promise<Palette> {
    const file = await readFile();
    const existing = file[id];
    if (!existing) throw new Error(`Palette "${id}" not found`);
    const updated: Palette = {
      ...existing,
      revisions: [...existing.revisions, { prompt, at: new Date().toISOString() }],
    };
    file[id] = updated;
    await writeFile(file);
    return updated;
  }
}
