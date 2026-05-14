import { ID } from "./common";

export type LeadStatus = "novo" | "contatado" | "qualificado" | "perdido" | "convertido";

export interface Lead {
  id: ID;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  assignedTo?: string;
  convertedCustomerId?: string;
  convertedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
