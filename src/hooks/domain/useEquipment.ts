import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import type { Equipment } from "@/types/equipment";

export const useEquipmentList = () =>
  useQuery({ queryKey: ["equipment"], queryFn: services.equipment.list });

export const useEquipment = (id?: string) =>
  useQuery({
    queryKey: ["equipment", id],
    queryFn: () => services.equipment.get(id!),
    enabled: !!id,
  });

export const useCreateEquipment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: services.equipment.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipment"] }),
  });
};

export const useUpdateEquipment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) =>
      services.equipment.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipment"] }),
  });
};

export const useRemoveEquipment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: services.equipment.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipment"] }),
  });
};