import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";

export const useInventoryMovements = () => {
  return useQuery({
    queryKey: ["inventory", "movements"],
    queryFn: services.inventory.listMovements,
  });
};
