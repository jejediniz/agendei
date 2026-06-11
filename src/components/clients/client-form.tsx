"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientSchema, type ClientFormData } from "@/lib/validations/client";
import { createClient, updateClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type ClientFormProps = {
  defaultValues?: ClientFormData;
  clientId?: string;
};

export function ClientForm({ defaultValues, clientId }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!clientId;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValues ?? {
      name: "",
      phone: "",
      email: "",
      document: "",
      notes: "",
    },
  });

  async function onSubmit(data: ClientFormData) {
    setLoading(true);
    const result = isEditing
      ? await updateClient(clientId, data)
      : await createClient(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar cliente.");
      return;
    }

    toast.success(isEditing ? "Cliente atualizado!" : "Cliente cadastrado!");
    router.push("/clientes");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-rose-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" placeholder="(11) 99999-9999" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-rose-600">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-rose-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">CPF / Documento</Label>
              <Input id="document" {...register("document")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
