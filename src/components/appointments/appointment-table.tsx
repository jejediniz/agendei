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
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/layout/empty-state";

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
        description="Crie um novo agendamento ou ajuste os filtros."
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
            <p className="mt-2 font-medium text-foreground">{apt.client.name}</p>
            <p className="text-sm text-muted-foreground">{apt.professional.name}</p>
            <p className="text-sm text-muted-foreground">{apt.service.name}</p>
            <div className="mt-3 flex flex-col gap-2">
              <AppointmentActions apt={apt} onStatus={handleStatus} stacked />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Data/Hora</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Cliente</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">Profissional</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground xl:table-cell">Serviço</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 text-foreground">
                  {formatDateTime(apt.startAt)}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {apt.client.name}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {apt.professional.name}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
                  {apt.service.name}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={apt.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-end">
                    <AppointmentActions apt={apt} onStatus={handleStatus} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
