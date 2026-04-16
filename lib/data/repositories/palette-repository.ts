import type { Palette } from "@/lib/agent/schemas";

export interface PaletteRepository {
  /** Palette id is always `${advisorId}:${clientId}`. */
  get(id: string): Promise<Palette | null>;
  save(palette: Palette): Promise<Palette>;
  /** Append a revision prompt (audit trail); returns updated palette. */
  recordRevision(id: string, prompt: string): Promise<Palette>;
}
