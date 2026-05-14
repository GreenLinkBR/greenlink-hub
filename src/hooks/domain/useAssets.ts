import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";

export const useAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: services.assets.list,
  });
};

export const useAsset = (id?: string) => {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: () => services.assets.get(id!),
    enabled: !!id,
  });
};
