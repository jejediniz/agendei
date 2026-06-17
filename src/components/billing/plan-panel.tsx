"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionStatus } from "@prisma/client";
import { toast } from "sonner";
import { startSubscription, cancelSubscription } from "@/lib/actions/billing";
import { getTrialDaysRemaining } from "@/lib/billing/subscription";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIAL: "Trial gratuito",
  ACTIVE: "Ativo",
  PAST_DUE: "Pagamento em atraso",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

type PlanPanelProps = {
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
  price: number;
};

export function PlanPanel({ status, trialEndsAt, price }: PlanPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const result = await startSubscription();
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao iniciar assinatura.");
      return;
    }

    if (result.paymentUrl) {
      window.open(result.paymentUrl, "_blank");
    }
    toast.success("Assinatura criada!");
    router.refresh();
  }

  async function handleCancel() {
    setLoading(true);
    const result = await cancelSubscription();
    setLoading(false);
    setShowCancelDialog(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao cancelar.");
      return;
    }

    toast.success("Assinatura cancelada.");
    router.refresh();
  }

  const trialDays = trialEndsAt ? getTrialDaysRemaining(trialEndsAt) : 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base">
            Plano Agendei
            <Badge
              variant={
                status === "ACTIVE"
                  ? "success"
                  : status === "TRIAL"
                    ? "warning"
                    : "secondary"
              }
            >
              {STATUS_LABELS[status]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(price)}
            <span className="text-base font-normal text-muted-foreground">/mês</span>
          </p>

          {status === SubscriptionStatus.TRIAL && trialEndsAt && (
            <p className="text-sm text-muted-foreground">
              Restam <strong>{trialDays} dia(s)</strong> de trial gratuito.
            </p>
          )}

          {(status === SubscriptionStatus.TRIAL ||
            status === SubscriptionStatus.EXPIRED) && (
            <Button onClick={handleSubscribe} disabled={loading}>
              {loading ? "Processando..." : "Assinar agora"}
            </Button>
          )}

          {status === SubscriptionStatus.ACTIVE && (
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              disabled={loading}
            >
              Cancelar assinatura
            </Button>
          )}

          {status === SubscriptionStatus.EXPIRED && (
            <p className="text-sm text-rose-600">
              Seu trial expirou. Assine para continuar usando o sistema.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar assinatura"
        description="Cancelar sua assinatura? Você perderá acesso após o período atual."
        confirmLabel="Cancelar assinatura"
        variant="destructive"
        loading={loading}
        onConfirm={handleCancel}
      />
    </>
  );
}
