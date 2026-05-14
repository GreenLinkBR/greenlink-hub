import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";

export const useCatalog = () => {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: services.catalog.list,
  });
};
