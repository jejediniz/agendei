"use client";

import Link from "next/link";
import { useEffect } from "react";
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
  CreditCard,
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
  { href: "/agenda", label: "Agenda do dia", icon: CalendarDays },
];

const settingsItems = [
  { href: "/configuracoes/negocio", label: "Negócio", icon: Settings },
  { href: "/configuracoes/plano", label: "Plano", icon: CreditCard },
];

type AppSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith("/configuracoes");

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const content = (
    <>
      <div className="flex h-14 min-h-14 items-center justify-between border-b border-border/60 px-4 pt-safe sm:h-16 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-primary"
        >
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
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-0.5">
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
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border-l-[3px] border-primary bg-primary-light text-primary-dark"
                    : "border-l-[3px] border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div>
          <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Configurações
          </p>
          <div className="space-y-0.5">
            {settingsItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive || (isSettingsActive && isActive)
                      ? "border-l-[3px] border-primary bg-primary-light text-primary-dark"
                      : "border-l-[3px] border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 flex-col border-r border-border/60 bg-surface lg:flex">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(18rem,85vw)] flex-col bg-surface pb-safe shadow-warm-lg">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
