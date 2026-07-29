"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { getPublicAvailableSlots } from "@/lib/actions/public-booking";
import { rescheduleCustomerAppointment } from "@/lib/actions/customer-booking";
import { combineDateAndTime, formatDateTime } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgendaWeekStrip } from "@/components/agenda/agenda-week-strip";
import { ProfessionalSlotTimeGrid } from "@/components/booking/professional-slot-time-grid";

type RescheduleAppointmentDialogProps = {
  slug: string;
  appointment: AppointmentWithRelations | null;
  onOpenChange: (open: boolean) => void;
  onRescheduled: () => void;
};

export function RescheduleAppointmentDialog({
  slug,
  appointment,
  onOpenChange,
  onRescheduled,
}: RescheduleAppointmentDialogProps) {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadSlots(nextDate: string) {
    if (!appointment) return;
    setLoadingSlots(true);
    setTime("");
    const result = await getPublicAvailableSlots(
      slug,
      appointment.professionalId,
      appointment.serviceId,
      nextDate,
    );
    setLoadingSlots(false);
    setSlots(result.slots);
    if (result.error && result.slots.length === 0) {
      toast.error(result.error);
    }
  }

  function handleOpenChange(open: boolean) {
    if (open && appointment) {
      const today = format(new Date(), "yyyy-MM-dd");
      setDate(today);
      setTime("");
      loadSlots(today);
    }
    onOpenChange(open);
  }

  async function handleConfirm() {
    if (!appointment || !time) return;
    setSaving(true);
    const result = await rescheduleCustomerAppointment(slug, {
      appointmentId: appointment.id,
      date,
      time,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao remarcar.");
      return;
    }

    toast.success("Agendamento remarcado!");
    onOpenChange(false);
    onRescheduled();
  }

  return (
    <Dialog open={!!appointment} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Remarcar agendamento</DialogTitle>
          <DialogDescription>
            {appointment && (
              <>
                {appointment.service.name} com {appointment.professional.name} ·
                atualmente em {formatDateTime(appointment.startAt)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="space-y-6">
            <AgendaWeekStrip
              selectedDate={date}
              onDateChange={(value) => {
                setDate(value);
                loadSlots(value);
              }}
              minDate={new Date().toISOString().split("T")[0]}
            />

            <ProfessionalSlotTimeGrid
              professionals={[appointment.professional]}
              slotsByProfessional={{ [appointment.professionalId]: slots }}
              loading={loadingSlots}
              selectedProfessionalId={time ? appointment.professionalId : undefined}
              selectedTime={time}
              onSelect={(_, slot) => setTime(slot)}
            />

            {time && (
              <p className="text-sm text-muted-foreground">
                Novo horário: {formatDateTime(combineDateAndTime(date, time))}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" disabled={!time || saving} onClick={handleConfirm}>
            {saving ? "Remarcando..." : "Confirmar novo horário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
