import { useAppStore } from "@/lib/mock/store";
import { Customer } from "@/types/customer";

/**
 * Service para domínio de Clientes.
 * Atualmente mapeia para o mock store em português.
 */
export const customerService = {
  list: async (): Promise<Customer[]> => {
    const clientes = useAppStore.getState().clientes;
    return clientes.map((c) => ({
      id: c.id,
      customerType: c.tipo,
      legalName: c.nome,
      tradeName: c.nome,
      documentNumber: c.documento,
      email: c.email,
      phone: c.telefone,
      city: c.cidade,
      state: c.estado,
      status: "active",
      notes: c.observacao,
      contacts: c.contatos.map((ct) => ({
        id: ct.id,
        fullName: ct.nome,
        roleTitle: ct.cargo,
        email: ct.email,
        phone: ct.telefone,
        isPrimary: false,
      })),
      addresses: [],
      createdAt: c.criadoEm,
      updatedAt: c.criadoEm,
    }));
  },

  get: async (id: string): Promise<Customer | undefined> => {
    const clientes = await customerService.list();
    return clientes.find((c) => c.id === id);
  },

  create: async (data: Partial<Customer>) => {
    const addCliente = useAppStore.getState().addCliente;
    addCliente({
      tipo: data.customerType ?? "pj",
      nome: data.legalName!,
      documento: data.documentNumber,
      email: data.email,
      telefone: data.phone,
      cidade: data.city,
      estado: data.state,
      contatos: [],
    });
  },

  update: async (id: string, data: Partial<Customer>) => {
    const updateCliente = useAppStore.getState().updateCliente;
    updateCliente(id, {
      tipo: data.customerType,
      nome: data.legalName,
      documento: data.documentNumber,
      email: data.email,
      telefone: data.phone,
      cidade: data.city,
      estado: data.state,
    });
  },

  remove: async (id: string) => {
    const removeCliente = useAppStore.getState().removeCliente;
    removeCliente(id);
  },
};
