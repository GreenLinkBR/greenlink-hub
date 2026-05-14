import { useAppStore } from "@/lib/mock/store";
import { CustomerOrder, type OrderStatus } from "@/types/order";
import type { Pedido } from "@/lib/mock/types";

const pedidoStatusToOrderStatus: Record<Pedido["status"], OrderStatus> = {
  aberto: "open",
  aprovado: "approved",
  faturado: "invoiced",
  parcialmente_atendido: "partially_fulfilled",
  atendido: "fulfilled",
  cancelado: "cancelled",
};

const orderStatusToPedidoStatus: Record<OrderStatus, Pedido["status"]> = {
  open: "aberto",
  approved: "aprovado",
  invoiced: "faturado",
  partially_fulfilled: "parcialmente_atendido",
  fulfilled: "atendido",
  cancelled: "cancelado",
};

export const orderService = {
  list: async (): Promise<CustomerOrder[]> => {
    const orders = useAppStore.getState().pedidos;
    return orders.map((p) => ({
      id: p.id,
      orderNumber: p.numero,
      quoteId: p.orcamentoId,
      customerId: p.clienteId,
      status: pedidoStatusToOrderStatus[p.status],
      orderDate: p.criadoEm,
      subtotal: p.total,
      discountAmount: 0,
      totalAmount: p.total,
      notes: "",
      createdAt: p.criadoEm,
      updatedAt: p.criadoEm,
      items: (p.itens || []).map((i) => ({
        id: i.itemId,
        orderId: p.id,
        catalogItemId: i.itemId,
        description: i.nome,
        itemType: "product",
        quantity: i.quantidade,
        unitPrice: i.precoUnit,
        totalAmount: (i.precoUnit - i.desconto) * i.quantidade,
      })),
    }));
  },

  get: async (id: string): Promise<CustomerOrder | undefined> => {
    const orders = await orderService.list();
    return orders.find((o) => o.id === id);
  },

  setStatus: async (id: string, status: string) => {
    const setStatus = useAppStore.getState().atualizarStatusPedido;
    const next =
      status in orderStatusToPedidoStatus
        ? orderStatusToPedidoStatus[status as OrderStatus]
        : "aberto";
    setStatus(id, next);
  },
};
