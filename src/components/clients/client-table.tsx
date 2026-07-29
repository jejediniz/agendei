"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@prisma/client";
import { deleteClient } from "@/lib/actions/clients";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
        description="Seus clientes aparecerão aqui conforme você for cadastrando ou recebendo agendamentos. Comece adicionando o primeiro."
        action={
          <Button asChild>
            <Link href="/clientes/novo">Cadastrar cliente</Link>
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
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-warm"
          >
            <div className="flex items-center gap-3">
              <Avatar name={client.name} size="md" />
              <div className="min-w-0">
                <p className="font-medium text-foreground">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
                {client.email && (
                  <p className="truncate text-sm text-muted-foreground">
                    {client.email}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/clientes/${client.id}/editar`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-rose-600 dark:text-rose-400"
                onClick={() => setDeleteId(client.id)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DataTable>
        <DataTableElement>
          <DataTableHead>
            <DataTableRow className="hover:bg-transparent">
              <DataTableHeaderCell>Cliente</DataTableHeaderCell>
              <DataTableHeaderCell>Telefone</DataTableHeaderCell>
              <DataTableHeaderCell className="hidden lg:table-cell">
                E-mail
              </DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Ações</DataTableHeaderCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {clients.map((client) => (
              <DataTableRow key={client.id}>
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={client.name} size="sm" />
                    <span className="font-medium text-foreground">
                      {client.name}
                    </span>
                  </div>
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {client.phone}
                </DataTableCell>
                <DataTableCell className="hidden text-muted-foreground lg:table-cell">
                  {client.email ?? "—"}
                </DataTableCell>
                <DataTableCell>
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
                      <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTableElement>
      </DataTable>

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
