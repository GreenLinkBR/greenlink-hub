import type { ID } from "./common";

export type CustomerDocType = "cnh" | "energy_bill" | "starlink_label" | "other";

export interface CustomerDocument {
  id: ID;
  customerId: string;
  docType: CustomerDocType;
  fileUrl: string;
  ocrData?: Record<string, unknown> | null;
  uploadedBy?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}