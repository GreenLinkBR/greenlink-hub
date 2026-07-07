import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Installation, InstallationStatus } from "@/types/installation";

type Row = Database["public"]["Tables"]["installations"]["Row"];

const toStrArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const map = (row: Row): Installation => ({
  id: row.id,
  customerId: row.customer_id,
  equipmentId: row.equipment_id ?? undefined,
  technicianId: row.technician_id ?? undefined,
  scheduledAt: row.scheduled_at ?? undefined,
  executedAt: row.executed_at ?? undefined,
  checklist: (row.checklist as Record<string, unknown>) ?? {},
  photosBefore: toStrArr(row.photos_before),
  photosAfter: toStrArr(row.photos_after),
  signatureUrl: row.signature_url ?? undefined,
  gpsLat: row.gps_lat ?? undefined,
  gpsLng: row.gps_lng ?? undefined,
  status: (row.status as InstallationStatus) ?? "scheduled",
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const payload = (d: Partial<Installation>) => ({
  customer_id: d.customerId!,
  equipment_id: d.equipmentId ?? null,
  technician_id: d.technicianId ?? null,
  scheduled_at: d.scheduledAt ?? null,
  executed_at: d.executedAt ?? null,
  checklist: (d.checklist ?? {}) as never,
  photos_before: (d.photosBefore ?? []) as never,
  photos_after: (d.photosAfter ?? []) as never,
  signature_url: d.signatureUrl ?? null,
  gps_lat: d.gpsLat ?? null,
  gps_lng: d.gpsLng ?? null,
  status: d.status ?? "scheduled",
  notes: d.notes ?? null,
});

export const installationService = {
  list: async (): Promise<Installation[]> => {
    const { data, error } = await supabase
      .from("installations")
      .select("*")
      .order("scheduled_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data ?? []).map(map);
  },
  get: async (id: string) => {
    const { data, error } = await supabase
      .from("installations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? map(data) : undefined;
  },
  create: async (data: Partial<Installation>) => {
    const { data: created, error } = await supabase
      .from("installations")
      .insert(payload(data))
      .select()
      .single();
    if (error) throw error;
    return map(created);
  },
  update: async (id: string, data: Partial<Installation>) => {
    const { data: updated, error } = await supabase
      .from("installations")
      .update(payload(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return map(updated);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("installations").delete().eq("id", id);
    if (error) throw error;
  },
};