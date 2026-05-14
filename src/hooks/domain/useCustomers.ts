import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import { Customer } from "@/types/customer";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: services.customers.list,
  });
};

export const useCustomer = (id?: string) => {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => services.customers.get(id!),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.customers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      services.customers.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", id] });
    },
  });
};

export const useRemoveCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.customers.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
