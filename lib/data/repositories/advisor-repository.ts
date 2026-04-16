import type { Advisor } from "@/lib/agent/schemas";

export interface AdvisorRepository {
  get(id: string): Promise<Advisor>;
  list(): Promise<Advisor[]>;
}
