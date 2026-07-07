import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";

export const useCustomerDocuments = (customerId?: string) =>
  useQuery({
    queryKey: ["customer_documents", customerId],
    queryFn: () => services.documents.listByCustomer(customerId!),
    enabled: !!customerId,
  });

export const useCreateCustomerDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: services.documents.create,
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["customer_documents", vars.customerId] }),
  });
};