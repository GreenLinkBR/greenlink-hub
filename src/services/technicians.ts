import { supabase } from "@/integrations/supabase/client";
import type { TechnicianStats } from "@/types/technician";

export const technicianService = {
  list: async (): Promise<TechnicianStats[]> => {
    const { data, error } = await supabase
      .from("technicians_stats")
      .select("*")
      .order("installations_done", { ascending: false });
    if (error) throw error;
    return (data ?? [])
      .filter((r) => r.technician_id)
      .map((r) => ({
        technicianId: r.technician_id!,
        fullName: r.full_name ?? undefined,
        email: r.email ?? undefined,
        installationsScheduled: r.installations_scheduled ?? 0,
        installationsDone: r.installations_done ?? 0,
        avgHoursToExecute: r.avg_hours_to_execute ?? undefined,
      }));
  },
};