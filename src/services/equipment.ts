import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Equipment, EquipmentStatus } from "@/types/equipment";

type Row = Database["public"]["Tables"]["equipment"]["Row"];

const map = (row: Row): Equipment => ({
  id: row.id,
  customerId: row.customer_id ?? undefined,
  model: row.model ?? undefined,
  serialNumber: row.serial_number ?? undefined,
  kitId: row.kit_id ?? undefined,
  dishModel: row.dish_model ?? undefined,
  pn: row.pn ?? undefined,
  powerSource: row.power_source ?? undefined,
  warrantyUntil: row.warranty_until ?? undefined,
  installedAt: row.installed_at ?? undefined,
  status: (row.status as EquipmentStatus) ?? "in_stock",
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const payload = (d: Partial<Equipment>) => ({
  customer_id: d.customerId ?? null,
  model: d.model ?? null,
  serial_number: d.serialNumber ?? null,
  kit_id: d.kitId ?? null,
  dish_model: d.dishModel ?? null,
  pn: d.pn ?? null,
  power_source: d.powerSource ?? null,
  warranty_until: d.warrantyUntil ?? null,
  installed_at: d.installedAt ?? null,
  status: d.status ?? "in_stock",
  notes: d.notes ?? null,
});

export const equipmentService = {
  list: async (): Promise<Equipment[]> => {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(map);
  },
  get: async (id: string) => {
    const { data, error } = await supabase.from("equipment").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? map(data) : undefined;
  },
  create: async (data: Partial<Equipment>) => {
    const { data: created, error } = await supabase
      .from("equipment")
      .insert(payload(data))
      .select()
      .single();
    if (error) throw error;
    return map(created);
  },
  update: async (id: string, data: Partial<Equipment>) => {
    const { data: updated, error } = await supabase
      .from("equipment")
      .update(payload(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return map(updated);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) throw error;
  },
};