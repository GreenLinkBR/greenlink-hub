import { ID } from "./common";

export type OpportunityStage =
  | "novo"
  | "qualificado"
  | "proposta"
  | "negociacao"
  | "ganho"
  | "perdido";

export interface Opportunity {
  id: ID;
  leadId?: string;
  customerId?: string;
  title: string;
  stage: OpportunityStage;
  amount: number;
  expectedCloseDate?: string;
  assignedTo?: string;
  winProbability?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
