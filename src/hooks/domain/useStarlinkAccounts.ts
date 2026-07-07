import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import type { StarlinkAccount } from "@/types/starlinkAccount";

export const useStarlinkAccounts = () =>
  useQuery({ queryKey: ["starlink_accounts"], queryFn: services.starlinkAccounts.list });

export const useStarlinkAccount = (id?: string) =>
  useQuery({
    queryKey: ["starlink_accounts", id],
    queryFn: () => services.starlinkAccounts.get(id!),
    enabled: !!id,
  });

export const useCreateStarlinkAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: services.starlinkAccounts.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["starlink_accounts"] }),
  });
};

export const useUpdateStarlinkAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StarlinkAccount> }) =>
      services.starlinkAccounts.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["starlink_accounts"] }),
  });
};