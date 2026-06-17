"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AppointmentStatus } from "@prisma/client";
import type { Professional } from "@prisma/client";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants/appointment-status";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AppointmentFiltersProps = {
  professionals: Professional[];
};

export function AppointmentFilters({ professionals }: AppointmentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/agendamentos?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <Label>Data</Label>
        <Input
          type="date"
          defaultValue={searchParams.get("data") ?? ""}
          onChange={(e) => updateFilter("data", e.target.value)}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label>Profissional</Label>
        <Select
          defaultValue={searchParams.get("profissional") ?? "all"}
          onValueChange={(v) => updateFilter("profissional", v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <Label>Status</Label>
        <Select
          defaultValue={searchParams.get("status") ?? "all"}
          onValueChange={(v) => updateFilter("status", v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {APPOINTMENT_STATUS_LABELS[status]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
