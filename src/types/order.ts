import { ID } from "./common";

export type OrderStatus =
  | "open"
  | "approved"
  | "invoiced"
  | "partially_fulfilled"
  | "fulfilled"
  | "cancelled";

export interface CustomerOrderItem {
  id: ID;
  orderId: string;
  catalogItemId?: string;
  description: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  serviceStartDate?: string;
  serviceEndDate?: string;
}

export interface CustomerOrder {
  id: ID;
  orderNumber: string;
  quoteId?: string;
  customerId: string;
  status: OrderStatus;
  orderDate: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
}
