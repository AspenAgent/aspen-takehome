import { advisor } from "@/data/advisor";
import { AdvisorSchema, type Advisor } from "@/lib/agent/schemas";
import type { AdvisorRepository } from "../advisor-repository";

function toAdvisor(raw: typeof advisor): Advisor {
  // id from firm slug: "Whitfield Wealth Advisors" -> "whitfield"
  const id = raw.firm.split(/\s+/)[0].toLowerCase();
  return AdvisorSchema.parse({ id, ...raw });
}

const JAMES = toAdvisor(advisor);

export class JsonAdvisorRepository implements AdvisorRepository {
  async get(id: string): Promise<Advisor> {
    if (id !== JAMES.id) {
      throw new Error(`Advisor "${id}" not found (only "${JAMES.id}" is seeded)`);
    }
    return JAMES;
  }

  async list(): Promise<Advisor[]> {
    return [JAMES];
  }
}
