"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Scissors, ToggleLeft } from "lucide-react";
import { toast } from "sonner";
import type { Service } from "@prisma/client";
import { toggleServiceActive } from "@/lib/actions/services";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";

type ServiceTableProps = {
  services: Service[];
};

export function ServiceTable({ services }: ServiceTableProps) {
  const router = useRouter();

  async function handleToggle(id: string) {
    const result = await toggleServiceActive(id);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao alterar status.");
      return;
    }
    toast.success("Status atualizado.");
    router.refresh();
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title="Nenhum serviço cadastrado"
        description="Cadastre os serviços oferecidos pelo estabelecimento."
        action={
          <Button asChild>
            <Link href="/servicos/novo">Novo serviço</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="px-4 py-3 font-medium text-slate-600">Serviço</th>
            <th className="px-4 py-3 font-medium text-slate-600">Duração</th>
            <th className="px-4 py-3 font-medium text-slate-600">Preço</th>
            <th className="px-4 py-3 font-medium text-slate-600">Status</th>
            <th className="px-4 py-3 text-right font-medium text-slate-600">Ações</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 font-medium text-slate-900">{service.name}</td>
              <td className="px-4 py-3 text-slate-600">{service.durationMin} min</td>
              <td className="px-4 py-3 text-slate-600">
                {formatCurrency(service.price.toString())}
              </td>
              <td className="px-4 py-3">
                <Badge variant={service.active ? "success" : "secondary"}>
                  {service.active ? "Ativo" : "Inativo"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/servicos/${service.id}/editar`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(service.id)}
                  >
                    <ToggleLeft className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
