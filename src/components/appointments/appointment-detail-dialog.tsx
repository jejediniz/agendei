"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { AppointmentStatus } from "@prisma/client";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import { formatDate, formatTime } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";
import {
  buildTelUrl,
  buildWhatsAppUrl,
  isValidContactPhone,
} from "@/lib/utils/contact-links";
import { StatusBadge } from "@/components/appointments/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AppointmentDetailDialogProps = {
  appointment: AppointmentWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PendingAction = {
  id: string;
  status: AppointmentStatus;
};

type ConfirmableStatus = "CANCELLED" | "COMPLETED" | "NO_SHOW";

const CONFIRM_MESSAGES: Record<
  ConfirmableStatus,
  {
    title: string;
    description: string;
    confirmLabel: string;
    variant: "default" | "destructive";
  }
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
  NO_SHOW: {
    title: "Marcar como não compareceu",
    description:
      "Registrar que o cliente não compareceu? O horário ficará disponível novamente.",
    confirmLabel: "Não compareceu",
    variant: "destructive",
  },
};

function buildWhatsAppMessage(appointment: AppointmentWithRelations): string {
  const date = formatDate(appointment.startAt);
  const time = formatTime(appointment.startAt);
  return `Olá, ${appointment.client.name}! Passando para confirmar seu atendimento. Serviço: ${appointment.service.name}. Data: ${date}. Horário: ${time}.`;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function StatusActions({
  appointment,
  onStatus,
  loading,
}: {
  appointment: AppointmentWithRelations;
  onStatus: (status: AppointmentStatus) => void;
  loading: boolean;
}) {
  if (appointment.status === "SCHEDULED") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={loading}
          onClick={() => onStatus("CONFIRMED")}
        >
          Confirmar
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => onStatus("CANCELLED")}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  if (appointment.status === "CONFIRMED") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={loading}
          onClick={() => onStatus("IN_PROGRESS")}
        >
          Iniciar atendimento
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => onStatus("COMPLETED")}
        >
          Concluir
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => onStatus("NO_SHOW")}
        >
          Não compareceu
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => onStatus("CANCELLED")}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  if (appointment.status === "IN_PROGRESS") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={loading}
          onClick={() => onStatus("COMPLETED")}
        >
          Concluir
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => onStatus("NO_SHOW")}
        >
          Não compareceu
        </Button>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Nenhuma alteração de status disponível para este agendamento.
    </p>
  );
}

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailDialogProps) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(false);

  if (!appointment) return null;

  const phone = appointment.client.phone;
  const hasPhone = isValidContactPhone(phone);
  const whatsAppUrl = hasPhone
    ? buildWhatsAppUrl(phone, buildWhatsAppMessage(appointment))
    : null;
  const telUrl = hasPhone ? buildTelUrl(phone) : null;

  async function applyStatus(status: AppointmentStatus) {
    if (!appointment) return;
    setLoading(true);
    const result = await updateAppointmentStatus(appointment.id, status);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao atualizar status.");
      return;
    }

    toast.success("Status atualizado.");
    router.refresh();
    onOpenChange(false);
  }

  async function handleConfirmPending() {
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
    onOpenChange(false);
  }

  function handleStatus(status: AppointmentStatus) {
    if (!appointment) return;
    // Transições sem risco aplicam direto; as que liberam o horário ou
    // encerram o atendimento pedem confirmação.
    if (status === "CONFIRMED" || status === "IN_PROGRESS") {
      void applyStatus(status);
      return;
    }
    setPending({ id: appointment.id, status });
  }

  const dialogConfig =
    pending?.status === "CANCELLED" ||
    pending?.status === "COMPLETED" ||
    pending?.status === "NO_SHOW"
      ? CONFIRM_MESSAGES[pending.status]
      : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md gap-0 p-0">
          <DialogHeader className="space-y-4 border-b border-border/60 p-6 pb-5">
            <div className="flex items-start gap-3 pr-6">
              <Avatar name={appointment.client.name} size="lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <DialogTitle className="text-left text-xl leading-tight">
                  {appointment.client.name}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={appointment.status} />
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatDate(appointment.startAt, "EEEE, dd 'de' MMMM")}
                  </span>
                </div>
                <p className="font-display text-2xl font-semibold tabular-nums text-primary">
                  {formatTime(appointment.startAt)} – {formatTime(appointment.endAt)}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 p-6">
            <dl className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <DetailRow label="Cliente" value={appointment.client.name} />
              <DetailRow
                label="Telefone"
                value={hasPhone ? phone : "Não informado"}
              />
              <DetailRow label="Serviço" value={appointment.service.name} />
              <DetailRow
                label="Profissional"
                value={appointment.professional.name}
              />
              <DetailRow
                label="Duração"
                value={`${appointment.service.durationMin} min`}
              />
              <DetailRow
                label="Preço"
                value={formatCurrency(appointment.service.price)}
              />
              {appointment.notes && (
                <DetailRow label="Observações" value={appointment.notes} />
              )}
            </dl>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ações rápidas
              </p>
              <div className="flex flex-wrap gap-2">
                {whatsAppUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-1.5 h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    WhatsApp
                  </Button>
                )}
                {telUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={telUrl}>
                      <Phone className="mr-1.5 h-4 w-4" />
                      Ligar
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    <Phone className="mr-1.5 h-4 w-4" />
                    Ligar
                  </Button>
                )}
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/agendamentos">
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    Ver na lista
                  </Link>
                </Button>
              </div>
              {!hasPhone && (
                <p className="text-xs text-muted-foreground">
                  Telefone inválido ou ausente — WhatsApp e ligação indisponíveis.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status do atendimento
              </p>
              <StatusActions
                appointment={appointment}
                onStatus={handleStatus}
                loading={loading}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {dialogConfig && (
        <ConfirmDialog
          open={!!pending}
          onOpenChange={(isOpen) => !isOpen && setPending(null)}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmLabel={dialogConfig.confirmLabel}
          variant={dialogConfig.variant}
          loading={loading}
          onConfirm={handleConfirmPending}
        />
      )}
    </>
  );
}
