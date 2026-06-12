"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@prisma/client";
import { deleteClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/layout/empty-state";

type ClientTableProps = {
  clients: Client[];
};

export function ClientTable({ clients }: ClientTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteClient(deleteId);
    setLoading(false);
    setDeleteId(null);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao excluir cliente.");
      return;
    }

    toast.success("Cliente excluído.");
    router.refresh();
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente cadastrado"
        description="Comece adicionando o primeiro cliente ao sistema."
        action={
          <Button asChild>
            <Link href="/clientes/novo">Novo cliente</Link>
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
              <th className="hidden px-4 py-3 font-medium text-slate-600 sm:table-cell">Telefone</th>
              <th className="hidden px-4 py-3 font-medium text-slate-600 md:table-cell">E-mail</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{client.name}</td>
                <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{client.phone}</td>
                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                  {client.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/clientes/${client.id}/editar`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(client.id)}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
