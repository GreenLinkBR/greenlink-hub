import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import type { Installation } from "@/types/installation";

export const useInstallations = () =>
  useQuery({ queryKey: ["installations"], queryFn: services.installations.list });

export const useInstallation = (id?: string) =>
  useQuery({
    queryKey: ["installations", id],
    queryFn: () => services.installations.get(id!),
    enabled: !!id,
  });

export const useCreateInstallation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: services.installations.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["installations"] }),
  });
};

export const useUpdateInstallation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Installation> }) =>
      services.installations.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["installations"] }),
  });
};