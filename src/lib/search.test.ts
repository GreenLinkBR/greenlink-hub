import { describe, expect, it } from "vitest";
import {
  filterGlobalSearchItems,
  groupGlobalSearchItems,
  type GlobalSearchItem,
} from "@/lib/search";
import { buildGlobalSearchIndex } from "@/lib/search-index";

describe("filterGlobalSearchItems", () => {
  it("filtra por contains e ignora acentos/caixa", () => {
    const items: GlobalSearchItem[] = [
      {
        kind: "cliente",
        id: "1",
        title: "Fazenda Vale Verde",
        target: { to: "/clientes/$id", params: { id: "1" } },
      },
      {
        kind: "os",
        id: "2",
        title: "OS-0001",
        subtitle: "Manutenção estação",
        target: { to: "/os/$id", params: { id: "2" } },
      },
    ];

    const res1 = filterGlobalSearchItems(items, "fazenda");
    expect(res1).toHaveLength(1);
    expect(res1[0]?.id).toBe("1");

    const res2 = filterGlobalSearchItems(items, "manutencao");
    expect(res2).toHaveLength(1);
    expect(res2[0]?.id).toBe("2");
  });

  it("retorna vazio para query vazia", () => {
    const items: GlobalSearchItem[] = [
      {
        kind: "cliente",
        id: "1",
        title: "Cliente",
        target: { to: "/clientes/$id", params: { id: "1" } },
      },
    ];
    expect(filterGlobalSearchItems(items, "")).toEqual([]);
    expect(filterGlobalSearchItems(items, "   ")).toEqual([]);
  });
});

describe("groupGlobalSearchItems", () => {
  it("agrupa por kind", () => {
    const items: GlobalSearchItem[] = [
      {
        kind: "cliente",
        id: "1",
        title: "A",
        target: { to: "/clientes/$id", params: { id: "1" } },
      },
      {
        kind: "cliente",
        id: "2",
        title: "B",
        target: { to: "/clientes/$id", params: { id: "2" } },
      },
      { kind: "os", id: "3", title: "OS-1", target: { to: "/os/$id", params: { id: "3" } } },
    ];
    const grouped = groupGlobalSearchItems(items);
    expect(grouped.cliente).toHaveLength(2);
    expect(grouped.os).toHaveLength(1);
  });
});

describe("buildGlobalSearchIndex", () => {
  it("cria itens com targets esperados", () => {
    const index = buildGlobalSearchIndex({
      clientes: [
        { id: "c1", tipo: "pj", nome: "Agro", contatos: [], criadoEm: new Date().toISOString() },
      ],
      leads: [],
      oportunidades: [],
      orcamentos: [],
      pedidos: [],
      contratos: [],
      ordens: [],
      ativos: [{ id: "a1", tag: "GTW-1", modelo: "Gateway", tipo: "Gateway", status: "ativo" }],
      tickets: [],
      catalogo: [],
    });
    const ativo = index.find((i) => i.kind === "ativo");
    expect(ativo?.target.to).toBe("/ativos/$id");
    expect(ativo?.target.params?.id).toBe("a1");
  });
});
