import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatDate } from "@/lib/mock/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/ativos/$id")({
  head: () => ({ meta: [{ title: "Ativo — GreenLink ADM" }] }),
  component: AtivoDetalhe,
  notFoundComponent: () => (
    <PageContainer>
      <p className="text-muted-foreground">Ativo não encontrado.</p>
    </PageContainer>
  ),
});

function AtivoDetalhe() {
  const { id } = Route.useParams();
  const { ativos, clientes, ordens } = useAppStore();
  const a = ativos.find((x) => x.id === id);
  if (!a) throw notFound();
  const cli = clientes.find((c) => c.id === a.clienteId);
  const historico = ordens.filter((o) => o.ativosIds.includes(a.id));

  return (
    <PageContainer>
      <Link
        to="/ativos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Ativos
      </Link>
      <PageHeader
        title={a.tag}
        description={[a.modelo, cli?.nome].filter(Boolean).join(" · ")}
        actions={<Badge variant="outline">{a.status}</Badge>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">Dados</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Info label="Tag" value={a.tag} />
            <Info label="Status" value={<Badge>{a.status}</Badge>} />
            <Info label="Modelo" value={a.modelo} />
            <Info label="Tipo" value={a.tipo} />
            <Info
              label="Cliente"
              value={
                cli ? (
                  <Link
                    to="/clientes/$id"
                    params={{ id: cli.id }}
                    className="text-primary hover:underline"
                  >
                    {cli.nome}
                  </Link>
                ) : (
                  "Sem cliente"
                )
              }
            />
            <Info label="Localização" value={a.localizacao ?? "—"} />
            <Info label="Instalado em" value={formatDate(a.instaladoEm)} />
            <Info label="Última leitura" value={formatDate(a.ultimaLeitura)} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Histórico de OS</h2>
          <div className="space-y-2 text-sm">
            {historico.slice(0, 8).map((o) => (
              <Link
                key={o.id}
                to="/os/$id"
                params={{ id: o.id }}
                className="block rounded-md border p-3 hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{o.numero}</span>
                  <Badge variant="outline">{o.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{o.titulo}</p>
              </Link>
            ))}
            {!historico.length && (
              <p className="text-sm text-muted-foreground">Nenhuma OS vinculada.</p>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
