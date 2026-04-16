import type { Client } from "@/lib/agent/schemas";

export interface ClientRepository {
  get(id: string): Promise<Client>;
  list(): Promise<Client[]>;
}
