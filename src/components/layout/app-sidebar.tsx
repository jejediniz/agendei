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
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
];

const gestaoNavItems = [
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

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: { href: string; label: string; icon: typeof LayoutDashboard };
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = isNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary-light text-primary-dark shadow-sm ring-1 ring-primary/10"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "w-0.5 self-stretch rounded-full transition-colors",
          isActive ? "bg-primary" : "bg-transparent group-hover:bg-border",
        )}
      />
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      {item.label}
    </Link>
  );
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();

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
      <div className="flex h-14 min-h-14 items-center justify-between border-b border-border/50 px-4 pt-safe sm:h-16 sm:px-5">
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

      <div className="border-b border-border/50 p-3">
        <Button asChild className="w-full justify-center shadow-warm">
          <Link href="/agendamentos/novo" onClick={onMobileClose}>
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={onMobileClose}
            />
          ))}
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
            Gestão
          </p>
          <div className="space-y-0.5">
            {gestaoNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onMobileClose}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
            Configurações
          </p>
          <div className="space-y-0.5">
            {settingsItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onMobileClose}
              />
            ))}
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 flex-col border-r border-border/50 bg-surface/90 backdrop-blur-sm lg:flex">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
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
