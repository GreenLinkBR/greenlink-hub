import { useAppStore } from "@/lib/mock/store";
import { CatalogItem, type CatalogItemType } from "@/types/catalog";
import type { ItemTipo } from "@/lib/mock/types";

const itemTipoToCatalogItemType: Record<ItemTipo, CatalogItemType> = {
  produto: "product",
  servico: "service",
  kit: "kit",
};

const catalogItemTypeToItemTipo: Record<CatalogItemType, ItemTipo> = {
  product: "produto",
  service: "servico",
  kit: "kit",
  rental: "produto",
  manufactured: "produto",
};

export const catalogService = {
  list: async (): Promise<CatalogItem[]> => {
    const items = useAppStore.getState().catalogo;
    return items.map((i) => ({
      id: i.id,
      itemCode: i.codigo,
      name: i.nome,
      itemType: itemTipoToCatalogItemType[i.tipo],
      unitCode: i.unidade,
      salePrice: i.preco,
      costPrice: 0,
      isActive: i.ativo,
      trackStock: false,
      trackSerial: false,
      isRecurring: false,
      description: i.descricao,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  create: async (data: Partial<CatalogItem>) => {
    const addItem = useAppStore.getState().addItemCatalogo;
    addItem({
      codigo: data.itemCode!,
      nome: data.name!,
      tipo: data.itemType ? catalogItemTypeToItemTipo[data.itemType] : "produto",
      unidade: data.unitCode!,
      preco: data.salePrice || 0,
      ativo: data.isActive ?? true,
      descricao: data.description,
    });
  },

  update: async (id: string, data: Partial<CatalogItem>) => {
    const updateItem = useAppStore.getState().updateItemCatalogo;
    updateItem(id, {
      codigo: data.itemCode,
      nome: data.name,
      tipo: data.itemType ? catalogItemTypeToItemTipo[data.itemType] : undefined,
      unidade: data.unitCode,
      preco: data.salePrice,
      ativo: data.isActive,
      descricao: data.description,
    });
  },

  remove: async (id: string) => {
    const removeItem = useAppStore.getState().removeItemCatalogo;
    removeItem(id);
  },
};
