"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import type { AppointmentStatus } from "@prisma/client";
import type {
  Appointment,
  Client,
  Professional,
  Service,
} from "@prisma/client";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import { formatDateTime } from "@/lib/utils/date";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";

type AppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: Service;
};

type AppointmentTableProps = {
  appointments: AppointmentWithRelations[];
};

export function AppointmentTable({ appointments }: AppointmentTableProps) {
  const router = useRouter();

  async function handleStatus(id: string, status: AppointmentStatus) {
    const result = await updateAppointmentStatus(id, status);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao atualizar status.");
      return;
    }
    toast.success("Status atualizado.");
    router.refresh();
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

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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
                  <div className="flex justify-end gap-1">
                    {apt.status === "SCHEDULED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatus(apt.id, "CONFIRMED")}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
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
                          onClick={() => handleStatus(apt.id, "COMPLETED")}
                        >
                          Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
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
    </div>
  );
}
