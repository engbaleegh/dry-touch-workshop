import type { UserRole } from "@prisma/client";

/** Routes STAFF may access under /dashboard */
const STAFF_ALLOWED_PREFIXES = [
  "/dashboard/bookings",
  "/dashboard/calendar",
  "/dashboard/services",
  "/dashboard/reports",
] as const;

const ADMIN_ONLY_PREFIXES = ["/dashboard/users", "/dashboard/settings"] as const;

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isStaffAllowedDashboardPath(pathname: string): boolean {
  if (pathname === "/dashboard") return true;
  if (pathname === "/dashboard/forbidden") return true;
  return STAFF_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function canAccessPath(pathname: string, role: UserRole): boolean {
  if (!pathname.startsWith("/dashboard")) return true;
  if (role === "ADMIN") return true;
  return isStaffAllowedDashboardPath(pathname);
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}
