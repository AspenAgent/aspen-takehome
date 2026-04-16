import type { ClientRepository } from "./client-repository";
import type { AdvisorRepository } from "./advisor-repository";
import type { PaletteRepository } from "./palette-repository";
import { JsonClientRepository } from "./json/client-json";
import { JsonAdvisorRepository } from "./json/advisor-json";
import { JsonPaletteRepository } from "./json/palette-json";
import { SupabaseClientRepository } from "./supabase/client-supabase";
import { SupabaseAdvisorRepository } from "./supabase/advisor-supabase";
import { SupabasePaletteRepository } from "./supabase/palette-supabase";

export type { ClientRepository, AdvisorRepository, PaletteRepository };

/**
 * Data backend switch. Defaults to "json" so the app runs out-of-the-box.
 * Set DATA_BACKEND=supabase in .env.local to use the (scaffolded) Supabase
 * repos — see todos/supabase-backend.md for what it takes to wire them up.
 */
const backend = (process.env.DATA_BACKEND ?? "json").toLowerCase();

export const clients: ClientRepository =
  backend === "supabase" ? new SupabaseClientRepository() : new JsonClientRepository();

export const advisors: AdvisorRepository =
  backend === "supabase"
    ? new SupabaseAdvisorRepository()
    : new JsonAdvisorRepository();

export const palettes: PaletteRepository =
  backend === "supabase"
    ? new SupabasePaletteRepository()
    : new JsonPaletteRepository();

export function paletteIdFor(advisorId: string, clientId: string): string {
  return `${advisorId}:${clientId}`;
}
