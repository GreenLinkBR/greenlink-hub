import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import {
  useInstallations,
  useCreateInstallation,
  useUpdateInstallation,
  useCustomers,
  useEquipmentList,
  useTechnicians,
} from "@/hooks/domain";
import type { InstallationStatus } from "@/types/installation";
import { formatDate } from "@/lib/formatters";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/instalacoes")({
  head: () => ({ meta: [{ title: "Instalações — GreenLink ADM" }] }),
  component: InstalacoesPage,
});

const statusLabel: Record<InstallationStatus, string> = {
  scheduled: "Agendada",
  in_progress: "Em execução",
  done: "Concluída",
  cancelled: "Cancelada",
};

function InstalacoesPage() {
  const { data: items = [] } = useInstallations();
  const { data: customers = [] } = useCustomers();
  const { data: equipment = [] } = useEquipmentList();
  const { data: technicians = [] } = useTechnicians();
  const create = useCreateInstallation();
  const update = useUpdateInstallation();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState({
    customerId: "",
    equipmentId: "",
    technicianId: "",
    scheduledAt: "",
    status: "scheduled" as InstallationStatus,
    notes: "",
  });

  const filtered = useMemo(
    () => (statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter)),
    [items, statusFilter],
  );

  const customerName = (id?: string) => customers.find((c) => c.id === id)?.legalName ?? "—";
  const techName = (id?: string) =>
    technicians.find((t) => t.technicianId === id)?.fullName ?? "—";
  const equipLabel = (id?: string) => {
    const e = equipment.find((x) => x.id === id);
    return e ? e.serialNumber || e.kitId || e.model || e.id : "—";
  };

  const submit = async () => {
    if (!form.customerId) {
      toast.error("Selecione o cliente.");
      return;
    }
    try {
      await create.mutateAsync({
        customerId: form.customerId,
        equipmentId: form.equipmentId || undefined,
        technicianId: form.technicianId || undefined,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        status: form.status,
        notes: form.notes || undefined,
      });
      toast.success("Instalação agendada.");
      setOpen(false);
      setForm({
        customerId: "",
        equipmentId: "",
        technicianId: "",
        scheduledAt: "",
        status: "scheduled",
        notes: "",
      });
    } catch {
      toast.error("Erro ao agendar.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Instalações"
        description={`${items.length} instalações · ${items.filter((i) => i.status === "scheduled").length} agendadas`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agendar instalação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova instalação</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Cliente</Label>
                  <Select
                    value={form.customerId}
                    onValueChange={(v) => setForm({ ...form, customerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.legalName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Equipamento</Label>
                  <Select
                    value={form.equipmentId}
                    onValueChange={(v) => setForm({ ...form, equipmentId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.serialNumber || e.kitId || e.model || e.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Técnico</Label>
                  <Select
                    value={form.technicianId}
                    onValueChange={(v) => setForm({ ...form, technicianId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((t) => (
                        <SelectItem key={t.technicianId} value={t.technicianId}>
                          {t.fullName ?? t.email ?? t.technicianId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data agendada</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: InstallationStatus) => setForm({ ...form, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabel).map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={submit}>Agendar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="p-3 md:p-4 space-y-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(statusLabel).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Agendada</TableHead>
              <TableHead>Executada</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{customerName(i.customerId)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {equipLabel(i.equipmentId)}
                </TableCell>
                <TableCell className="text-muted-foreground">{techName(i.technicianId)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(i.scheduledAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(i.executedAt)}</TableCell>
                <TableCell>
                  <Select
                    value={i.status}
                    onValueChange={async (v: InstallationStatus) => {
                      try {
                        await update.mutateAsync({
                          id: i.id,
                          data: {
                            status: v,
                            executedAt:
                              v === "done" && !i.executedAt
                                ? new Date().toISOString()
                                : i.executedAt,
                          },
                        });
                      } catch {
                        toast.error("Erro ao atualizar");
                      }
                    }}
                  >
                    <SelectTrigger className="h-7 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabel).map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma instalação.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="text-xs text-muted-foreground">
          <Badge variant="outline">{filtered.length}</Badge> resultados
        </div>
      </Card>
    </PageContainer>
  );
}