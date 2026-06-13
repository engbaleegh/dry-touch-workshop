"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useLocale } from "../providers/locale-provider";

import type { UserRole } from "@prisma/client";

interface DashboardShellProps {
  children: React.ReactNode;
  username: string;
  role: UserRole;
}

export function DashboardShell({ children, username, role }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { dict } = useLocale();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const titleMap: Record<string, string> = {
    "/dashboard": dict.dashboard.title,
    "/dashboard/bookings": dict.bookings.title,
    "/dashboard/bookings/new": dict.bookings.new,
    "/dashboard/services": dict.services.title,
    "/dashboard/services/new": dict.services.new,
    "/dashboard/users": dict.users.title,
    "/dashboard/users/new": dict.users.new,
    "/dashboard/calendar": dict.calendar.title,
    "/dashboard/reports": dict.reports.title,
    "/dashboard/settings": dict.settings.title,
  };

  let title = titleMap[pathname] ?? "DRY TOUCH";

  if (pathname.includes("/services/") && pathname.includes("/edit")) {
    title = dict.services.edit;
  } else if (pathname.includes("/users/") && pathname.includes("/edit")) {
    title = dict.users.edit;
  } else if (pathname.includes("/edit")) {
    title = dict.bookings.edit;
  } else if (
    pathname.startsWith("/dashboard/bookings/") &&
    pathname !== "/dashboard/bookings/new"
  ) {
    title = dict.bookings.details;
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          username={username}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="page-container w-full max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
