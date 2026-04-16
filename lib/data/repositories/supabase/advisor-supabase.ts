import type { Advisor } from "@/lib/agent/schemas";
import type { AdvisorRepository } from "../advisor-repository";

/**
 * Scaffolded-only Supabase advisor repository. Not wired up.
 * See todos/supabase-backend.md and todos/multi-advisor-brands.md.
 */
export class SupabaseAdvisorRepository implements AdvisorRepository {
  async get(_id: string): Promise<Advisor> {
    throw new Error(
      "SupabaseAdvisorRepository not wired — see todos/supabase-backend.md",
    );
  }

  async list(): Promise<Advisor[]> {
    throw new Error(
      "SupabaseAdvisorRepository not wired — see todos/supabase-backend.md",
    );
  }
}
