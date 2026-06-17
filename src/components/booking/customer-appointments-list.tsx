"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { cancelCustomerAppointment } from "@/lib/actions/customer-booking";
import { formatDateTime } from "@/lib/utils/date";
import { StatusBadge } from "@/components/appointments/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/layout/empty-state";
import { Calendar } from "lucide-react";

type CustomerAppointmentsListProps = {
  slug: string;
  appointments: AppointmentWithRelations[];
};

export function CustomerAppointmentsList({
  slug,
  appointments,
}: CustomerAppointmentsListProps) {
  const router = useRouter();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const upcoming = appointments.filter(
    (apt) =>
      apt.startAt > now &&
      (apt.status === "SCHEDULED" || apt.status === "CONFIRMED"),
  );
  const past = appointments.filter(
    (apt) =>
      apt.startAt <= now ||
      apt.status === "COMPLETED" ||
      apt.status === "CANCELLED",
  );

  async function handleCancel() {
    if (!cancelId) return;
    setLoading(true);
    const result = await cancelCustomerAppointment(slug, cancelId);
    setLoading(false);
    setCancelId(null);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao cancelar.");
      return;
    }

    toast.success("Agendamento cancelado.");
    router.refresh();
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum agendamento encontrado"
        description="Quando você agendar, seus horários aparecerão aqui."
        action={
          <Button asChild>
            <a href={`/${slug}`}>Fazer agendamento</a>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-8">
        {upcoming.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-foreground/80">Próximos</h2>
            {upcoming.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onCancel={() => setCancelId(apt.id)}
              />
            ))}
          </section>
        )}

        {past.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-foreground/80">Histórico</h2>
            {past.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </section>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancelar agendamento"
        description="Cancelar este agendamento? O horário ficará disponível novamente."
        confirmLabel="Cancelar agendamento"
        variant="destructive"
        loading={loading}
        onConfirm={handleCancel}
      />
    </>
  );
}

function AppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: AppointmentWithRelations;
  onCancel?: () => void;
}) {
  const canCancel =
    onCancel &&
    appointment.startAt > new Date() &&
    (appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium text-foreground">{appointment.service.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(appointment.startAt)} · {appointment.professional.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={appointment.status} />
          {canCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
