import { ID } from "./common";

export type ContractType = "sale_installation" | "rental" | "subscription" | "support" | "mixed";
export type ContractStatus = "draft" | "active" | "suspended" | "expired" | "cancelled";
export type BillingFrequency = "one_time" | "monthly" | "quarterly" | "semiannual" | "annual";
export type BillingStatus = "open" | "partial" | "paid" | "overdue" | "cancelled";

export interface ContractItem {
  id: ID;
  contractId: string;
  catalogItemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  billingFrequency?: BillingFrequency;
  startDate?: string;
  endDate?: string;
  isRecurring: boolean;
}

export interface Contract {
  id: ID;
  contractNumber: string;
  customerId: string;
  orderId?: string;
  contractType: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  billingFrequency?: BillingFrequency;
  monthlyAmount: number;
  priceIndexer?: string;
  autoRenew: boolean;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  items: ContractItem[];
}
