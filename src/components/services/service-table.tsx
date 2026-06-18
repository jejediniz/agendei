"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Scissors, ToggleLeft } from "lucide-react";
import { toast } from "sonner";
import type { SerializableService } from "@/lib/queries/services";
import { toggleServiceActive } from "@/lib/actions/services";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/layout/empty-state";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableElement,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/layout/data-table";

type ServiceTableProps = {
  services: SerializableService[];
};

export function ServiceTable({ services }: ServiceTableProps) {
  const router = useRouter();
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleToggle(id: string, currentlyActive: boolean) {
    if (currentlyActive) {
      setDeactivateId(id);
      return;
    }

    const result = await toggleServiceActive(id);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao alterar status.");
      return;
    }
    toast.success("Serviço ativado.");
    router.refresh();
  }

  async function handleConfirmDeactivate() {
    if (!deactivateId) return;
    setLoading(true);
    const result = await toggleServiceActive(deactivateId);
    setLoading(false);
    setDeactivateId(null);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao alterar status.");
      return;
    }
    toast.success("Serviço desativado.");
    router.refresh();
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title="Nenhum serviço cadastrado"
        description="Cadastre os serviços que seu negócio oferece para que clientes possam agendar online ou pelo painel."
        action={
          <Button asChild>
            <Link href="/servicos/novo">Novo serviço</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-border bg-card p-4 shadow-warm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-foreground">{service.name}</p>
              <Badge variant={service.active ? "success" : "secondary"}>
                {service.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {service.durationMin} min · {formatCurrency(service.price)}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/servicos/${service.id}/editar`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleToggle(service.id, service.active)}
              >
                <ToggleLeft className="mr-1.5 h-4 w-4" />
                {service.active ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DataTable>
        <DataTableElement>
          <DataTableHead>
            <DataTableRow className="hover:bg-transparent">
              <DataTableHeaderCell>Serviço</DataTableHeaderCell>
              <DataTableHeaderCell>Duração</DataTableHeaderCell>
              <DataTableHeaderCell>Preço</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Ações</DataTableHeaderCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {services.map((service) => (
              <DataTableRow key={service.id}>
                <DataTableCell className="font-medium text-foreground">
                  {service.name}
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {service.durationMin} min
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatCurrency(service.price)}
                </DataTableCell>
                <DataTableCell>
                  <Badge variant={service.active ? "success" : "secondary"}>
                    {service.active ? "Ativo" : "Inativo"}
                  </Badge>
                </DataTableCell>
                <DataTableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/servicos/${service.id}/editar`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(service.id, service.active)}
                      title={service.active ? "Desativar" : "Ativar"}
                    >
                      <ToggleLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTableElement>
      </DataTable>

      <ConfirmDialog
        open={!!deactivateId}
        onOpenChange={(open) => !open && setDeactivateId(null)}
        title="Desativar serviço"
        description="Desativar este serviço? Ele não aparecerá em novos agendamentos."
        confirmLabel="Desativar"
        variant="default"
        loading={loading}
        onConfirm={handleConfirmDeactivate}
      />
    </>
  );
}
