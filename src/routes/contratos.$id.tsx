import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate } from "@/lib/mock/store";
import {
  CONTRATO_FREQUENCIA_LABEL,
  CONTRATO_TIPO_LABEL,
} from "@/lib/mock/types";
import { ArrowLeft, FileSignature, PauseCircle, PlayCircle, XCircle, Wrench } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contratos/$id")({
  head: () => ({ meta: [{ title: "Contrato — GreenLink ADM" }] }),
  component: Detalhe,
  notFoundComponent: () => (
    <PageContainer>
      <p className="text-muted-foreground">Contrato não encontrado.</p>
    </PageContainer>
  ),
});

function Detalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { contratos, clientes, lancamentos, faturarContrato, updateContrato, addOS } =
    useAppStore();
  const ct = contratos.find((c) => c.id === id);
  if (!ct) throw notFound();
  const cli = clientes.find((c) => c.id === ct.clienteId);
  const faturas = lancamentos.filter((l) => l.contratoId === ct.id);

  // cronograma futuro mock (12 meses)
  const cronograma = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    d.setDate(10);
    return { ref: d, valor: ct.valorMensal };
  });

  return (
    <PageContainer>
      <Link
        to="/contratos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Contratos
      </Link>
      <PageHeader
        title={ct.numero}
        description={`${cli?.nome ?? "—"} · ${ct.descricao ?? ""}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => {
                faturarContrato(ct.id);
                toast.success("Fatura gerada no financeiro.");
              }}
            >
              <FileSignature className="h-4 w-4 mr-2" />
              Gerar fatura
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const os = addOS({
                  titulo: `Atendimento — ${ct.numero}`,
                  clienteId: ct.clienteId,
                  prioridade: "media",
                  tecnico: "",
                  endereco: cli?.endereco,
                  tarefas: [],
                  ativosIds: [],
                  contratoId: ct.id,
                });
                toast.success(`OS ${os.numero} criada.`);
                navigate({ to: "/os/$id", params: { id: os.id } });
              }}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Criar OS
            </Button>
            {ct.status === "ativo" ? (
              <Button
                variant="outline"
                onClick={() => updateContrato(ct.id, { status: "suspenso" })}
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                Suspender
              </Button>
            ) : (
              <Button variant="outline" onClick={() => updateContrato(ct.id, { status: "ativo" })}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Reativar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => updateContrato(ct.id, { status: "encerrado" })}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Encerrar
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">Dados</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Info label="Cliente" value={cli?.nome ?? "—"} />
            <Info label="Status" value={<Badge>{ct.status}</Badge>} />
            <Info label="Tipo" value={CONTRATO_TIPO_LABEL[ct.tipo]} />
            <Info label="Frequência" value={CONTRATO_FREQUENCIA_LABEL[ct.frequencia]} />
            <Info label="Início" value={formatDate(ct.inicio)} />
            <Info label="Fim" value={formatDate(ct.fim)} />
            <Info
              label="Valor mensal"
              value={<span className="font-semibold">{formatBRL(ct.valorMensal)}</span>}
            />
            <Info label="Indexador" value={ct.indexador.toUpperCase()} />
            <Info
              label="Próximo reajuste"
              value={ct.proximoReajuste ? formatDate(ct.proximoReajuste) : "—"}
            />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Faturas geradas</h2>
          <ul className="space-y-2 text-sm">
            {faturas.length ? (
              faturas.map((f) => (
                <li key={f.id} className="flex justify-between border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{formatDate(f.vencimento)}</span>
                  <span className="font-medium">{formatBRL(f.valor)}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {f.status}
                  </Badge>
                </li>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">Sem faturas.</p>
            )}
          </ul>
        </Card>
      </div>

      <Card className="p-5 mt-4">
        <h2 className="font-semibold mb-3">Cronograma previsto (12 meses)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {cronograma.map((p, i) => (
            <div key={i} className="rounded-lg border p-2 text-center">
              <p className="text-[10px] uppercase text-muted-foreground">
                {p.ref.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
              </p>
              <p className="text-sm font-semibold">{formatBRL(p.valor)}</p>
            </div>
          ))}
        </div>
      </Card>
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
