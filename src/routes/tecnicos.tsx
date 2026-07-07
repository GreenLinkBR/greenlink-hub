import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useTechnicians } from "@/hooks/domain";

export const Route = createFileRoute("/tecnicos")({
  head: () => ({ meta: [{ title: "Técnicos — GreenLink ADM" }] }),
  component: TecnicosPage,
});

function TecnicosPage() {
  const { data: technicians = [] } = useTechnicians();

  return (
    <PageContainer>
      <PageHeader
        title="Técnicos"
        description={`${technicians.length} técnicos ranqueados por instalações concluídas`}
      />
      <Card className="p-3 md:p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Técnico</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Agendadas</TableHead>
              <TableHead>Concluídas</TableHead>
              <TableHead>Tempo médio (h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.map((t) => (
              <TableRow key={t.technicianId}>
                <TableCell className="font-medium">
                  {t.fullName ?? t.email ?? t.technicianId}
                </TableCell>
                <TableCell className="text-muted-foreground">{t.email ?? "—"}</TableCell>
                <TableCell>{t.installationsScheduled}</TableCell>
                <TableCell>{t.installationsDone}</TableCell>
                <TableCell>
                  {t.avgHoursToExecute != null ? t.avgHoursToExecute.toFixed(1) : "—"}
                </TableCell>
              </TableRow>
            ))}
            {!technicians.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum técnico com atividade.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}