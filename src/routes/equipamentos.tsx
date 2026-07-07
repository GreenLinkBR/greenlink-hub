import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useEquipmentList,
  useCreateEquipment,
  useUpdateEquipment,
  useCustomers,
} from "@/hooks/domain";
import type { EquipmentStatus } from "@/types/equipment";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/equipamentos")({
  head: () => ({ meta: [{ title: "Equipamentos — GreenLink ADM" }] }),
  component: EquipamentosPage,
});

const statusLabel: Record<EquipmentStatus, string> = {
  in_stock: "Em estoque",
  installed: "Instalado",
  maintenance: "Manutenção",
  retired: "Baixado",
};

function EquipamentosPage() {
  const { data: items = [] } = useEquipmentList();
  const { data: customers = [] } = useCustomers();
  const create = useCreateEquipment();
  const update = useUpdateEquipment();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState({
    model: "",
    serialNumber: "",
    kitId: "",
    dishModel: "",
    pn: "",
    powerSource: "",
    status: "in_stock" as EquipmentStatus,
    customerId: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return items.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!n) return true;
      return [i.model, i.serialNumber, i.kitId, i.pn, i.dishModel]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(n));
    });
  }, [items, q, statusFilter]);

  const customerName = (id?: string) => customers.find((c) => c.id === id)?.legalName ?? "—";

  const submit = async () => {
    if (!form.serialNumber && !form.kitId) {
      toast.error("Informe SN ou KIT ID.");
      return;
    }
    try {
      await create.mutateAsync({
        ...form,
        customerId: form.customerId || undefined,
      });
      toast.success("Equipamento cadastrado.");
      setOpen(false);
      setForm({
        model: "",
        serialNumber: "",
        kitId: "",
        dishModel: "",
        pn: "",
        powerSource: "",
        status: "in_stock",
        customerId: "",
        notes: "",
      });
    } catch (e) {
      toast.error("Erro ao salvar equipamento.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Equipamentos Starlink"
        description={`${items.length} equipamentos cadastrados`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo equipamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo equipamento</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Dish model</Label>
                  <Input
                    value={form.dishModel}
                    onChange={(e) => setForm({ ...form, dishModel: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>KIT ID</Label>
                  <Input
                    value={form.kitId}
                    onChange={(e) => setForm({ ...form, kitId: e.target.value })}
                  />
                </div>
                <div>
                  <Label>P/N</Label>
                  <Input
                    value={form.pn}
                    onChange={(e) => setForm({ ...form, pn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fonte de energia</Label>
                  <Input
                    value={form.powerSource}
                    onChange={(e) => setForm({ ...form, powerSource: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Cliente</Label>
                  <Select
                    value={form.customerId}
                    onValueChange={(v) => setForm({ ...form, customerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem cliente" />
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
                <div className="col-span-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: EquipmentStatus) => setForm({ ...form, status: v })}
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={submit}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="p-3 md:p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Buscar por SN, KIT ID, modelo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="md:max-w-sm"
          />
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
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>SN</TableHead>
              <TableHead>KIT ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.model || "—"}</TableCell>
                <TableCell>{e.serialNumber || "—"}</TableCell>
                <TableCell>{e.kitId || "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {customerName(e.customerId)}
                </TableCell>
                <TableCell>
                  <Select
                    value={e.status}
                    onValueChange={async (v: EquipmentStatus) => {
                      try {
                        await update.mutateAsync({ id: e.id, data: { status: v } });
                      } catch {
                        toast.error("Erro ao atualizar status");
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
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum equipamento.
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