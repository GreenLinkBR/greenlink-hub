import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate } from "@/lib/mock/store";
import type { ContratoIndexador } from "@/lib/mock/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contratos")({
  head: () => ({ meta: [{ title: "Contratos — GreenLink ADM" }] }),
  component: ContratosPage,
});

const statusVariant = (s: string) =>
  s === "ativo" ? "default" : s === "suspenso" ? "secondary" : "outline";

function ContratosPage() {
  const { contratos, clientes, addContrato } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clienteId: "", valorMensal: "", inicio: new Date().toISOString().slice(0, 10),
    fim: "", indexador: "fixo" as ContratoIndexador, descricao: "",
  });

  const submit = () => {
    if (!form.clienteId || !form.valorMensal || !form.fim) {
      toast.error("Preencha cliente, valor mensal e vigência."); return;
    }
    addContrato({
      clienteId: form.clienteId, valorMensal: Number(form.valorMensal),
      inicio: new Date(form.inicio).toISOString(), fim: new Date(form.fim).toISOString(),
      indexador: form.indexador, descricao: form.descricao,
    });
    toast.success("Contrato criado.");
    setOpen(false);
    setForm({ clienteId: "", valorMensal: "", inicio: new Date().toISOString().slice(0, 10), fim: "", indexador: "fixo", descricao: "" });
  };

  return (
    <PageContainer>
      <PageHeader title="Contratos" description={`${contratos.length} contratos · ${formatBRL(contratos.filter(c => c.status === "ativo").reduce((a, c) => a + c.valorMensal, 0))}/mês ativo`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo contrato</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo contrato</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Cliente</Label>
                  <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Início</Label><Input type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} /></div>
                  <div><Label>Fim</Label><Input type="date" value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Valor mensal</Label><Input type="number" value={form.valorMensal} onChange={(e) => setForm({ ...form, valorMensal: e.target.value })} /></div>
                  <div><Label>Indexador</Label>
                    <Select value={form.indexador} onValueChange={(v) => setForm({ ...form, indexador: v as ContratoIndexador })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixo">Fixo</SelectItem>
                        <SelectItem value="ipca">IPCA</SelectItem>
                        <SelectItem value="igpm">IGPM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit}>Criar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />
      <Card className="p-3 md:p-4">
        <div className="md:hidden space-y-2">
          {contratos.map((c) => {
            const cli = clientes.find((x) => x.id === c.clienteId);
            return (
              <Link key={c.id} to="/contratos/$id" params={{ id: c.id }} className="block rounded-lg border p-3 hover:bg-muted">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.numero}</p>
                  <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{cli?.nome} · {c.indexador.toUpperCase()}</p>
                <p className="text-sm font-semibold mt-1">{formatBRL(c.valorMensal)}/mês</p>
                <p className="text-xs text-muted-foreground">Até {formatDate(c.fim)}</p>
              </Link>
            );
          })}
        </div>
        <div className="hidden md:block">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Número</TableHead><TableHead>Cliente</TableHead><TableHead>Vigência</TableHead>
              <TableHead>Mensal</TableHead><TableHead>Indexador</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {contratos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell><Link to="/contratos/$id" params={{ id: c.id }} className="font-medium hover:text-primary">{c.numero}</Link></TableCell>
                  <TableCell className="text-muted-foreground">{clientes.find((x) => x.id === c.clienteId)?.nome ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(c.inicio)} → {formatDate(c.fim)}</TableCell>
                  <TableCell className="font-semibold">{formatBRL(c.valorMensal)}</TableCell>
                  <TableCell className="uppercase text-xs">{c.indexador}</TableCell>
                  <TableCell><Badge variant={statusVariant(c.status)}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
              {!contratos.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum contrato.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
