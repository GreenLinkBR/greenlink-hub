import { ID } from "./common";

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "expired" | "cancelled";

export interface QuoteItem {
  id: ID;
  quoteId: string;
  catalogItemId?: string;
  itemDescription: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalAmount: number;
  sortOrder: number;
}

export interface Quote {
  id: ID;
  quoteNumber: string;
  customerId: string;
  opportunityId?: string;
  status: QuoteStatus;
  issueDate: string;
  validUntil?: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
}
