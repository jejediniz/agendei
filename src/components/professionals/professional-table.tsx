"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, UserCog, UserX } from "lucide-react";
import { toast } from "sonner";
import type { Professional } from "@prisma/client";
import { toggleProfessionalActive } from "@/lib/actions/professionals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/layout/empty-state";

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
        description="Adicione profissionais para gerenciar horários e agendamentos."
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
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 font-medium text-slate-600">Nome</th>
              <th className="hidden px-4 py-3 font-medium text-slate-600 sm:table-cell">Especialidade</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map((professional) => (
              <tr key={professional.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{professional.name}</td>
                <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                  {professional.specialty ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={professional.active ? "success" : "secondary"}>
                    {professional.active ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
