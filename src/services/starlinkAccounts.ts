import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { StarlinkAccount, StarlinkAccountStatus } from "@/types/starlinkAccount";

type Row = Database["public"]["Tables"]["starlink_accounts"]["Row"];

const map = (row: Row): StarlinkAccount => ({
  id: row.id,
  glCode: row.gl_code,
  customerId: row.customer_id ?? undefined,
  equipmentId: row.equipment_id ?? undefined,
  gmailAlias: row.gmail_alias,
  isPrimaryAccount: row.is_primary_account,
  plan: row.plan ?? undefined,
  status: (row.status as StarlinkAccountStatus) ?? "active",
  activatedAt: row.activated_at ?? undefined,
  customerHasAccess: row.customer_has_access,
  recoveryEmail: row.recovery_email ?? undefined,
  recoveryPhone: row.recovery_phone ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const payload = (d: Partial<StarlinkAccount>) => ({
  customer_id: d.customerId ?? null,
  equipment_id: d.equipmentId ?? null,
  is_primary_account: d.isPrimaryAccount ?? false,
  plan: d.plan ?? null,
  status: d.status ?? "active",
  activated_at: d.activatedAt ?? null,
  customer_has_access: d.customerHasAccess ?? false,
  recovery_email: d.recoveryEmail ?? null,
  recovery_phone: d.recoveryPhone ?? null,
  notes: d.notes ?? null,
});

export const starlinkAccountService = {
  list: async (): Promise<StarlinkAccount[]> => {
    const { data, error } = await supabase
      .from("starlink_accounts")
      .select("*")
      .order("gl_code", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(map);
  },
  get: async (id: string) => {
    const { data, error } = await supabase
      .from("starlink_accounts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? map(data) : undefined;
  },
  create: async (data: Partial<StarlinkAccount>) => {
    const { data: created, error } = await supabase
      .from("starlink_accounts")
      .insert(payload(data))
      .select()
      .single();
    if (error) throw error;
    return map(created);
  },
  update: async (id: string, data: Partial<StarlinkAccount>) => {
    const { data: updated, error } = await supabase
      .from("starlink_accounts")
      .update(payload(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return map(updated);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("starlink_accounts").delete().eq("id", id);
    if (error) throw error;
  },
};