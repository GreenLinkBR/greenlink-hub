import { ID, GenericStatus, Address } from "./common";

export type CustomerType = "pf" | "pj";

export interface CustomerContact {
  id: ID;
  fullName: string;
  roleTitle?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface Customer {
  id: ID;
  customerType: CustomerType;
  legalName: string;
  tradeName?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  status: GenericStatus;
  notes?: string;
  contacts: CustomerContact[];
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}
