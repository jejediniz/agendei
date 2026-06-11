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
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-slate-500 sm:block">
          {formatDate(new Date(), "EEEE, dd 'de' MMMM")}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
