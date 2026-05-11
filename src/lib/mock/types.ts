export type ID = string;

export type LeadStatus = "novo" | "contatado" | "qualificado" | "descartado";
export type LeadOrigem = "site" | "indicacao" | "evento" | "ads" | "outro";

export interface Lead {
  id: ID; nome: string; email?: string; telefone?: string; empresa?: string;
  origem: LeadOrigem; status: LeadStatus; observacao?: string;
  criadoEm: string; convertidoEm?: string; clienteId?: ID;
}

export type ClienteTipo = "pf" | "pj";
export interface Contato { id: ID; nome: string; cargo?: string; email?: string; telefone?: string; }
export interface Cliente {
  id: ID; tipo: ClienteTipo; nome: string; documento?: string; email?: string; telefone?: string;
  cidade?: string; estado?: string; endereco?: string; contatos: Contato[]; observacao?: string; criadoEm: string;
}

export type EstagioOportunidade = "novo" | "qualificado" | "proposta" | "negociacao" | "ganho" | "perdido";
export const ESTAGIOS: { id: EstagioOportunidade; label: string }[] = [
  { id: "novo", label: "Novo" }, { id: "qualificado", label: "Qualificado" },
  { id: "proposta", label: "Proposta" }, { id: "negociacao", label: "Negociação" },
  { id: "ganho", label: "Ganho" }, { id: "perdido", label: "Perdido" },
];
export interface Oportunidade {
  id: ID; titulo: string; clienteId: ID; valor: number; estagio: EstagioOportunidade;
  responsavel?: string; observacao?: string; criadoEm: string;
}

export type ItemTipo = "produto" | "servico" | "kit";
export interface ItemCatalogo {
  id: ID; codigo: string; nome: string; tipo: ItemTipo; unidade: string;
  preco: number; ativo: boolean; descricao?: string;
}

export type OrcamentoStatus = "rascunho" | "enviado" | "aprovado" | "recusado" | "convertido";
export interface OrcamentoItem {
  itemId: ID; codigo: string; nome: string; quantidade: number; precoUnit: number; desconto: number;
}
export interface Orcamento {
  id: ID; numero: string; clienteId: ID; oportunidadeId?: ID; itens: OrcamentoItem[];
  desconto: number; observacao?: string; status: OrcamentoStatus;
  criadoEm: string; validoAte?: string; pedidoId?: ID;
}
export interface Pedido {
  id: ID; numero: string; orcamentoId: ID; clienteId: ID; total: number;
  criadoEm: string; status: "aberto" | "concluido" | "cancelado";
}

// ---------- Contratos ----------
export type ContratoStatus = "ativo" | "suspenso" | "encerrado";
export type ContratoIndexador = "ipca" | "igpm" | "fixo";
export interface Contrato {
  id: ID; numero: string; clienteId: ID; pedidoId?: ID;
  inicio: string; fim: string; valorMensal: number;
  indexador: ContratoIndexador; proximoReajuste?: string;
  status: ContratoStatus; descricao?: string; criadoEm: string;
}

// ---------- Ativos ----------
export type AtivoStatus = "ativo" | "manutencao" | "baixado";
export interface Ativo {
  id: ID; tag: string; modelo: string; tipo: string; clienteId?: ID;
  localizacao?: string; status: AtivoStatus; ultimaLeitura?: string;
  instaladoEm?: string; observacao?: string;
}

// ---------- Ordens de Serviço ----------
export type OSStatus = "aberta" | "em_execucao" | "concluida" | "cancelada";
export type OSPrioridade = "baixa" | "media" | "alta" | "critica";
export const OS_STATUS: { id: OSStatus; label: string }[] = [
  { id: "aberta", label: "Aberta" }, { id: "em_execucao", label: "Em execução" },
  { id: "concluida", label: "Concluída" }, { id: "cancelada", label: "Cancelada" },
];
export interface OSTarefa { id: ID; descricao: string; feita: boolean; }
export interface OS {
  id: ID; numero: string; titulo: string; clienteId: ID;
  prioridade: OSPrioridade; status: OSStatus; tecnico?: string;
  endereco?: string; sla?: string; tarefas: OSTarefa[];
  ativosIds: ID[]; horasGastas?: number; observacao?: string;
  pedidoId?: ID; contratoId?: ID; criadoEm: string; concluidaEm?: string;
}

// ---------- Estoque ----------
export type MovTipo = "entrada" | "saida" | "ajuste" | "reserva";
export interface Movimentacao {
  id: ID; itemId: ID; tipo: MovTipo; quantidade: number;
  motivo?: string; osId?: ID; criadoEm: string;
}

// ---------- Financeiro ----------
export type LancamentoTipo = "receber" | "pagar";
export type LancamentoStatus = "aberto" | "pago" | "vencido" | "cancelado";
export type LancamentoOrigem = "contrato" | "pedido" | "manual";
export interface Lancamento {
  id: ID; tipo: LancamentoTipo; descricao: string;
  clienteId?: ID; fornecedor?: string;
  valor: number; vencimento: string; pagoEm?: string;
  status: LancamentoStatus; origem: LancamentoOrigem;
  contratoId?: ID; pedidoId?: ID; criadoEm: string;
}

// ---------- Suporte ----------
export type TicketStatus = "novo" | "andamento" | "aguardando" | "resolvido";
export type TicketPrioridade = "baixa" | "media" | "alta" | "critica";
export type TicketCanal = "email" | "whatsapp" | "portal" | "telefone";
export interface TicketMensagem {
  id: ID; autor: string; interno: boolean; texto: string; criadoEm: string;
}
export interface Ticket {
  id: ID; numero: string; assunto: string; clienteId: ID;
  canal: TicketCanal; prioridade: TicketPrioridade; status: TicketStatus;
  sla?: string; mensagens: TicketMensagem[]; osId?: ID; criadoEm: string;
}
