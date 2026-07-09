import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Upload,
  CheckCircle2,
  Wand2,
  IdCard,
  Zap,
  Satellite,
  CalendarClock,
  ClipboardCheck,
} from "lucide-react";
import { uploadCustomerDoc } from "@/lib/storage";
import {
  callOcr,
  customerOnboardingService,
  type OnboardingResult,
  type PendingDoc,
} from "@/services/customerOnboarding";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/clientes/novo")({
  head: () => ({ meta: [{ title: "Novo cliente — GreenLink ADM" }] }),
  component: NovoClienteWizard,
});

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { icon: IdCard, label: "CNH" },
  { icon: Zap, label: "Conta de energia" },
  { icon: Satellite, label: "Etiqueta Starlink" },
  { icon: CalendarClock, label: "Plano & instalação" },
  { icon: ClipboardCheck, label: "Revisão" },
] as const;

function Stepper({ current }: { current: StepIndex }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 mb-6">
      {STEPS.map((s, idx) => {
        const active = idx === current;
        const done = idx < current;
        const Icon = s.icon;
        return (
          <li
            key={s.label}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              active
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : done
                  ? "border-primary/50 text-primary"
                  : "border-border text-muted-foreground"
            }`}
          >
            {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            <span>
              {idx + 1}. {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

type FormState = {
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  model: string;
  serialNumber: string;
  kitId: string;
  pn: string;
  plan: string;
  scheduledAt: string;
  notes: string;
};

const initialForm: FormState = {
  fullName: "",
  cpf: "",
  birthDate: "",
  email: "",
  phone: "",
  street: "",
  district: "",
  city: "",
  state: "",
  zipCode: "",
  latitude: "",
  longitude: "",
  model: "",
  serialNumber: "",
  kitId: "",
  pn: "",
  plan: "",
  scheduledAt: "",
  notes: "",
};

function NovoClienteWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<StepIndex>(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [docs, setDocs] = useState<PendingDoc[]>([]);
  const [tempId] = useState(() => `_pending/${crypto.randomUUID()}`);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<OnboardingResult | null>(null);

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const goNext = () => setStep((s) => Math.min(4, s + 1) as StepIndex);
  const goBack = () => setStep((s) => Math.max(0, s - 1) as StepIndex);

  async function handleSubmit() {
    if (!form.fullName.trim()) {
      toast.error("Nome do cliente é obrigatório");
      setStep(0);
      return;
    }
    setSubmitting(true);
    try {
      const r = await customerOnboardingService.create(
        {
          customer: {
            legalName: form.fullName.trim(),
            documentNumber: form.cpf.trim() || undefined,
            birthDate: form.birthDate || undefined,
            email: form.email.trim() || undefined,
            phone: form.phone.trim() || undefined,
            street: form.street.trim() || undefined,
            district: form.district.trim() || undefined,
            city: form.city.trim() || undefined,
            state: form.state.trim() || undefined,
            zipCode: form.zipCode.trim() || undefined,
            latitude: form.latitude ? Number(form.latitude) : undefined,
            longitude: form.longitude ? Number(form.longitude) : undefined,
          },
          equipment: {
            model: form.model.trim() || undefined,
            serialNumber: form.serialNumber.trim() || undefined,
            kitId: form.kitId.trim() || undefined,
            pn: form.pn.trim() || undefined,
          },
          starlink: { plan: form.plan.trim() || undefined },
          installation: {
            scheduledAt: form.scheduledAt || undefined,
            notes: form.notes.trim() || undefined,
          },
          docs,
        },
        user?.id,
      );
      setResult(r);
      toast.success(`Cliente criado. Conta ${r.glCode} gerada.`);
    } catch (err) {
      console.error(err);
      const e2 = err as { message?: string };
      toast.error(e2.message ?? "Erro ao concluir cadastro");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <PageContainer>
        <PageHeader title="Cliente cadastrado" description="Fluxo concluído com sucesso." />
        <Card className="p-6 max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">{form.fullName}</p>
              <p className="text-sm text-muted-foreground">
                Conta Starlink e instalação agendadas.
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">GL Code</dt>
              <dd className="font-mono font-semibold">{result.glCode}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Gmail alias</dt>
              <dd className="font-mono text-xs break-all">{result.gmailAlias}</dd>
            </div>
          </dl>
          <div className="flex gap-2 mt-6">
            <Button onClick={() => navigate({ to: "/clientes/$id", params: { id: result.customerId } })}>
              Ver cliente
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/clientes" })}>
              Voltar à lista
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        to="/clientes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Clientes
      </Link>
      <PageHeader
        title="Novo cliente (cadastro guiado)"
        description="Enviamos os documentos e a IA preenche os campos. Você pode ajustar antes de salvar."
      />
      <Stepper current={step} />

      <Card className="p-5 max-w-3xl">
        {step === 0 && (
          <DocStep
            title="1. CNH do titular"
            description="Envie a foto/scan da CNH. Extraímos nome, CPF e nascimento."
            docType="cnh"
            tempId={tempId}
            docs={docs}
            setDocs={setDocs}
            onExtract={(d) => {
              update({
                fullName: (d.full_name as string) ?? form.fullName,
                cpf: (d.cpf as string) ?? form.cpf,
                birthDate: (d.birth_date as string) ?? form.birthDate,
              });
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <Field label="Nome completo" value={form.fullName} onChange={(v) => update({ fullName: v })} required />
              <Field label="CPF" value={form.cpf} onChange={(v) => update({ cpf: v })} />
              <Field label="Nascimento" type="date" value={form.birthDate} onChange={(v) => update({ birthDate: v })} />
              <Field label="E-mail" type="email" value={form.email} onChange={(v) => update({ email: v })} />
              <Field label="Telefone" value={form.phone} onChange={(v) => update({ phone: v })} />
            </div>
          </DocStep>
        )}

        {step === 1 && (
          <DocStep
            title="2. Conta de energia"
            description="Envie a conta para preencher o endereço de instalação."
            docType="energy_bill"
            tempId={tempId}
            docs={docs}
            setDocs={setDocs}
            onExtract={(d) => {
              update({
                street: (d.street as string) ?? form.street,
                district: (d.district as string) ?? form.district,
                city: (d.city as string) ?? form.city,
                state: (d.state as string) ?? form.state,
                zipCode: (d.zip_code as string) ?? form.zipCode,
              });
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <Field label="Logradouro e número" value={form.street} onChange={(v) => update({ street: v })} />
              <Field label="Bairro" value={form.district} onChange={(v) => update({ district: v })} />
              <Field label="Cidade" value={form.city} onChange={(v) => update({ city: v })} />
              <Field label="UF" value={form.state} onChange={(v) => update({ state: v.toUpperCase().slice(0, 2) })} />
              <Field label="CEP" value={form.zipCode} onChange={(v) => update({ zipCode: v })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Latitude" value={form.latitude} onChange={(v) => update({ latitude: v })} />
                <Field label="Longitude" value={form.longitude} onChange={(v) => update({ longitude: v })} />
              </div>
            </div>
          </DocStep>
        )}

        {step === 2 && (
          <DocStep
            title="3. Etiqueta do kit Starlink"
            description="Envie a foto da etiqueta/caixa para capturar SN, KIT ID e PN."
            docType="starlink_label"
            tempId={tempId}
            docs={docs}
            setDocs={setDocs}
            onExtract={(d) => {
              update({
                model: (d.model as string) ?? form.model,
                serialNumber: (d.serial_number as string) ?? form.serialNumber,
                kitId: (d.kit_id as string) ?? form.kitId,
                pn: (d.pn as string) ?? form.pn,
              });
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <Field label="Modelo" value={form.model} onChange={(v) => update({ model: v })} />
              <Field label="Serial Number" value={form.serialNumber} onChange={(v) => update({ serialNumber: v })} />
              <Field label="KIT ID" value={form.kitId} onChange={(v) => update({ kitId: v })} />
              <Field label="Part Number (PN)" value={form.pn} onChange={(v) => update({ pn: v })} />
            </div>
          </DocStep>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-semibold mb-1">4. Plano e agendamento</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Defina o plano contratado e agende a instalação. O técnico pode ser atribuído depois em
              /instalações.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Plano Starlink" value={form.plan} onChange={(v) => update({ plan: v })} />
              <Field
                label="Instalação agendada para"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(v) => update({ scheduledAt: v })}
              />
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Notas</Label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border bg-background p-2 text-sm"
                  value={form.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-semibold mb-1">5. Revisão</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Confira os dados. Ao confirmar, criamos cliente, equipamento, conta Starlink e
              instalação. GL-code e alias Gmail são gerados automaticamente.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Summary title="Cliente">
                <SumRow label="Nome" value={form.fullName} />
                <SumRow label="CPF" value={form.cpf} />
                <SumRow label="Nascimento" value={form.birthDate} />
                <SumRow label="E-mail" value={form.email} />
                <SumRow label="Telefone" value={form.phone} />
              </Summary>
              <Summary title="Endereço">
                <SumRow label="Rua" value={form.street} />
                <SumRow label="Bairro" value={form.district} />
                <SumRow label="Cidade/UF" value={[form.city, form.state].filter(Boolean).join(" / ")} />
                <SumRow label="CEP" value={form.zipCode} />
                <SumRow
                  label="GPS"
                  value={form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : ""}
                />
              </Summary>
              <Summary title="Equipamento">
                <SumRow label="Modelo" value={form.model} />
                <SumRow label="SN" value={form.serialNumber} />
                <SumRow label="KIT ID" value={form.kitId} />
                <SumRow label="PN" value={form.pn} />
              </Summary>
              <Summary title="Plano & instalação">
                <SumRow label="Plano" value={form.plan} />
                <SumRow label="Agendada" value={form.scheduledAt.replace("T", " ")} />
                <SumRow label="Notas" value={form.notes} />
              </Summary>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">Documentos anexados</Badge>
              <span>{docs.length} de 3</span>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button variant="outline" onClick={goBack} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          {step < 4 ? (
            <Button onClick={goNext}>
              Avançar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Concluir cadastro
            </Button>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}

function Summary({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="font-semibold text-sm mb-2">{title}</p>
      <dl className="space-y-1">{children}</dl>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-right text-xs font-medium truncate max-w-[60%]">{value || "—"}</dd>
    </div>
  );
}

function DocStep({
  title,
  description,
  docType,
  tempId,
  docs,
  setDocs,
  onExtract,
  children,
}: {
  title: string;
  description: string;
  docType: "cnh" | "energy_bill" | "starlink_label";
  tempId: string;
  docs: PendingDoc[];
  setDocs: (fn: (d: PendingDoc[]) => PendingDoc[]) => void;
  onExtract: (data: Record<string, unknown>) => void;
  children: React.ReactNode;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [ocring, setOcring] = useState(false);
  const current = docs.find((d) => d.docType === docType);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const up = await uploadCustomerDoc(file, tempId, docType);
      const doc: PendingDoc = { path: up.path, docType, ocrData: null };
      setDocs((arr) => [...arr.filter((d) => d.docType !== docType), doc]);
      toast.success("Arquivo enviado. Extraindo dados…");
      setOcring(true);
      try {
        const extracted = await callOcr(up.path, docType);
        setDocs((arr) =>
          arr.map((d) => (d.docType === docType ? { ...d, ocrData: extracted } : d)),
        );
        onExtract(extracted);
        toast.success("Dados extraídos. Revise abaixo.");
      } catch (err) {
        console.error(err);
        const e2 = err as { message?: string };
        toast.error(e2.message ?? "OCR falhou. Preencha manualmente.");
      } finally {
        setOcring(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha no upload do arquivo.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || ocring}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-1" />
          )}
          {current ? "Substituir arquivo" : "Enviar documento"}
        </Button>
        {ocring && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Wand2 className="h-3.5 w-3.5 animate-pulse" /> Lendo com IA…
          </span>
        )}
        {current && !ocring && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> {current.path.split("/").pop()}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}