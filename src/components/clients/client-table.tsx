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
      <div className="space-y-3 md:hidden">
        {clients.map((client) => (
          <div
            key={client.id}
            className="rounded-xl border border-border bg-card p-4 shadow-warm"
          >
            <p className="font-medium text-foreground">{client.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{client.phone}</p>
            {client.email && (
              <p className="text-sm text-muted-foreground">{client.email}</p>
            )}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/clientes/${client.id}/editar`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-rose-600"
                onClick={() => setDeleteId(client.id)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Nome</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Telefone</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">E-mail</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{client.phone}</td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
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
