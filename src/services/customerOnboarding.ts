import { supabase } from "@/integrations/supabase/client";
import { moveCustomerDoc, signedUrl } from "@/lib/storage";
import type { CustomerDocType } from "@/types/customerDocument";

export interface PendingDoc {
  path: string;
  docType: CustomerDocType;
  ocrData?: Record<string, unknown> | null;
}

export interface OnboardingPayload {
  customer: {
    legalName: string;
    documentNumber?: string;
    birthDate?: string;
    email?: string;
    phone?: string;
    street?: string;
    district?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  };
  equipment: {
    model?: string;
    serialNumber?: string;
    kitId?: string;
    pn?: string;
  };
  starlink: {
    plan?: string;
  };
  installation: {
    scheduledAt?: string;
    technicianId?: string;
    notes?: string;
  };
  docs: PendingDoc[];
}

export interface OnboardingResult {
  customerId: string;
  equipmentId: string;
  starlinkAccountId: string;
  glCode: string;
  gmailAlias: string;
  installationId: string;
}

export const customerOnboardingService = {
  create: async (payload: OnboardingPayload, uploadedBy?: string): Promise<OnboardingResult> => {
    const { customer, equipment, starlink, installation, docs } = payload;

    // 1. Customer
    const { data: cust, error: cErr } = await supabase
      .from("customers")
      .insert({
        customer_type: "pf",
        legal_name: customer.legalName,
        document_number: customer.documentNumber ?? null,
        cpf_cnpj: customer.documentNumber ?? null,
        birth_date: customer.birthDate ?? null,
        email: customer.email ?? null,
        phone: customer.phone ?? null,
        city: customer.city ?? null,
        state: customer.state ?? null,
        latitude: customer.latitude ?? null,
        longitude: customer.longitude ?? null,
        status: "active",
      })
      .select()
      .single();
    if (cErr) throw cErr;
    const customerId = cust.id;

    try {
      // 1b. Address
      if (customer.street || customer.city || customer.zipCode) {
        await supabase.from("customer_addresses").insert({
          customer_id: customerId,
          label: "Instalação",
          street: customer.street ?? null,
          district: customer.district ?? null,
          city: customer.city ?? null,
          state: customer.state ?? null,
          zip_code: customer.zipCode ?? null,
          latitude: customer.latitude ?? null,
          longitude: customer.longitude ?? null,
        });
      }

      // 2. Documents (move de _pending para {customerId}/)
      for (const d of docs) {
        const finalPath = await moveCustomerDoc(d.path, customerId);
        await supabase.from("customer_documents").insert({
          customer_id: customerId,
          doc_type: d.docType,
          file_url: finalPath,
          ocr_data: (d.ocrData ?? null) as never,
          uploaded_by: uploadedBy ?? null,
        });
      }

      // 3. Equipment
      const { data: eq, error: eErr } = await supabase
        .from("equipment")
        .insert({
          customer_id: customerId,
          model: equipment.model ?? null,
          serial_number: equipment.serialNumber ?? null,
          kit_id: equipment.kitId ?? null,
          pn: equipment.pn ?? null,
          status: "installed",
          installed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (eErr) throw eErr;

      // 4. Starlink account (gl_code e gmail_alias vêm dos DEFAULTs do banco)
      const { data: sl, error: sErr } = await supabase
        .from("starlink_accounts")
        .insert({
          customer_id: customerId,
          equipment_id: eq.id,
          plan: starlink.plan ?? null,
          status: "active",
          activated_at: new Date().toISOString(),
          is_primary_account: true,
        })
        .select()
        .single();
      if (sErr) throw sErr;

      // 5. Installation
      const { data: inst, error: iErr } = await supabase
        .from("installations")
        .insert({
          customer_id: customerId,
          equipment_id: eq.id,
          technician_id: installation.technicianId ?? null,
          scheduled_at: installation.scheduledAt ?? null,
          status: "scheduled",
          notes: installation.notes ?? null,
        })
        .select()
        .single();
      if (iErr) throw iErr;

      return {
        customerId,
        equipmentId: eq.id,
        starlinkAccountId: sl.id,
        glCode: sl.gl_code,
        gmailAlias: sl.gmail_alias,
        installationId: inst.id,
      };
    } catch (err) {
      // rollback simples: apaga o cliente (cascade limpa o resto)
      await supabase.from("customers").delete().eq("id", customerId);
      throw err;
    }
  },
};

export async function callOcr(
  filePath: string,
  docType: CustomerDocType,
): Promise<Record<string, unknown>> {
  const url = await signedUrl(filePath, 600);
  const { data, error } = await supabase.functions.invoke<{ data: Record<string, unknown>; error?: string }>(
    "ocr-extract",
    { body: { file_url: url, doc_type: docType } },
  );
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Resposta vazia do OCR");
  return data.data ?? {};
}