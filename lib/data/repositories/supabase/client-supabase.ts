import type { Client } from "@/lib/agent/schemas";
import type { ClientRepository } from "../client-repository";

/**
 * Scaffolded-only Supabase client repository. Not wired up.
 *
 * See todos/supabase-backend.md for the schema + wiring.
 * Activate by setting DATA_BACKEND=supabase in .env.local and
 * implementing these methods against your `clients` table.
 */
export class SupabaseClientRepository implements ClientRepository {
  async get(_id: string): Promise<Client> {
    throw new Error(
      "SupabaseClientRepository not wired — see todos/supabase-backend.md",
    );
  }

  async list(): Promise<Client[]> {
    throw new Error(
      "SupabaseClientRepository not wired — see todos/supabase-backend.md",
    );
  }
}
