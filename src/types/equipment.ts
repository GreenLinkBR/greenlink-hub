import type { ID } from "./common";

export type EquipmentStatus = "in_stock" | "installed" | "maintenance" | "retired";

export interface Equipment {
  id: ID;
  customerId?: string;
  model?: string;
  serialNumber?: string;
  kitId?: string;
  dishModel?: string;
  pn?: string;
  powerSource?: string;
  warrantyUntil?: string;
  installedAt?: string;
  status: EquipmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}