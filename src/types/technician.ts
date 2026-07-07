export interface TechnicianStats {
  technicianId: string;
  fullName?: string;
  email?: string;
  installationsScheduled: number;
  installationsDone: number;
  avgHoursToExecute?: number;
}