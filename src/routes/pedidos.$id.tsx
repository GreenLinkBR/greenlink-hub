import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate } from "@/lib/mock/store";
import { PEDIDO_STATUS } from "@/lib/mock/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Wrench } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/pedidos/$id")({
  head: () => ({ meta: [{ title: "Pedido — GreenLink ADM" }] }),
  component: PedidoDetalhe,
  notFoundComponent: () => (
    <PageContainer>
      <p className="text-muted-foreground">Pedido não encontrado.</p>
    </PageContainer>
  ),
});

function PedidoDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { pedidos, clientes, orcamentos, addOS, atualizarStatusPedido } = useAppStore();
  const p = pedidos.find((x) => x.id === id);
  if (!p) throw notFound();
  const orc = orcamentos.find((o) => o.id === p.orcamentoId);
  const cli = clientes.find((c) => c.id === p.clienteId);
  const itens = p.itens ?? orc?.itens ?? [];
  return (
    <PageContainer>
      <Link
        to="/pedidos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Pedidos
      </Link>
      <PageHeader
        title={p.numero}
        description={`${cli?.nome ?? "—"} · ${formatDate(p.criadoEm)}`}
        actions={
          <div className="flex gap-2 flex-wrap items-center">
            <Select
              value={p.status}
              onValueChange={(v) => {
                atualizarStatusPedido(p.id, v as typeof p.status);
                toast.success("Status do pedido atualizado.");
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PEDIDO_STATUS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                const os = addOS({
                  titulo: `Instalação/atendimento — ${p.numero}`,
                  clienteId: p.clienteId,
                  prioridade: "media",
                  tecnico: "",
                  endereco: cli?.endereco,
                  tarefas: [],
                  ativosIds: [],
                  pedidoId: p.id,
                });
                toast.success(`OS ${os.numero} criada.`);
                navigate({ to: "/os/$id", params: { id: os.id } });
              }}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Criar OS
            </Button>
          </div>
        }
      />
      <Card className="p-5">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Cliente</p>
            <p>{cli?.nome ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Origem (orçamento)</p>
            {orc ? (
              <Link
                to="/orcamentos/$id"
                params={{ id: orc.id }}
                className="text-primary hover:underline"
              >
                {orc.numero}
              </Link>
            ) : (
              "—"
            )}
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{formatBRL(p.total)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Itens</p>
            <p>{itens.length}</p>
          </div>
        </div>
        {itens.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
              Itens do pedido (snapshot)
            </p>
            <ul className="divide-y text-sm">
              {itens.map((it, i) => (
                <li key={i} className="flex justify-between py-2">
                  <span>
                    <span className="font-medium">{it.nome}</span>{" "}
                    <span className="text-muted-foreground text-xs">({it.codigo})</span>
                  </span>
                  <span className="text-muted-foreground">
                    {it.quantidade} × {formatBRL(it.precoUnit)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
