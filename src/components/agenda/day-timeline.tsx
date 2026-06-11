"use client";

import type {
  Appointment,
  Client,
  Professional,
  Service,
} from "@prisma/client";
import {
  APPOINTMENT_STATUS_DOT_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/constants/appointment-status";
import { formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: Service;
};

type DayTimelineProps = {
  appointments: AppointmentWithRelations[];
  dateLabel: string;
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export function DayTimeline({ appointments, dateLabel }: DayTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dateLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Nenhum agendamento para este dia.
          </p>
        ) : (
          <div className="relative space-y-0">
            {HOURS.map((hour) => {
              const hourAppointments = appointments.filter((apt) => {
                const aptHour = new Date(apt.startAt).getHours();
                return aptHour === hour;
              });

              return (
                <div
                  key={hour}
                  className="flex min-h-[64px] border-t border-slate-100 first:border-t-0"
                >
                  <div className="w-16 shrink-0 py-2 pr-4 text-right text-xs text-slate-400">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    {hourAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={cn(
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                              APPOINTMENT_STATUS_DOT_COLORS[apt.status],
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-slate-900">
                                {formatTime(apt.startAt)} — {apt.client.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {APPOINTMENT_STATUS_LABELS[apt.status]}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {apt.professional.name} · {apt.service.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
