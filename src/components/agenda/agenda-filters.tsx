"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Professional } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";

type AgendaFiltersProps = {
  professionals: Professional[];
};

export function AgendaFilters({ professionals }: AgendaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDate = searchParams.get("data") ?? format(new Date(), "yyyy-MM-dd");

  function navigate(days: number) {
    const date = addDays(parseISO(currentDate), days);
    const params = new URLSearchParams(searchParams.toString());
    params.set("data", format(date, "yyyy-MM-dd"));
    router.replace(`/agenda?${params.toString()}`);
  }

  function updateDate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("data", value);
    router.replace(`/agenda?${params.toString()}`);
  }

  function updateProfessional(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") params.set("profissional", value);
    else params.delete("profissional");
    router.replace(`/agenda?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-2">
          <Label>Data</Label>
          <Input
            type="date"
            value={currentDate}
            onChange={(e) => updateDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label>Profissional</Label>
        <Select
          defaultValue={searchParams.get("profissional") ?? "all"}
          onValueChange={updateProfessional}
        >
          <SelectTrigger className="w-48">
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
    </div>
  );
}
