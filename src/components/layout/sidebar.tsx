"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  BarChart3,
  PlusCircle,
  Wrench,
  Users,
  Settings,
  X,
} from "lucide-react";
import type { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Logo } from "../brand/logo";
import { useLocale } from "../providers/locale-provider";

const allNavItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    key: "dashboard" as const,
    roles: ["ADMIN", "STAFF"] as UserRole[],
  },
  {
    href: "/dashboard/bookings",
    icon: ClipboardList,
    key: "bookings" as const,
    roles: ["ADMIN", "STAFF"] as UserRole[],
  },
  {
    href: "/dashboard/bookings/new",
    icon: PlusCircle,
    key: "newBooking" as const,
    roles: ["ADMIN", "STAFF"] as UserRole[],
  },
  {
    href: "/dashboard/services",
    icon: Wrench,
    key: "services" as const,
    roles: ["ADMIN"] as UserRole[],
  },
  {
    href: "/dashboard/users",
    icon: Users,
    key: "users" as const,
    roles: ["ADMIN"] as UserRole[],
  },
  {
    href: "/dashboard/calendar",
    icon: CalendarDays,
    key: "calendar" as const,
    roles: ["ADMIN"] as UserRole[],
  },
  {
    href: "/dashboard/reports",
    icon: BarChart3,
    key: "reports" as const,
    roles: ["ADMIN", "STAFF"] as UserRole[],
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    key: "settings" as const,
    roles: ["ADMIN"] as UserRole[],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  role: UserRole;
}

function NavLinks({
  onNavigate,
  role,
}: {
  onNavigate?: () => void;
  role: UserRole;
}) {
  const pathname = usePathname();
  const { dict } = useLocale();

  const labels: Record<string, string> = {
    dashboard: dict.nav.dashboard,
    bookings: dict.nav.bookings,
    newBooking: dict.nav.newBooking,
    services: dict.nav.services,
    users: dict.nav.users,
    calendar: dict.nav.calendar,
    reports: dict.nav.reports,
    settings: dict.nav.settings,
  };

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : item.href === "/dashboard/bookings"
              ? pathname === "/dashboard/bookings" ||
                (pathname.startsWith("/dashboard/bookings/") &&
                  !pathname.includes("/new"))
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/20"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {labels[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ open, onClose, role }: SidebarProps) {
  const { dict, dir } = useLocale();

  const drawerSide = dir === "rtl" ? "right-0" : "left-0";
  const closedTransform =
    dir === "rtl" ? "translate-x-full" : "-translate-x-full";

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-slate-800/50 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:flex ltr:border-r rtl:border-l">
        <div className="px-5 py-5">
          <Logo
            variant="light"
            showTagline
            tagline={dict.app.tagline}
            size="md"
          />
        </div>
        <NavLinks role={role} />
        <div className="border-t border-white/10 p-4 text-xs tracking-wider text-slate-500">
          DRY TOUCH v1.0
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-[min(18rem,85vw)] flex-col border-slate-800/50 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transition-transform duration-300 ease-in-out lg:hidden",
          drawerSide,
          dir === "rtl" ? "border-l" : "border-r",
          open ? "translate-x-0" : closedTransform
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Logo
            variant="light"
            showTagline
            tagline={dict.app.tagline}
            size="sm"
          />
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavLinks onNavigate={onClose} role={role} />
        <div className="border-t border-white/10 p-4 text-xs tracking-wider text-slate-500">
          DRY TOUCH v1.0
        </div>
      </aside>
    </>
  );
}
