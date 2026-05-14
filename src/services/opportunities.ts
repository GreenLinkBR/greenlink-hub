import { useAppStore } from "@/lib/mock/store";
import { Opportunity, type OpportunityStage } from "@/types/opportunity";

export const opportunityService = {
  list: async (): Promise<Opportunity[]> => {
    const opportunities = useAppStore.getState().oportunidades;
    return opportunities.map((o) => ({
      id: o.id,
      title: o.titulo,
      customerId: o.clienteId,
      amount: o.valor,
      stage: o.estagio,
      notes: o.observacao,
      createdAt: o.criadoEm,
      updatedAt: o.criadoEm,
    }));
  },

  create: async (data: Partial<Opportunity>) => {
    const addOportunidade = useAppStore.getState().addOportunidade;
    addOportunidade({
      titulo: data.title!,
      clienteId: data.customerId!,
      valor: data.amount || 0,
      estagio: data.stage ?? "novo",
    });
  },

  update: async (id: string, data: Partial<Opportunity>) => {
    const updateOportunidade = useAppStore.getState().updateOportunidade;
    updateOportunidade(id, {
      titulo: data.title,
      clienteId: data.customerId,
      valor: data.amount,
      estagio: data.stage,
    });
  },

  move: async (id: string, stage: OpportunityStage) => {
    const moverOportunidade = useAppStore.getState().moverOportunidade;
    moverOportunidade(id, stage);
  },

  remove: async (id: string) => {
    const removeOportunidade = useAppStore.getState().removeOportunidade;
    removeOportunidade(id);
  },
};
