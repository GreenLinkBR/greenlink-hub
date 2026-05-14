import { useAppStore } from "@/lib/mock/store";
import { Asset, type AssetStatus } from "@/types/asset";
import type { AtivoStatus } from "@/lib/mock/types";

const ativoStatusToAssetStatus: Record<AtivoStatus, AssetStatus> = {
  ativo: "installed",
  manutencao: "maintenance",
  baixado: "inactive",
};

const assetStatusToAtivoStatus: Record<AssetStatus, AtivoStatus> = {
  available: "ativo",
  reserved: "ativo",
  installed: "ativo",
  rented: "ativo",
  maintenance: "manutencao",
  returned: "ativo",
  inactive: "baixado",
};

export const assetService = {
  list: async (): Promise<Asset[]> => {
    const assets = useAppStore.getState().ativos;
    return assets.map((a) => ({
      id: a.id,
      assetTag: a.tag,
      serialNumber: a.tag, // Mock
      ownerType: "greenlink",
      customerId: a.clienteId,
      status: ativoStatusToAssetStatus[a.status],
      siteName: a.localizacao,
      installedAt: a.instaladoEm,
      lastReadingAt: a.ultimaLeitura,
      notes: a.observacao,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  get: async (id: string): Promise<Asset | undefined> => {
    const assets = await assetService.list();
    return assets.find((a) => a.id === id);
  },

  create: async (data: Partial<Asset>) => {
    const addAtivo = useAppStore.getState().addAtivo;
    addAtivo({
      tag: data.assetTag!,
      modelo: "Modelo Padrão",
      tipo: "Tipo Padrão",
      clienteId: data.customerId,
      localizacao: data.siteName,
      status: data.status ? assetStatusToAtivoStatus[data.status] : "ativo",
      observacao: data.notes,
    });
  },

  update: async (id: string, data: Partial<Asset>) => {
    const updateAtivo = useAppStore.getState().updateAtivo;
    updateAtivo(id, {
      tag: data.assetTag,
      clienteId: data.customerId,
      localizacao: data.siteName,
      status: data.status ? assetStatusToAtivoStatus[data.status] : undefined,
      observacao: data.notes,
    });
  },

  remove: async (id: string) => {
    const removeAtivo = useAppStore.getState().removeAtivo;
    removeAtivo(id);
  },
};
