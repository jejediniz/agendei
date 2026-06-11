"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/constants/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col">
        <AppHeader title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
