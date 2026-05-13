import type {
  Ativo,
  Cliente,
  Contrato,
  Lead,
  Oportunidade,
  Orcamento,
  Pedido,
  OS,
  Ticket,
  ItemCatalogo,
} from "@/lib/mock/types";
import type { GlobalSearchItem } from "@/lib/search";

export function buildGlobalSearchIndex(input: {
  clientes: Cliente[];
  leads: Lead[];
  oportunidades: Oportunidade[];
  orcamentos: Orcamento[];
  pedidos: Pedido[];
  contratos: Contrato[];
  ordens: OS[];
  ativos: Ativo[];
  tickets: Ticket[];
  catalogo: ItemCatalogo[];
}) {
  const clienteNome = new Map(input.clientes.map((c) => [c.id, c.nome]));

  const items: GlobalSearchItem[] = [];

  for (const c of input.clientes) {
    items.push({
      kind: "cliente",
      id: c.id,
      title: c.nome,
      subtitle: [c.documento, [c.cidade, c.estado].filter(Boolean).join("/")]
        .filter(Boolean)
        .join(" · "),
      keywords: [c.email, c.telefone].filter(Boolean) as string[],
      target: { to: "/clientes/$id", params: { id: c.id } },
    });
  }

  for (const l of input.leads) {
    items.push({
      kind: "lead",
      id: l.id,
      title: l.nome,
      subtitle: [l.empresa ?? "Pessoa física", l.origem, l.status].filter(Boolean).join(" · "),
      keywords: [l.email, l.telefone].filter(Boolean) as string[],
      target: { to: "/leads" },
    });
  }

  for (const o of input.oportunidades) {
    items.push({
      kind: "oportunidade",
      id: o.id,
      title: o.titulo,
      subtitle: [clienteNome.get(o.clienteId) ?? "—", o.estagio].filter(Boolean).join(" · "),
      keywords: [o.responsavel].filter(Boolean) as string[],
      target: { to: "/pipeline" },
    });
  }

  for (const o of input.orcamentos) {
    items.push({
      kind: "orcamento",
      id: o.id,
      title: o.numero,
      subtitle: [clienteNome.get(o.clienteId) ?? "—", o.status].filter(Boolean).join(" · "),
      keywords: o.itens.flatMap((i) => [i.codigo, i.nome]),
      target: { to: "/orcamentos/$id", params: { id: o.id } },
    });
  }

  for (const p of input.pedidos) {
    items.push({
      kind: "pedido",
      id: p.id,
      title: p.numero,
      subtitle: [clienteNome.get(p.clienteId) ?? "—", p.status].filter(Boolean).join(" · "),
      target: { to: "/pedidos/$id", params: { id: p.id } },
    });
  }

  for (const c of input.contratos) {
    items.push({
      kind: "contrato",
      id: c.id,
      title: c.numero,
      subtitle: [clienteNome.get(c.clienteId) ?? "—", c.status].filter(Boolean).join(" · "),
      keywords: [c.indexador, String(c.valorMensal)].filter(Boolean),
      target: { to: "/contratos/$id", params: { id: c.id } },
    });
  }

  for (const o of input.ordens) {
    items.push({
      kind: "os",
      id: o.id,
      title: o.numero,
      subtitle: [o.titulo, clienteNome.get(o.clienteId) ?? "—"].filter(Boolean).join(" · "),
      keywords: [o.tecnico, o.status, o.prioridade, o.endereco].filter(Boolean) as string[],
      target: { to: "/os/$id", params: { id: o.id } },
    });
  }

  for (const a of input.ativos) {
    items.push({
      kind: "ativo",
      id: a.id,
      title: a.tag,
      subtitle: [a.modelo, clienteNome.get(a.clienteId ?? "")].filter(Boolean).join(" · "),
      keywords: [a.tipo, a.localizacao, a.status].filter(Boolean) as string[],
      target: { to: "/ativos/$id", params: { id: a.id } },
    });
  }

  for (const t of input.tickets) {
    items.push({
      kind: "ticket",
      id: t.id,
      title: t.numero,
      subtitle: [t.assunto, clienteNome.get(t.clienteId) ?? "—"].filter(Boolean).join(" · "),
      keywords: [t.canal, t.status, t.prioridade].filter(Boolean),
      target: { to: "/suporte/$id", params: { id: t.id } },
    });
  }

  for (const i of input.catalogo) {
    items.push({
      kind: "catalogo",
      id: i.id,
      title: `${i.codigo} — ${i.nome}`,
      subtitle: [i.tipo, i.ativo ? "ativo" : "inativo"].filter(Boolean).join(" · "),
      target: { to: "/catalogo" },
    });
  }

  return items;
}
