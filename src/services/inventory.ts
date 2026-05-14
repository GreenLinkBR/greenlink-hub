import { useAppStore } from "@/lib/mock/store";
import { StockMovement, StockBalance, type StockMovementType } from "@/types/inventory";
import type { MovTipo } from "@/lib/mock/types";

const movTipoToStockMovementType: Record<MovTipo, StockMovementType> = {
  entrada: "in",
  saida: "out",
  ajuste: "adjustment",
  reserva: "reservation",
};

const stockMovementTypeToMovTipo: Partial<Record<StockMovementType, MovTipo>> = {
  in: "entrada",
  out: "saida",
  adjustment: "ajuste",
  reservation: "reserva",
};

export const inventoryService = {
  listMovements: async (): Promise<StockMovement[]> => {
    const movements = useAppStore.getState().movimentacoes;
    return movements.map((m) => ({
      id: m.id,
      movementType: movTipoToStockMovementType[m.tipo],
      catalogItemId: m.itemId,
      quantity: m.quantidade,
      notes: m.motivo,
      referenceType: m.osId ? "serviceOrder" : undefined,
      referenceId: m.osId,
      occurredAt: m.criadoEm,
    }));
  },

  addMovement: async (data: Partial<StockMovement>) => {
    const add = useAppStore.getState().addMovimentacao;
    add({
      itemId: data.catalogItemId!,
      tipo: (data.movementType && stockMovementTypeToMovTipo[data.movementType]) || "ajuste",
      quantidade: data.quantity!,
      motivo: data.notes,
      osId: data.referenceId,
    });
  },

  listBalances: async (): Promise<StockBalance[]> => {
    // Mocking balances based on movements
    return [];
  },
};
