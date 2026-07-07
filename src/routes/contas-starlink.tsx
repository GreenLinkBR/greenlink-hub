import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  useStarlinkAccounts,
  useCreateStarlinkAccount,
  useCustomers,
  useEquipmentList,
} from "@/hooks/domain";
import type { StarlinkAccountStatus } from "@/types/starlinkAccount";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contas-starlink")({
  head: () => ({ meta: [{ title: "Contas Starlink — GreenLink ADM" }] }),
  component: ContasStarlinkPage,
});

const statusLabel: Record<StarlinkAccountStatus, string> = {
  active: "Ativa",
  inactive: "Inativa",
  suspended: "Suspensa",
  cancelled: "Cancelada",
};

function ContasStarlinkPage() {
  const { data: accounts = [] } = useStarlinkAccounts();
  const { data: customers = [] } = useCustomers();
  const { data: equipment = [] } = useEquipmentList();
  const create = useCreateStarlinkAccount();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    customerId: "",
    equipmentId: "",
    plan: "",
    status: "active" as StarlinkAccountStatus,
    isPrimaryAccount: false,
    customerHasAccess: false,
    recoveryEmail: "",
    recoveryPhone: "",
  });

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return accounts;
    return accounts.filter((a) =>
      [a.glCode, a.gmailAlias, a.plan, a.recoveryEmail]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(n)),
    );
  }, [accounts, q]);

  const customerName = (id?: string) => customers.find((c) => c.id === id)?.legalName ?? "—";
  const equipmentLabel = (id?: string) => {
    const e = equipment.find((x) => x.id === id);
    return e ? e.serialNumber || e.kitId || e.model || e.id : "—";
  };

  const submit = async () => {
    try {
      await create.mutateAsync({
        customerId: form.customerId || undefined,
        equipmentId: form.equipmentId || undefined,
        plan: form.plan || undefined,
        status: form.status,
        isPrimaryAccount: form.isPrimaryAccount,
        customerHasAccess: form.customerHasAccess,
        recoveryEmail: form.recoveryEmail || undefined,
        recoveryPhone: form.recoveryPhone || undefined,
      });
      toast.success("Conta Starlink criada. GL e alias gerados automaticamente.");
      setOpen(false);
      setForm({
        customerId: "",
        equipmentId: "",
        plan: "",
        status: "active",
        isPrimaryAccount: false,
        customerHasAccess: false,
        recoveryEmail: "",
        recoveryPhone: "",
      });
    } catch (e) {
      toast.error("Erro ao criar conta.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Contas Starlink"
        description={`${accounts.length} contas · GL e alias gerados automaticamente`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova conta Starlink</DialogTitle>
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
                <div className="col-span-2">
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
                  <Label>Plano</Label>
                  <Input
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: StarlinkAccountStatus) => setForm({ ...form, status: v })}
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
                <div>
                  <Label>E-mail de recuperação</Label>
                  <Input
                    value={form.recoveryEmail}
                    onChange={(e) => setForm({ ...form, recoveryEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Telefone de recuperação</Label>
                  <Input
                    value={form.recoveryPhone}
                    onChange={(e) => setForm({ ...form, recoveryPhone: e.target.value })}
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.isPrimaryAccount}
                      onCheckedChange={(v) =>
                        setForm({ ...form, isPrimaryAccount: Boolean(v) })
                      }
                    />
                    Conta principal do cliente
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.customerHasAccess}
                      onCheckedChange={(v) =>
                        setForm({ ...form, customerHasAccess: Boolean(v) })
                      }
                    />
                    Cliente possui acesso
                  </label>
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
        <Input
          placeholder="Buscar por GL, alias, plano…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="md:max-w-sm"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GL Code</TableHead>
              <TableHead>Gmail alias</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Acesso do cliente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.glCode}</TableCell>
                <TableCell className="text-muted-foreground">{a.gmailAlias}</TableCell>
                <TableCell className="text-muted-foreground">
                  {customerName(a.customerId)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {equipmentLabel(a.equipmentId)}
                </TableCell>
                <TableCell className="text-muted-foreground">{a.plan ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{statusLabel[a.status]}</Badge>
                </TableCell>
                <TableCell>{a.isPrimaryAccount ? "Sim" : "—"}</TableCell>
                <TableCell>{a.customerHasAccess ? "Sim" : "—"}</TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhuma conta.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}