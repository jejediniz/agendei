"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { getPageTitle } from "@/lib/constants/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const hasFab = pathname === "/agenda" || pathname.startsWith("/agenda/");

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} onMenuClick={() => setMobileOpen(true)} />
        <main
          className={cn(
            "flex-1 p-4 lg:p-8",
            hasFab && "pb-safe-fab",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
