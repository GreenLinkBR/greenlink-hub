import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { CustomerDocument, CustomerDocType } from "@/types/customerDocument";

type Row = Database["public"]["Tables"]["customer_documents"]["Row"];

const map = (row: Row): CustomerDocument => ({
  id: row.id,
  customerId: row.customer_id,
  docType: row.doc_type as CustomerDocType,
  fileUrl: row.file_url,
  ocrData: (row.ocr_data as Record<string, unknown> | null) ?? null,
  uploadedBy: row.uploaded_by ?? undefined,
  uploadedAt: row.uploaded_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const documentService = {
  listByCustomer: async (customerId: string): Promise<CustomerDocument[]> => {
    const { data, error } = await supabase
      .from("customer_documents")
      .select("*")
      .eq("customer_id", customerId)
      .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(map);
  },
  create: async (data: Partial<CustomerDocument>) => {
    const { data: created, error } = await supabase
      .from("customer_documents")
      .insert({
        customer_id: data.customerId!,
        doc_type: data.docType!,
        file_url: data.fileUrl!,
        ocr_data: (data.ocrData ?? null) as never,
        uploaded_by: data.uploadedBy ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return map(created);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("customer_documents").delete().eq("id", id);
    if (error) throw error;
  },
};