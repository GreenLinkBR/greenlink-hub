import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";

export const useTickets = () => {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: services.tickets.list,
  });
};

export const useTicket = (id?: string) => {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => services.tickets.get(id!),
    enabled: !!id,
  });
};
