export type GlobalSearchKind =
  | "cliente"
  | "lead"
  | "oportunidade"
  | "orcamento"
  | "pedido"
  | "contrato"
  | "os"
  | "ativo"
  | "ticket"
  | "catalogo";

export type GlobalSearchTarget = { to: string; params?: Record<string, string> };

export type GlobalSearchItem = {
  kind: GlobalSearchKind;
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  target: GlobalSearchTarget;
};

const normalize = (v: string) =>
  v
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export function filterGlobalSearchItems(items: GlobalSearchItem[], query: string) {
  const q = normalize(query);
  if (!q) return [];
  return items
    .map((item) => {
      const hay = normalize(
        [item.title, item.subtitle, ...(item.keywords ?? [])].filter(Boolean).join(" "),
      );
      const score = hay.includes(q) ? q.length : 0;
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "pt-BR"))
    .map((x) => x.item);
}

export function groupGlobalSearchItems(items: GlobalSearchItem[]) {
  const groups: Record<string, GlobalSearchItem[]> = {};
  for (const item of items) {
    if (!groups[item.kind]) groups[item.kind] = [];
    groups[item.kind].push(item);
  }
  return groups;
}
