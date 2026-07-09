import { supabase } from "@/integrations/supabase/client";

export type UploadedDoc = {
  path: string;
  signedUrl: string;
};

/**
 * Faz upload de um documento do cliente no bucket privado `customer-docs`.
 * Enquanto o cliente ainda não existe, usa o prefixo `_pending/<tempId>/`.
 */
export async function uploadCustomerDoc(
  file: File,
  scopeId: string,
  docType: string,
): Promise<UploadedDoc> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${scopeId}/${docType}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("customer-docs").upload(path, file, {
    contentType: file.type || undefined,
    upsert: true,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage
    .from("customer-docs")
    .createSignedUrl(path, 60 * 10);
  if (sErr) throw sErr;
  return { path, signedUrl: data.signedUrl };
}

/**
 * Move um arquivo temporário para o caminho definitivo do cliente.
 */
export async function moveCustomerDoc(fromPath: string, customerId: string): Promise<string> {
  const fileName = fromPath.split("/").pop() || fromPath;
  const toPath = `${customerId}/${fileName}`;
  if (fromPath === toPath) return toPath;
  const { error } = await supabase.storage.from("customer-docs").move(fromPath, toPath);
  if (error) throw error;
  return toPath;
}

export async function signedUrl(path: string, seconds = 300): Promise<string> {
  const { data, error } = await supabase.storage
    .from("customer-docs")
    .createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl;
}