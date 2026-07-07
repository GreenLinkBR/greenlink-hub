import type { ID } from "./common";

export type InstallationStatus = "scheduled" | "in_progress" | "done" | "cancelled";

export interface Installation {
  id: ID;
  customerId: string;
  equipmentId?: string;
  technicianId?: string;
  scheduledAt?: string;
  executedAt?: string;
  checklist: Record<string, unknown>;
  photosBefore: string[];
  photosAfter: string[];
  signatureUrl?: string;
  gpsLat?: number;
  gpsLng?: number;
  status: InstallationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}