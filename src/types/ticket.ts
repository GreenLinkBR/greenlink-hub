import { ID } from "./common";

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "new" | "in_progress" | "waiting_customer" | "resolved" | "cancelled";

export interface TicketMessage {
  id: ID;
  ticketId: string;
  authorUserId?: string;
  authorContactId?: string;
  isInternal: boolean;
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: ID;
  ticketNumber: string;
  customerId: string;
  contractId?: string;
  assetId?: string;
  channel?: string;
  subject: string;
  description?: string;
  category?: string;
  priority: TicketPriority;
  status: TicketStatus;
  slaDueAt?: string;
  assignedTo?: string;
  openedByContactId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: TicketMessage[];
}
