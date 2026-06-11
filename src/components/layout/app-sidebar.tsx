"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Scissors,
  Clock,
  Calendar,
  CalendarDays,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/profissionais", label: "Profissionais", icon: UserCog },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/horarios", label: "Horários", icon: Clock },
  { href: "/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/configuracoes/negocio", label: "Configurações", icon: Settings },
];

type AppSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
        <Link href="/" className="text-xl font-bold text-teal-600">
          Agendei
        </Link>
        {onMobileClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
