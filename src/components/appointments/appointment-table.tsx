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
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Data/Hora</th>
              <th className="px-4 py-3 font-medium text-slate-600">Cliente</th>
              <th className="hidden px-4 py-3 font-medium text-slate-600 md:table-cell">Profissional</th>
              <th className="hidden px-4 py-3 font-medium text-slate-600 lg:table-cell">Serviço</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-900">
                  {formatDateTime(apt.startAt)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {apt.client.name}
                </td>
                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                  {apt.professional.name}
                </td>
                <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                  {apt.service.name}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={apt.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-end">
                    {apt.status === "SCHEDULED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => handleStatus(apt.id, "CONFIRMED")}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full sm:w-auto"
                          onClick={() => handleStatus(apt.id, "CANCELLED")}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    {apt.status === "CONFIRMED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => handleStatus(apt.id, "COMPLETED")}
                        >
                          Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full sm:w-auto"
                          onClick={() => handleStatus(apt.id, "CANCELLED")}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
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
