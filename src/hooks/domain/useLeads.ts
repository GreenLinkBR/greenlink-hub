import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import { Lead } from "@/types/lead";

export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],
    queryFn: services.leads.list,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.leads.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      services.leads.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId?: string }) =>
      services.leads.convert(id, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
