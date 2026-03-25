import Dexie, { type EntityTable } from "dexie";

export interface LocalTransaction {
  localId?: number;
  serverId: number | null;
  businessId: number;
  type: "sale" | "expense";
  description: string;
  amount: number;
  category: string | null;
  source: string;
  rawInput: string | null;
  createdAt: string;
  synced: boolean;
  deleted: boolean;
}

export interface LocalBusiness {
  id: number;
  phone: string;
  name: string;
  sector: string | null;
  city: string | null;
  language: string;
}

class FikexLocalDB extends Dexie {
  transactions!: EntityTable<LocalTransaction, "localId">;
  businesses!: EntityTable<LocalBusiness, "id">;

  constructor() {
    super("fikex-local");

    this.version(1).stores({
      transactions:
        "++localId, serverId, businessId, synced, createdAt, deleted",
      businesses: "id, phone",
    });
  }
}

export const localDb = new FikexLocalDB();
