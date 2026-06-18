"use client";

import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { formatDate } from "@/lib/utils/date";

type AppHeaderProps = {
  title: string;
  onMenuClick?: () => void;
};

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
