import { CLIENTS } from "@/data/contact";
import { ClientSchema, type Client } from "@/lib/agent/schemas";
import type { ClientRepository } from "../client-repository";

/**
 * JSON-backed client repository — reads from `data/contact.ts`.
 *
 * The id for each client is derived from their first name so we don't
 * hand-maintain ids in the data file. Everything downstream (orchestrator,
 * palette cache, intake classifier) keys on this id. When two seed clients
 * share a first name, both fall back to a full-name slug so the ids stay
 * unique — this is what the two "Matt" personas exercise.
 */
function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveIds(raws: readonly (typeof CLIENTS)[number][]): string[] {
  const firstNameCounts = new Map<string, number>();
  for (const raw of raws) {
    const first = raw.name.split(" ")[0].toLowerCase();
    firstNameCounts.set(first, (firstNameCounts.get(first) ?? 0) + 1);
  }
  return raws.map((raw) => {
    const first = raw.name.split(" ")[0].toLowerCase();
    return (firstNameCounts.get(first) ?? 0) > 1 ? slug(raw.name) : first;
  });
}

const IDS = deriveIds(CLIENTS);
const ALL: Client[] = CLIENTS.map((raw, i) =>
  ClientSchema.parse({ id: IDS[i], ...raw }),
);
const BY_ID = new Map(ALL.map((c) => [c.id, c]));

export class JsonClientRepository implements ClientRepository {
  async get(id: string): Promise<Client> {
    const hit = BY_ID.get(id);
    if (!hit) {
      const known = Array.from(BY_ID.keys()).join(", ");
      throw new Error(`Client "${id}" not found (known: ${known})`);
    }
    return hit;
  }

  async list(): Promise<Client[]> {
    return ALL;
  }
}
