import type { Palette } from "@/lib/agent/schemas";
import type { PaletteRepository } from "../palette-repository";

/**
 * Scaffolded-only Supabase palette repository. Not wired up.
 * See todos/supabase-backend.md.
 */
export class SupabasePaletteRepository implements PaletteRepository {
  async get(_id: string): Promise<Palette | null> {
    throw new Error(
      "SupabasePaletteRepository not wired — see todos/supabase-backend.md",
    );
  }

  async save(_palette: Palette): Promise<Palette> {
    throw new Error(
      "SupabasePaletteRepository not wired — see todos/supabase-backend.md",
    );
  }

  async recordRevision(_id: string, _prompt: string): Promise<Palette> {
    throw new Error(
      "SupabasePaletteRepository not wired — see todos/supabase-backend.md",
    );
  }
}
