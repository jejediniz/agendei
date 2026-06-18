"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, UserCog, UserX } from "lucide-react";
import { toast } from "sonner";
import type { Professional } from "@prisma/client";
import { toggleProfessionalActive } from "@/lib/actions/professionals";
import { Avatar } from "@/components/ui/avatar";
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

type ProfessionalTableProps = {
  professionals: Professional[];
};

export function ProfessionalTable({ professionals }: ProfessionalTableProps) {
  const router = useRouter();
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleToggle(id: string, currentlyActive: boolean) {
    if (currentlyActive) {
      setDeactivateId(id);
      return;
    }

    const result = await toggleProfessionalActive(id);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao alterar status.");
      return;
    }
    toast.success("Profissional ativado.");
    router.refresh();
  }

  async function handleConfirmDeactivate() {
    if (!deactivateId) return;
    setLoading(true);
    const result = await toggleProfessionalActive(deactivateId);
    setLoading(false);
    setDeactivateId(null);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao alterar status.");
      return;
    }
    toast.success("Profissional desativado.");
    router.refresh();
  }

  if (professionals.length === 0) {
    return (
      <EmptyState
        icon={UserCog}
        title="Nenhum profissional cadastrado"
        description="Adicione os profissionais da sua equipe para definir horários e receber agendamentos."
        action={
          <Button asChild>
            <Link href="/profissionais/novo">Novo profissional</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            className="rounded-xl border border-border bg-card p-4 shadow-warm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <Avatar name={professional.name} size="md" />
                <div>
                  <p className="font-medium text-foreground">{professional.name}</p>
                  {professional.specialty && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {professional.specialty}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={professional.active ? "success" : "secondary"}>
                {professional.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/profissionais/${professional.id}/editar`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleToggle(professional.id, professional.active)}
              >
                <UserX className="mr-1.5 h-4 w-4" />
                {professional.active ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DataTable>
        <DataTableElement>
          <DataTableHead>
            <DataTableRow className="hover:bg-transparent">
              <DataTableHeaderCell>Profissional</DataTableHeaderCell>
              <DataTableHeaderCell>Especialidade</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Ações</DataTableHeaderCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {professionals.map((professional) => (
              <DataTableRow key={professional.id}>
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={professional.name} size="sm" />
                    <span className="font-medium text-foreground">
                      {professional.name}
                    </span>
                  </div>
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {professional.specialty ?? "—"}
                </DataTableCell>
                <DataTableCell>
                  <Badge variant={professional.active ? "success" : "secondary"}>
                    {professional.active ? "Ativo" : "Inativo"}
                  </Badge>
                </DataTableCell>
                <DataTableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/profissionais/${professional.id}/editar`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(professional.id, professional.active)}
                      title={professional.active ? "Desativar" : "Ativar"}
                    >
                      <UserX className="h-4 w-4" />
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
        title="Desativar profissional"
        description="Desativar este profissional? Ele não aparecerá em novos agendamentos."
        confirmLabel="Desativar"
        variant="default"
        loading={loading}
        onConfirm={handleConfirmDeactivate}
      />
    </>
  );
}
