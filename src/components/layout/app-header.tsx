"use client";

import { useSyncExternalStore } from "react";
import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { formatDate } from "@/lib/utils/date";

type AppHeaderProps = {
  title: string;
  onMenuClick?: () => void;
};

// next-themes só sabe o tema real depois de montar no cliente; renderizar
// direto no servidor causaria mismatch de hidratação. useSyncExternalStore
// resolve isso sem precisar de setState dentro de um effect.
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return <div className="touch-target h-9 w-9 shrink-0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="touch-target shrink-0"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 min-h-14 items-center justify-between gap-2 border-b border-border/50 bg-card/70 px-4 backdrop-blur-md sm:h-16 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="truncate font-display text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h2>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-muted-foreground md:block">
          {formatDate(new Date(), "EEEE, dd 'de' MMMM")}
        </span>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          className="touch-target"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
