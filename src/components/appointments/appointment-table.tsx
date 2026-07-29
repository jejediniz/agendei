"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import type { AppointmentStatus } from "@prisma/client";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import { formatDateTime } from "@/lib/utils/date";
import { StatusBadge } from "./status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/layout/empty-state";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableElement,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/layout/data-table";

type AppointmentTableProps = {
  appointments: AppointmentWithRelations[];
};

type PendingAction = {
  id: string;
  status: AppointmentStatus;
};

const ACTION_MESSAGES: Record<
  "CANCELLED" | "COMPLETED",
  { title: string; description: string; confirmLabel: string; variant: "default" | "destructive" }
> = {
  CANCELLED: {
    title: "Cancelar agendamento",
    description:
      "Cancelar este agendamento? O horário ficará disponível novamente.",
    confirmLabel: "Cancelar agendamento",
    variant: "destructive",
  },
  COMPLETED: {
    title: "Concluir agendamento",
    description: "Marcar este agendamento como concluído?",
    confirmLabel: "Concluir",
    variant: "default",
  },
};

function AppointmentActions({
  apt,
  onStatus,
  stacked = false,
}: {
  apt: AppointmentWithRelations;
  onStatus: (id: string, status: AppointmentStatus) => void;
  stacked?: boolean;
}) {
  const btnClass = stacked ? "w-full" : "w-full sm:w-auto";
  if (apt.status === "SCHEDULED") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className={btnClass}
          onClick={() => onStatus(apt.id, "CONFIRMED")}
        >
          Confirmar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={btnClass}
          onClick={() => onStatus(apt.id, "CANCELLED")}
        >
          Cancelar
        </Button>
      </>
    );
  }

  if (apt.status === "CONFIRMED") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className={btnClass}
          onClick={() => onStatus(apt.id, "COMPLETED")}
        >
          Concluir
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={btnClass}
          onClick={() => onStatus(apt.id, "CANCELLED")}
        >
          Cancelar
        </Button>
      </>
    );
  }

  return null;
}

export function AppointmentTable({ appointments }: AppointmentTableProps) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!pending) return;
    setLoading(true);
    const result = await updateAppointmentStatus(pending.id, pending.status);
    setLoading(false);
    setPending(null);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao atualizar status.");
      return;
    }
    toast.success("Status atualizado.");
    router.refresh();
  }

  async function handleStatus(id: string, status: AppointmentStatus) {
    if (status === "CONFIRMED") {
      const result = await updateAppointmentStatus(id, status);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao atualizar status.");
        return;
      }
      toast.success("Status atualizado.");
      router.refresh();
      return;
    }

    setPending({ id, status });
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum agendamento encontrado"
        description="Não há agendamentos com os filtros atuais. Crie um novo ou ajuste data, profissional ou status."
        action={
          <Button asChild>
            <Link href="/agendamentos/novo">Novo agendamento</Link>
          </Button>
        }
      />
    );
  }

  const dialogConfig =
    pending?.status === "CANCELLED" || pending?.status === "COMPLETED"
      ? ACTION_MESSAGES[pending.status]
      : null;

  return (
    <>
      <div className="space-y-3 md:hidden">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="rounded-xl border border-border bg-card p-4 shadow-warm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium tabular-nums text-foreground">
                {formatDateTime(apt.startAt)}
              </p>
              <StatusBadge status={apt.status} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Avatar name={apt.client.name} size="sm" />
              <p className="font-medium text-foreground">{apt.client.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">{apt.professional.name}</p>
            <p className="text-sm text-muted-foreground">{apt.service.name}</p>
            <div className="mt-3 flex flex-col gap-2">
              <AppointmentActions apt={apt} onStatus={handleStatus} stacked />
            </div>
          </div>
        ))}
      </div>

      <DataTable>
        <DataTableElement>
          <DataTableHead>
            <DataTableRow className="hover:bg-transparent">
              <DataTableHeaderCell>Data/Hora</DataTableHeaderCell>
              <DataTableHeaderCell>Cliente</DataTableHeaderCell>
              <DataTableHeaderCell className="hidden lg:table-cell">
                Profissional
              </DataTableHeaderCell>
              <DataTableHeaderCell className="hidden xl:table-cell">
                Serviço
              </DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Ações</DataTableHeaderCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {appointments.map((apt) => (
              <DataTableRow key={apt.id}>
                <DataTableCell className="tabular-nums text-foreground">
                  {formatDateTime(apt.startAt)}
                </DataTableCell>
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={apt.client.name} size="sm" />
                    <span className="font-medium text-foreground">
                      {apt.client.name}
                    </span>
                  </div>
                </DataTableCell>
                <DataTableCell className="hidden text-muted-foreground lg:table-cell">
                  {apt.professional.name}
                </DataTableCell>
                <DataTableCell className="hidden text-muted-foreground xl:table-cell">
                  {apt.service.name}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={apt.status} />
                </DataTableCell>
                <DataTableCell>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-end">
                    <AppointmentActions apt={apt} onStatus={handleStatus} />
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTableElement>
      </DataTable>

      {dialogConfig && (
        <ConfirmDialog
          open={!!pending}
          onOpenChange={(open) => !open && setPending(null)}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmLabel={dialogConfig.confirmLabel}
          variant={dialogConfig.variant}
          loading={loading}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
