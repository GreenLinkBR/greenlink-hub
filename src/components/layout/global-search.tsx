"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/mock/store";
import { buildGlobalSearchIndex } from "@/lib/search-index";
import { filterGlobalSearchItems, groupGlobalSearchItems } from "@/lib/search";
import {
  Cpu,
  FileSignature,
  FileText,
  Kanban,
  LifeBuoy,
  Search,
  ShoppingCart,
  UserPlus,
  Users,
  Wrench,
  Package,
  type LucideIcon,
} from "lucide-react";

const kindLabel: Record<string, string> = {
  cliente: "Clientes",
  lead: "Leads",
  oportunidade: "Oportunidades",
  orcamento: "Orçamentos",
  pedido: "Pedidos",
  contrato: "Contratos",
  os: "Ordens de Serviço",
  ativo: "Ativos",
  ticket: "Suporte",
  catalogo: "Catálogo",
};

const kindIcon: Record<string, LucideIcon> = {
  cliente: Users,
  lead: UserPlus,
  oportunidade: Kanban,
  orcamento: FileText,
  pedido: ShoppingCart,
  contrato: FileSignature,
  os: Wrench,
  ativo: Cpu,
  ticket: LifeBuoy,
  catalogo: Package,
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const store = useAppStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const index = useMemo(
    () =>
      buildGlobalSearchIndex({
        clientes: store.clientes,
        leads: store.leads,
        oportunidades: store.oportunidades,
        orcamentos: store.orcamentos,
        pedidos: store.pedidos,
        contratos: store.contratos,
        ordens: store.ordens,
        ativos: store.ativos,
        tickets: store.tickets,
        catalogo: store.catalogo,
      }),
    [
      store.clientes,
      store.leads,
      store.oportunidades,
      store.orcamentos,
      store.pedidos,
      store.contratos,
      store.ordens,
      store.ativos,
      store.tickets,
      store.catalogo,
    ],
  );

  const results = useMemo(() => filterGlobalSearchItems(index, query).slice(0, 40), [index, query]);
  const grouped = useMemo(() => groupGlobalSearchItems(results), [results]);

  const openDialog = () => setOpen(true);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="hidden md:flex items-center gap-2 flex-1 max-w-md justify-start h-9"
        onClick={openDialog}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">
          Buscar clientes, OS, contratos, tickets…
        </span>
        <span className="ml-auto text-xs text-muted-foreground">Ctrl K</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Buscar"
        onClick={openDialog}
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setQuery("");
        }}
      >
        <CommandInput
          placeholder="Buscar por cliente, número, tag, assunto…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
          {Object.entries(grouped).map(([kind, items]) => (
            <CommandGroup key={kind} heading={kindLabel[kind] ?? kind}>
              {items.map((item) => {
                const Icon = kindIcon[item.kind] ?? Search;
                return (
                  <CommandItem
                    key={`${item.kind}:${item.id}`}
                    value={`${item.title} ${item.subtitle ?? ""}`}
                    onSelect={() => {
                      setOpen(false);
                      setQuery("");
                      navigate({
                        to: item.target.to as never,
                        params: item.target.params as never,
                      });
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      {item.subtitle && (
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
