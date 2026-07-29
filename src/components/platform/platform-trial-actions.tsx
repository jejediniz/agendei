"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extendTrial } from "@/lib/actions/organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PlatformTrialActionsProps = {
  organizationId: string;
};

export function PlatformTrialActions({
  organizationId,
}: PlatformTrialActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleExtend(days: number) {
    setLoading(true);
    const result = await extendTrial(organizationId, days);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao estender trial.");
      return;
    }

    toast.success(`Trial estendido em ${days} dias.`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ações</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => handleExtend(7)}
        >
          +7 dias de trial
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => handleExtend(14)}
        >
          +14 dias de trial
        </Button>
      </CardContent>
    </Card>
  );
}
