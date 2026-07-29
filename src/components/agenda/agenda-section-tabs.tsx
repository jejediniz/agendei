"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, List } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { href: "/agenda", label: "Calendário", icon: CalendarDays },
  { href: "/agendamentos", label: "Lista", icon: List },
];

/**
 * Sub-navegação do hub Agenda. Unifica a visão de calendário (grade do dia)
 * e a lista de agendamentos, que antes eram itens separados no menu.
 */
export function AgendaSectionTabs() {
  const pathname = usePathname();

  return (
    <div
      role="tablist"
      aria-label="Visões da agenda"
      className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-muted/50 p-1"
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              isActive
                ? "bg-card text-foreground shadow-warm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
