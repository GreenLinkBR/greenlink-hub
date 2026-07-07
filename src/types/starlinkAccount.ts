import type { ID } from "./common";

export type StarlinkAccountStatus = "active" | "inactive" | "suspended" | "cancelled";

export interface StarlinkAccount {
  id: ID;
  glCode: string;
  customerId?: string;
  equipmentId?: string;
  gmailAlias: string;
  isPrimaryAccount: boolean;
  plan?: string;
  status: StarlinkAccountStatus;
  activatedAt?: string;
  customerHasAccess: boolean;
  recoveryEmail?: string;
  recoveryPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}