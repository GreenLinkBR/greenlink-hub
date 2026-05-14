import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";

export const useServiceOrders = () => {
  return useQuery({
    queryKey: ["serviceOrders"],
    queryFn: services.serviceOrders.list,
  });
};

export const useServiceOrder = (id?: string) => {
  return useQuery({
    queryKey: ["serviceOrders", id],
    queryFn: () => services.serviceOrders.get(id!),
    enabled: !!id,
  });
};

export const useFinishServiceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.serviceOrders.finish,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
      queryClient.invalidateQueries({ queryKey: ["serviceOrders", id] });
    },
  });
};

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ osId, title }: { osId: string; title: string }) =>
      services.serviceOrders.addTask(osId, title),
    onSuccess: (_, { osId }) => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders", osId] });
    },
  });
};

export const useToggleTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ osId, taskId }: { osId: string; taskId: string }) =>
      services.serviceOrders.toggleTask(osId, taskId),
    onSuccess: (_, { osId }) => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders", osId] });
    },
  });
};

export const useCreateServiceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.serviceOrders.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
    },
  });
};
