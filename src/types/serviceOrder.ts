import { ID } from "./common";

export type ServiceType =
  | "installation"
  | "maintenance"
  | "removal"
  | "support"
  | "inspection"
  | "training";
export type ServicePriority = "low" | "medium" | "high" | "urgent";
export type ServiceOrderStatus =
  | "open"
  | "scheduled"
  | "in_route"
  | "in_progress"
  | "waiting_parts"
  | "done"
  | "cancelled"
  | "return_required";
export type TaskStatus = "pending" | "done";

export interface ServiceOrderTask {
  id: ID;
  serviceOrderId: string;
  title: string;
  status: TaskStatus;
  sortOrder: number;
  completedAt?: string;
}

export interface ServiceOrder {
  id: ID;
  osNumber: string;
  customerId: string;
  contractId?: string;
  assetId?: string;
  orderId?: string;
  ticketId?: string;
  serviceType: ServiceType;
  priority: ServicePriority;
  status: ServiceOrderStatus;
  scheduledStart?: string;
  scheduledEnd?: string;
  completedAt?: string;
  siteAddressId?: string;
  description?: string;
  createdBy?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  tasks: ServiceOrderTask[];
}
