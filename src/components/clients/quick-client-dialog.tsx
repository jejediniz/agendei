"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  quickClientSchema,
  type QuickClientFormData,
} from "@/lib/validations/client";
import { createClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QuickClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (client: { id: string; name: string }) => void;
};

export function QuickClientDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickClientDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickClientFormData>({
    resolver: zodResolver(quickClientSchema),
    defaultValues: { name: "", phone: "" },
  });

  async function onSubmit(data: QuickClientFormData) {
    setLoading(true);
    const result = await createClient({
      ...data,
      email: "",
      document: "",
      notes: "",
    });
    setLoading(false);

    if (!result.success || !result.id) {
      toast.error(result.error ?? "Erro ao cadastrar cliente.");
      return;
    }

    toast.success("Cliente cadastrado!");
    onCreated({ id: result.id, name: data.name });
    reset();
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>
            Cadastre o cliente para continuar o agendamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-client-name">Nome *</Label>
            <Input id="quick-client-name" autoFocus {...register("name")} />
            {errors.name && (
              <p className="text-sm text-rose-600 dark:text-rose-400">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-client-phone">Telefone *</Label>
            <Input
              id="quick-client-phone"
              placeholder="(11) 99999-9999"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-rose-600 dark:text-rose-400">{errors.phone.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
