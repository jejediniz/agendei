"use client";

import { CalendarClock, Clock, MessageCircle, Phone } from "lucide-react";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { formatTime } from "@/lib/utils/date";
import {
  buildTelUrl,
  buildWhatsAppUrl,
  isValidContactPhone,
} from "@/lib/utils/contact-links";
import { StatusBadge } from "@/components/appointments/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";

type NextAppointmentHeroProps = {
  appointment: AppointmentWithRelations | null;
  onViewDetails?: (appointment: AppointmentWithRelations) => void;
};

function buildWhatsAppMessage(appointment: AppointmentWithRelations): string {
  const time = formatTime(appointment.startAt);
  return `Olá, ${appointment.client.name}! Passando para confirmar seu atendimento. Serviço: ${appointment.service.name}. Horário: ${time}.`;
}

export function NextAppointmentHero({
  appointment,
  onViewDetails,
}: NextAppointmentHeroProps) {
  if (!appointment) {
    return (
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary-light/30">
        <CardContent className="p-6 sm:p-8">
          <EmptyState
            compact
            icon={CalendarClock}
            title="Nenhum próximo atendimento para hoje"
            description="Quando houver horários marcados ou confirmados ainda por vir, o próximo aparecerá aqui."
            className="border-none bg-transparent"
          />
        </CardContent>
      </Card>
    );
  }

  const phone = appointment.client.phone;
  const hasPhone = isValidContactPhone(phone);
  const whatsAppUrl = hasPhone
    ? buildWhatsAppUrl(phone, buildWhatsAppMessage(appointment))
    : null;
  const telUrl = hasPhone ? buildTelUrl(phone) : null;

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary-light/25 shadow-warm-md">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4 sm:gap-5">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-warm sm:px-5">
              <span className="text-xs font-medium uppercase tracking-wide opacity-90">
                Hoje
              </span>
              <span className="font-display text-3xl font-bold tabular-nums sm:text-4xl">
                {formatTime(appointment.startAt)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Próximo atendimento
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Avatar name={appointment.client.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
                    {appointment.client.name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {appointment.service.name}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary/70" />
                  {appointment.professional.name}
                </span>
                {hasPhone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-primary/70" />
                    {phone}
                  </span>
                )}
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col lg:items-stretch">
            {onViewDetails && (
              <Button
                className="w-full sm:w-auto lg:w-full"
                onClick={() => onViewDetails(appointment)}
              >
                Ver detalhes
              </Button>
            )}
            {whatsAppUrl ? (
              <Button variant="outline" className="w-full sm:w-auto lg:w-full" asChild>
                <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-1.5 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            ) : (
              <Button variant="outline" className="w-full sm:w-auto lg:w-full" disabled>
                <MessageCircle className="mr-1.5 h-4 w-4" />
                WhatsApp
              </Button>
            )}
            {telUrl ? (
              <Button variant="outline" className="w-full sm:w-auto lg:w-full" asChild>
                <a href={telUrl}>
                  <Phone className="mr-1.5 h-4 w-4" />
                  Ligar
                </a>
              </Button>
            ) : (
              <Button variant="outline" className="w-full sm:w-auto lg:w-full" disabled>
                <Phone className="mr-1.5 h-4 w-4" />
                Ligar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
